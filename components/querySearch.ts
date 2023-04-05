import { hash } from "@/components/hash";
import { getCache } from "@/components/cache";
import { saveResults } from "@/components/like/pg";
import { retry } from "@/components/retry";
import { fetchWithTimeout } from "./fetchWithTimeout";

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
export const bad = {
  links: [
    {
      id: "0",
      title: "None found :-/",
      body: "Well, we tried. But we couldn't find any journalists",
      href: "https://valosan.com?utm_source=jojogpt&utm_medium=referral&utm_campaign=none_found",
    },
  ],
};
export const querySearch = async (
  query: string,
  searchParams: URLSearchParams,
  industry: string,
  country: string
): Promise<Result[]> => {
  searchParams.set("q", query + " -site:wikipedia.org -site:upwork.com");
  const key = hash(searchParams.toString());
  console.info("Search query", query, "key", key, "search url", process.env.SEARCH_URL);
  if (!process.env.SEARCH_URL) {
    throw new Error("No search url");
  }

  const json = await getCache().getset(
    "ddg-v3-" + key,
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

      console.info("Search", url, "response", response);
      const results = response.json;
      const json = (results as Result[]).map((result: any) => {
        return {
          id: "0",
          body: result.body,
          href: result.href,
          title: result.title,
        };
      });

      const id = await saveResults(industry, country, json);
      console.info("Search", url, "saved results", id);
      if (id) {
        json.forEach((item) => {
          item.id = id;
        });
      }
      console.info("Search", url, "results", json.length);
      return json;
    },
    1000 * 3600 * 24 * 1
  );

  if (!json) {
    throw new Error("No results");
  }

  return json;
};
