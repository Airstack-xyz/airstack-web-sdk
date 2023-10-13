import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useLazyQueryWithPagination } from "../useQueryWithPagination";
import { init } from "../../init";
import { waitForLoadingStartAndStop } from "./utils";
const testAPIKey = "ef3d1cdeafb642d3a8d6a44664ce566c";
const testQuery = `query tokens($address: Identity!, $limit: Int!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: $limit, blockchain: ethereum}
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
  limit: 1,
};

const testMultiQuery = `query tokens($address: Identity!, $address2: Identity!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: 2, blockchain: ethereum}
  ) {
    data: TokenBalance {
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
    pageInfo {
      prevCursor
      nextCursor
    }
  },
  _erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address2]}, tokenType: {_in: [ERC20]}}, limit: 2, blockchain: ethereum}
  ) {
    data: TokenBalance {
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
    pageInfo {
      prevCursor
      nextCursor
    }
  }
}`;

const testSocialFollowersQuery = `query FollowersDetails($identity: Identity!) {
  SocialFollowers(input: {filter: {identity: {_eq: $identity}}, blockchain: ALL, limit: 2}) {
    Follower {
      id
      blockchain
      followerProfileId
      followerTokenId
      followingProfileId
      followerAddress {
        identity
        addresses
        socials {
          blockchain
          dappName
          profileName
          profileTokenId
          profileTokenAddress
        }
        primaryDomain {
          name
        }
        domains {
          dappName
          name
        }
        xmtp {
          isXMTPEnabled
        }
      }
    }
  }
}`;

init(testAPIKey);

describe("useLazyQueryWithPagination", () => {
  it("should fetch data successfully", async () => {
    const { result } = renderHook(() =>
      useLazyQueryWithPagination(testQuery, testVariables)
    );
    expect(result.current[1].loading).toBe(false);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].error).toBe(null);

    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);
    expect(result.current[1].data).not.toBe(null);
    expect(result.current[1].data.erc20.data).toHaveLength(1);
    expect(result.current[1].error).toBe(null);
  }, 10000);

  it("should handle error correctly", async () => {
    const { result } = renderHook(() =>
      useLazyQueryWithPagination("", testVariables)
    );

    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);
    expect(result.current[1].error).not.toBe(null);
    expect(result.current[1].data).toBe(null);
  });

  describe("config and callbacks", () => {
    it("should call onCompleted callback when the query is completed", async () => {
      const mockCompleteCallback = vi.fn();
      const { result } = renderHook(() =>
        useLazyQueryWithPagination(testQuery, testVariables, {
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
        useLazyQueryWithPagination<"string">(testQuery, testVariables, {
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

  describe("pagination", () => {
    it("should fetch next page on getNextPage", async () => {
      const { result } = renderHook(() =>
        useLazyQueryWithPagination(testQuery, testVariables, {
          cache: false,
        })
      );
      expect(result.current[1].loading).toBe(false);
      expect(result.current[1].data).toBe(null);
      expect(result.current[1].error).toBe(null);

      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      const { data, error, pagination } = result.current[1];
      expect(data).not.toBe(null);
      expect(data.erc20.data).toHaveLength(1);
      expect(error).toBe(null);
      expect(error).toBeNull();
      expect(data.erc20.data).toHaveLength(1);
      expect(pagination.hasNextPage).toBe(true);
      expect(pagination.hasPrevPage).toBe(false);
      await act(async () => {
        pagination.getNextPage();
      });
      await waitForLoadingStartAndStop(result);
      if (result.current[1].data) {
        const { data: nextData, error: nextError } = result.current[1];
        expect(nextError).toBeNull();
        expect(nextData.erc20.data).toHaveLength(1);
        expect(nextData.erc20.data[0].id).not.toBe(data.erc20.data[0].id);
      }
    }, 10000);

    it("should return hasNextPage as false if no next page, and getNextPage should return null", async () => {
      // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
      const variables = {
        address: "betashop.eth",
        limit: 2,
      };

      const { result } = renderHook(() =>
        useLazyQueryWithPagination(testQuery, variables, {
          cache: false,
        })
      );

      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      const {
        data,
        error,
        pagination: { hasNextPage, hasPrevPage, getNextPage },
      } = result.current[1];
      expect(error).toBeNull();
      expect(data.erc20.data).toHaveLength(1);
      expect(hasPrevPage).toBe(false);
      expect(hasNextPage).toBe(false);
      await act(async () => {
        await getNextPage();
      });
      await waitFor(
        () => {
          expect(result.current[1].data).toBeNull();
        },
        {
          timeout: 10000,
        }
      );
    }, 10000);

    it("should paginate backward and forward and should add/remove sub-query when required", async () => {
      // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
      const variables = {
        address: "betashop.eth",
        address2: "vitalik.eth",
      };
      const { result } = renderHook(() =>
        useLazyQueryWithPagination(testMultiQuery, variables, {
          cache: false,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      const {
        data,
        error,
        pagination: { hasNextPage, hasPrevPage },
      } = result.current[1];
      // page => 0
      expect(error).toBeNull();
      expect(data.erc20.data).toHaveLength(1);
      expect(data._erc20.data).toHaveLength(2);
      expect(hasPrevPage).toBe(false);
      expect(hasNextPage).toBe(true);

      // page => 0 => 1 => 2 => 3
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current[1].pagination.getNextPage();
        });
        const data = result.current[1].data;
        if (data) {
          expect(data.erc20).toBeUndefined();
          expect(data._erc20.data).toHaveLength(2);
        }
      }

      // page 3 => 2 => 1
      for (let i = 0; i < 2; i++) {
        await act(async () => {
          await result.current[1].pagination.getPrevPage();
        });
        const data = result.current[1].data;
        expect(data.erc20).toBeUndefined();
        expect(data._erc20.data).toHaveLength(2);
      }
      // page => 0
      await act(async () => {
        await result.current[1].pagination.getPrevPage();
      });
      expect(result.current[1].data.erc20).toBeTruthy();
    }, 20000);
  });

  describe("schema mismatch", () => {
    it("should do pagination backward and forward for queries with a mismatched schema", async () => {
      // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
      const variables = {
        identity: "betashop.eth",
      };

      const { result } = renderHook(() =>
        useLazyQueryWithPagination(testSocialFollowersQuery, variables, {
          cache: false,
        })
      );
      await act(async () => {
        result.current[0]();
      });
      await waitForLoadingStartAndStop(result);
      const {
        data,
        error,
        pagination: { hasNextPage, hasPrevPage },
      } = result.current[1];
      // page => 0
      expect(error).toBeNull();
      expect(data.SocialFollowers.Follower).toHaveLength(2);
      expect(hasPrevPage).toBe(false);
      expect(hasNextPage).toBe(true);

      // page => 0 => 1 => 2 => 3
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current[1].pagination.getNextPage();
        });
        expect(result.current[1].data.SocialFollowers.Follower).toHaveLength(2);
      }

      // page 3 => 2 => 1
      for (let i = 0; i < 2; i++) {
        await act(async () => {
          await result.current[1].pagination.getPrevPage();
        });
        expect(result.current[1].data.SocialFollowers.Follower).toHaveLength(2);
      }
      // page => 0
      await act(async () => {
        await result.current[1].pagination.getPrevPage();
      });
      expect(result.current[1].data.SocialFollowers.Follower).toBeTruthy();
    }, 15000);
  });
});
