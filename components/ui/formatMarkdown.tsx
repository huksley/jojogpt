import React from "react";
import { compiler, MarkdownToJSX } from "markdown-to-jsx";

const DivElement = ({ children, ...props }: { children: React.ReactNode; props: unknown }) =>
  React.createElement("div", { ...props, className: "markdown" }, children);

export const formatMarkdown = (
  str: string | string[] | undefined,
  options?: MarkdownToJSX.Options,
  overrides?: MarkdownToJSX.Overrides,
  forceBlock?: boolean
) => {
  if (str === undefined) {
    return null;
  }
  return compiler(Array.isArray(str) ? str.join() : typeof str === "string" ? str : String(str), {
    wrapper: DivElement,
    overrides: {
      ...overrides,
    },
    disableParsingRawHTML: true,
    ...options,
  });
};
