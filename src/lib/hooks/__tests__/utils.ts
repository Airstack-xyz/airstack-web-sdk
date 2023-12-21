import { waitFor } from "@testing-library/react";
import crossFetch from "cross-fetch";
global.fetch = crossFetch;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function waitForLoadingStartAndStop(result: any) {
  expect(result.current[1].loading).toBe(true);
  await waitFor(
    () => {
      expect(result.current[1].loading).toBe(false);
    },
    {
      timeout: 20000,
    }
  );
}
