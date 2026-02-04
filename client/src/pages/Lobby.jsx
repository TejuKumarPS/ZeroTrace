import React, { useState, useEffect, useRef } from "react";
import { Send, Flag, Power, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import RadarLoader from "../components/RadarLoader";
import ChatMessage from "../components/ChatMessage";
import Modal from "../components/Modal";

const Lobby = ({
  chatHook,
  userData,
  onBack,
  verifiedGender,
  token,
  onUpdatePreference,
}) => {
  const {
    messages,
    partnerNickname,
    isTyping,
    error,
    inQueue,
    joinQueue,
    leaveQueue,
    sendMessage,
    sendTypingIndicator,
    disconnect,
    reportPartner,
  } = chatHook;

  const [messageInput, setMessageInput] = useState("");
  const [isShredding, setIsShredding] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check for daily limit error
  useEffect(() => {
    console.log("Chat error:", error);
    if (error) {
      if (error.includes("Daily") && error.includes("limit")) {
        setShowDailyLimitModal(true);
      }
    }
  }, [error]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat starts
  useEffect(() => {
    if (partnerNickname && inputRef.current) {
      inputRef.current.focus();
    }
  }, [partnerNickname]);

  const handleFindMatch = () => {
    joinQueue(userData.preference, verifiedGender, token, userData.nickname);
  };

  const handleSkip = () => {
    // 1. Disconnect current partner
    disconnect();

    // 2. Set 'isShredding' briefly for visual effect (Optional, but looks cool)
    setIsShredding(true);

    // 3. Immediately join queue again after a tiny delay
    setTimeout(() => {
      setIsShredding(false);
      joinQueue(userData.preference, verifiedGender, token, userData.nickname);
    }, 300);
  };

  const handleCancelQueue = () => {
    leaveQueue();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    sendTypingIndicator();
  };

  const handleDisconnect = () => {
    setIsShredding(true);
    setTimeout(() => {
      disconnect();
      setIsShredding(false);
      onBack();
    }, 1000);
  };

  const handleReport = () => {
    if (window.confirm("Report this user for inappropriate behavior?")) {
      reportPartner(messages);
    }
  };

  // Queue View
  if (inQueue && !partnerNickname) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {console.log("User Data in Queue:", userData)}
        <RadarLoader searchingFor={userData.preference} />

        <div className="mt-12">
          <Button onClick={handleCancelQueue} variant="ghost">
            [ CANCEL ]
          </Button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
          Matching you with verified users in real-time...
        </div>
      </div>
    );
  }

  // Chat View
  if (partnerNickname) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={
            isShredding
              ? {
                  opacity: 0,
                  y: "100vh",
                  scaleY: 0,
                  transition: { duration: 1, ease: "easeIn" },
                }
              : { opacity: 1, y: 0 }
          }
          className="min-h-screen flex flex-col bg-bg-dark"
        >
          {/* Chat Header */}
          <div className="border-b-2 border-cyber-green/30 bg-bg-darker px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyber-green shadow-[0_0_10px_var(--cyber-green)] animate-pulse" />
                <div>
                  <div className="font-orbitron text-sm text-gray-400 uppercase">
                    Connected to:
                  </div>
                  <div className="font-orbitron text-xl text-cyber-green">
                    {partnerNickname}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-bg-dark transition-all font-orbitron text-sm uppercase tracking-wider flex items-center gap-2"
                  title="Skip to next match"
                >
                  <SkipForward size={18} />
                  <span>Next</span>
                </button>
                <button
                  onClick={handleReport}
                  className="p-2 text-cyber-yellow hover:text-cyber-red transition-colors"
                  title="Report user"
                >
                  <Flag size={20} />
                </button>
                <button
                  onClick={handleDisconnect}
                  className="p-2 text-cyber-red hover:bg-cyber-red hover:text-bg-dark transition-all border border-cyber-red"
                  title="Disconnect"
                >
                  <Power size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-grid-pattern bg-grid">
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}

              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-3 bg-cyber-blue/20 border border-cyber-blue/50 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-cyber-blue animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-cyber-green/30 bg-bg-darker px-6 py-4">
            <form
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto flex gap-4"
            >
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-cyber-green/5 border-2 border-cyber-green text-gray-200 font-tech outline-none focus:bg-cyber-green/10 focus:border-cyber-blue transition-all"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-8 py-3 bg-cyber-green text-bg-dark font-orbitron uppercase tracking-wider font-bold hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </form>

            <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-500 text-center">
              Messages are encrypted and destroyed after disconnection. Text
              only - no file uploads.
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Idle Lobby View
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div>
          <h2 className="font-orbitron text-3xl text-cyber-green uppercase tracking-wider mb-2">
            Ready to Connect
          </h2>
          <p className="text-gray-400">
            Welcome,{" "}
            <span className="text-cyber-blue font-bold">
              {userData.nickname}
            </span>
          </p>
        </div>

        <div className="p-6 border border-cyber-green/30 bg-cyber-green/5 rounded">
          <div className="text-sm text-gray-300 mb-1">Your Bio:</div>
          <div className="text-gray-200">{userData.bio}</div>
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-cyber-green/20">
            <span className="text-sm text-gray-500">I want to chat with:</span>

            <div className="relative group">
              <select
                value={userData.preference}
                onChange={(e) => onUpdatePreference(e.target.value)}
                className="appearance-none bg-bg-dark border-2 border-cyber-blue text-cyber-blue font-orbitron text-sm px-4 py-2 pr-8 rounded cursor-pointer focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:bg-cyber-blue/10 transition-all uppercase tracking-wider"
              >
                <option value="any">Any (Unlimited)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              {/* Custom Arrow Icon */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyber-blue">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleFindMatch}
          variant="primary"
          disabled={showDailyLimitModal}
          fullWidth
        >
          [ FIND MATCH ]
        </Button>

        <div className="text-center text-sm text-gray-500">
          Click to enter the matchmaking queue
        </div>
      </div>
      {/* Daily Limit Modal */}
      <Modal
        isOpen={showDailyLimitModal}
        onClose={() => setShowDailyLimitModal(false)}
        title="Daily Limit Reached"
        message="You have reached your 5 filters limit for today. This helps us maintain quality and security. Come back tomorrow to continue chatting!"
        type="error"
      />
    </div>
  );
};

export default Lobby;
