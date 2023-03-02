import useSWR from "swr";
import { Result } from "../pages/api/query";
import { trackLink, trackOnClick } from "./trackLink";
import { addLike } from "./addLike";

export const ResultItem = ({ item, index }: { item: Result; index: number }) => {
  const { data: upvote, mutate: invalidate } = useSWR<{ negative: 0; positive: 0 }>(
    ["/api/like", item.id, index],
    ([url, id, index]: string[]) => fetch(url + "?resultId=" + id + "&resultIndex=" + index).then((r) => r.json())
  );

  return (
    <div key={item.href} className="flex flex-col gap-2">
      <hr className="mb-4" />
      <h3 className="SectionSubTitle mb-4">
        [{index + 1}] 🌐 {new URL(item.href).hostname.replace("www.", "").replace(/blog\./, "")}: {item.title}
      </h3>
      <div className="mb-4">{item.body}</div>
      <div className="flex flex-row justify-between gap-4">
        <a
          className="button p-4"
          href={item.href}
          onClick={trackLink("ResultGo", { domain: new URL(item.href).hostname })}
          rel="noopener noreferrer"
          target="_blank"
        >
          Go →
        </a>

        {item.id && item.id !== "0" && upvote ? (
          <div className="flex flex-row justify-end gap-2">
            <button
              className="p-4"
              onClick={trackOnClick("Upvote", { domain: new URL(item.href).hostname }, () => {
                addLike({ resultId: item.id, resultIndex: index, upvote: 1 }, () => invalidate());
              })}
            >
              👍 {upvote?.positive}
            </button>
            <button
              className="p-4"
              onClick={trackOnClick("Downvote", { domain: new URL(item.href).hostname }, () => {
                addLike({ resultId: item.id, resultIndex: index, upvote: -1 }, () => invalidate());
              })}
            >
              👎 {upvote?.negative}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
