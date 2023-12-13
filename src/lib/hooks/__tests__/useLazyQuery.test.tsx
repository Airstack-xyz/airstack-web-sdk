import { vi, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLazyQuery } from "../useQuery";
import { init } from "../../init";
import { waitForLoadingStartAndStop } from "./utils";

const testAPIKey = "190fc193f24b34d7cafc3dec305c96b0a";
const testQuery = `query tokens($address: Identity!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: 1, blockchain: ethereum}
  ) {
    data:TokenBalance {
      amount
      formattedAmount
      chainId
      id
      tokenAddress
      tokenId
      tokenType
      token {
        name
        symbol
      }
    }
  }
}`;

const testVariables = {
  address: "vitalik.eth",
};

init(testAPIKey);

describe("useLazyQuery", () => {
  it("should fetch data successfully", async () => {
    const { result } = renderHook(() => useLazyQuery(testQuery, testVariables));
    expect(result.current[1].loading).toBe(false);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].error).toBe(null);
    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);
    expect(result.current[1].data).not.toBe(null);
    expect(result.current[1].error).toBe(null);
  });

  it("should return an error if the query fails", async () => {
    const query = "query { unknownField }";
    const { result } = renderHook(() => useLazyQuery(query, testVariables));
    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].error).not.toBe(null);
  });

  describe("config and callbacks", () => {
    it("should call onCompleted callback when the query is completed", async () => {
      const mockCompleteCallback = vi.fn();
      const { result } = renderHook(() =>
        useLazyQuery(testQuery, testVariables, {
          cache: false,
          onCompleted: mockCompleteCallback,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      expect(mockCompleteCallback).toHaveBeenCalledWith(result.current[1].data);
    });

    it("should return formatted data if dataFormatter callback is provided", async () => {
      const mockCompleteCallback = vi.fn();
      const mockFormatterCallback = vi.fn();
      const mockFormattedDataString = "mockFormattedDataString";

      const { result } = renderHook(() =>
        useLazyQuery<"string">(testQuery, testVariables, {
          cache: false,
          onCompleted: mockCompleteCallback,
          dataFormatter: mockFormatterCallback.mockImplementation(
            () => mockFormattedDataString
          ),
        })
      );
      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      expect(mockFormatterCallback).toHaveBeenCalled();
      expect(mockCompleteCallback).toHaveBeenCalledWith(
        mockFormattedDataString
      );
      expect(result.current[1].data).toBe(mockFormattedDataString);
    });
  });

  describe("api call cancellation", () => {
    it("should cancel api call if cancel callback is called and return error", async () => {
      const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");
      const { result } = renderHook(() =>
        useLazyQuery(testQuery, testVariables, {
          cache: false,
        })
      );
      expect(result.current[1].loading).toBe(false);
      expect(result.current[1].data).toBe(null);
      expect(result.current[1].error).toBe(null);

      await act(async () => {
        result.current[0]();
      });
      result.current[1].cancelRequest();
      expect(abortControllerSpy).toHaveBeenCalledOnce();
      await waitForLoadingStartAndStop(result);
      expect(result.current[1].data).toBe(null);
      expect(result.current[1].error).toBe(null);
    });

    it("should not cancel active api call on hook unmount if cancelRequestOnUnmount is falsy", async () => {
      const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");
      const { result, unmount } = renderHook(() =>
        useLazyQuery(testQuery, testVariables, {
          cache: false,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      unmount();
      expect(abortControllerSpy).not.toHaveBeenCalledOnce();
    });

    it("should cancel active api call on hook unmount if cancelRequestOnUnmount is true", async () => {
      const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");
      const { result, unmount } = renderHook(() =>
        useLazyQuery(testQuery, testVariables, {
          cache: false,
          cancelRequestOnUnmount: true,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      unmount();
      expect(abortControllerSpy).toHaveBeenCalledOnce();
    });

    it("should cancel active api call on hook unmount if cancelHookRequestsOnUnmount is passed as true to init", async () => {
      const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");
      init(testAPIKey, {
        cancelHookRequestsOnUnmount: true,
      });
      const { result, unmount } = renderHook(() =>
        useLazyQuery(testQuery, testVariables, {
          cache: false,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      unmount();
      expect(abortControllerSpy).toHaveBeenCalledOnce();
    });
  });
});
