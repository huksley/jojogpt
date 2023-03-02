// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getCache } from "@/components/cache";
import { Limit } from "../../components/limit";
import { createHash } from "crypto";
import { tokens } from "@/components/test";
consoleStamp(console);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const limit = await tokens(0);
    return res.status(200).json({ ...limit });
  } catch (err: any) {
    console.warn(
      "Error",
      err?.message,
      "response",
      err?.response?.status,
      err?.response?.statusText,
      err?.response?.data
    );
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
