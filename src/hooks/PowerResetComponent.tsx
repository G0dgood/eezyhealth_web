import React from "react";
import { GrPowerReset } from "react-icons/gr";
import axios from "axios";

const PowerResetComponent: React.FC<{
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  email: string;
}> = ({ setIsLoading, email }) => {
  const handleResetEmail = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "/api/v2/auth/resend-email-verification",
        {
          email: email,
        }
      );
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
