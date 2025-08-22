

const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-800";
      case "Chat":
        return "bg-orange-100 text-orange-800";
      case "Call":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
};
		


export { getTypeColor };