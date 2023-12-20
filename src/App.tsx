import React, { useState } from "react";
import "./App.css";
import OnChainGraph from "./playgrounds/OnChainGraph";
import Query from "./playgrounds/Query";
import XMTPMessaging from "./playgrounds/XMTPMessaging";

const PLAYGROUNDS = [
  {
    name: "Query",
    component: <Query />,
  },
  {
    name: "XMTP Messaging",
    component: <XMTPMessaging />,
  },
  {
    name: "On-Chain Graph",
    component: <OnChainGraph />,
  },
];

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div>
      <h1 style={{ textAlign: "center", fontSize: "2rem"}}>Airstack Web SDK</h1>
      <div style={{ display: "flex", gap: "1rem" }}>
        {PLAYGROUNDS.map((item, index) => (
          <button
            key={item.name}
            disabled={index === selectedTab}
            onClick={() => setSelectedTab(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      {PLAYGROUNDS[selectedTab].component}
    </div>
  );
}

export default App;
