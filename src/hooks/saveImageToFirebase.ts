import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from "@/lib/firebase"; 
 

 export const saveImageToFirebase = async (imageUri: string, handleUpdate: (photoUrl: string) => void) => {
  if (!imageUri) return;

  const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
  const imageRef = ref(storage, `images/${fileName}`);

  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    await uploadBytes(imageRef, blob);
    const downloadUrl = await getDownloadURL(imageRef);

    // After successfully uploading, call handleUpdate with the new photoUrl
    handleUpdate(downloadUrl);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error uploading image:', error.message);
    } else {
      console.error('Error uploading image:', error);
    }
    // Handle the error as needed, e.g., show a toast
  }
};
