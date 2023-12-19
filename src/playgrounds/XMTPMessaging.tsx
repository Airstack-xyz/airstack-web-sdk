import React, { useState } from "react";
import { init, sendMessageOnXMTP } from "../lib";

init("190fc193f24b34d7cafc3dec305c96b0a", {
  env: "dev",
});

function XMTPMessaging() {
  const [messageText, setMessageText] = useState("Hey this is sample message");
  const [addressesText, setAddressesText] = useState("gm.xmtp.eth");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const addresses = addressesText
      .split(/[\s,]/)
      .filter(Boolean)
      .map((x) => x.trim());

    setLoading(true); 
    const { data, error, progress } = await sendMessageOnXMTP({
      message: messageText,
      addresses,
      useAirstackForProcessingAddresses: true,
      onComplete: (data) => console.log("sendMessageOnXMTP:onComplete -", data),
      onProgress: (data) => console.log("sendMessageOnXMTP:onProgress -", data),
      onError: (err) => {
        console.log("sendMessageOnXMTP:onError -", err);
      }
    });
    setLoading(false); 

    console.log("sendMessageOnXMTP:returnValue -", { data, error, progress });
  };

  return (
    <div style={{ marginInline: "5rem"}}>
      <h1>XMTP Messaging playground</h1>
      <h3>Message</h3>
      <div>
        <textarea
          style={{ minWidth: 500 }}
          rows={10}
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
      </div>
      <h3>Addresses</h3>
      <div>
        <textarea
          style={{ minWidth: 500 }}
          rows={10}
          value={addressesText}
          onChange={(event) => setAddressesText(event.target.value)}
        />
      </div>
      <button type="button" disabled={loading} onClick={sendMessage}>
        {loading ? "Loading..." : "Send Message"}
      </button>
    </div>
  );
}

export default XMTPMessaging;
