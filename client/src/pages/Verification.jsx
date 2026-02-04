import React, { useState } from "react";
import { verifyUser } from "../utils/helpers";
import LiveVerification from "../components/LiveVerification";

const Verification = ({ onVerified, onError }) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const handleCapture = async (imageBlob) => {
    setVerifying(true);
    setVerificationError(null);

    try {
      const { gender, token } = await verifyUser(imageBlob);

      console.log(`✅ Verified: ${gender}`);

      // Show success message briefly
      setTimeout(() => {
        onVerified({ gender, token });
      }, 1500);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(error.message || "Liveness Check Failed");
      setVerifying(false);
      if (onError) onError(error);
    }
  };

  const handleCaptureError = (error) => {
    setVerificationError("Try Better Lighting");
    setVerifying(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-orbitron text-4xl md:text-5xl uppercase text-cyber-green tracking-wider">
            The Airlock
          </h2>
          <p className="text-gray-400 text-lg">
            Biometric verification required for entry
          </p>
        </div>

        <LiveVerification
          onVerified={(blob) => handleCapture(blob)}
          onError={(err) => setError(err)}
        />

        {/* Verification Status */}
        {verifying && !verificationError && (
          <div className="text-center space-y-4 animate-[slideUp_0.3s_ease]">
            <div className="font-orbitron text-cyber-green text-xl uppercase tracking-wider">
              Identity Verified
            </div>
            <div className="text-gray-400">
              Analyzing Gender & Generating Token...
            </div>
          </div>
        )}

        {/* Error Message */}
        {verificationError && (
          <div className="text-center p-6 border-2 border-cyber-red bg-cyber-red/10 rounded animate-shake">
            <div className="text-cyber-red font-orbitron text-lg uppercase tracking-wider mb-2">
              Verification Failed
            </div>
            <div className="text-gray-300">{verificationError}</div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto border-t border-gray-700 pt-6">
          <p className="mb-2">
            🔒 <span className="text-cyber-green">Privacy First</span>
          </p>
          <p>
            Your biometric data is processed in RAM and never stored on our
            servers. We only verify liveness and gender for matching purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;
