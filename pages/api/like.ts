// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { createMiddlewares, runLimiterMiddleware } from "../../components/rateLimiting";
import { getCookie, setCookie } from "cookies-next";
import { hash } from "@/components/hash";
import { addLikeChat, addLikeResult, getLikesChat, getLikesResult } from "@/components/like/pg";
consoleStamp(console);

const middlewaresGet = createMiddlewares({ limit: 100, delayAfter: 100, prefix: "like-get-" });
const middlewaresPost = createMiddlewares({ limit: 20, delayAfter: 20, prefix: "like-set-" });

interface Data {
  negative: number;
  positive: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | { message?: string }>) {
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

  let sessionId = getCookie("sessionId", { req, res }) as string;
  if (!sessionId) {
    sessionId = hash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setCookie("sessionId", sessionId, { req, res, maxAge: 60 * 60 * 24 * 365 });
  }

  try {
    if (req.method === "GET") {
      if (req.query.resultId && req.query.resultIndex) {
        console.info("Get result likes", req.query.resultId, req.query.resultIndex);
        return res
          .status(200)
          .json(await getLikesResult(req.query.resultId as string, parseInt(req.query.resultIndex as string, 10)));
      } else if (req.query.chatId) {
        console.info("Get chat likes", req.query.chatId);
        return res.status(200).json(await getLikesChat(req.query.chatId as string));
      } else {
        return res.status(400).json({ message: "Invalid" });
      }
    } else if (req.method === "POST") {
      if (req.body.resultId !== undefined && req.body.resultIndex !== undefined && req.body.upvote !== undefined) {
        console.info("Upvote result", req.body.resultId, req.body.resultIndex, req.body.upvote);
        await addLikeResult(
          sessionId,
          req.body.resultId,
          parseInt(req.body.resultIndex, 10),
          parseInt(req.body.upvote, 10)
        );
        return res.status(200).json({ message: "OK" });
      } else if (req.body.chatId !== undefined && req.body.upvote !== undefined) {
        console.info("Upvote chat", req.body.chatId, req.body.upvote);
        await addLikeChat(sessionId, req.body.chatId, parseInt(req.body.upvote, 10));
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
