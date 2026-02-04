const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const verifyUser = async (imageBlob) => {
  try{const formData = new FormData();
  formData.append("photo", imageBlob, "liveness-capture.jpg");

  const fingerprint = localStorage.getItem("fingerprint");
  if (fingerprint) formData.append("fingerprint", fingerprint);

  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return response.json();} catch (err) {
    console.error("Error in verifyUser:", err);
    throw err;
  }
};


export const containsPII = (text) => {
  // Check for numbers (0-9)
  if (/\d/.test(text)) {
    return true;
  }

  // Check for @ symbol (email indicator)
  if (text.includes("@")) {
    return true;
  }

  // Check for phone number patterns
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
    return true;
  }

  return false;
};

export const validateNickname = (nickname) => {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: "Nickname is required" };
  }

  if (nickname.length > 12) {
    return { valid: false, error: "Nickname must be 12 characters or less" };
  }

  if (containsPII(nickname)) {
    return {
      valid: false,
      error: "Security Alert: Do not reveal personal info",
    };
  }

  return { valid: true };
};

export const validateBio = (bio) => {
  if (!bio || bio.trim().length === 0) {
    return { valid: false, error: "Bio is required" };
  }

  if (bio.length > 100) {
    return { valid: false, error: "Bio must be 100 characters or less" };
  }

  if (containsPII(bio)) {
    return {
      valid: false,
      error: "Security Alert: Do not reveal personal info",
    };
  }

  return { valid: true };
};

export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateRandomNickname = () => {
  const adjectives = [
    "Neon",
    "Cyber",
    "Ghost",
    "Shadow",
    "Phantom",
    "Digital",
    "Binary",
    "Quantum",
  ];
  const nouns = [
    "Rider",
    "Walker",
    "Runner",
    "Hacker",
    "Agent",
    "Ninja",
    "Warrior",
    "Sentinel",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}`;
};
