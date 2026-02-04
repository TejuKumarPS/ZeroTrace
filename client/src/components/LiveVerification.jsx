import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { ScanFace, Smile } from "lucide-react";

const LiveVerification = ({ onVerified, onError }) => {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("Initializing Neural Net...");
  const [capturing, setCapturing] = useState(false);
  const [expression, setExpression] = useState("neutral");

  // 1. Load Models on Mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; 
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus("System Ready. Please SMILE to Verify.");
      } catch (err) {
        console.error("Model Load Error:", err);
        if (onError)
          onError("Failed to load AI models. Check public/models folder.");
      }
    };
    loadModels();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onError]);

  // 2. Continuous Face Scan Loop
  const handleVideoOnPlay = () => {
    // Run detection every 500ms
    intervalRef.current = setInterval(async () => {
      if (!webcamRef.current || !webcamRef.current.video || capturing) return;

      const video = webcamRef.current.video;

      // Safe check if video is ready
      if (video.readyState !== 4) return;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;

          // Debug: Check which expression is dominant
          const maxExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b,
          );
          setExpression(maxExpression);

          // CHECK FOR SMILE (Happiness > 0.7)
          if (expressions.happy > 0.7 && !capturing) {
            captureImage();
          } else {
            setStatus(
              `Face Detected. Expression: ${maxExpression.toUpperCase()}`,
            );
          }
        } else {
          setStatus("No Face Detected. Center yourself.");
          setExpression("none");
        }
      } catch (err) {
        console.error("Detection Error:", err);
      }
    }, 500);
  };

  const captureImage = () => {
    if (capturing) return;
    setCapturing(true);
    setStatus("SMILE DETECTED! ENCRYPTING BIOMETRICS...");

    // Stop the loop
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Capture
    const imageSrc = webcamRef.current.getScreenshot();

    // Convert to Blob for your existing logic
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        // Add a small delay for the user to see the "Success" message
        setTimeout(() => {
          onVerified(blob);
        }, 1000);
      });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Cyberpunk Status Header */}
      <div className="text-center space-y-2">
        <h2
          className={`font-orbitron text-xl uppercase tracking-widest ${capturing ? "text-cyber-blue animate-pulse" : "text-cyber-green"}`}
        >
          {capturing ? "VERIFICATION SUCCESSFUL" : "LIVENESS CHECK REQUIRED"}
        </h2>
        <div className="text-gray-400 font-tech text-sm flex items-center justify-center gap-2">
          {capturing ? (
            <ScanFace className="animate-spin" />
          ) : (
            <Smile
              className={
                expression === "happy" ? "text-cyber-yellow" : "text-gray-500"
              }
            />
          )}
          <span>{status}</span>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full aspect-[4/3] border-2 border-cyber-green bg-black rounded overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.1)]">
        {modelsLoaded ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user",
            }}
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror mode
            onUserMedia={handleVideoOnPlay}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-cyber-green animate-pulse">
            <ScanFace size={48} />
            <p className="mt-4 font-orbitron">INITIALIZING AI MODULES...</p>
          </div>
        )}

        {/* Scanning Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[length:30px_30px]" />

          {/* Corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-cyber-green/50" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-cyber-green/50" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-cyber-green/50" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-cyber-green/50" />

          {/* Scanning Line (Only when not capturing) */}
          {!capturing && (
            <div className="absolute w-full h-1 bg-cyber-green/50 shadow-[0_0_15px_rgba(0,255,65,0.8)] animate-scan top-0" />
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 font-mono text-center">
        SECURITY PROTOCOL: SMILE TO TRIGGER SHUTTER
      </div>
    </div>
  );
};

export default LiveVerification;
