import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CountdownTimer = ({
  seconds,
  email,
}: {
  seconds: number;
  email: string;
}) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          router.push("/");
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, email, router]);

  return <div>You will be redirected to login in {timeLeft} seconds.</div>;
};

export default CountdownTimer;
