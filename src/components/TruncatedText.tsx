import React from "react";

interface TruncatedTextProps {
  text?: string;
  limit?: number;
  className?: string;
  fallback?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ 
  text, 
  limit = 30, 
  className = "", 
  fallback = "" 
}) => {
  const content = text || fallback;
  
  const getTruncated = (str: string) => {
    if (!str) return "";
    const words = str.split(" ");
    if (words.length <= limit) return str;
    return words.slice(0, limit).join(" ") + "...";
  };

  return (
    <p className={className} title={content}>
      {getTruncated(content)}
    </p>
  );
};

export default TruncatedText;
