import React, { useState } from "react";
import { containsPII } from "../utils/helpers";
import { AlertTriangle } from "lucide-react";

const Input = ({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  checkPII = false,
  error,
  type = "text",
  multiline = false,
}) => {
  const [piiWarning, setPiiWarning] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (checkPII) {
      setPiiWarning(containsPII(newValue));
    }

    onChange(newValue);
  };

  const Component = multiline ? "textarea" : "input";
  const hasError = piiWarning || error;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="font-orbitron text-sm text-cyber-green uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <Component
          type={multiline ? undefined : type}
          className={`
            w-full px-4 py-3 font-tech text-base
            bg-cyber-green/5 border-2 text-gray-200
            outline-none transition-all duration-300
            placeholder:text-gray-500 placeholder:opacity-50
            focus:bg-cyber-green/10 focus:shadow-[0_0_20px_rgba(0,255,65,0.2)]
            ${
              hasError
                ? "border-cyber-red animate-shake focus:shadow-[0_0_20px_rgba(255,0,85,0.3)]"
                : "border-cyber-green focus:border-cyber-blue"
            }
            ${multiline ? "resize-y min-h-[100px]" : ""}
          `}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={multiline ? 4 : undefined}
        />

        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {piiWarning && (
        <div className="flex items-center gap-2 text-sm p-3 rounded bg-cyber-red/10 border border-cyber-red text-cyber-red animate-[slideUp_0.3s_ease]">
          <AlertTriangle size={20} className="flex-shrink-0 animate-pulse" />
          <span>Security Alert: Do not reveal personal info</span>
        </div>
      )}

      {error && !piiWarning && (
        <div className="text-cyber-red text-sm animate-[slideUp_0.3s_ease]">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
