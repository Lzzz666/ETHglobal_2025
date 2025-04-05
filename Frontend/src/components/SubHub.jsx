import React, { useState } from "react";
import "./SubHub.css";

import { useWriteContract, useWaitForTransactionReceipt, useConnect,useChainId, useAccount} from "wagmi";
import { parseEther } from 'viem'
import {supportedChains,config} from '../../config'
import { waitForTransactionReceipt } from 'wagmi/actions';
const categories = ["AI Tool", "App","Web3", "Community"];
import { ERC721_ABI } from "../abi/ERC721";
const polygonAmoy = supportedChains.find((chain) => chain.id === 80002);

const sampleServices = [
  {
    name: "ChatGPT Pro",
    price: "$20/mo",
    category: "AI Tool",
    description: "Access to GPT-4, faster responses, and priority access.",
    img: "https://pbs.twimg.com/profile_images/1885410181409820672/ztsaR0JW_400x400.jpg",
  },
  {
    name: "Claude Pro",
    price: "$20/mo",
    category: "AI Tool",
    description: "Anthropic's conversational AI with high-quality natural language understanding.",
    img: "https://zorgle.co.uk/wp-content/uploads/2024/11/Claude-ai-logo.png",
  },
  {
    name: "Perplexity Pro",
    price: "$20/mo",
    category: "AI Tool",
    description: "AI-powered search engine with citations and real-time browsing.",
    img: "https://pbs.twimg.com/profile_images/1886515713537413120/kj5NsIXW_400x400.jpg",
  },
  {
    name: "Cursor",
    price: "$20/mo",
    category: "AI Tool",
    description: "AI coding assistant built into a collaborative IDE. Supports pair programming.",
    img: "https://pbs.twimg.com/profile_images/1794806483219337216/9vW73mux_400x400.jpg",
  },
  {
    name: "Disney+",
    price: "$7.99/mo",
    category: "App",
    description: "Stream Disney, Marvel, Pixar, Star Wars, and more.",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  },
  {
    name: "Notion AI",
    price: "$10/mo",
    category: "AI Tool",
    description: "Generate content, summarize notes, and automate tasks.",
    img: "https://pbs.twimg.com/profile_images/1903224093476077568/OCclsw4c_400x400.jpg",
  },
  {
    name: "Figma Plus",
    price: "$15/mo",
    category: "App",
    description: "Advanced prototyping and collaborative tools in Figma.",
    img: "https://pbs.twimg.com/profile_images/1907792113573515265/dyEphxPo_400x400.jpg",
  },
  {
    name: "Kirby",
    price: "$5/mo",
    category: "Community",
    description: "Join the group to see more Kirby!",
    img: "https://pbs.twimg.com/profile_images/1642709121182105600/Nsa4_hLo_400x400.png",
  },
  {
    name: "Netflix",
    price: "$20/mo",
    category: "App",
    description: "Unlimited streaming of movies and shows.",
    img: "https://pbs.twimg.com/profile_images/1886652419028955136/rQ9l8-TF_400x400.jpg",
  },
  {
    name: "Spotify Premium",
    price: "$9.99/mo",
    category: "App",
    description: "Unlimited music streaming without ads, offline listening, and high-quality audio.",
    img: "https://pbs.twimg.com/profile_images/1793315484961591301/DiEXUJEV_400x400.jpg",
  },
  {
    name: "YouTube Premium",
    price: "$11.99/mo",
    category: "App",
    description: "Ad-free videos, background play, and offline access across YouTube and YouTube Music.",
    img: "https://pbs.twimg.com/profile_images/1861941491549302784/zhvc0XLF_400x400.jpg",
  },
  {
    name: "Canva Pro",
    price: "$12.99/mo",
    category: "App",
    description: "Advanced design tools, premium templates, brand kit, and team collaboration features.",
    img: "https://pbs.twimg.com/profile_images/1542647040756568064/YbE5Hs-5_400x400.jpg",
  },
  {
    name: "Gemini Advanced",
    price: "$19.99/mo",
    category: "AI Tool",
    description: "Google’s Gemini 1.5 with long context, multi-modal understanding.",
    img: "https://pbs.twimg.com/profile_images/1815873998682742785/xrPuqBjr_400x400.jpg",
  },
  {
    name: "GitHub Copilot",
    price: "$10/mo",
    category: "AI Tool",
    description: "Code autocompletion and chat assistant powered by OpenAI.",
    img: "https://pbs.twimg.com/profile_images/1633247750010830848/8zfRrYjA_400x400.png",
  },
  {
    name: "Grammarly Premium",
    price: "$12/mo",
    category: "AI Tool",
    description: "Grammar, tone, and AI writing suggestions for documents and emails.",
    img: "https://pbs.twimg.com/profile_images/1753062253837090816/BJZQhxg2_400x400.jpg",
  },
  {
    name: "NotebookLM (Google)",
    price: "Free",
    category: "AI Tool",
    description: "AI-powered notebook assistant that understands and summarizes your documents, notes, and sources.",
    img: "https://pbs.twimg.com/profile_images/1861084152054849547/uKBhfKBo_400x400.jpg",
  },
  {
    name: "Grok AI (xAI)",
    price: "$16/mo",
    category: "AI Tool",
    description: "An AI chatbot developed by Elon Musk’s xAI, integrated with X (Twitter) and designed with a humorous personality and real-time web access.",
    img: "https://pbs.twimg.com/profile_images/1893219113717342208/Vgg2hEPa_400x400.jpg",
  },
  {
    name: "LinkedIn Premium",
    price: "$39.99/mo",
    category: "App",
    description: "Advanced career insights, InMail credits, profile views, and learning courses to boost your career.",
    img: "https://pbs.twimg.com/profile_images/1661161645857710081/6WtDIesg_400x400.png",
  },
  {
    name: "Amazon Prime",
    price: "$14.99/mo",
    category: "App",
    description: "Fast delivery, Prime Video, exclusive deals, and Amazon Music all in one subscription.",
    img: "https://pbs.twimg.com/profile_images/1722015850168037376/OiNYYeZQ_400x400.jpg",
  },
  {
    name: "Medium Membership",
    price: "$5/mo",
    category: "App",
    description: "Unlimited access to high-quality stories and support for your favorite writers on Medium.",
    img: "https://pbs.twimg.com/profile_images/1825934378192564224/Z-TG086Z_400x400.jpg",
  },
  {
    name: "X Premium+ (Grok AI)",
    price: "$22/mo",
    category: "AI Tool",
    description: "Access Grok AI, ad-free experience, article publishing, and maximum reply visibility on X (formerly Twitter).",
    img: "https://pbs.twimg.com/profile_images/1683899100922511378/5lY42eHs_400x400.jpg",
  },
  {
    name: "Discord Nitro",
    price: "$9.99/mo",
    category: "App",
    description: "Enhanced Discord experience with server boosts, increased upload limits, and more.",
    img: "https://pbs.twimg.com/profile_images/1795851438956204032/rLl5Y48q_400x400.jpg",
  },
  {
    name: "Twitch Turbo",
    price: "$8.99/mo",
    category: "App",
    description: "Ad-free viewing, exclusive chat badges, and more on Twitch.",
    img: "https://pbs.twimg.com/profile_images/1903140828152823808/FAufQwqc_400x400.jpg",
  },
  {
    name: "LeetCode Pro",
    price: "$35/mo",
    category: "App",
    description: "Access to premium coding problems, contests, and interview simulations.",
    img: "https://pbs.twimg.com/profile_images/910592237695676416/7xInX10u_400x400.jpg",
  },
  {
    name: "Nansen Pro",
    price: "$100/mo",
    category: "Web3",
    description: "Chain analytics for power users. Explore wallet behaviors, token movements, and NFT trends.",
    img: "https://pbs.twimg.com/profile_images/1798630976387764224/O05j4854_400x400.jpg"
  },
  {
    name: "Alchemy Enhanced",
    price: "$49/mo",
    category: "Web3",
    description: "Web3 infrastructure with advanced analytics, API boost, and enhanced support.",
    img: "https://pbs.twimg.com/profile_images/1876056405012033536/vjO9FucE_400x400.jpg"
  }
];



