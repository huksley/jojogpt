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
          
Instructions: Using the provided web search results, write a detailed reply to the query.
Make sure to cite results using [[number](URL)] notation after the reference.
Use your best guess, and provide names of journalists with a link to the article.
Query: ${query}`;
}
