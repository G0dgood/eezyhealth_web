import { api } from "./baseApi";

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== DOCUMENT & UPLOAD MANAGEMENT =====
    getUploads: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

          const uploadsData = await createFirebaseQuery("uploads");

          // If no uploads found, try other possible collection names
          if (!uploadsData || uploadsData.length === 0) {
            const possibleCollections = [
              "Uploads",
              "documents",
              "Documents",
              "certifications",
              "Certifications",
            ];

            for (const collectionName of possibleCollections) {
              try {
                const data = await createFirebaseQuery(collectionName);

                if (data && data.length > 0) {
                  return { data: { uploads: data } };
                }
              } catch {
                // ignore and try next
              }
            }
          }

          return { data: { uploads: uploadsData || [] } };
        } catch (error) {
          console.error("Error fetching Firebase uploads:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Upload"],
    }),

    updateUploadStatus: builder.mutation({
      async queryFn({
        uploadId,
        doctorId,
        name,
        downloadUrl,
        status,
        comment,
        reviewedBy,
      }) {
        try {
          const {
            doc,
            updateDoc,
            collection,
            query,
            where,
            getDocs,
          } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

           
          // First, find the parent document in uploads collection that contains this document
          const uploadsRef = collection(db, "uploads");
          const q = query(uploadsRef, where("doctorId", "==", doctorId));

          const querySnapshot = await getDocs(q);

            
          if (querySnapshot.empty) {
            return {
              error: {
                status: "NOT_FOUND",
                error:
                  "No upload documents found for this doctor in database.",
              },
            };
          }

          // Find the correct parent document and update the specific document in the documents array
          let updated = false;
          const matchAttempts: Array<{
            docId: string;
            url: string;
            fileName: string;
            match: { id: boolean; url: boolean; name: boolean };
          }> = [];

          let uploadDocToUpdate = null;
          let finalDocIndex = -1;

          for (const uploadDoc of querySnapshot.docs) {
            const uploadData = uploadDoc.data();

            if (uploadData.documents && Array.isArray(uploadData.documents)) {
               

              // Find the document in the documents array
              // Prioritize exact ID match first, then URL, then filename
              const docIndex = uploadData.documents.findIndex(
                (docItem: any) => {
                  const idMatch = docItem.id === uploadId;
                  const urlMatch = docItem.downloadUrl === downloadUrl;
                  const nameMatch =
                    docItem.fileName === name || docItem.name === name;

                   

                  matchAttempts.push({
                    docId: docItem.id,
                    url: docItem.downloadUrl,
                    fileName: docItem.fileName || docItem.name,
                    match: { id: idMatch, url: urlMatch, name: nameMatch },
                  });

                  // Prioritize ID match first (most reliable)
                  if (idMatch) {
                   
                    return true;
                  }
                  // Then try URL match if ID doesn't match
                  if (urlMatch) { 
                    return true;
                  }
                  // Finally try filename match
                  if (nameMatch) { 
                    return true;
                  }
                  return false;
                }
              );

              if (docIndex !== -1) {
                uploadDocToUpdate = uploadDoc;
                finalDocIndex = docIndex;
                 
                break; // Exit the loop once we found the document
              }
            }
          }

          if (uploadDocToUpdate && finalDocIndex !== -1) {
            const uploadData = uploadDocToUpdate.data();
             

            // Update the specific document in the array
            const updatedDocuments = [...uploadData.documents];
             

            // Preserve all existing fields and only update what's needed
            const currentDoc = updatedDocuments[finalDocIndex];
            updatedDocuments[finalDocIndex] = {
              ...currentDoc,
              status: status,
              comment: comment?.trim() || currentDoc.comment || "",
              reviewedBy: reviewedBy || currentDoc.reviewedBy,
              reviewedAt: new Date().toISOString(),
            };

            
            await updateDoc(doc(db, "uploads", uploadDocToUpdate.id), {
              documents: updatedDocuments,
            });

            
            updated = true;
          }

          if (!updated) {  

            return {
              error: {
                status: "NOT_FOUND",
                error:
                  "Document not found in database. It may have been deleted.",
              },
            };
          }

          return {
            data: {
              success: true,
              message: `Document ${status} successfully.`,
            },
          };
        } catch (error: any) {
          console.error("Error updating document status:", error);
          console.error("Error details:", {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
            fullError: error,
          });

          return {
            error: {
              status: error?.code || "CUSTOM_ERROR",
              error: error?.message || "Failed to update document",
            },
          };
        }
      },
      invalidatesTags: ["Upload"],
    }),
  }),
});

export const {
  useGetUploadsQuery,
  useUpdateUploadStatusMutation,
} = uploadApi;


