import { useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateNurseProxyTokenMutation, useCreateStreamTokenMutation } from '@/store/streamChatApi';
import { getStreamChatClient } from '@/lib/streamChat';

// The client is typically a singleton, but we can access it via getStreamChatClient
// or use the one passed to the hook if needed.

export const useNurseChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: userData } = useAuth(); // Assuming this is the logged-in nurse
  const [createNurseProxyToken] = useCreateNurseProxyTokenMutation();
  const [createStreamToken] = useCreateStreamTokenMutation();

  const connectAsPatient = async (patientId: string) => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    const chatClient = getStreamChatClient();

    try {
      // 1. Try to call the Cloud Function via RTK Query (Proxy Mode)
      const response = await createNurseProxyToken({ 
        targetPatientId: patientId,
        nurseId: userData.uid,
        email: userData.email || undefined
      }).unwrap();
      
      const { token, userId } = response;

      // 2. Disconnect any existing connection
      if (chatClient.userID) {
        await chatClient.disconnectUser();
      }

      // 3. Connect as the PATIENT (Proxy)
      await chatClient.connectUser(
        {
          id: userId,
          name: `Patient (via Nurse ${userData.displayName || userData.email})`, 
        },
        token
      );

      return { chatClient, token, userId, isProxy: true };
    } catch (err: any) {
      console.error("Nurse Proxy Connection Failed:", err);
      
      // FALLBACK: If proxy fails (e.g. permission error), connect as Nurse (Self)
      // This allows the UI to function even if the user lacks 'nurse' role
      const isPermissionError = 
        err?.message?.includes("Only nurses") || 
        err?.message?.includes("status: 400") ||
        err?.message?.includes("PERMISSION_DENIED") ||
        err?.code === "functions/permission-denied" ||
        err?.status === 400 || 
        err?.originalStatus === 400;

      if (isPermissionError) {
          console.warn("Nurse proxy failed (likely permission/role issue). Falling back to direct Nurse connection...");
          try {
             const tokenResponse = await createStreamToken({
                name: userData.displayName || "Nurse",
             }).unwrap();
             
             const nurseToken = tokenResponse.token;
             
             if (chatClient.userID) {
                await chatClient.disconnectUser();
             }

             await chatClient.connectUser(
                {
                    id: userData.uid,
                    name: userData.displayName || "Nurse",
                    role: 'nurse', // self
                },
                nurseToken
             );
             
             return { chatClient, token: nurseToken, userId: userData.uid, isProxy: false };
          } catch (fallbackErr) {
             console.error("Fallback connection also failed:", fallbackErr);
             throw fallbackErr;
          }
      }

      const errorMessage = err.error || err.message || "Failed to connect as patient";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    const chatClient = getStreamChatClient();
    await chatClient.disconnectUser();
  };

  return { connectAsPatient, disconnect, loading, error };
};
