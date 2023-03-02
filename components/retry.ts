/** Retry execution of specified function */

export const retry = async <T>(fn: () => Promise<T>, attempts = 3, interval = 1000, name?: string): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.info("Retrying", name ?? "func", "ignoring error", error, "attempts left", attempts);
    if (attempts > 0) {
      return new Promise((resolve, reject) =>
        setTimeout(
          () =>
            retry(fn, attempts - 1, interval)
              .then(resolve)
              .catch(reject),
          interval
        )
      );
    }

    throw error;
  }
};
