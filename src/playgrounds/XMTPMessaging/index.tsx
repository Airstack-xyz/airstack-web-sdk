import React, { useState } from "react";
import { init, useLazySendMessageOnXMTP } from "../../lib";
import { Wallet } from "ethers";

init("190fc193f24b34d7cafc3dec305c96b0a", {
  env: "dev",
});

const stringify = (obj: unknown) =>
  JSON.stringify(
    obj,
    (_, value) => {
      if (value instanceof Error) {
        return `${value.name}: ${value?.message}`;
      }
      return value;
    },
    2
  );

function XMTPMessaging() {
  const [messageText, setMessageText] = useState("Hey this is sample message");
  const [addressesText, setAddressesText] = useState("gm.xmtp.eth");
  const [keyText, setKeyText] = useState("");
 
  const [sendMessage, { data, progress, error, loading, cancel }] =
    useLazySendMessageOnXMTP({
      onComplete: (data) =>
        console.log("useLazySendMessageOnXMTP:onComplete -", data),
      onProgress: (data) =>
        console.log("useLazySendMessageOnXMTP:onProgress -", data),
      onError: (err) => {
        console.log("useLazySendMessageOnXMTP:onError -", err);
      },
    });

  const handleButtonClick = async () => {
    const addresses = addressesText
      .split(/[\s,]/)
      .filter(Boolean)
      .map((x) => x.trim());

    const wallet = keyText ? new Wallet(keyText) : undefined;

    const result = await sendMessage({
      message: messageText,
      addresses,
      wallet,
    });

    console.log("sendMessage:returnValue -", result);
  };

  return (
    <div>
      <h2>XMTP Messaging playground</h2>
      <div>
        <h3>Wallet private key (optional)</h3>
        <textarea
          style={{ minWidth: 840 }}
          rows={2}
          value={keyText}
          onChange={(event) => setKeyText(event.target.value)}
        />
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>Message</h3>
          <textarea
            style={{ minWidth: 400 }}
            rows={10}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
          />
        </div>
        <div>
          <h3>Addresses</h3>
          <textarea
            style={{ minWidth: 400 }}
            rows={10}
            value={addressesText}
            onChange={(event) => setAddressesText(event.target.value)}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" disabled={loading} onClick={handleButtonClick}>
          {loading
            ? `Loading... (${(progress?.sent || 0) + (progress?.error || 0)}/${
                progress?.total || 0
              })`
            : "Send"}
        </button>
        <button type="button" disabled={!loading} onClick={cancel}>
          Cancel
        </button>
      </div>
      <h3>Hook Data</h3>
      <div>
        <textarea
          readOnly
          style={{ minWidth: 840 }}
          rows={10}
          value={stringify({
            data,
            loading,
            progress,
            error,
          })}
        />
      </div>
    </div>
  );
}

export default XMTPMessaging;
