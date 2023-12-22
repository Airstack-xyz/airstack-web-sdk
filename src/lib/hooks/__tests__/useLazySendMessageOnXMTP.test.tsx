import { act, renderHook } from "@testing-library/react";
import { Wallet } from "ethers";
import { vi } from "vitest";
import { init } from "../../init";
import { useLazySendMessageOnXMTP } from "../useSendMessageOnXMTP";
import { noop, waitForLoadingStartAndStop } from "./utils";

const testAPIKey = "190fc193f24b34d7cafc3dec305c96b0a";

const testWallet = Wallet.createRandom();

init(testAPIKey);

// sources of addresses used in tests:
// gm.xmtp.eth      - https://xmtp.org/docs/tutorials/debug-and-test
// vitalik.eth      - https://docs.airstack.xyz/airstack-docs-and-faqs/guides/ens-domain/resolve-ens-domain
// fc_fname:dwr.eth - https://docs.airstack.xyz/airstack-docs-and-faqs/guides/farcaster/resolve-farcaster-users
// lens/@stani      - https://docs.airstack.xyz/airstack-docs-and-faqs/guides/lens/resolve-lens-profiles

vi.mock("@xmtp/xmtp-js", () => ({
  Client: {
    create: () => ({
      conversations: {
        newConversation: () => ({
          send: noop,
        }),
      },
    }),
  },
}));

describe("useLazySendMessageOnXMTP", () => {
  it("should send invite with callbacks", async () => {
    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth"],
        wallet: testWallet,
      })
    );

    expect(result.current[1].error).toBe(null);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].progress).toBe(null);

    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);

    expect(result.current[1].error).toBe(null);
    expect(result.current[1].data).toHaveLength(1);
    expect(result.current[1].progress).toEqual({
      total: 1,
      sent: 1,
      error: 0,
    });
  }, 10000);

  it("should return fatal error with callbacks", async () => {
    const mockOnProgressCallback = vi.fn();
    const mockOnCompleteCallback = vi.fn();
    const mockOnErrorCallback = vi.fn();

    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth"],
        // wallet: testWallet, // not passing wallet, with throw fatal error
        onProgress: mockOnProgressCallback,
        onComplete: mockOnCompleteCallback,
        onError: mockOnErrorCallback,
      })
    );

    expect(result.current[1].error).toBe(null);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].progress).toBe(null);

    await act(async () => {
      result.current[0]();
    });

    expect(mockOnErrorCallback).toHaveBeenCalled();
    expect(mockOnProgressCallback).not.toHaveBeenCalled();
    expect(mockOnCompleteCallback).not.toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(result.current[1].error?.message).toBe(
      "Browser based wallet not found"
    );
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].progress).toBe(null);
  }, 10000);

  it("should send 1 out 2 invites", async () => {
    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: [
          "gm.xmtp.eth",
          "unknown.fail", // invite should not be sent to this address
        ],
        wallet: testWallet,
      })
    );

    expect(result.current[1].progress).toBe(null);
    expect(result.current[1].data).toBe(null);

    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);

    expect(result.current[1].progress).toEqual({
      total: 2,
      sent: 1,
      error: 1,
    });

    expect(result.current[1].data).toHaveLength(2);
    expect(result.current[1].data?.[0]?.sent).toBe(true); // for gm.xmtp.eth
    expect(result.current[1].data?.[1]?.sent).toBe(false); // for unknown.fail
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(result.current[1].data?.[1]?.error?.message).toBe(
      "Recipient unknown.fail is not on the XMTP network"
    );
  }, 10000);

  it("should send invites to different kinds of identities", async () => {
    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: [
          "gm.xmtp.eth",
          "fc_fname:dwr.eth",
          "lens/@stani",
          "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // address for vitalik.eth
        ],
        wallet: testWallet,
      })
    );

    expect(result.current[1].progress).toBe(null);
    expect(result.current[1].data).toBe(null);

    await act(async () => {
      result.current[0]();
    });
    await waitForLoadingStartAndStop(result);

    expect(result.current[1].progress).toEqual({
      total: 4,
      sent: 4,
      error: 0,
    });

    expect(result.current[1].data).toHaveLength(4);
    expect(result.current[1].data?.[0]).toEqual({
      address: "gm.xmtp.eth",
      recipientAddress: "0x937c0d4a6294cdfa575de17382c7076b579dc176",
      sent: true,
    });
    expect(result.current[1].data?.[1]).toEqual({
      address: "fc_fname:dwr.eth",
      recipientAddress: "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea",
      sent: true,
    });
    expect(result.current[1].data?.[2]).toEqual({
      address: "lens/@stani",
      recipientAddress: "0x7241dddec3a6af367882eaf9651b87e1c7549dff",
      sent: true,
    });
    expect(result.current[1].data?.[3]).toEqual({
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      recipientAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      sent: true,
    });
  }, 10000);

  it("should abort messaging on calling cancel method", async () => {
    const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");

    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth"],
        wallet: testWallet,
      })
    );

    expect(result.current[1].error).toBe(null);
    expect(result.current[1].data).toBe(null);
    expect(result.current[1].progress).toBe(null);

    await act(async () => {
      result.current[0]();
      result.current[1].cancel();
    });

    expect(abortControllerSpy).toHaveBeenCalledOnce();

    expect(result.current[1].error).toBe(null);
    expect(result.current[1].data).toHaveLength(0);
    expect(result.current[1].progress).toEqual({
      total: 1,
      sent: 0,
      error: 0,
    });
  }, 10000);

  it("should abort messaging on unmount", async () => {
    const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");

    const { result, unmount } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth"],
        wallet: testWallet,
      })
    );

    await act(async () => {
      result.current[0]();
    });
    unmount();

    expect(abortControllerSpy).toHaveBeenCalledOnce();
  }, 10000);
});
