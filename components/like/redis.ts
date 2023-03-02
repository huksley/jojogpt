import { getCache } from "@/components/cache";

interface Like {
  positive: number;
  negative: number;
}

export const getLikesChat = async (chatId: string) => {
  const cache = await getCache();
  const key = `like:${chatId}`;
  const value = await cache.get<Like>(key);
  return value || { positive: 0, negative: 0 };
};

export const getLikesResult = async (resultId: string, resultIndex: number) => {
  const cache = await getCache();
  const key = `like:${resultId}:${resultIndex}`;
  const value = await cache.get<Like>(key);
  return value || { positive: 0, negative: 0 };
};

export const addLikeChat = async (sessionId: string, chatId: string, upvote: number) => {
  const cache = await getCache();
  const key = `like:${chatId}`;
  const value = await cache.get<Like>(key);
  const voted = await cache.get<number>(`voted:${sessionId}:${chatId}`);
  if (!voted) {
    if (value) {
      await cache.set(key, {
        positive: upvote > 0 ? value.positive + Math.sign(upvote) : value.positive,
        negative: upvote < 0 ? value.negative - Math.sign(upvote) : value.negative,
      });
      await cache.set(`voted:${sessionId}:${chatId}`, 1);
    } else {
      await cache.set(key, { positive: upvote > 0 ? upvote : 0, negative: upvote < 0 ? -upvote : 0 });
    }
  } else {
    console.info("Already voted", key);
  }
};

export const addLikeResult = async (sessionId: string, resultId: string, resultIndex: number, upvote: number) => {
  const cache = await getCache();
  const key = `like:${resultId}:${resultIndex}`;
  const value = await cache.get<{ positive: number; negative: number }>(key);
  const voted = await cache.get<number>(`voted:${sessionId}:${resultId}:${resultIndex}`);
  if (!voted) {
    if (value) {
      await cache.set(key, {
        positive: upvote > 0 ? value.positive + Math.sign(upvote) : value.positive,
        negative: upvote < 0 ? value.negative - Math.sign(upvote) : value.negative,
      });
      await cache.set(`voted:${sessionId}:${resultId}:${resultIndex}`, 1);
    } else {
      await cache.set(key, { positive: upvote > 0 ? upvote : 0, negative: upvote < 0 ? -upvote : 0 });
    }
  } else {
    console.info("Already voted", key);
  }
};
