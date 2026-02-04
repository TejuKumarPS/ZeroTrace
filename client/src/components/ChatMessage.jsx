import React from "react";
import { formatTime } from "../utils/helpers";

const ChatMessage = ({ message }) => {
  const { type, text, timestamp } = message;

  if (type === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-cyber-green/10 border border-cyber-green/30 rounded text-sm text-gray-400 text-center max-w-md">
          {text}
        </div>
      </div>
    );
  }

  const isUser = type === "user";

  return (
    <div
      className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"} animate-[slideUp_0.3s_ease]`}
    >
      <div className={`max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`
          px-4 py-3 rounded-lg break-words
          ${
            isUser
              ? "bg-cyber-green/20 border border-cyber-green/50 text-gray-100"
              : "bg-cyber-blue/20 border border-cyber-blue/50 text-gray-100"
          }
        `}
        >
          {text}
        </div>
        <div className="text-xs text-gray-500 mt-1 px-1">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
