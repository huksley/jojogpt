// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { queryChatGpt } from "@/components/gpt";
import { removeEmoji } from "@/components/ui/emoji";
import { saveChat } from "@/components/like/pg";
import { createMiddlewares, runLimiterMiddleware } from "@/components/rateLimiting";
import { generatePrompt } from "../../components/generatePrompt";
import { Data, Error, querySearch, bad } from "../../components/querySearch";
import { generateQuery } from "../../components/generateQuery";
consoleStamp(console);

const middlewares = createMiddlewares({ limit: 10, delayAfter: 5, prefix: "query-" });

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
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

    const query = generateQuery(value, country);
    const searchParams = new URLSearchParams();
    searchParams.set("max_results", String(numResults ?? 5));
    if (timePeriod) searchParams.set("time", timePeriod);
    if (region) searchParams.set("region", region);

    try {
      const json = await querySearch(query, searchParams, value, country);
      const prompt = json ? generatePrompt(json, query, 3) : undefined;
      const response = json && prompt ? await queryChatGpt(prompt) : undefined;

      let chatId: string | undefined = undefined;
      if (prompt && json && json[0] && json[0].id) {
        console.info("ChatGPT response", response);
        if (response) {
          chatId = await saveChat(value!, country!, json[0].id, prompt, response);
        }
      }

      return res.status(200).json({ links: json, chatId, message: response });
    } catch (e) {
      console.error("Query error", e);
      return res.status(200).json(bad);
    }
  } else {
    return res.status(200).json(bad);
  }
}
