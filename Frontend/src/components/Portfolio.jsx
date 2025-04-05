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

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("Token");
  const [activeRange, setActiveRange] = useState("1Y");

  const [walletAddress] = useState("0x176f78E74dcB519b3F05A929496f13886DA26418"); // TODO: 後續可改為 props 或從錢包取得
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
        const res = await fetch(
          `/api/portfolio?wallet=${walletAddress}&category=${activeCategory}&range=${activeRange}`
        );
        if (!res.ok) throw new Error("API 錯誤");
        const data = await res.json();
        setTotalValue(data.totalValue);
        setChartData(data.chart);
        setAssets(data.assets);
      } catch (err) {
        setError("❌ 無法取得資產資料，請稍後再試");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [walletAddress, activeCategory, activeRange]);

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
                  color:
                    asset.changeColor === "green" ? "#3cb371" : "#d9534f",
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
