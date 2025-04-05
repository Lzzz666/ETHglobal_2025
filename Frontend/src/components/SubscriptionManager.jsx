import React, { useEffect, useState } from "react";
import "./SubscriptionManager.css";
import { createPublicClient, http, parseAbi } from "viem";
import { parseAbiItem } from "viem";
import { supportedChains } from "../../config";
import { useAccount, useChainId, useWalletClient } from "wagmi";

const NFT_CONTRACT = "0x09AF6F37BEA695fBD170f1738Ce9BEf0D3730166";
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function symbol() view returns (string)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)",

];

export default function SubscriptionManager() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferSub, setTransferSub] = useState(null);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);

  const { address: Address } = useAccount();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const totalMonthlyCost = 200;
  const paidThisMonth = 80;
  const historicalTotalPaid = 150;

  const handleTransfer = (sub) => {
    setTransferSub(sub);
    setShowTransferModal(true);
  };

  const handleCancel = (sub) => {
    alert(`Cancel subscription: ${sub.name}`);
  };

  const transferNFT = async () => {
    if (!walletClient || !transferSub || !transferTarget) {
      alert("請確認所有資訊都已填寫！");
      return;
    }

    try {
      const chain = supportedChains.find((c) => c.id === currentChainId);
      if (!chain) throw new Error("鏈未支援");

      const tokenId = transferSub.tokenId;
      const contractAddress = NFT_CONTRACT;

      console.log("🚀 Transferring token:", tokenId, "to", transferTarget);

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: parseAbi(ABI),
        functionName: "safeTransferFrom",
        args: [userAddress, transferTarget, BigInt(tokenId)],
      });

      alert(`✅ 成功轉讓 ${transferSub.name} 給 ${transferTarget}`);
      setShowTransferModal(false);
      setTransferTarget("");
    } catch (err) {
      console.error("❌ Transfer failed", err);
      alert(`轉讓失敗：${err.message || err}`);
    }
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const client = createPublicClient({
          chain: supportedChains.find((c) => c.id === currentChainId),
          transport: http(),
        });

        console.log("🚀 Connected account:", Address);
        setUserAddress(Address);

        const symbol = await client.readContract({
          address: NFT_CONTRACT,
          abi: parseAbi(ABI),
          functionName: "symbol",
        });

        const logs = await client.getLogs({
          address: NFT_CONTRACT,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
          ),
          args: { to: Address },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        const tokenIds = logs.map((log) => log.args.tokenId);
        const nftList = [];
        const subscriptionList = [];

        for (const tokenId of tokenIds) {
          // 先確認目前是否還持有
          const owner = await client.readContract({
            address: NFT_CONTRACT,
            abi: parseAbi(ABI),
            functionName: "ownerOf",
            args: [tokenId],
          });
        
          if (owner.toLowerCase() !== Address.toLowerCase()) {
            continue; // ⛔ 跳過不屬於自己的
          }
        
          // 再去抓 metadata
          const tokenURI = await client.readContract({
            address: NFT_CONTRACT,
            abi: parseAbi(ABI),
            functionName: "tokenURI",
            args: [tokenId],
          });
        
          nftList.push({ tokenId, tokenURI });
        
          const fake = {
            price: 5 + (parseInt(tokenId) % 10),
            currency: "USDT",
            nextDue: `2025-05-${String((parseInt(tokenId) % 28) + 1).padStart(2, "0")}`,
          };
        
          subscriptionList.push({
            name: `${symbol} #${tokenId}`,
            tokenId,
            tokenURI,
            ...fake,
          });
        }
        
        setOwnedNFTs(nftList);
        setSubscriptions(subscriptionList);
      } catch (err) {
        console.error("❌ Failed to fetch NFTs:", err);
      }
    };

    fetchNFTs();
  }, [currentChainId]);

  return (
    <div className="subscription-manager">
      {/* Top Info Card */}
      <div className="info-card">
        <div className="info-item">
          <h2 className="info-title">Total Monthly Subscription Cost</h2>
          <p className="info-value">$ {totalMonthlyCost} USDT / month</p>
        </div>
        <div className="info-item">
          <h2 className="info-title">Paid This Month</h2>
          <p className="info-value paid">$ {paidThisMonth} USDT</p>
        </div>
        <div className="info-item">
          <h2 className="info-title">Historical Total Paid</h2>
          <p className="info-value totalpaid">$ {historicalTotalPaid} USDT</p>
        </div>
      </div>

      {/* Subscription List Table */}
      <div className="subscription-table-container">
        <table className="subscription-table">
          <thead>
            <tr>
              <th>Subscription Service</th>
              <th>Price</th>
              <th>Next Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, index) => (
              <tr key={index}>
                <td>{sub.name}</td>
                <td>
                  {sub.price} {sub.currency}/month
                </td>
                <td>{sub.nextDue}</td>
                <td>
                  <button className="btn transfer" onClick={() => handleTransfer(sub)}>
                    Transfer
                  </button>
                  <button className="btn cancel" onClick={() => handleCancel(sub)}>
                    Unsubscribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTransferModal(false)}>
              ×
            </button>

            <h2 className="modal-title">Transfer Subscription</h2>
            <p className="modal-desc">
              You're about to transfer <strong>{transferSub?.name}</strong>.
              Please enter the wallet address or username of the recipient below.
            </p>

            <input
              type="text"
              className="input"
              placeholder="Recipient address"
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
            />

            <div className="modal-warning">
              ⚠️ Once transferred, this subscription cannot be undone.
              Make sure the recipient address is correct.
            </div>

            <div className="modal-footer">
              <button
                className="subscribe-btn"
                onClick={transferNFT}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
