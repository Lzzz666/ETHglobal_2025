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
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("Token");
  const [activeRange, setActiveRange] = useState("1Y");
  const [activeNetwork, setActiveNetwork] = useState("ethereum");
  const [apiMode, setApiMode] = useState("standard"); // 'standard' 或 'combined'

  const [walletAddress] = useState(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  const [totalValue, setTotalValue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 添加一個函數專門用於獲取 CombinedBalance 資料
  const fetchCombinedBalance = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/Token/CombinedBalance/${activeNetwork}/${walletAddress}`
      );

      if (!res.ok) throw new Error("API 錯誤");

      const data = await res.json();
      console.log("Combined Balance Data:", data);

      // 解析組合餘額資料格式
      const parsedAssets = Object.entries(data).map(([key, value]) => {
        // 解析地址和名稱，例如 "0xAddress (TokenName)"
        const addressMatch = key.match(/(0x[a-fA-F0-9]+) \((.*?)\)/);
        const address = addressMatch ? addressMatch[1] : key;
        const name = addressMatch ? addressMatch[2] : "Unknown Token";

        // 解析餘額和 USD 值，例如 "12.345(USD=12.34)"
        const balanceMatch = value.match(/([\d.e+-]+)\(USD=([\d.]+)\)/);
        const balance = balanceMatch ? balanceMatch[1] : "0.0";
        const usdValue = balanceMatch ? parseFloat(balanceMatch[2]) : 0;

        return {
          address,
          name,
          balance,
          usdValue,
        };
      });

      // 計算總 USD 值
      const totalUSD = parsedAssets.reduce(
        (sum, asset) => sum + asset.usdValue,
        0
      );
      setTotalValue(totalUSD);

      // 建立圖表資料
      const chartDataFormat = parsedAssets
        .filter((asset) => parseFloat(asset.balance) > 0)
        .map((asset) => ({
          name: asset.name,
          value: asset.usdValue,
        }));
      setChartData(chartDataFormat);

      // 格式化資產資料用於顯示
      setAssets(
        parsedAssets.map((asset) => ({
          name: asset.name,
          icon: "💰",
          tag: activeCategory,
          amount: `${asset.balance}`,
          value: `$${asset.usdValue.toFixed(2)}`,
          diff: "0%",
          change: "0%",
          changeColor: "green",
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("組合餘額 API 錯誤:", err);
      setError("❌ 無法取得組合餘額資料，請稍後再試");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);

      // 根據模式選擇使用哪個 API
      if (apiMode === "combined") {
        fetchCombinedBalance();
        return;
      }

      try {
        // 原始 API 端點邏輯
        const res = await fetch(
          `http://127.0.0.1:5000/api/Token/TokenBalance/${activeNetwork}/${walletAddress}`
        );

        // 只打印回應狀態，避免消耗 body stream
        console.log("HTTP Response Status:", res.status, res.statusText);

        if (!res.ok) throw new Error("API 錯誤");

        // 只讀取一次 res.json()
        const data = await res.json();
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

        console.log("Total Assets Value:", totalAssets);
        setTotalValue(totalAssets);

        if (data) {
          const chartDataFormat =
            data.historicalData?.[activeRange] ||
            Object.entries(data).map(([address, value]) => ({
              name: address.substring(0, 8),
              value:
                typeof value === "string" && !isNaN(value)
                  ? parseInt(value, 10)
                  : typeof value === "number"
                    ? value
                    : 0,
            }));
          setChartData(chartDataFormat);

          const assetsData =
            data.tokens ||
            Object.entries(data)
              .filter(
                ([_, value]) =>
                  (typeof value === "string" &&
                    !isNaN(value) &&
                    parseInt(value, 10) > 0) ||
                  (typeof value === "number" && value > 0)
              )
              .map(([address, value]) => ({
                name: address,
                balance: typeof value === "string" ? value : value.toString(),
                symbol: "",
                valueUsd:
                  typeof value === "string" ? parseInt(value, 10) : value,
                priceChangeUsd: 0,
                priceChangePercent: "0%",
              }));

          setAssets(
            assetsData.map((token) => ({
              name: token.name,
              icon: token.icon || "💰",
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
  }, [walletAddress, activeCategory, activeRange, activeNetwork, apiMode]);

  return (
    <div className="portfolio-card">
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

      {/* API 模式選擇器 */}
      <div className="api-mode-selector">
        <button
          className={apiMode === "standard" ? "active" : ""}
          onClick={() => setApiMode("standard")}
        >
          標準 API
        </button>
        <button
          className={apiMode === "combined" ? "active" : ""}
          onClick={() => setApiMode("combined")}
        >
          組合餘額 API
        </button>
      </div>

      {/* 網路選擇器 */}
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
