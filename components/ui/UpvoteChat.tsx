import useSWR from "swr";
import { trackOnClick } from "./track";
import { addLike } from "../like/addLike";

export const UpvoteChat = ({ chatId }: { chatId?: string }) => {
  const { data: upvote, mutate: invalidate } = useSWR<{ negative: 0; positive: 0 }>(
    chatId && chatId != "0" ? ["/api/like", chatId] : null,
    ([url, id]: string[]) => fetch(url + "?chatId=" + id).then((r) => r.json())
  );

  return upvote ? (
    <div className="flex flex-row gap-2 justify-end">
      <button
        className="p-4"
        onClick={trackOnClick("UpvoteChat", { chatId }, () => {
          addLike({ chatId, upvote: 1 }, () => invalidate());
        })}
      >
        👍 {upvote?.positive}
      </button>
      <button
        className="p-4"
        onClick={trackOnClick("DownvoteChat", { chatId }, () => {
          addLike({ chatId, upvote: -1 }, () => invalidate());
        })}
      >
        👎 {upvote?.negative}
      </button>
    </div>
  ) : null;
};
