import { act, renderHook } from "@testing-library/react";
import { Wallet } from "ethers";
import { vi } from "vitest";
import { init } from "../../init";
import { useLazySendMessageOnXMTP } from "../useSendMessageOnXMTP";
import { noop, waitForLoadingStartAndStop } from "./utils";

const testAPIKey = "190fc193f24b34d7cafc3dec305c96b0a";

const testWallet = Wallet.createRandom();

init(testAPIKey);

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
  it("should send invites with callbacks", async () => {
    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth"], // test address can be found here: https://xmtp.org/docs/tutorials/debug-and-test#use-test-message-bots-and-addresses
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
    expect(result.current[1].progress).toMatchObject({
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
        // wallet: testWallet, // not passing wallet, with throw fatal error 'Error: Browser based wallet not found'
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
          "unknown.fail", // invite should not be sent to this address as identity resolution should fail
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

    expect(result.current[1].progress).toMatchObject({
      total: 2,
      sent: 1,
      error: 1,
    });

    expect(result.current[1].data).toHaveLength(2);

    expect(result.current[1].data?.[0]).toMatchObject({
      address: "gm.xmtp.eth",
      recipientAddress: "0x937c0d4a6294cdfa575de17382c7076b579dc176", // actual wallet address of gm.xmtp.eth
      sent: true,
    });
    expect(result.current[1].data?.[1]).toMatchObject({
      address: "unknown.fail",
      recipientAddress: "",
      sent: false,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(result.current[1].data?.[1]?.error?.message).toBe(
      "Identity unknown.fail couldn't be resolved to address"
    );
  }, 10000);

  it("should abort messaging on calling cancel method", async () => {
    const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");

    const { result } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth", "hi.xmtp.eth"],
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
    expect(result.current[1].progress).toMatchObject({
      total: 2,
      sent: 0,
      error: 0,
    });
  }, 10000);

  it("should abort messaging on unmount", async () => {
    const abortControllerSpy = vi.spyOn(AbortController.prototype, "abort");

    const { result, unmount } = renderHook(() =>
      useLazySendMessageOnXMTP({
        message: "This is a test message",
        addresses: ["gm.xmtp.eth", "hi.xmtp.eth"],
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
