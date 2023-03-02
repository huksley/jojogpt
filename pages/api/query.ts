// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { hash, queryChatGpt } from "@/components/gpt";
import { getCache } from "@/components/cache";
import { removeEmoji } from "@/components/ui/emoji";
import { saveChat, saveResults } from "@/components/like/pg";
import { retry } from "@/components/retry";
import { createMiddlewares, runLimiterMiddleware } from "@/components/rateLimiting";
import { fetchWithTimeout } from "./fetchWithTimeout";
consoleStamp(console);

export interface Result {
  id?: string;
  body: string;
  href: string;
  title: string;
}

export type Data = {
  links: Result[];
  chatId?: string;
  message?: string;
};

export interface Error {
  message: string;
}

const bad = {
  links: [
    {
      id: "0",
      title: "None found :-/",
      body: "Well, we tried. But we couldn't find any journalists",
      href: "https://valosan.com?utm_source=jojogpt&utm_medium=referral&utm_campaign=none_found",
    },
  ],
};

const middlewares = createMiddlewares({ limit: 10, delayAfter: 5, prefix: "query-" });

export default async function handler2(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
  try {
    await runLimiterMiddleware(middlewares, req, res);
  } catch (e) {
    console.warn("Middleware error", e);
    return res.status(429).json({ message: "Too Many Requests" });
  }

  let { value, country, numResults, timePeriod, region } =
    req.method === "POST"
      ? (req.body as {
          value?: string;
          country?: string;
          numResults?: number;
          timePeriod?: string;
          region?: string;
        })
      : (req.query as {
          value?: string;
          country?: string;
          numResults?: number;
          timePeriod?: string;
          region?: string;
        });

  if (value && country) {
    value = removeEmoji(value);
    country = removeEmoji(country);

    const query = "Who is the best journalist in " + country + " who writes about " + value + "?";
    const searchParams = new URLSearchParams();
    searchParams.set("q", query);
    searchParams.set("max_results", String(numResults ?? 3));
    if (timePeriod) searchParams.set("time", timePeriod);
    if (region) searchParams.set("region", region);

    const key = hash(query);
    try {
      console.info("DDG query", query, "key", key, "search url", process.env.SEARCH_URL);
      const json = process.env.SEARCH_URL
        ? await getCache().getset(
            "ddg-" + key,
            async () => {
              const headers = new Headers({
                Origin: "https://chat.openai.com",
                "Content-Type": "application/json",
                Accept: "*/*",
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
              });

              const url = process.env.SEARCH_URL + `?${searchParams.toString()}`;
              console.info("Invoke", url);
              const response = await retry(() =>
                fetchWithTimeout(url, {
                  method: "GET",
                  headers,
                  timeout: 30000,
                }).then(async (response) => {
                  return {
                    headers: response.headers,
                    status: response.status,
                    statusText: response.statusText,
                    json: await response.json(),
                  };
                })
              );

              console.info("Response", response);
              const results = response.json;
              const json = (results as Result[]).map((result: any) => {
                return {
                  id: "0",
                  body: result.body,
                  href: result.href,
                  title: result.title,
                };
              });
              const id = await saveResults(value!, country!, json);
              console.info("Save results", id);
              if (id) {
                json.forEach((item) => {
                  item.id = id;
                });
              }
              console.info("Query", req.body, "results", json);
              return json;
            },
            1000 * 3600 * 24 * 1
          )
        : undefined;

      if (!json) {
        return res.status(200).json(bad);
      }

      const prompt = json
        ? `Web search results:

      ${json
        .map(
          (c, index) => `[${index + 1}] "${c.title}"
          URL: ${c.href}
        `
        )
        .join("\n")}
          
          Instructions: Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject. If the provided search results do not contain enough information to answer the query, write an answer based on your own knowledge in the same format.
          Query: What is the best journalist to write about startups in ${value} in ${country}?`
        : undefined;
      const chat = json && prompt ? await queryChatGpt(query) : undefined;

      console.info("ChatGPT response", chat?.data?.choices[0]?.message?.content);
      const chatId =
        json && query
          ? await saveChat(value!, country!, json[0].id, prompt ?? "", chat?.data?.choices[0]?.message?.content ?? "")
          : undefined;

      return res.status(200).json({ links: json, chatId, message: chat?.data?.choices[0]?.message?.content });
    } catch (e) {
      console.error("Query error", e);
      return res.status(200).json(bad);
    }
  } else {
    return res.status(200).json(bad);
  }
}
