// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getCache } from "@/components/cache";
import { Limit, timestampDay } from "./limit";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Result } from "../pages/api/query";

consoleStamp(console);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : undefined;

interface Req {}

interface Resp {}

export const saveResults = async (industry: string, country: string, list: Result[]) => {
  if (!supabase) {
    console.info("saveResults: No supabase");
    return;
  }
  const { data, error } = await supabase
    .from("results")
    .upsert(
      [
        {
          period: timestampDay(new Date()),
          industry,
          country,
          items: list,
          updated_at: new Date(),
        },
      ],
      { onConflict: "period,industry,country" }
    )
    .select();

  if (error) {
    console.warn("Failed to upsert", error);
  } else {
    return data[0].id as string;
  }
};

export const saveLikeResult = async (result_id: string, result_index: number, upvote: number) => {
  if (!supabase) {
    console.info("saveLike: No supabase");
    return;
  }

  const { data, error } = await supabase
    .from("likes")
    .insert([
      {
        result_id,
        result_index,
        upvote: Math.sign(upvote),
      },
    ])
    .select();

  if (error) {
    console.warn("Failed to upsert", error);
  } else {
    return data[0].id as string;
  }
};

export const saveLikeChat = async (chat_id: number, upvote: number) => {
  if (!supabase) {
    console.info("saveLike: No supabase");
    return;
  }

  const { data, error } = await supabase
    .from("likes")
    .insert([
      {
        chat_id,
        upvote: Math.sign(upvote),
      },
    ])
    .select();

  if (error) {
    console.warn("Failed to upsert", error);
  } else {
    return data[0].id as string;
  }
};

export const getLikesResult = async (result_id: string, result_index: number) => {
  if (!supabase) {
    console.info("getLikesResult: No supabase");
    return;
  }
  console.info("getLikesResult", result_id, result_index);
  const { data, error } = await supabase
    .rpc("get_upvote_result", {
      result_id_to_check: result_id,
      result_index_to_check: result_index,
    })
    .select();
  console.info("Data", data);

  if (error) {
    console.warn("Failed to select", error);
  } else {
    return data[0];
  }
};

export const getLikesChat = async (chat_id: string) => {
  if (!supabase) {
    console.info("getLikesChat: No supabase");
    return;
  }

  const { data, error } = await supabase.rpc("get_upvote_result", { chat_id_to_check: chat_id }).select();

  if (error) {
    console.warn("Failed to select", error);
  } else {
    return data[0];
  }
};

export const saveChat = async (
  industry: string,
  country: string,
  resultId: string,
  query: string,
  response: string
) => {
  if (!supabase) {
    console.info("saveChat: No supabase");
    return;
  }

  const { data, error } = await supabase
    .from("chats")
    .upsert(
      [
        {
          period: timestampDay(new Date()),
          industry,
          country,
          query,
          response,
          updated_at: new Date(),
        },
      ],
      { onConflict: "period,industry,country" }
    )
    .select();

  if (error) {
    console.warn("Failed to upsert", error);
  } else {
    return data[0].id as string;
  }
};

export default async function handler(req: NextApiRequest & Req, res: NextApiResponse<Resp>) {
  try {
    if (req.method === "GET") {
      if (req.query.resultId && req.query.resultIndex) {
        return res.status(200).json({
          data: getLikesResult(req.query.resultId as string, parseInt(req.query.resultIndex as string, 10)),
        });
      } else if (req.query.chatId) {
        return res.status(200).json({ data: getLikesChat(req.query.chatId as string) });
      } else {
        return res.status(400).json({ message: "Invalid" });
      }
    } else if (req.method === "POST") {
    }
    return res.status(400).json({ message: "Invalid" });
  } catch (err: any) {
    console.warn("Error", err?.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
