import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

const Modal = ({ isOpen, onClose, title, message, type = "info" }) => {
  const typeStyles = {
    info: "border-cyber-blue text-cyber-blue",
    error: "border-cyber-red text-cyber-red",
    success: "border-cyber-green text-cyber-green",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`
              relative max-w-md w-full p-8 
              bg-bg-darker border-2 ${typeStyles[type]}
              shadow-[0_0_30px_rgba(0,255,65,0.3)]
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-cyber-green transition-colors"
            >
              <X size={24} />
            </button>

            {/* Title */}
            <h2
              className={`font-orbitron text-2xl uppercase tracking-wider mb-4 ${typeStyles[type]}`}
            >
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>

            {/* Action Button */}
            <Button
              onClick={onClose}
              variant={
                type === "error"
                  ? "danger"
                  : type === "success"
                    ? "primary"
                    : "secondary"
              }
              fullWidth
            >
              Understood
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
