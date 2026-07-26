"use client";

import { useEffect, useState } from "react";
import {
 StreamVideo,
 StreamCall,
 StreamVideoClient,
 Call,
 SpeakerLayout,
 CallControls,
 StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

type Props = {
 callId: string;
 userId: string;
 userName: string;
 token: string;
 apiKey: string;
 isCaller: boolean;
 client?: StreamVideoClient | null; // Optional: allow reusing client
};

export default function VideoCallPage({
 callId,
 userId,
 userName,
 token,
 apiKey,
 isCaller,
 client: propClient,
}: Props) {
 const [client, setClient] = useState<StreamVideoClient | null>(propClient || null);
 const [call, setCall] = useState<Call | null>(null);

 // Initialize Client if not provided
 useEffect(() => {
  if (propClient) {
   setClient(propClient);
   return;
  }

  const _client = new StreamVideoClient({
   apiKey,
   user: { id: userId, name: userName },
   token,
  });
  setClient(_client);

  return () => {
   _client.disconnectUser();
  };
 }, [apiKey, userId, userName, token, propClient]);

 // Join Call
 useEffect(() => {
  if (!client) return;

  const _call = client.call("default", callId);

  const joinCall = async () => {
   try {
    await _call.join({ create: isCaller });
    setCall(_call);
   } catch (error) {
    console.error("Error joining call:", error);
   }
  };

  joinCall();

  return () => {
   // Optional: leave call on unmount
   // _call.leave(); 
  };
 }, [client, callId, isCaller]);

 if (!client || !call) return <div className="text-center p-10">Joining call...</div>;

 return (
  <StreamVideo client={client}>
   <StreamCall call={call}>
    <StreamTheme>
     <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center relative">
       <SpeakerLayout participantsBarPosition="bottom" />
      </div>
      <div className="p-4 flex justify-center">
       <CallControls onLeave={() => window.location.reload()} />
       {/* Reload or callback to exit */}
      </div>
     </div>
    </StreamTheme>
   </StreamCall>
  </StreamVideo>
 );
}
