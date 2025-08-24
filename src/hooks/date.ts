export const convertToISOString =(inputDate: string) =>{
		// Parse the input date string
		const dateParts = inputDate?.split('-');
		const year = parseInt(dateParts[0], 10);
		const month = parseInt(dateParts[1], 10) - 1; // Month is zero-based
		const day = parseInt(dateParts[2], 10);

		// Create a JavaScript Date object
		const dateObject = new Date(year, month, day);

		// Format the Date object to ISO string
		const isoDateString = dateObject.toISOString();

		return isoDateString;
	}