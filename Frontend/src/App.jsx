
// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./Home"; // 你首頁的元件
import Profile from "./components/Profile";
import ServiceDemo from "./components/Gpt-pro"; // 你服務頁面的元件
import SubscriptionManager from "./components/SubscriptionManager"; // 你訂閱頁面的元件
// import Settings from "./Settings"; // 你設定頁面的元件
import ReadContract from "./components/test"; // 你測試頁面的元件
export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/SubscriptionManager" element={<SubscriptionManager />} />
        <Route path="/gpt" element={<ServiceDemo />} />
        <Route path="/test" element={<ReadContract/>} />
      </Routes>
    </Router>
  );
}
