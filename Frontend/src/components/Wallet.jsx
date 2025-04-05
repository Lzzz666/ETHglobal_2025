import React, { useState, useEffect } from "react";
import Web3 from "web3";
import "./Wallet.css";

const WALLET_TYPES = {
  METAMASK: "MetaMask",
  OKX: "OKX Wallet",
};

const CHAINS = {
  "0x1": { name: "Ethereum", icon: "/ethereum.svg" },
  "0x89": { name: "Polygon", icon: "/polygon.svg" },
  // 你可以繼續加入 Optimism、Arbitrum 等
};

const Wallet = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [signature, setSignature] = useState("");
  const [showChains, setShowChains] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState("0x1"); // 預設 Ethereum Mainnet


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    } else {
      setAccount(null);
      setBalance(0);
    }
  };
  
  const findMetaMaskProvider = () => {
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find((p) => p.isMetaMask);
    }
    return window.ethereum?.isMetaMask ? window.ethereum : null;
  };
  
  const connectWallet = async (walletType) => {
    setShowModal(false);
    setIsConnecting(true);
    try {
      const message = "請確認您要連接這個網站。";

      if (walletType === WALLET_TYPES.METAMASK) {
        const metamaskProvider = findMetaMaskProvider();
        
        if (!metamaskProvider) {
          alert("找不到 MetaMask，請確認已安裝並啟用");
          return;
        }
  
        const web3Instance = new Web3(metamaskProvider);
  
        const accounts = await metamaskProvider.request({
          method: "eth_requestAccounts",
        });
  
        if (!accounts || accounts.length === 0) {
          throw new Error("未取得帳號");
        }
  
        const account = accounts[0];
  
        const signedMessage = await metamaskProvider.request({
          method: "personal_sign",
          params: [message, account],
        });
        console.log("✅ MetaMask 簽名成功1:", signedMessage);
        setWeb3(web3Instance);
        setAccount(account);
        getBalance(account, web3Instance);
        setSignature(signedMessage);
        console.log("✅ MetaMask 簽名成功:", signedMessage);
      }
      else if (walletType === WALLET_TYPES.OKX && window.okxwallet) {
        const web3Instance = new Web3(window.okxwallet);

        const accounts = await window.okxwallet.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];

        const signedMessage = await window.okxwallet.request({
          method: "personal_sign",
          params: [message, account],
        });

        setWeb3(web3Instance);
        setAccount(account);
        getBalance(account, web3Instance);
        setSignature(signedMessage);
        console.log("OKX Wallet 簽名成功:", signedMessage);
      } else {
        alert("請確認已安裝對應錢包擴充功能！");
      }
    } catch (error) {
      alert("使用者取消連線或簽名。");
      console.error("❌ 錢包連接或簽名失敗", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getBalance = async (address, web3Instance = web3) => {
    if (!web3Instance || !address) return;
    try {
      const balanceWei = await web3Instance.eth.getBalance(address);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(balanceEth);
    } catch (error) {
      console.error("獲取餘額失敗:", error);
    }
  };

  const shortenAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  };
  const handleSwitchChain = async (chainId) => {
    const chainInfoMap = {
      "0x1": {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_ID"],
        blockExplorerUrls: ["https://etherscan.io"],
      },
      "0x89": {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
      "0xa86a": {
        chainId: "0xa86a",
        chainName: "Avalanche",
        nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://snowtrace.io"],
      },
    };
  }  
  
  return (
    <div className="wallet-container">
      {!account ? (
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
                <div
                  className="wallet-option"
                  onClick={() => connectWallet(WALLET_TYPES.OKX)}
                >
                  🔶 OKX Wallet
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
                <img src={CHAINS[selectedChainId]?.icon} alt="chain" className="chain-icon" />
                <span className="arrow">▼</span>
              </div>
              {showChains && (
                <div className="chain-list">
                  {Object.entries(CHAINS).map(([id, chain]) => (
                    <div key={id} className="chain-item" onClick={() => handleSwitchChain(id)}>
                      <img src={chain.icon} alt={chain.name} className="chain-icon" />
                      {chain.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wallet-address">{shortenAddress(account)}</div>
            <div className="wallet-balance">{parseFloat(balance).toFixed(3)} ETH</div>
            <div
              className="disconnect-button"
              onClick={() => {
                setAccount(null);
                setBalance(0);
                setSignature("");
                setWeb3(null);
              }}
            >
              <img src="./image.png" alt="Disconnect" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