export default function SubHub() {
  const [selectedCategory, setSelectedCategory] = useState("AI Tool");
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [subscribedList, setSubscribedList] = useState(["ChatGPT Pro"]);
  const { writeContractAsync } = useWriteContract();
  const { address: userAddress } = useAccount();
  const isSubscribed = (serviceName) => subscribedList.includes(serviceName);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const currentChainId = useChainId();
  
  const CONTRACT_ADDRESS = "0x5BD6BA046bCC634A52214D6c0b96b0c1739CE96A";

  const { connectors, connect } = useConnect()
  console.log("Connectors:", connectors)

  const to = '0x2Ac66a303fBfe2a5f2a265D69aea6EC58ae3B99a';


  const filtered = sampleServices.filter(
    (s) => s.category === selectedCategory
  );

  const parsePrice = (priceString) => {
    const numericString = priceString.replace(/^\$/, '').split('/')[0];
    const value = parseFloat(numericString);
    return value;
  };


  const handleSubscribe = async (service) => {
    console.log("🔔 Subscribing to:", service.name);
  
    // 1. Chain check
    if (currentChainId!== 80002) {
      console.log("🔁 Switching to Polygon Amoy...");
      try {
        await switchChainAsync({ currentChainId: 80002 });
        console.log("✅ Chain switched to Polygon Amoy");
      } catch (err) {
        console.error("❌ Failed to switch chain:", err);
        return;
      }
    }
  
    // 2. Prepare data
    const tokenId = 100; // Replace if needed
    const value = "0.0001";
    console.log("🧾 Token ID:", tokenId);
    console.log("💰 Service price (in MATIC):", value);
  
    try {
      // 3. Write transaction
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "safeMint",
        args: [userAddress, tokenId],
        value: parseEther(value),
      });
  
      console.log("📤 Transaction sent. Hash:", txHash);
  
      // 4. Wait for confirmation
      const receipt = await waitForTransactionReceipt(config, { hash: txHash });
      if (receipt.status === 'success') {
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
      } else {
        console.error("⚠️ Transaction failed or reverted.");
      }
    } catch (error) {
      console.error("❌ Subscription failed:", error);
      if (error?.cause?.message) {
        console.error("🪲 Revert Reason:", error.cause.message);
      }
    }
  };
  // Example usage in your component
  const exampleService = {
    name: "Premium Subscription",
    tokenId: 1, // Example token ID
    price: "0.01", // Example price in MATIC
  };
  
  return (
    <div className="subhub-container">
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filtered.map((service, idx) => (
          <div
            className="card"
            key={idx}
            onClick={() => {
              setSelectedService(service);
              setShowModal(true);
            }}
          >

            <div className="card-img">
              <img className="applogo" src={service.img} alt="Subscription Service" />
            </div>
            <div className="card-name">{service.name}</div>
            <div className="card-price">
              {isSubscribed(service.name) ? "✅ Subscribed" : service.price}
            </div>

          </div>
        ))}
      </div>
      {showModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

            <div className="modal-logo">
              <img className="applogo" src={selectedService.img} alt={selectedService.name} />
            </div>

            <h2 className="modal-title">{selectedService.name}</h2>
            <p className="modal-desc">{selectedService.description}</p>

            <div className="modal-footer">
              {isSubscribed(selectedService.name) ? (
                <div className="subscribe-btn subscribed">✅ Subscribed</div>
              ) : (
                <div className="subscribe-btn"  onClick={() => handleSubscribe(selectedService)}>{isPending ? 'Waiting...' : `Subscribe ${selectedService.price}`}</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
