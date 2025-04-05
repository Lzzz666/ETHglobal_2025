
// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./Home"; // 你首頁的元件
import Profile from "./components/Profile";
import ServiceDemo from "./components/ServiceDemo"; // 你服務頁面的元件
import SubscriptionManager from "./components/SubscriptionManager"; // 你訂閱頁面的元件
import Faucet from "./components/Faucet"; // 你測試頁面的元件
export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/SubscriptionManager" element={<SubscriptionManager />} />
        <Route path='/serviceDemo' element={<ServiceDemo />} /> {/* 這是測試頁面 */}
        <Route path='/faucet' element={<Faucet />} /> {/* 這是測試頁面 */}
      </Routes>
    </Router>
  );
}
