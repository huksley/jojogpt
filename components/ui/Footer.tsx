import useSWR from "swr";

export const Footer = () => {
  const { data: limit } = useSWR("/api/tokens", (url: string) => fetch(url).then((r) => r.json()), {
    refreshInterval: 10000,
  });

  return (
    <>
      <div className="text-center my-4">
        2020-2023 &copy; Valosan Oy. Jojo GPT is powered by ChatGPT and Valosan PR Platform | Tokens used:{" "}
        {limit?.current}
      </div>
    </>
  );
};
