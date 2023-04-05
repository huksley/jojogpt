import type { NextApiRequest, NextApiResponse } from "next";
import consoleStamp from "console-stamp";
import { queryChatGpt } from "@/components/gpt";
consoleStamp(console);

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
