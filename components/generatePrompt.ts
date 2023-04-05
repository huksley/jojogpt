import { Result } from "./querySearch";

export function generatePrompt(json: Result[], query: string, maxResults?: number) {
  return `Web search results:
${json
  .filter((_, index) => !maxResults || index < maxResults)
  .map(
    (c, index) => `[${index + 1}] "${c.title}"
URL: ${c.href}
`
  )
  .join("\n")}

Instructions: Write summary of your knowledge based on provided search results and
cite results using [[number](URL)] notation after the reference.
If search results are not relevant, write based on your own knowledge. 
Do not write "I am sorry", that you are AI model, do not know, etc. 
Query: ${query}`;
}
