import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const updateUploadCertification = async (doctorId?: string) => {
  try {
    const uploadsCollectionRef = collection(db, "uploads");

    // Add condition for filtering by doctorId if provided
    const q = doctorId
      ? query(uploadsCollectionRef, where("doctorId", "==", doctorId))
      : uploadsCollectionRef;

    const snapshot = await getDocs(q);
    const uploadsData = snapshot.docs.map((doc) => doc.data());
    return uploadsData;
  } catch (error) {
    console.error("Error fetching uploads collection:", error);
    throw error;
  }
};
