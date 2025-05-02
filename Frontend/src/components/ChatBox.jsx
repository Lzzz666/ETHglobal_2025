import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";
import { useMCPClient } from "./MCPClient";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const { sendToMCP, isLoading, error } = useMCPClient();

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 新增使用者訊息到對話框
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // 呼叫 MCPClient 傳送訊息
      const data = await sendToMCP(input);
      setMessages([
        ...newMessages,
        { role: "mcp", content: data.reply || "沒有回覆" },
      ]);
    } catch (error) {
      console.error("呼叫 MCP server 錯誤：", error);
      setMessages([
        ...newMessages,
        { role: "mcp", content: `系統錯誤，請稍後再試：${error.message}` },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="message-area">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${
              msg.role === "user" ? "user-message" : "mcp-message"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="輸入指令（Enter 送出，Shift+Enter 換行）"
        />
      </div>
    </div>
  );
}
