import { trackLink } from "./track";

const Paywall = () => {
  return (
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
  );
};
