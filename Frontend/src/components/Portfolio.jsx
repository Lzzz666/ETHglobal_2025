import React, { useEffect, useState } from "react";
import KirbyImage from "../assets/Kirby.gif";
import "./Portfolio.css";

const categories = ["Token", "Defi", "NFT"];
const networks = [
  "polygon",
  "binance",
  "arbitrum",
  "optimistic",
  "base",
  "zksync",
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("Token");
  const [activeRange, setActiveRange] = useState("24H");
  const [activeNetwork, setActiveNetwork] = useState("polygon");

  const [walletAddress] = useState(
    "0x50ec05ade8280758e2077fcbc08d878d4aef79c3"
  );
  const [totalValue, setTotalValue] = useState(0);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/Token/CombinedBalance/${activeNetwork}/${walletAddress}`
        );

        if (!res.ok) throw new Error("API 錯誤");

        const data = await res.json();

        // 計算所有資產的總和
        const totalAssets = Object.values(data).reduce(
          (sum, value) =>
            sum +
            (typeof value === "string" && !isNaN(value)
              ? parseInt(value, 10)
              : typeof value === "number"
                ? value
                : 0),
          0
        );

        setTotalValue(totalAssets);

        // 格式化圖表資料
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

        // 格式化資產資料
        const assetsData = Object.entries(data)
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
            valueUsd: typeof value === "string" ? parseInt(value, 10) : value,
          }));

        setAssets(
          assetsData.map((token) => ({
            name: token.name,
            icon: token.icon || "🪙",
            tag: activeCategory,
            amount: `${token.balance} ${token.symbol}`,
            value: `$${token.valueUsd?.toLocaleString() || "0"}`,
            diff: "0%",
            change: "0%",
            changeColor: "#000",
          }))
        );
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
      <div className="top-section">
        <div className="chart-area-b">
          <img
            src={KirbyImage}
            alt="Kirby"
            style={{
              width: "141px", // 設定圖片寬度
              height: "112.5px", // 設定圖片高度
              marginBottom: "10px", // 添加底部間距
            }}
          />
        </div>

        <div
          className="total-value"
          style={{
            marginRight: "20px", // 添加右邊間距
          }}
        >
          {loading ? "Loading..." : `Total: $${totalValue.toLocaleString()}`}
        </div>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`button category-button ${
              cat === activeCategory ? "active" : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="asset-list">
        {assets.map((asset, i) => (
          <React.Fragment key={i}>
            <div className="asset-item">
              <div className="asset-left">
                <span className="asset-icon">{asset.icon}</span>
                <div>
                  <div className="asset-name">
                    {asset.name}
                    <span
                      className={`asset-tag tag-${asset.tag?.toLowerCase()}`}
                    >
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
                    color: asset.changeColor,
                  }}
                ></div>
              </div>
            </div>
            {/* 添加分隔線 */}
            {i !== assets.length - 1 && <hr className="asset-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
