import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CountdownTimer = ({ seconds, email }: { seconds: number, email: any }) => {
	const navigate = useNavigate();
	const [timeLeft, setTimeLeft] = useState(seconds);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prevTime) => {
				if (prevTime === 0) {
					navigate("/");
					return 0;
				} else {
					return prevTime - 1;
				}
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [seconds, email, navigate]);

	return (
		<div>
			You will be redirected to login in {timeLeft} seconds.
		</div>
	);
};

export default CountdownTimer;
