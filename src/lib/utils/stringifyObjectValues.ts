export function stringifyObjectValues(value: Record<string, any>) {
  const stringified: Record<string, string> = {};
  if (!value || typeof value !== "object") return value;

  for (const key in value) {
    if (Array.isArray(value[key])) {
      stringified[key] = value[key].map((item: any) =>
        stringifyObjectValues(item)
      );
    } else if (typeof value[key] === "object") {
      stringified[key] = JSON.stringify(value[key]);
    } else {
      stringified[key] = value[key];
    }
  }
  return stringified;
}
