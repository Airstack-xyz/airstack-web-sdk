import { vi, describe, expect, beforeEach, it } from "vitest";
import {
  render,
  act,
  screen,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { useLazyQuery, useQuery } from "../useQuery";
import { init } from "../../init";
import "./utils";
import { waitForLoadingStartAndStop } from "./utils";

const testAPIKey = "ef3d1cdeafb642d3a8d6a44664ce566c";
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

describe("useLazyQueryWithPagination", () => {
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
});
