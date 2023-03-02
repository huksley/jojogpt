// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getCache } from "@/components/cache";
import { Limit, timestampDay } from "../../components/limit";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createMiddlewares, Result, runLimiterMiddleware } from "./query";

consoleStamp(console);

const getLikeChat = async (chatId: string) => {
  const cache = await getCache();
  const key = `like:${chatId}`;
  const value = await cache.get<Resp>(key);
  return value || { positive: 0, negative: 0 };
};

const getLikeResult = async (resultId: string, resultIndex: number): Promise<Resp> => {
  const cache = await getCache();
  const key = `like:${resultId}:${resultIndex}`;
  const value = await cache.get<Resp>(key);
  return value || { positive: 0, negative: 0 };
};

const addLikeChat = async (chatId: string, upvote: number) => {
  const cache = await getCache();
  const key = `like:${chatId}`;
  const value = await cache.get<Resp>(key);
  if (value) {
    await cache.set(key, {
      positive: upvote > 0 ? value.positive + Math.sign(upvote) : value.positive,
      negative: upvote < 0 ? value.negative - Math.sign(upvote) : value.negative,
    });
  } else {
    await cache.set(key, { positive: upvote > 0 ? upvote : 0, negative: upvote < 0 ? -upvote : 0 });
  }
};

interface Resp {
  negative: number;
  positive: number;
}

const addLikeResult = async (resultId: string, resultIndex: number, upvote: number) => {
  const cache = await getCache();
  const key = `like:${resultId}:${resultIndex}`;
  const value = await cache.get<{ positive: number; negative: number }>(key);
  if (value) {
    await cache.set(key, {
      positive: upvote > 0 ? value.positive + Math.sign(upvote) : value.positive,
      negative: upvote < 0 ? value.negative - Math.sign(upvote) : value.negative,
    });
  } else {
    await cache.set(key, { positive: upvote > 0 ? upvote : 0, negative: upvote < 0 ? -upvote : 0 });
  }
};

const middlewaresGet = createMiddlewares({ limit: 100, delayAfter: 100 });
const middlewaresPost = createMiddlewares({ limit: 20, delayAfter: 20 });

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp | { message?: string }>) {
  try {
    if (req.method === "GET") {
      await runLimiterMiddleware(middlewaresGet, req, res);
    } else {
      await runLimiterMiddleware(middlewaresPost, req, res);
    }
  } catch (e) {
    console.warn("Middleware error", e);
    return res.status(429).json({ message: "Too Many Requests" });
  }

  try {
    if (req.method === "GET") {
      if (req.query.resultId && req.query.resultIndex) {
        return res
          .status(200)
          .json(await getLikeResult(req.query.resultId as string, parseInt(req.query.resultIndex as string, 10)));
      } else if (req.query.chatId) {
        return res.status(200).json(await getLikeChat(req.query.chatId as string));
      } else {
        return res.status(400).json({ message: "Invalid" });
      }
    } else if (req.method === "POST") {
      if (req.body.resultId !== undefined && req.body.resultIndex !== undefined && req.body.upvote !== undefined) {
        console.info("Upvote", req.body.resultId, req.body.resultIndex, req.body.upvote);
        await addLikeResult(req.body.resultId, parseInt(req.body.resultIndex, 10), parseInt(req.body.upvote, 10));
        return res.status(200).json({ message: "OK" });
      } else if (req.body.chatId !== undefined && req.body.upvote !== undefined) {
        console.info("Upvote", req.body.chatId, req.body.upvote);
        await addLikeChat(req.body.chatId, parseInt(req.body.upvote, 10));
        return res.status(200).json({ message: "OK" });
      } else {
        return res.status(400).json({ message: "Invalid", ...req.body });
      }
    }
    return res.status(400).json({ message: "Invalid" });
  } catch (err: any) {
    console.warn("Error", err?.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
