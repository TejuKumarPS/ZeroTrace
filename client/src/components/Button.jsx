import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  fullWidth = false,
}) => {
  const baseClasses = `
    font-orbitron font-bold uppercase tracking-widest
    px-10 py-4 border-2 transition-all duration-300
    relative overflow-hidden group
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

  const variantClasses = {
    primary: `
      text-cyber-green border-cyber-green
      hover:text-bg-dark hover:shadow-[0_0_30px_rgba(0,255,65,0.5)]
      before:absolute before:inset-0 before:bg-cyber-green 
      before:-translate-x-full before:transition-transform before:duration-300
      hover:before:translate-x-0 before:-z-10
    `,
    secondary: `
      text-cyber-blue border-cyber-blue
      hover:text-bg-dark hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]
      before:absolute before:inset-0 before:bg-cyber-blue 
      before:-translate-x-full before:transition-transform before:duration-300
      hover:before:translate-x-0 before:-z-10
    `,
    danger: `
      text-cyber-red border-cyber-red
      hover:text-bg-dark hover:shadow-[0_0_30px_rgba(255,0,85,0.5)]
      before:absolute before:inset-0 before:bg-cyber-red 
      before:-translate-x-full before:transition-transform before:duration-300
      hover:before:translate-x-0 before:-z-10
    `,
    ghost: `
      text-gray-400 border-gray-400 text-sm px-6 py-3
      hover:text-bg-dark hover:shadow-[0_0_20px_rgba(138,138,138,0.5)]
      before:absolute before:inset-0 before:bg-gray-400 
      before:-translate-x-full before:transition-transform before:duration-300
      hover:before:translate-x-0 before:-z-10
    `,
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
