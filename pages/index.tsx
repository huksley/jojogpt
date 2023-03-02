import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import React, { useState } from "react";
import useSWR from "swr";
import { Data, Result } from "./api/query";
import { useQueryState } from "next-usequerystate";
import { trackLink, trackOnClick, track } from "../components/trackLink";
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

const countries = [
  "🇦🇺 Australia",
  "🇦🇹 Austria",
  "🇧🇪 Belgium",
  "🇧🇷 Brazil",
  "🇨🇦 Canada",
  "🇨🇭 Switzerland",
  "🇨🇿 Czech Republic",
  "🇩🇪 Germany",
  "🇪🇸 Spain",
  "🇫🇮 Finland",
  "🇫🇷 France",
  "🇬🇧 UK",
  "🇭🇺 Hungary",
  "🇮🇪 Ireland",
  "🇮🇹 Italy",
  "🇯🇵 Japan",
  "🇱🇹 Lithuania",
  "🇳🇱 Netherlands",
  "🇳🇴 Norway",
  "🇵🇱 Poland",
  "🇵🇹 Portugal",
  "🇷🇺 Russia",
  "🇸🇪 Sweden",
  "🇹🇷 Turkey",
  "🇺🇸 USA",
  "🇺🇦 Ukraine",
  "🇺🇿 Uzbekistan",
  "🇻🇳 Vietnam",
  "🇿🇦 South Africa",
];

export const removeEmoji = (str: string) => str.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "").trim();

const industries = [
  "🚀 Tech",
  "🏦 Finance",
  "🏥 Healthcare",
  "🏭 Manufacturing",
  "🏢 Business",
  "🏫 Education",
  "🏡 Real Estate",
  "🏛️ Government",
  "🏆 Sports",
  "🎨 Arts",
  "🎮 Gaming",
  "🎥 Media",
  "🎨 Design",
  "🎨 Fashion",
  "🎨 Beauty",
  "🎨 Food",
  "🎨 Travel",
  "🎨 Lifestyle",
  "🎨 Entertainment",
  "🎨 Music",
  "🎨 Events",
  "🎨 Culture",
  "🎨 Religion",
  "🎨 Politics",
  "🎨 Science",
  "🎨 Environment",
  "🎨 Energy",
  "🎨 Transportation",
  "🎨 Construction",
  "🎨 Agriculture",
  "🎨 Mining",
];

const addLike = (data: any, callback: () => void) => {
  console.info("Submitting", data);
  return fetch("/api/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then((r) => {
      console.log(r);
      callback();
    })
    .catch((e) => {
      console.warn("Rate limited", e);
    });
};

const UpvoteChat = ({ chatId }: { chatId?: string }) => {
  const { data: upvote, mutate: invalidate } = useSWR<{ negative: 0; positive: 0 }>(
    chatId && chatId != "0" ? ["/api/like", chatId] : null,
    ([url, id]: string[]) => fetch(url + "?chatId=" + id).then((r) => r.json())
  );

  return (
    <div className="flex flex-row gap-2 justify-end">
      <button
        className="p-4"
        onClick={trackOnClick("UpvoteChat", { chatId }, () => {
          addLike({ chatId, upvote: 1 }, () => invalidate());
        })}
      >
        Upvote&nbsp;&nbsp;⬆️&nbsp;&nbsp;{upvote?.positive}
      </button>
      <button
        className="p-4"
        onClick={trackOnClick("DownvoteChat", { chatId }, () => {
          addLike({ chatId, upvote: -1 }, () => invalidate());
        })}
      >
        Downvote&nbsp;&nbsp;⬇️&nbsp;&nbsp;{upvote?.negative}
      </button>
    </div>
  );
};

