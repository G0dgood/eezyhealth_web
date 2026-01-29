import Image from "next/image";
import { UserCircle, Camera, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "sonner";

interface ProfilePictureSectionProps {
  profileImage: string | null | undefined;
  onImageChange: (url: string) => void;
  // Optional custom classes to support the slight variations, defaulting to the Admin style
  buttonClassName?: string;
  textClassName?: string;
}

export default function ProfilePictureSection({
  profileImage,
  onImageChange,
  buttonClassName = "bg-[#22c55e] hover:bg-[#16a34a]",
  textClassName = "text-[#22c55e]",
}: ProfilePictureSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const isValidImageUrl = (url: string | null | undefined) => {
    if (
      !url ||
      url === "/api/placeholder/120/120" ||
      url.includes("placeholder")
    )
      return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a temporary ID for the filename
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const filename = `image-uploads/${tempId}.jpg`;
      const storageRef = ref(storage, filename);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Pass the URL back to the parent
      onImageChange(downloadURL);
      toast.success("Image uploaded successfully");
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be selected again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="text-center">
      <div className="relative inline-block">
        {isUploading ? (
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : profileImage && isValidImageUrl(profileImage) ? (
          <Image
            src={profileImage}
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            <UserCircle className="w-24 h-24 text-gray-400" />
          </div>
        )}
        <label
          className={`absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer transition-colors ${buttonClassName} ${isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <Camera className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      <p className={`font-medium mt-2 cursor-pointer ${textClassName}`}>
        {isUploading ? "Uploading..." : "Update"}
      </p>
    </div>
  );
}
