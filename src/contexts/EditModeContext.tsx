import { createContext } from "react";

export const EditModeContext = createContext<{
	isEditing: boolean;
	setIsEditing: (editing: boolean) => void;
}>({
	isEditing: false,
	setIsEditing: () => { },
});
