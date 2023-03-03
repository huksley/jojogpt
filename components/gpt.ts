// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getCache } from "@/components/cache";
import { Limit } from "./limit";
import { createHash } from "crypto";

consoleStamp(console);

export const tokens = Limit.month("openai-chat-", 1000000);

export const hash = (value: string, algo?: string) => {
  const hmac = createHash(algo || "sha256");
  hmac.update(value);
  return hmac.digest("hex");
};

export const queryChatGpt = async (query: string) => {
  if (!process.env.OPENAI_API_KEY) {
    return undefined;
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const messages = [
    {
      role: "user",
      content: query,
    },
  ] as ChatCompletionRequestMessage[];

  const key = "openai-v2-" + hash(JSON.stringify(messages));
  console.info("ChatGPT query key", key, "messages", messages);
  const response = await getCache().getset(
    key,
    async () => {
      const limit = await tokens(0);
      if (limit.available <= 0) {
        console.warn("No more tokens available", limit.key, "used", limit.current, "max", limit.max);
        throw new Error("No more tokens, max: " + limit.max + ", current: " + limit.current);
      }
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Current date: " + new Date().toISOString() },
          ...messages,
        ],
      });

      if (response.data) {
        const add = response.data.usage?.total_tokens;
        const result = await tokens(add);
        if (result.available <= 0) {
          console.warn("Limit exausted", result.key, "used", result.current, "max", result.max, "consumed", add);
        } else {
          console.warn("Token limit", result.key, "used", result.current, "max", result.max, "consumed", add);
        }
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          key,
          updatedAt: new Date(),
        };
      } else {
        console.warn("Failed to get data", response.status, response.statusText);
        throw new Error("No data");
      }
    },
    1000 * 3600 * 24 * 30
  );

  const text = response?.data?.choices[0]?.message?.content;
  if (text) {
    return text;
  } else {
    throw new Error("No response text");
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `Web search results:
    
    [1] "Dan Seifert - Deputy Editor. When it comes to the latest in tech gadgets, Dan Seifert is your go-to journalist. Besides gadgets, the deputy editor of the Verge specializes in mobile tech and has quite an obsession with computer and camera bags. If you are looking to buy a new phone and are unsure about your options, or maybe planning on ..."
    URL: https://blog.thecrowdfundingformula.com/top-tech-journalists/
    
    Instructions: Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject. If the provided search results do not contain enough information to answer the query, write an answer based on your own knowledge in the same format.
    Query: What is the best journalist to write about startups in Healthcare?`;

    const response = await queryChatGpt(query);
    if (response) {
      return res.status(200).json({ data: response });
    } else {
      console.info("ChatGPT failed, no response");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (err: any) {
    console.warn("Error", err?.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
