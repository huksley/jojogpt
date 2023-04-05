// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getCache } from "@/components/cache";
import { hash } from "./hash";
import { tokens } from "./tokens";

consoleStamp(console);

const model = process.env.OPENAPI_MODEL || "gpt-3.5-turbo";

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

  const key = "openai-v3-" + hash(model + JSON.stringify(messages));
  console.info("ChatGPT query key", key, "model", model, "messages", messages);
  const response = await getCache().getset(
    key,
    async () => {
      const limit = await tokens(0);
      if (limit.available <= 0) {
        console.warn("No more tokens available", limit.key, "used", limit.current, "max", limit.max);
        throw new Error("No more tokens, max: " + limit.max + ", current: " + limit.current);
      }
      const response = await openai.createChatCompletion({
        model,
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
