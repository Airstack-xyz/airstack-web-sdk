import { vi, describe, expect, beforeEach, it } from "vitest";
import { render, act } from "@testing-library/react";
import { useLazyQuery } from "../useQuery";
import { init } from "../../config";
import { pageOneData } from "./pageOneData";
import { mockFetch } from "./utils";

init("123");

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockedResponse = vi.fn();
mockFetch(mockedResponse);

const TestComponent = () => {
  const [fetch, { data, error, loading }] = useLazyQuery(``, {});

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {data && <div data-testid="data">{JSON.stringify(data)}</div>}

      <button
        onClick={() => fetch({ date: Date.now() })}
        data-testid="fetch-button"
      >
        Fetch
      </button>
    </div>
  );
};

describe("useLazyQueryWithPagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch data successfully", async () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);
    mockedResponse.mockResolvedValueOnce({
      data: {
        ...pageOneData,
      },
    });

    await act(async () => {
      getByTestId("fetch-button").click();
    });

    expect(queryByTestId("loading")).toBeInTheDocument();

    await wait(1000);

    expect(queryByTestId("loading")).not.toBeInTheDocument();
    expect(queryByTestId("data")).toHaveTextContent(
      JSON.stringify(pageOneData)
    );
    expect(queryByTestId("error")).not.toBeInTheDocument();
  });

  it("should handle error correctly", async () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);

    mockedResponse.mockResolvedValueOnce({
      data: null,
      errors: "Error message",
    });

    await act(async () => {
      getByTestId("fetch-button").click();
    });

    expect(queryByTestId("loading")).toBeInTheDocument();

    await wait(500);

    expect(queryByTestId("loading")).not.toBeInTheDocument();
    expect(queryByTestId("error")).toBeInTheDocument();
    expect(queryByTestId("data")).not.toBeInTheDocument();
  });
});
