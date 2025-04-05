import { useState } from "react";

export function useMCPClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendToMCP = async (input) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("呼叫 MCP server 錯誤：", error);
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  return { sendToMCP, isLoading, error };
}
