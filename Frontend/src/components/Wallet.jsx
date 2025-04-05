import React, { useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
  useChainId,
  useConfig,
} from "wagmi";
import { metaMask } from "@wagmi/connectors";
import { switchChain as switchChainViem } from 'viem/actions'
import "./Wallet.css";
import { supportedChains } from '../../config';

const WALLET_TYPES = {
  METAMASK: "MetaMask",
};

const CHAINS = {
  [1]: { name: "Ethereum", icon: "/ethereum.svg" },
  [137]: { name: "Polygon", icon: "/polygon.svg" },
  [80002]: { name: "Polygon Amoy", icon: "/polygon.svg" },
};

const Wallet = () => {
  const [showChains, setShowChains] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const { address, isConnecting, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const config = useConfig();

  const connectWallet = async (walletType) => {
    setShowModal(false);
    try {
      if (walletType === WALLET_TYPES.METAMASK) {
        connect({ connector: metaMask() });
      }

      if (address) {
        signMessage({ message: "請確認您要連接這個網站。" }, {
          onSuccess: (signature) => console.log("✅ 簽名成功:", signature),
          onError: (error) => console.error("❌ 簽名失敗:", error),
        });
      }
    } catch (error) {
      console.error("❌ 錢包連接失敗", error);
      alert("使用者取消連線或發生錯誤");
    }
  };

  const shortenAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  };

  const handleSwitchChain = async (chainId) => {
    try {
      const chain = supportedChains.find(c => c.id === chainId);
      if (!chain) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      await switchChain(
        { chainId },
        {
          onSuccess: () => {
            setShowChains(false);
            console.log("✅ 成功切換至", CHAINS[chainId].name);
          },
          onError: async (error) => {
            console.error("❌ Initial switch failed:", error);
            // Handle case where chain isn't added to wallet (error code 4902)
            if (error.code === 4902) {
              try {
                const provider = await config.connectors[0].getProvider();
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${chainId.toString(16)}`,
                    chainName: chain.name,
                    nativeCurrency: chain.nativeCurrency,
                    rpcUrls: chain.rpcUrls.default.http,
                    blockExplorerUrls: [chain.blockExplorers?.default.url],
                  }],
                });
                // After adding, try switching again
                await switchChain({ chainId });
                setShowChains(false);
                console.log("✅ Chain added and switched to", CHAINS[chainId].name);
              } catch (addError) {
                console.error("❌ Failed to add chain:", addError);
                alert("無法新增網絡，請手動在錢包中添加");
              }
            } else {
              alert(`切換鏈失敗: ${error.message}`);
            }
          },
        }
      );
    } catch (error) {
      console.error("❌ 切換鏈失敗:", error);
      alert("切換鏈失敗，請確認錢包設定");
    }
  };

  // ... rest of your component (render part remains mostly the same)
  return (
    <div className="wallet-container">
      {!isConnected ? (
        <>
          <div className="connect-button" onClick={() => setShowModal(true)}>
            {isConnecting ? "連接中..." : "Connect Wallet"}
          </div>
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Select Wallet</h3>
                <div
                  className="wallet-option"
                  onClick={() => connectWallet(WALLET_TYPES.METAMASK)}
                >
                  🦊 MetaMask
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="account-box">
          <div className="wallet-info">
            <div className="chain-dropdown">
              <div className="chain-selector" onClick={() => setShowChains(!showChains)}>
                <img 
                  src={CHAINS[currentChainId]?.icon} 
                  alt="chain" 
                  className="chain-icon" 
                />
                <span className="arrow">▼</span>
              </div>
              {showChains && (
                <div className="chain-list">
                  {Object.entries(CHAINS).map(([id, chain]) => (
                    <div
                      key={id}
                      className="chain-item"
                      onClick={() => handleSwitchChain(Number(id))}
                    >
                      <img src={chain.icon} alt={chain.name} className="chain-icon" />
                      {chain.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wallet-address">{shortenAddress(address)}</div>
            <div className="wallet-balance">
              {balance ? parseFloat(balance.formatted).toFixed(3) : "0"} {balance?.symbol}
            </div>
            <div className="disconnect-button" onClick={() => disconnect()}>
              <img src="./image.png" alt="Disconnect" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;