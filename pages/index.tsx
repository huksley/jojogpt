/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { Data } from "./api/query";
import { useQueryState } from "next-usequerystate";
import { trackLink, trackOnClick, track } from "../components/trackLink";
import { formatMarkdown } from "../components/formatMarkdown";
import { industries, countries } from "../components/data";
import { removeEmoji, sortByStringWithEmojiRemoved } from "../components/emoji";
import { UpvoteChat } from "../components/UpvoteChat";
import { ResultItem } from "../components/ResultItem";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

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

  return (
    <>
      <Head>
        <title>JojoGPT</title>
        <meta name="description" content="Find the right journalist for your startup idea. Connect in minutes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
        <script async defer data-domain="jojogpt.valosan.com" src="https://t.valosan.com/js/collect.js"></script>
      </Head>

      <Header />

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

            <h2 className="SectionTitle mt-8 mb-4">
              JojoGPT recommends to read these {data?.links.length} web results:
            </h2>

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
              Did you know that Series A to C startups getting press coverage raise 3-5x more funding than those without
              talking to the press? It all starts with finding the right journalist to cover your story.
            </div>

            <div className="SectionTitle">Find journalists 👇</div>

            <h2 className="Desc my-4">I am creating a new product in the field of</h2>

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
              {industries.sort(sortByStringWithEmojiRemoved).map((value) => (
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
                  {countries.sort(sortByStringWithEmojiRemoved).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </>
            ) : null}

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
                  Find <span className={isLoading ? "fly text-lg" : "text-lg"}>🚀</span>
                </button>
              </>
            ) : null}
          </div>
        )}
        <h2 className="Heading2 mt-[128px]">Need more?</h2>
        <div className="bg-box my-8 flex flex-col gap-8 md:gap-4 px-6 md:px-12 py-12">
          <h3 className="SectionBigTitle">Do PR yourself</h3>
          <div className="Desc mt-2 mb-4">
            Build connections with journalists to be a news source about your startup and a thought leader in your
            field. Learn more about PR in Michael Seibel&apos;s (Managing Director at YCombinator) article{" "}
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
              <div className="Desc">Follow the journalists, e-mail to them and pitch your idea.</div>
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
        <Footer />
      </main>
    </>
  );
}
