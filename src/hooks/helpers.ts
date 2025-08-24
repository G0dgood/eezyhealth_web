const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

// Capitalize the first letter of the month
export const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

//generateRandomID
export const generateRandomID = (index: number): string => {
    return `${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;
};


	export const timeSlot = (message: { slot: string; }) => {
		if (!message || !message.slot) {
			return '';
		}

		const formattedItem = message.slot
			.replace('_', ' ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

		return formattedItem;
	};
