/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export const Header = () => {
  return (
    <header>
      <div className="mt-4 mb-4 md:mt-12 md:mb-12 flex flex-col md:flex-row gap-2 md:justify-between items-center">
        <div className="flex flex-row items-center gap-3 md:gap-8">
          <Link href="/">
            <span className="Menu">🪀 JojoGPT</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center md:gap-8 gap-4">
          <a
            href="https://www.producthunt.com/posts/jojogpt?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jojogpt"
            target="_blank"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=382092&theme=light"
              alt="JojoGPT - Find the right journalist with an AI | Product Hunt"
              height="40"
              className="object-contain max-h-[40px]"
            />
          </a>

          <a
            href="https://news.ycombinator.com/item?id=34996803"
            className="flex flex-row justify-center gap-2 font-bold"
          >
            <img
              src="/y.webp"
              alt="Post on YCombinator News"
              height={24}
              className="rounded bg-[#ffffff] object-contain max-h-[24px]"
            />
            Hacker News
          </a>
          <a href="https://valosan.com?utm_source=jojogpt" target="_blank" rel="noopener noreferrer">
            Brought to you by Valosan PR Platform
          </a>
        </div>
      </div>
    </header>
  );
};
