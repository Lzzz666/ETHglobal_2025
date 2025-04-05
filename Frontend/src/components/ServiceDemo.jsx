import React, { useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { parseAbi } from "viem";
import "./ServiceDemo.css";

const FACTORY_ADDRESS = "0x8984bA1C5C3b87EbB3CB6B5da08CC75E268a6665";
const FACTORY_ABI = [
    {
      "type": "function",
      "name": "contractToName",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createSubscription",
      "inputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        { "name": "symbol", "type": "string", "internalType": "string" },
        { "name": "duration", "type": "uint256", "internalType": "uint256" },
        { "name": "price", "type": "uint256", "internalType": "uint256" },
        {
          "name": "paymentTokens",
          "type": "address[]",
          "internalType": "address[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getAllSubscriptions",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getContractByName",
      "inputs": [{ "name": "name", "type": "string", "internalType": "string" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getNameByContract",
      "inputs": [
        {
          "name": "contractAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getSubscriptionCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "nameToContract",
      "inputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "subscriptionContracts",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "SubscriptionCreated",
      "inputs": [
        {
          "name": "provider",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "contractAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "name",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    }
  ];

export default function ServiceDemo() {
  const [appName, setAppName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [mintPrice, setMintPrice] = useState("");
  const [transferable, setTransferable] = useState(true);

  const [creating, setCreating] = useState(false);
  const [nftAddress, setNftAddress] = useState(null);
  const [error, setError] = useState(null);
  const [NFTMintHash, setNFTMintHash] = useState("");
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const handleCreateNFT = async () => {
    if (!appName || !symbol) {
      setError("App name and symbol are required.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
        const hash = await walletClient.writeContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: "createSubscription",
            args: [
              appName,                       // string
              symbol,                        // string
              BigInt(30 * 24 * 60 * 60),     // uint256 - 例如 30 天（秒）
              BigInt(100),   // uint256 - 例如 1 ETH (單位為 wei)
              ["0x48940F9E6fd63b4816883b102B05F026484fBf28"]        // address[] - 例如 ["0x..."]
            ]
        });

      console.log("📝 Transaction hash:", hash);
      setNFTMintHash(hash);
      setNftAddress("Transaction submitted. Check your wallet or explorer.");
    } catch (err) {
      console.error("❌ Error creating NFT:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mint-container">
      <h1>Create Subscription NFT</h1>
      <p>Deploy a new NFT contract for your app via the Subscription Factory.</p>

      <input
        type="text"
        placeholder="App Name (e.g. ChatGPT Pro)"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        className="input-field"
      />

      <input
        type="text"
        placeholder="Symbol (e.g. GPT)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="input-field"
      />

      <input
        type="number"
        placeholder="Mint Price (e.g. 0.01 Pol)"
        value={mintPrice}
        onChange={(e) => setMintPrice(e.target.value)}
        className="input-field"
      />

      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={transferable}
          onChange={(e) => setTransferable(e.target.checked)}
        />
        Allow Transfer
      </label>

      <button className="mint-button" onClick={handleCreateNFT} disabled={creating}>
        {creating ? "Creating..." : "Create NFT"}
      </button>

      {nftAddress && <p className="success-msg">✅ {nftAddress}</p>}
      {error && <p className="error-msg">❌ {error}</p>}
        {NFTMintHash && (
            <p className="transaction-hash">
            📝 Transaction Hash:{" "}
            <a href={`https://amoy.polygonscan.com/tx/${NFTMintHash}`} target="_blank" rel="noopener noreferrer">
                {NFTMintHash}
            </a>
            </p>
        )}
    </div>
  );
}