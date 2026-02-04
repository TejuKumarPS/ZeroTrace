import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { validateNickname, validateBio } from "../utils/helpers";

const Onboarding = ({ onComplete, verifiedGender }) => {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [preference, setPreference] = useState("any");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    const nicknameValidation = validateNickname(nickname);
    const bioValidation = validateBio(bio);

    if (!nicknameValidation.valid || !bioValidation.valid) {
      setErrors({
        nickname: nicknameValidation.error,
        bio: bioValidation.error,
      });
      return;
    }

    // Clear errors and submit
    setErrors({});
    onComplete({ nickname, bio, preference });
  };

  const preferenceOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "any", label: "Any" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-orbitron text-4xl md:text-5xl uppercase text-cyber-green tracking-wider">
            Identity Forge
          </h2>
          <p className="text-gray-400 text-lg">Create your anonymous profile</p>
          {verifiedGender && (
            <div className="text-sm text-cyber-blue">
              Verified as:{" "}
              <span className="font-bold uppercase">{verifiedGender}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname Input */}
          <Input
            label="Codename"
            value={nickname}
            onChange={setNickname}
            maxLength={12}
            placeholder="Enter your alias..."
            checkPII={true}
            error={errors.nickname}
          />

          {/* Bio Input */}
          <Input
            label="Bio Signature"
            value={bio}
            onChange={setBio}
            maxLength={100}
            placeholder="Describe yourself anonymously..."
            checkPII={true}
            error={errors.bio}
            multiline
          />

          {/* Preference Selection */}
          <div className="space-y-3">
            <label className="font-orbitron text-sm text-cyber-green uppercase tracking-wider block">
              Looking For
            </label>
            <div className="grid grid-cols-3 gap-4">
              {preferenceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreference(option.value)}
                  className={`
                    px-6 py-4 font-orbitron uppercase tracking-wider border-2 transition-all duration-300
                    ${
                      preference === option.value
                        ? "bg-cyber-green text-bg-dark border-cyber-green shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                        : "bg-transparent text-gray-400 border-gray-600 hover:border-cyber-green hover:text-cyber-green"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 border border-cyber-yellow/30 bg-cyber-yellow/5 rounded">
            <div className="flex items-start gap-3">
              <div className="text-cyber-yellow text-2xl flex-shrink-0">⚠</div>
              <div className="text-sm text-gray-300">
                <div className="font-bold text-cyber-yellow mb-1">
                  Security Protocol
                </div>
                Do not include numbers, email addresses, or any personal
                identifiable information. Your safety depends on anonymity.
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" fullWidth>
            [ ENTER QUEUE ]
          </Button>
        </form>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700">
          All data is ephemeral. Your profile will be destroyed after
          disconnection.
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
