import { useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateNurseProxyTokenMutation } from '@/store/streamChatApi';
import { getStreamChatClient } from '@/lib/streamChat';

// The client is typically a singleton, but we can access it via getStreamChatClient
// or use the one passed to the hook if needed.

export const useNurseChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: userData } = useAuth(); // Assuming this is the logged-in nurse
  const [createNurseProxyToken] = useCreateNurseProxyTokenMutation();

  const connectAsPatient = async (patientId: string) => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    const chatClient = getStreamChatClient();

    try {
      // 1. Call the Cloud Function via RTK Query
      const response = await createNurseProxyToken({ 
        targetPatientId: patientId,
        nurseId: userData.uid,
        email: userData.email || undefined
      }).unwrap();
      
      const { token, userId } = response;

      // 2. Disconnect any existing connection (important!)
      if (chatClient.userID) {
        await chatClient.disconnectUser();
      }

      // 3. Connect as the PATIENT
      // Note: We use the patient's ID returned from the server
      await chatClient.connectUser(
        {
          id: userId,
          name: `Patient (via Nurse ${userData.displayName || userData.email})`, // Indicate it's a proxy
          // You can pass other patient details here if you have them
        },
        token
      );

      return { chatClient, token, userId };
    } catch (err: any) {
      console.error("Nurse Proxy Connection Failed:", err);
      // Handle RTK Query error object structure
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
