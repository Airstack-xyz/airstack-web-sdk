import React, { useState } from "react";
import { init, useLazyMessagingOnXMTP } from "../../lib";

init("190fc193f24b34d7cafc3dec305c96b0a", {
  env: "dev",
});

function XMTPMessaging() {
  const [messageText, setMessageText] = useState("Hey this is sample message");
  const [addressesText, setAddressesText] = useState("gm.xmtp.eth");
  const [sendMessage, { data, progress, error, loading, cancel }] =
    useLazyMessagingOnXMTP({
      processAddressesViaAirstackAPIs: true,
      onComplete: (data) =>
        console.log("useLazyMessagingOnXMTP:onComplete -", data),
      onProgress: (data) =>
        console.log("useLazyMessagingOnXMTP:onProgress -", data),
      onError: (err) => {
        console.log("useLazyMessagingOnXMTP:onError -", err);
      },
    });

  const handleButtonClick = async () => {
    const addresses = addressesText
      .split(/[\s,]/)
      .filter(Boolean)
      .map((x) => x.trim());

    const result = await sendMessage({
      message: messageText,
      addresses,
    });

    console.log("sendMessage:returnValue -", result);
  };

  return (
    <div>
      <h2>XMTP Messaging playground</h2>
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
          value={JSON.stringify(
            {
              data,
              loading,
              progress,
              error,
            },
            null,
            2
          )}
        />
      </div>
    </div>
  );
}

export default XMTPMessaging;
