import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";

const NFT_CONTRACT_ADDRESS = "0xYourNFTContractAddress"; // 改成你的 NFT 地址

const abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export default function ServiceDemo() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();

  const { data: balance, isLoading } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address, // 只有在 address 存在時才查詢
    watch: true,        // 自動更新
  });

  const hasNFT = balance && BigInt(balance) > 0n;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>🔐 ChatGPT Pro Access</h1>

      {!isConnected ? (
        <button onClick={() => connect()}>連接錢包</button>
      ) : (
        <>
          <button onClick={() => disconnect()} style={{ marginBottom: "20px" }}>
            斷開連線
          </button>

          {isLoading ? (
            <p>正在檢查 NFT 擁有狀態...</p>
          ) : hasNFT ? (
            <div>
              <h2>✅ 您擁有訂閱 NFT</h2>
              <p>歡迎使用 ChatGPT Pro 🎉</p>
            </div>
          ) : (
            <div>
              <h2>🚫 無 NFT</h2>
              <p>
                請前往 <a href="https://your-subhub.app">SubHub</a> 訂閱服務
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
