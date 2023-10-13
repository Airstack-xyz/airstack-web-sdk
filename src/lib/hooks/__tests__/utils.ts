import { waitFor } from "@testing-library/react";
import crossFetch from "cross-fetch";
global.fetch = crossFetch;

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
