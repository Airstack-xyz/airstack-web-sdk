import React, { useState } from "react";
import { sendMessageOnXMTP } from "../lib";

function XMTPMessaging() {
  const [text, setText] = useState("0x937C0d4a6294cdfa575de17382c7076b579DC176, 0x37cf8bd14e92B1fc849469EddBA264E923bd7bd8");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const addresses = text
      .split(/[\s,]/)
      .filter(Boolean)
      .map((x) => x.trim());

    setLoading(true); 
    const { data, error, progress } = await sendMessageOnXMTP({
      message: "Hey this is me",
      addresses,
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
      <label>Addresses</label>
      <div>
        <textarea
          style={{ minWidth: 500 }}
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <button type="button" disabled={loading} onClick={sendMessage}>
        {loading ? "Loading..." : "Send Message"}
      </button>
    </div>
  );
}

export default XMTPMessaging;
