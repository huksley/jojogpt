/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useQueryState } from "next-usequerystate";
import { Banner } from "../components/ui/Banner";
import { Form } from "@/components/ui/Form";
import { useEffect, useState } from "react";
import { Display } from "@/components/ui/Display";
import useSWR from "swr";
import { Data } from "./api/query";

export default function Home() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setLoading] = useState(false);

  const { data, isLoading: isDataLoading } = useSWR<Data>(
    isLoading && industry && country ? ["/api/query", industry, country] : null,
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

  useEffect(() => {
    if (router.isReady) {
      const { industry, country } = router.query as { industry: string; country: string };
      setIndustry(industry ?? "");
      setCountry(country ?? "");
    }

    if (Object.keys(router.query).length === 0) {
      setLoading(false);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (data && !isDataLoading && typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [data, isDataLoading]);

  return (
    <main className="main" suppressHydrationWarning>
      {data ? (
        <Display value={industry} country={country} data={data} />
      ) : (
        <Form
          value={industry}
          setValue={setIndustry}
          country={country}
          setCountry={setCountry}
          isLoading={isLoading}
          search={() => {
            setLoading(true);
            router.push("/?" + new URLSearchParams({ industry, country }).toString(), undefined, {
              shallow: true,
            });
          }}
        />
      )}
      <Banner />
    </main>
  );
}
