import { trackOnClick, track } from "./track";
import { industries, countries } from "@/components/data";
import { sortByStringWithEmojiRemoved } from "./emoji";
import { useRouter } from "next/router";

export const Form = ({
  value,
  setValue,
  country,
  setCountry,
  isLoading,
  search,
}: {
  value: string;
  setValue: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  isLoading: boolean;
  search?: () => void;
}) => {
  const router = useRouter();
  return (
    <div className="center" key="Form">
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
              search
            )}
          >
            Find <span className={isLoading ? "fly text-lg" : "text-lg"}>🚀</span>
          </button>
        </>
      ) : null}
    </div>
  );
};
