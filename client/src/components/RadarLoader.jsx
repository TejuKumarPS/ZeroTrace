import React from "react";

const RadarLoader = ({ searchingFor }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Radar Animation */}
      <div className="relative w-64 h-64">
        {/* Outer Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-cyber-green/20" />
        <div className="absolute inset-8 rounded-full border-2 border-cyber-green/30" />
        <div className="absolute inset-16 rounded-full border-2 border-cyber-green/40" />

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyber-green shadow-[0_0_20px_var(--cyber-green)]" />

        {/* Rotating Sweep */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-cyber-green to-transparent origin-bottom" />
        </div>

        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full bg-cyber-green/10 animate-radar-pulse" />
        <div
          className="absolute inset-4 rounded-full bg-cyber-green/5 animate-radar-pulse"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Blips */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyber-blue shadow-[0_0_10px_var(--cyber-blue)] animate-pulse" />
        <div
          className="absolute top-3/4 right-1/4 w-2 h-2 rounded-full bg-cyber-blue shadow-[0_0_10px_var(--cyber-blue)] animate-pulse"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="absolute bottom-1/3 left-2/3 w-2 h-2 rounded-full bg-cyber-blue shadow-[0_0_10px_var(--cyber-blue)] animate-pulse"
          style={{ animationDelay: "0.6s" }}
        />
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="font-orbitron text-xl text-cyber-green uppercase tracking-wider mb-2">
          Scanning Frequency
        </p>
        <p className="text-gray-400">
          Looking for{" "}
          <span className="text-cyber-blue font-bold">{searchingFor}</span>{" "}
          match...
        </p>
      </div>

      {/* Dots Animation */}
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" />
        <div
          className="w-2 h-2 rounded-full bg-cyber-green animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-cyber-green animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
};

export default RadarLoader;
