import { vi, describe, expect, beforeEach, it } from "vitest";
import { render, act } from "@testing-library/react";
import { useLazyQueryWithPagination } from "../useQueryWithPagination";
import { init } from "../../init";
import { pageOneData } from "./pageOneData";
import { pageTwoData } from "./pageTwoData";
import { mockFetch } from "./utils";

init("123");

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockedResponse = vi.fn();
mockFetch(mockedResponse);

const TestComponent = () => {
  const [fetch, { data, error, loading, pagination }] =
    useLazyQueryWithPagination(``, {});
  const { getNextPage, getPrevPage, hasNextPage, hasPrevPage } = pagination;

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {data && <div data-testid="data">{JSON.stringify(data)}</div>}
      {hasNextPage && (
        <button onClick={() => getNextPage()} data-testid="next">
          next
        </button>
      )}
      {hasPrevPage && (
        <button onClick={() => getPrevPage()} data-testid="prev">
          prev
        </button>
      )}

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
    expect(queryByTestId("next")).not.toBeInTheDocument();
    expect(queryByTestId("prev")).not.toBeInTheDocument();

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
    expect(queryByTestId("next")).toBeInTheDocument();
    expect(queryByTestId("prev")).not.toBeInTheDocument();
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
    expect(queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("should handle pagination correctly", async () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);
    mockedResponse
      .mockResolvedValueOnce({
        data: {
          ...pageOneData,
        },
      })
      .mockResolvedValueOnce({
        data: {
          ...pageTwoData,
        },
      });

    // Simulate fetch action
    await act(async () => {
      getByTestId("fetch-button").click();
    });

    await wait(500);

    const data = await queryByTestId("data");
    expect(data).toHaveTextContent(JSON.stringify(pageOneData));
    expect(queryByTestId("next")).toBeInTheDocument();
    expect(queryByTestId("prev")).not.toBeInTheDocument();

    await wait(200);

    await act(async () => {
      getByTestId("next").click();
    });

    await wait(200);

    const _data = await queryByTestId("data");
    expect(_data).toHaveTextContent(JSON.stringify(pageTwoData));
    expect(queryByTestId("prev")).toBeInTheDocument();
    expect(queryByTestId("next")).not.toBeInTheDocument();
  });
});
