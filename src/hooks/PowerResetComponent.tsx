import React from "react";
import { GrPowerReset } from "react-icons/gr";

const PowerResetComponent: React.FC<{
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  email: string;
}> = ({ setIsLoading, email }) => {
  const handleResetEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v2/auth/resend-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error); // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="power-reset">
      <span>If you did not get any email click</span>
      <GrPowerReset size={20} onClick={handleResetEmail} />
      <span>to reset.</span>
    </div>
  );
};

export default PowerResetComponent;
