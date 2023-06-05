export function stringifyObjectValues(obj: Record<string, any>) {
  const stringified: Record<string, string> = {};
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      stringified[key] = JSON.stringify(obj[key]);
    } else {
      stringified[key] = obj[key];
    }
  }
  return stringified;
}
