import React, { useState, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import Landing from "./pages/Landing";
import Verification from "./pages/Verification";
import Onboarding from "./pages/Onboarding";
import Lobby from "./pages/Lobby";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [token, setToken] = useState(null);
  const [verifiedGender, setVerifiedGender] = useState(null);
  const [userData, setUserData] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const chat = useChat(token);

  // Check for existing token on mount
  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setDeviceId(visitorId);
      console.log("Device ID:", visitorId);
    };

    const storedToken = localStorage.getItem("fingerprint");
    const storedUserData = localStorage.getItem("userData");
    const storedGender = localStorage.getItem("verifiedGender");

    setFp();

    if (storedToken) {
      setToken(storedToken);

      if (storedGender) {
        setVerifiedGender(storedGender);
      }

      if (storedUserData) {
        // we have both token and user data, go to lobby
        setUserData(JSON.parse(storedUserData));
        setCurrentView("lobby");
      } else {
        // we have token but no user data, go to onboarding
        setCurrentView("onboarding");
      }
    } else {
      // no token, stay on landing
      setCurrentView("landing");
    }
  }, []);

  const handleEnterAirlock = () => {
    const storedToken = localStorage.getItem("fingerprint");
    if (storedToken) {
      if (userData) {
        setCurrentView("lobby");
      } else {
        setCurrentView("onboarding");
      }
      setToken(storedToken);
    } else {
      setCurrentView("verification");
    }
  };

  const handleVerificationSuccess = (verificationData) => {
    setToken(verificationData.token);
    setVerifiedGender(verificationData.gender);

    // save token to localStorage
    localStorage.setItem("fingerprint", verificationData.token);
    localStorage.setItem("verifiedGender", verificationData.gender);

    setCurrentView("onboarding");
  };

  const handleVerificationError = (error) => {
    console.error("❌ Verification failed:", error);
  };

  const handleOnboardingComplete = (data) => {
    setUserData(data);

    // save user data to localStorage
    localStorage.setItem("userData", JSON.stringify(data));

    setCurrentView("lobby");
  };

  const handleBackToOnboarding = () => {
    setCurrentView("onboarding");
  };

  const handlePreferenceUpdate = (newPref) => {
    setUserData((prev) => ({
      ...prev,
      preference: newPref, // Updates the UI to "any"
    }));
  };

  const chatHook = useChat(token, handlePreferenceUpdate);

  const handlePreferenceChange = (newPreference) => {
    setUserData((prev) => ({ ...prev, preference: newPreference }));
  };

  const handleFullLogout = () => {
    localStorage.removeItem("fingerprint");
    localStorage.removeItem("userData");
    setToken(null);
    setUserData(null);
    setVerifiedGender(null);
    setCurrentView("landing");
  };

  return (
    <div className="min-h-screen bg-grid-pattern bg-grid bg-cyber-gradient bg-bg-dark relative scanline-effect">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 border-2 border-cyber-green rounded-full animate-spin-slow" />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 border-2 border-cyber-blue rounded-full animate-spin-slow"
          style={{ animationDirection: "reverse" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {currentView === "landing" && <Landing onEnter={handleEnterAirlock} />}

        {currentView === "verification" && (
          <Verification
            onVerified={handleVerificationSuccess}
            onError={handleVerificationError}
          />
        )}

        {currentView === "onboarding" && (
          <Onboarding
            onComplete={handleOnboardingComplete}
            verifiedGender={verifiedGender}
          />
        )}

        {currentView === "lobby" && userData && (
          <Lobby
            chatHook={chat}
            userData={userData}
            onBack={handleBackToOnboarding}
            verifiedGender={verifiedGender}
            token={deviceId}
            onUpdatePreference={handlePreferenceChange}
            onLogout={handleFullLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;
