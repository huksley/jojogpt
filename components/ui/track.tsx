export type UserEvent =
  | React.UIEvent<HTMLElement, Event>
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | React.ChangeEvent<HTMLSelectElement>
  | React.MouseEvent<HTMLButtonElement, Event>
  | React.MouseEvent<HTMLAnchorElement, Event>
  | React.MouseEvent<Element, Event>
  | React.KeyboardEvent<HTMLInputElement>
  | React.FormEvent<HTMLFormElement>;

export const meh = (event: UserEvent) => {
  event.preventDefault();
  event.stopPropagation();
  return true;
};

type Goal =
  | "IndustrySelect"
  | "CountrySelect"
  | "Find"
  | "ResultGo"
  | "TryAgain"
  | "ValosanSignup"
  | "Upvote"
  | "Downvote"
  | "UpvoteChat"
  | "DownvoteChat";

const logger = console as Console & { verbose: (message?: any, ...optionalParams: any[]) => void };
logger.verbose = 1 === 1 + 0 ? logger.warn : () => {};

type PlausibleTracker = (
  goal: string,
  props?: { callback?: () => void; [key: string]: string | number | unknown }
) => void;

/** Track onClick events */
export const trackOnClick =
  (goal: Goal, props?: Record<string, unknown>, onClick?: (event: UserEvent) => void) => (event: UserEvent) =>
    track(event, goal, props).then((_) => onClick && onClick(event));

/** Track link events for hrefs <a href="/link" onClick={trackLink(goal, props)}>Hello</a> */
export const trackLink =
  (goal: Goal, props?: Record<string, unknown>) => (event: React.MouseEvent<HTMLAnchorElement, Event>) =>
    track(event, goal, props);

/**
 * Logs frontend event to analytics, if enabled, as `goal(goal, props?)`
 *
 * - https://docs.plausible.io/custom-event-goals/
 */
export const track = (event: UserEvent | undefined, goal: Goal, props?: Record<string, unknown>): Promise<boolean> => {
  // FIXME: arguments are different from one at https://github.com/plausible/plausible-tracker
  const tracker = (global as any).plausible as PlausibleTracker | undefined;

  let click = () => true;
  if (event) {
    // If it is a href, emulate click so our event have a chance to get through
    // after you immediately navigating to other page. It cancels XHR request to send analytics
    // See: outbound link tracking
    const element = event.target as HTMLElement;
    const tree = [element, element.parentNode as HTMLElement];

    const clickElement = (el: HTMLAnchorElement) => () => {
      if (el.target) {
        window.open(el.href, el.target);
      } else {
        window.location.href = el.href;
      }
      return true;
    };

    const submitForm = (el: HTMLButtonElement) => () => {
      if (!el.form) {
        throw new Error("Element " + (el.id || el.name) + " have no form");
      }
      el.form.submit();
      return true;
    };

    tree.forEach((el) => {
      if (el.nodeName === "A" && el instanceof HTMLAnchorElement && el.href.startsWith("https://") && !el.target) {
        meh(event);
        click = clickElement(el);
      }

      if (el.nodeName === "BUTTON" && el instanceof HTMLButtonElement && el.form) {
        meh(event);
        click = submitForm(el);
      }
    });
  }

  const isLocalhost = /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(window.location.hostname);

  if (!tracker) {
    click();
    logger.verbose("Skipping tracking", goal, props);
    return Promise.resolve(false);
  } else {
    return new Promise((resolve) => {
      if (tracker && !isLocalhost) {
        logger.verbose("Tracking goal", goal, props);
        tracker(goal, {
          callback: () => {
            click();
            resolve(true);
          },
          props,
        });
      } else {
        logger.verbose("Skipping tracking goal", goal, props);
        click();
        resolve(false);
      }
    });
  }
};