const ResultItem = ({ item, index }: { item: Result; index: number }) => {
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

        {item.id && item.id !== "0" ? (
          <div className="flex flex-row justify-end gap-2">
            <button
              className="p-4"
              onClick={trackOnClick("Upvote", { domain: new URL(item.href).hostname }, () => {
                addLike({ resultId: item.id, resultIndex: index, upvote: 1 }, () => invalidate());
              })}
            >
              Upvote&nbsp;&nbsp;⬆️&nbsp;&nbsp;{upvote?.positive}
            </button>
            <button
              className="p-4"
              onClick={trackOnClick("Downvote", { domain: new URL(item.href).hostname }, () => {
                addLike({ resultId: item.id, resultIndex: index, upvote: -1 }, () => invalidate());
              })}
            >
              Downvote&nbsp;&nbsp;⬇️&nbsp;&nbsp;{upvote?.negative}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [country, setCountry] = useState("");
  const [count, setCount] = useState("0");
  const [retry, setRetry] = useQueryState("retry", {
    defaultValue: "0",
  });

  const { data, isLoading } = useSWR<Data>(
    value && country && count != "0" ? ["/api/query", value, country] : null,
    ([url, value, country]: string[]) =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value, country }),
      }).then((r) => r.json()),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );

  const { data: limit } = useSWR("/api/tokens", (url: string) => fetch(url).then((r) => r.json()));

  return (
    <>
      <Head>
        <title>JojoGPT</title>
        <meta name="description" content="Find the right journalist for your startup idea. Connect in minutes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <script async defer data-domain="jojogpt.valosan.com" src="https://t.valosan.com/js/collect.js"></script>
      </Head>

      <header>
        <div className="mt-4 mb-4 md:mt-12 md:mb-12 flex flex-col md:flex-row gap-2 md:justify-between items-center">
          <div className="flex flex-row items-center gap-3 md:gap-8">
            <a href="?">
              <span className="Menu">🪀 JojoGPT</span>
            </a>
          </div>

          <div className="flex flex-row items-center gap-8">
            <a href="https://valosan.com?utm_source=jojogpt" target="_blank" rel="noopener noreferrer">
              Brought to you by Valosan PR Platform
            </a>
          </div>
        </div>
      </header>
      <main className="main">
        {parseInt(retry, 10) >= 2 ? (
          <div className="center">
            <h1 className="Heading my-4">Signup for Valosan to get more results</h1>
            <div className="flex flex-row my-4">
              <a
                className="button p-4"
                onClick={trackLink("ValosanSignup")}
                href="https://app.valosan.com/signup?utm_source=jojogpt"
              >
                Let me in 🔥
              </a>
            </div>
          </div>
        ) : data ? (
          <div className="center">
            <h1 className="Heading">
              I am creating a new product in {removeEmoji(value)} and I want to connect with a journalist in{" "}
              {removeEmoji(country)}
            </h1>

            <h2 className="SectionTitle mt-8 mb-4">JojoGPT recommends these {data?.links.length} resources:</h2>

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
              <button
                className="p-4"
                onClick={trackOnClick("TryAgain", { retry }, (event) => {
                  window.location.replace("/?retry=" + (parseInt(retry, 10) + 1));
                })}
              >
                Try again 🚀
              </button>
            </div>
          </div>
        ) : (
          <div className="center">
            <h1 className="Heading my-4">Do you want to get press coverage for your startup?</h1>

            <div className="Desc mb-4">
              Building trustworthy relationships with journalists and getting published in international media like
              TechCrunch, Forbes, Fast Company, or Bloomberg is a proven way to build your audience.
            </div>

            <div className="Desc mb-4">
              Did you know that Series-A and C startups getting press coverage get 3x-5x more funding than those without
              talking to the press?
            </div>

            <div className="SectionTitle">Search below to find journalists 👇</div>

            <h2 className="Desc my-4">I am creating a new product in the field</h2>

            <select
              className="p-5"
              value={value}
              onChange={(event) => {
                track(undefined, "IndustrySelect", {
                  industry: event.target.value,
                });
                setValue(event.target.value);
              }}
            >
              <option>💥 SELECT 💥</option>
              {industries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            {value !== "" ? (
              <>
                <h2 className="Desc my-4">and I want to connect with a journalist in</h2>
                <select
                  className="p-5"
                  value={country}
                  onChange={(event) => {
                    track(undefined, "CountrySelect", {
                      country: event.target.value,
                    });
                    setCountry(event.target.value);
                  }}
                >
                  <option>💥 SELECT 💥</option>
                  {countries.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <h2 className="Desc my-4">Select 👆</h2>
            )}

            {value && country ? (
              <>
                <h2 className="SectionTitle my-4">Press to get contacts 👇</h2>
                <button
                  disabled={isLoading}
                  className="p-4"
                  onClick={trackOnClick(
                    "Find",
                    {
                      industry: value,
                      country,
                    },
                    (_) => {
                      setCount(String(parseInt(count, 10) + 1));
                    }
                  )}
                >
                  Find 🚀
                </button>
              </>
            ) : value ? (
              <h2 className="Desc my-4">Select 👆</h2>
            ) : null}
          </div>
        )}
        <h2 className="Heading2 mt-[128px]">Need more?</h2>
        <div className="bg-box my-8 flex flex-col gap-8 md:gap-4 px-6 md:px-12 py-12">
          <h3 className="SectionBigTitle">Do PR yourself</h3>
          <div className="Desc my-6">
            You should build your own connection with journalist to be a good source and thought leader in your field.
            Learn more about PR in Michael Seibel&apos;s (Managing Director at YCombinator) article{" "}
            <a href="https://www.michaelseibel.com/blog/getting-press-for-your-startup">
              &quot;Getting press for your startup&quot;
            </a>
            .
          </div>

          <div className="flex flex-col md:grid grid-cols-4 gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="SectionTitle">Find journalists</h3>
              <div className="Desc">
                Understand your audience, plan your PR strategy, and find the right journalists to reach out to.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="SectionTitle">Write the story</h3>
              <div className="Desc">Write convincing pitch, and prepare the press release.</div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="SectionTitle">Build connections</h3>
              <div className="Desc">Follow the journalists, connect and pitch your idea.</div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="SectionTitle">Monitor media</h3>
              <div className="Desc">
                Track the publications you love and get notified when they publish a new article.
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-4 md:flex-row gap-6 justify-between items-start">
            <h2 className="Heading2 md:w-[40%]">Use our PR platform to do everything 10x faster.</h2>
            <div>
              <a href="https://valosan.com?utm_source=jojogpt" className="button px-8 py-4">
                Explore Valosan
              </a>
            </div>
          </div>
        </div>

        <div className="Desc text-center my-4">
          2020-2023 &copy; Valosan Oy. All rights reserved. Jojo GPT is powered by ChatGPT by OpenAI and Valosan PR
          Platform.
        </div>

        <div className="Desc text-center my-4">
          Do you find JojoGPT useful? Please consider{" "}
          <a href="https://www.buymeacoffee.com/huksley?utm_source=jojogpt">buying me a ☕ coffee</a>.
        </div>

        <div className="Desc text-center my-4">Tokens used: {limit?.current}</div>
      </main>
    </>
  );
}
