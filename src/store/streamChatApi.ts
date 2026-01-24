import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'; 
import { getFunctions, httpsCallable } from 'firebase/functions'; 

// Types for Stream Chat responses 
interface StreamTokenResponse { 
  token: string; 
  apiKey: string; 
  userId: string; 
} 

interface StreamTokenRequest { 
  name?: string; 
} 

interface GenerateTokenRequest { 
  userId: string; 
} 

interface GenerateTokenResponse { 
  streamToken: string; 
  token: string; 
  apiKey: string; 
  userId: string; 
  videoToken?: string; 
} 

interface AddMemberRequest {
  channelId: string;
  userId: string;
  type: string;
  doctorId?: string; // Optional doctor ID for authorization context
}

interface CreateNurseProxyTokenRequest {
  targetPatientId: string;
  nurseId?: string;
  email?: string;
}

interface CreateNurseProxyTokenResponse {
  token: string;
  userId: string;
  apiKey: string;
  videoToken?: string;
}

export const streamChatApi = createApi({ 
  reducerPath: 'streamChatApi', 
  baseQuery: fakeBaseQuery(), 
  keepUnusedDataFor: 60 * 60, 
  refetchOnMountOrArgChange: 30, 
  refetchOnReconnect: true, 
  refetchOnFocus: true, 
  tagTypes: ['StreamToken'], 
  endpoints: (builder) => ({ 
    // New secure callable function approach (Recommended) 
    createStreamToken: builder.mutation<StreamTokenResponse, StreamTokenRequest>({ 
      async queryFn({ name }, { signal }) { 
        try { 
          const functions = getFunctions(); 
          const createStreamToken = httpsCallable(functions, 'createStreamToken'); 
          
          const result = await createStreamToken({ name }); 
          const data = result.data as StreamTokenResponse; 
          
          return { data }; 
        } catch (error: any) { 
          return { 
            error: { 
              status: 'CUSTOM_ERROR' as const, 
              error: error.message || 'Failed to create Stream token' 
            } 
          }; 
        } 
      }, 
    }), 
    
    // Backward compatibility - HTTP function approach 
    generateTokenForUser: builder.mutation<GenerateTokenResponse, GenerateTokenRequest>({ 
      async queryFn({ userId }, { signal }) { 
        try { 
          const response = await fetch( 
            'https://us-central1-eezyhealth-2025.cloudfunctions.net/generateTokenForUser', 
            { 
              method: 'POST', 
              headers: { 
                'Content-Type': 'application/json', 
              }, 
              body: JSON.stringify({ userId }), 
              signal, 
            } 
          ); 
          
          if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`); 
          } 
          
          const data = await response.json() as GenerateTokenResponse; 
          return { data }; 
        } catch (error: any) { 
          return { 
            error: { 
              status: 'FETCH_ERROR' as const, 
              error: error.message || 'Failed to generate token' 
            } 
          }; 
        } 
      }, 
    }), 

    // Create nurse proxy token
    createNurseProxyToken: builder.mutation<CreateNurseProxyTokenResponse, CreateNurseProxyTokenRequest>({
      async queryFn({ targetPatientId, nurseId, email }, { signal }) {
        try {
          const functions = getFunctions();
          const createNurseProxyToken = httpsCallable(functions, 'createNurseProxyToken');
          
          const result = await createNurseProxyToken({ targetPatientId, nurseId, email });
          const data = result.data as CreateNurseProxyTokenResponse;
          
          return { data };
        } catch (error: any) {
          console.error("Callable createNurseProxyToken failed, trying HTTP fallback:", error);
          
          // Fallback to HTTP request
          try {
             const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
             const { auth } = await import('@/lib/firebase');
             const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
             
             // Try standard HTTP POST (onRequest style) first
             // This matches the pattern of generateTokenForUser
             const response = await fetch(
                'https://us-central1-eezyhealth-2025.cloudfunctions.net/createNurseProxyToken',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
                  },
                  body: JSON.stringify({ targetPatientId, nurseId, email }), 
                }
             );

             if (!response.ok) {
                 // If 400, it might be expecting "data" wrapper (onCall style)
                 if (response.status === 400) {
                     console.log("Standard HTTP failed with 400, trying onCall format...");
                     const retryResponse = await fetch(
                        'https://us-central1-eezyhealth-2025.cloudfunctions.net/createNurseProxyToken',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
                          },
                          body: JSON.stringify({ data: { targetPatientId, nurseId, email } }), 
                        }
                     );
                     
                     if (retryResponse.ok) {
                         const result = await retryResponse.json();
                         const data = result.result as CreateNurseProxyTokenResponse;
                         return { data };
                     }
                 }
                 
                 const errorText = await response.text();
                 throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
             }

             const result = await response.json();
             // Check if it's wrapped in "result" (onCall) or direct (onRequest)
             const data = (result.result || result) as CreateNurseProxyTokenResponse;
             return { data };

          } catch (httpError: any) {
             console.error("HTTP fallback failed:", httpError);
             return { 
                error: { 
                  status: 'CUSTOM_ERROR' as const, 
                  error: error.message || httpError.message || 'Failed to create nurse proxy token' 
                } 
              }; 
          }
        }
      },
    }),

    // Add member to channel (Requires backend implementation)
    addMemberToChannel: builder.mutation<void, AddMemberRequest>({
      async queryFn({ channelId, userId, type, doctorId }, { signal }) {
        try {
          const functions = getFunctions();
          const addMember = httpsCallable(functions, 'addMemberToChannel');
          
          await addMember({ channelId, userId, type, doctorId });
          
          return { data: undefined };
        } catch (error: any) {
          // Fallback to HTTP if callable fails (optional)
          try {
             const response = await fetch( 
                'https://us-central1-eezyhealth-2025.cloudfunctions.net/addMemberToChannel', 
                { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ channelId, userId, type, doctorId }), 
                  signal, 
                } 
              );
              if (response.ok) return { data: undefined };
          } catch (e) {}

          return { 
            error: { 
              status: 'CUSTOM_ERROR' as const, 
              error: error.message || 'Failed to add member to channel' 
            } 
          }; 
        }
      },
    }),
  }), 
}); 

export const { 
  useCreateStreamTokenMutation, 
  useGenerateTokenForUserMutation,
  useAddMemberToChannelMutation,
  useCreateNurseProxyTokenMutation
} = streamChatApi;
