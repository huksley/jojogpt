import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { Arguments, BareFetcher, SWRConfig, SWRConfiguration, SWRHook, Middleware } from "swr";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>JojoGPT</title>
        <meta name="description" content="Find the right journalist for your startup idea. Connect in minutes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <Script async defer data-domain="jojogpt.valosan.com" src="https://t.valosan.com/js/collect.js" />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
