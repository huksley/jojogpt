export const addLike = (data: any, callback: () => void) => {
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
