export const isPromise = (value: any) => {
  return (
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
};

export const $ = (selector: string) => document.getElementById(selector);
