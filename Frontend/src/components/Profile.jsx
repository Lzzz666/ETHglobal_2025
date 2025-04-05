import React from "react";
import Portfolio from "./Portfolio"; // 根據實際路徑調整
import ChatBox from "./ChatBox";     // 根據實際路徑調整
import "./Profile.css";                 // 假設你有樣式

const Profile = () => {
  return (
    <div className="chat-layout">
      <div className="app-container">
        <main>
          <Portfolio />
        </main>
      </div>
      <div className="app-container">
        <main>
          <ChatBox />
        </main>
      </div>
    </div>
  );
};

export default Profile;
