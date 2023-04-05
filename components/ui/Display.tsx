import { trackOnClick } from "./track";
import { formatMarkdown } from "./formatMarkdown";
import { removeEmoji } from "./emoji";
import { UpvoteChat } from "./UpvoteChat";
import { ResultItem } from "./ResultItem";
import { useRouter } from "next/router";
import { Data } from "@/components/querySearch";

export const Display = ({ value, country, data }: { value: string; country: string; data: Data }) => {
  const router = useRouter();
  return (
    <div className="center" key="Display">
      <h1 className="Heading">
        I am creating a new product in {removeEmoji(value)} and I want to connect with a journalist in{" "}
        {removeEmoji(country)}
      </h1>

      <h2 className="SectionTitle mt-8 mb-4">JojoGPT recommends to read these {data?.links.length} web results:</h2>

      <div className="my-4 flex flex-col gap-4">
        {data.links.map((item, index) => (
          <ResultItem item={item} key={index} index={index} />
        ))}
      </div>

      {data?.message ? (
        <>
          <h2 className="SectionTitle mt-8 mb-4">JojoGPT suggestions:</h2>
          <hr className="my-4" />
          {formatMarkdown(data?.message)}
          <UpvoteChat chatId={data?.chatId} />
        </>
      ) : null}

      <hr className="my-4" />
      <div className="my-4">
        <button className="p-4" onClick={trackOnClick("TryAgain", undefined, (_event) => router.push("/"))}>
          Try again 🚀
        </button>
      </div>
    </div>
  );
};
