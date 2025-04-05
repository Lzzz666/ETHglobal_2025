import React, { useEffect, useState } from "react";
import "./Portfolio.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const categories = ["Token", "Defi", "NFT"];
const timeRanges = ["24H", "1W", "1M", "1Y", "3Y"];
const networks = [
  "ethereum",
  "polygon",
  "binance",
  "arbitrum",
  "optimistic",
  "base",
  "zksync",
]; // 可根據您的需求調整網路列表

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("Token");
  const [activeRange, setActiveRange] = useState("1Y");
  const [activeNetwork, setActiveNetwork] = useState("ethereum"); // 預設網路

  const [walletAddress] = useState(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  ); // TODO: 後續可改為 props 或從錢包取得
  const [totalValue, setTotalValue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        // 使用新的 API 端點
        const res = await fetch(
          `http://127.0.0.1:5000/api/Token/TokenBalance/${activeNetwork}/${walletAddress}`
        );

        // 打印 HTTP 回應本身，而不是嘗試讀取 body
        console.log("HTTP Response:", res);

        if (!res.ok) throw new Error("API 錯誤");

        // 只讀取一次 res.json()
        const data = await res.json();

        // 打印完整的回傳資料
        console.log("API Response Data:", data);

        // 計算所有資產的總和，將字串轉換為數字
        const totalAssets = Object.values(data).reduce(
          (sum, value) =>
            sum +
            (typeof value === "string" && !isNaN(value)
              ? parseInt(value, 10)
              : 0),
          0
        );

        // 打印加總結果
        console.log("Total Assets Value:", totalAssets);

        // 更新顯示的總值
        setTotalValue(totalAssets);

        // 處理資產數據用於圖表和資產列表
        if (data) {
          // 處理歷史數據用於圖表
          const chartDataFormat =
            data.historicalData?.[activeRange] ||
            Object.entries(data).map(([address, value]) => ({
              name: address.substring(0, 8),
              value: typeof value === "number" ? value : 0,
            }));
          setChartData(chartDataFormat);

          // 處理資產數據
          const assetsData =
            data.tokens ||
            Object.entries(data)
              .filter(([_, value]) => typeof value === "number" && value > 0)
              .map(([address, value]) => ({
                name: address,
                balance: value,
                symbol: "",
                valueUsd: value,
                priceChangeUsd: 0,
                priceChangePercent: "0%",
              }));

          setAssets(
            assetsData.map((token) => ({
              name: token.name,
              icon: token.icon || "💰", // 預設圖示
              tag: token.tag || activeCategory,
              amount: `${token.balance} ${token.symbol}`,
              value: `$${token.valueUsd?.toLocaleString() || "0"}`,
              diff: token.priceChangeUsd || "0%",
              change: token.priceChangePercent || "0%",
              changeColor: token.priceChangeUsd > 0 ? "green" : "red",
            }))
          );
        } else {
          setError("回傳資料格式錯誤");
        }
      } catch (err) {
        console.error("API 錯誤:", err);
        setError("❌ 無法取得資產資料，請稍後再試");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [walletAddress, activeCategory, activeRange, activeNetwork]);

  return (
    <div className="portfolio-card">
      {/* 其餘 JSX 保持不變 */}
      <div className="top-section">
        <div className="chart-area">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="total-value">
          {loading ? "Loading..." : `$${totalValue.toLocaleString()}`}
        </div>
      </div>

      {/* 新增網路選擇器 */}
      <div className="network-selector">
        <select
          value={activeNetwork}
          onChange={(e) => setActiveNetwork(e.target.value)}
          className="network-dropdown"
        >
          {networks.map((network) => (
            <option key={network} value={network}>
              {network.charAt(0).toUpperCase() + network.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={cat === activeCategory ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="time-range-tabs">
        {timeRanges.map((range) => (
          <button
            key={range}
            className={range === activeRange ? "active" : ""}
            onClick={() => setActiveRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="asset-list">
        {assets.map((asset, i) => (
          <div className="asset-item" key={i}>
            <div className="asset-left">
              <span className="asset-icon">{asset.icon}</span>
              <div>
                <div className="asset-name">
                  {asset.name}
                  <span className={`asset-tag tag-${asset.tag?.toLowerCase()}`}>
                    {asset.tag}
                  </span>
                </div>
                <div className="asset-amount">{asset.amount}</div>
              </div>
            </div>
            <div className="asset-right">
              <div className="asset-value">{asset.value}</div>
              <div
                className="asset-diff"
                style={{
                  color: asset.changeColor === "green" ? "#3cb371" : "#d9534f",
                }}
              >
                {asset.diff} <span>({asset.change})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
