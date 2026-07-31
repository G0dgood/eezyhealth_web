"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import { getVideoClient } from "@/lib/streamVideo";

export default function NurseAudioCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = searchParams.get("callId") || "";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const hasJoined = useRef(false);
  const unsubscribeEndedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user || !callId || hasJoined.current) return;
    hasJoined.current = true;

    const init = async () => {
      const tokenResponse = await generateTokenForUser({ userId: user.uid }).unwrap();
      const token = tokenResponse.videoToken || tokenResponse.streamToken || tokenResponse.token;
      const apiKey = tokenResponse.apiKey || process.env.NEXT_PUBLIC_STREAM_API_KEY!;

      const videoClient = getVideoClient(
        apiKey,
        { id: user.uid, name: user.displayName || "Nurse", image: user.photoURL || undefined },
        token
      );

      const streamCall = videoClient.call("default", callId);

      // Ensure we join the call properly with members before trying to accept
      const patientId = searchParams.get("patientId") || "";
      const callData: any = {};

      if (patientId && user.uid) {
        callData.members = [{ user_id: user.uid }, { user_id: patientId }];
      }

      try {
        await streamCall.join({ create: true, data: callData });

        // Only accept if we are responding to an incoming call
        if (searchParams.get("isAccepting") === "true") {
          await streamCall.accept();
        }

        await streamCall.microphone.enable();
        await streamCall.camera.disable();

        unsubscribeEndedRef.current = streamCall.on("call.ended", () => {
          router.push("/nurse/message");
        });
      } catch (e) {
        console.error("Error joining audio call as nurse:", e);
      }

      setClient(videoClient);
      setCall(streamCall);
    };

    init();

    return () => {
      if (unsubscribeEndedRef.current) {
        unsubscribeEndedRef.current();
      }
    };
  }, [user, callId, generateTokenForUser]);

  const handleEnd = async () => {
    if (call) {
      try {
        await call.endCall();
      } catch (e) {
        // ignore
      }
    }
    router.push("/nurse/message");
  };

  if (!client || !call) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <h2>Connecting...</h2>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-8">Audio Call Connected</h2>
            <button
              onClick={handleEnd}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              End Call
            </button>
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
