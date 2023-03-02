export const sortByStringWithEmojiRemoved = (a: string, b: string) => {
  const aWithoutEmojii = removeEmoji(a);
  const bWithoutEmojii = removeEmoji(b);
  if (aWithoutEmojii < bWithoutEmojii) {
    return -1;
  }

  if (aWithoutEmojii > bWithoutEmojii) {
    return 1;
  }

  return 0;
};

export const removeEmoji = (str: string) => str.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "").trim();
