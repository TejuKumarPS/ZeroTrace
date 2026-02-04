import React from "react";
import Button from "../components/Button";

const Landing = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto space-y-8">
        {/* Headline */}
        <h1 className="font-orbitron font-black text-6xl md:text-8xl uppercase tracking-wider bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent animate-glitch drop-shadow-[0_0_40px_rgba(0,255,65,0.3)]">
          Anonymous.
          <br />
          Verified.
          <br />
          Ephemeral.
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-lg md:text-xl uppercase tracking-[0.3em] font-orbitron">
          [ ENTER THE VOID ]
        </p>

        {/* Subtext */}
        <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed opacity-80">
          The only chat app that deletes your identity before you say hello.
        </p>

        {/* CTA Button */}
        <div className="pt-8">
          <Button onClick={onEnter} variant="primary">
            [ ENTER THE AIRLOCK ]
          </Button>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 border border-cyber-green/30 bg-cyber-green/5 backdrop-blur">
            <div className="text-cyber-green font-orbitron text-sm uppercase mb-2">
              Zero Retention
            </div>
            <div className="text-gray-400 text-sm">
              Messages are destroyed after each session. No databases. No
              traces.
            </div>
          </div>
          <div className="p-6 border border-cyber-blue/30 bg-cyber-blue/5 backdrop-blur">
            <div className="text-cyber-blue font-orbitron text-sm uppercase mb-2">
              Biometric Verify
            </div>
            <div className="text-gray-400 text-sm">
              AI-powered liveness detection ensures real humans, processed in
              RAM.
            </div>
          </div>
          <div className="p-6 border border-cyber-green/30 bg-cyber-green/5 backdrop-blur">
            <div className="text-cyber-green font-orbitron text-sm uppercase mb-2">
              Anonymous Match
            </div>
            <div className="text-gray-400 text-sm">
              Smart matchmaking without storing personal information.
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 border border-cyber-green/30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-20 right-20 w-60 h-60 border border-cyber-blue/20 rotate-12 animate-pulse-slow" />
      </div>
    </div>
  );
};

export default Landing;
