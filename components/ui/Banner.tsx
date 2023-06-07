export const Banner = () => (
  <>
    <h2 className="Heading2 mt-[128px]">Need more?</h2>
    <div className="bg-box my-8 flex flex-col gap-8 md:gap-4 px-6 md:px-12 py-12">
      <h3 className="SectionBigTitle">Do PR yourself</h3>
      <div className="Desc mt-2 mb-4">
        Build connections with journalists to be a news source about your startup and a thought leader in your field.
        Learn more about PR in Michael Seibel&apos;s (Managing Director at YCombinator) article{" "}
        <a href="https://www.michaelseibel.com/blog/getting-press-for-your-startup">
          &quot;Getting press for your startup&quot;
        </a>
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
          <div className="Desc">Track the publications you love and get notified when they publish a new article.</div>
        </div>
      </div>

      <div className="flex flex-col mt-4 md:flex-row gap-6 justify-between items-start">
        <h2 className="Heading2 md:w-[40%]">Use our PR platform to do PR 10x faster.</h2>
        <div>
          <a href="https://valosan.com?utm_source=jojogpt" className="button px-8 py-4">
            Explore Valosan
          </a>
        </div>
      </div>
    </div>
  </>
);
