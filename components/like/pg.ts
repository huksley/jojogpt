import consoleStamp from "console-stamp";
import { timestampDay } from "../limit";
import { createClient } from "@supabase/supabase-js";
import { Result } from "../../pages/api/query";

consoleStamp(console);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : undefined;

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

export const addLikeResult = async (session_id: string, result_id: string, result_index: number, upvote: number) => {
  if (!supabase) {
    console.info("saveLike: No supabase");
    return;
  }

  const { data, error } = await supabase
    .from("likes")
    .upsert(
      [
        {
          session_id,
          result_id,
          result_index,
          upvote: Math.sign(upvote),
          updated_at: new Date(),
        },
      ],
      {
        onConflict: "session_id,result_id,result_index",
      }
    )
    .select();

  if (error) {
    console.warn("Failed to upsert", error);
  } else {
    return data[0].id as string;
  }
};

export const addLikeChat = async (session_id: string, chat_id: number, upvote: number) => {
  if (!supabase) {
    console.info("saveLike: No supabase");
    return;
  }

  const { data, error } = await supabase
    .from("likes")
    .upsert(
      [
        {
          session_id,
          chat_id,
          upvote: Math.sign(upvote),
          updated_at: new Date(),
        },
      ],
      { onConflict: "session_id,chat_id" }
    )
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
    return { positive: 0, negative: 0 };
  }
  console.info("getLikesResult", result_id, result_index);
  const { data, error } = await supabase
    .rpc("get_upvote_result", {
      result_id_to_check: result_id,
      result_index_to_check: result_index,
    })
    .select();

  if (error) {
    console.warn("Failed to select", error);
    return { positive: 0, negative: 0 };
  } else {
    return data[0] || { positive: 0, negative: 0 };
  }
};

export const getLikesChat = async (chat_id: string) => {
  if (!supabase) {
    console.info("getLikesChat: No supabase");
    return { positive: 0, negative: 0 };
  }

  const { data, error } = await supabase.rpc("get_upvote_chat", { chat_id_to_check: chat_id }).select();

  if (error) {
    console.warn("Failed to select", error);
    return { positive: 0, negative: 0 };
  } else {
    return data[0] || { positive: 0, negative: 0 };
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
