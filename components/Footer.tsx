import useSWR from "swr";

export const Footer = () => {
  const { data: limit } = useSWR("/api/tokens", (url: string) => fetch(url).then((r) => r.json()), {
    refreshInterval: 10000,
  });

  return (
    <>
      <div className="Desc text-center my-4">
        2020-2023 &copy; Valosan Oy. All rights reserved. Jojo GPT is powered by ChatGPT by OpenAI and Valosan PR
        Platform.
      </div>

      <div className="Desc text-center my-4">
        Do you find JojoGPT useful? Please consider{" "}
        <a href="https://www.buymeacoffee.com/huksley?utm_source=jojogpt">buying me a ☕ coffee</a>.
      </div>

      <div className="Desc text-center my-4">Tokens used: {limit?.current}</div>
    </>
  );
};
