"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  Call,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import VideoCallScreen from "@/components/VideoCallScreen";
import { getVideoClient } from "@/lib/streamVideo";

import { notifyMissedCall } from "@/utils/notifications";

export default function DoctorVideoCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = params.get("callId")!;
  const patientName = params.get("patientName") || "Patient";
  const isCaller = params.get("isCaller") === "true";
  const patientId = params.get("patientId");

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [waiting, setWaiting] = useState(isCaller);
  const [duration, setDuration] = useState(0);
  const hasJoined = useRef(false);
  const hasRungRef = useRef(false);

  const handleCancelCall = async () => {
    if (call && patientId) {
      // 1. Explicitly stop camera/mic
      try {
        await call.camera.disable();
        await call.microphone.disable();
      } catch (e) {
        console.warn("Failed to disable devices", e);
      }

      // Notify missed call before ending only if call was not accepted yet
      if (waiting) {
        notifyMissedCall({
          calleeId: patientId,
          callerName: user?.displayName || "Doctor",
          callId,
          callType: 'video',
        }).catch(err => console.error("Failed to notify missed call", err));
      }
      await call.endCall();
    }
  };

  console.log('patientId---->', patientId)

  /* ----------------------------------
     INIT STREAM VIDEO CLIENT
  ---------------------------------- */
  useEffect(() => {
    if (!user) return;

    let videoClient: StreamVideoClient;

    const init = async () => {
      if (hasJoined.current) return;
      hasJoined.current = true;

      try {
        const response = await generateTokenForUser({ userId: user.uid }).unwrap();
        // Prefer videoToken if available, otherwise fallback to streamToken/token
        const token = response.videoToken || response.streamToken || response.token;
        const apiKey = response.apiKey || "4g6sfwegs7he";

        if (!apiKey) {
          throw new Error("API Key is missing");
        }

        videoClient = getVideoClient(
          apiKey,
          {
            id: user.uid,
            name: user.displayName || "Doctor",
            image: user.photoURL || undefined,
          },
          token
        );

        const streamCall = videoClient.call("default", callId);

        // 1. Join call as doctor
        const callData = {
          members: [{ user_id: user.uid }, { user_id: patientId! }],
          custom: {
            callType: 'video',
            callerName: user.displayName || "Doctor",
            callerImage: user.photoURL || "",
            callerId: user.uid
          }
        };

        await streamCall.join({
          create: true,
          data: callData
        });

        // 2. Ring ONLY ONCE
        if (!hasRungRef.current) {
          console.log("Attempting to ring patient:", patientId);
          await streamCall.ring();
          hasRungRef.current = true;
        }

        // Video mode: enable camera/mic
        try {
          await streamCall.camera.enable();
          await streamCall.microphone.enable();
        } catch (e) {
          console.warn("Could not enable camera/mic", e);
        }

        streamCall.on("call.accepted", () => setWaiting(false));
        streamCall.on("call.ended", () => router.push("/doctor/message"));

        setClient(videoClient);
        setCall(streamCall);
      } catch (err) {
        console.error(err);
        toast.error("Unable to start call");
        router.back();
      }
    };

    init();

    return () => {
      call?.leave();
      // Do not disconnect singleton client
    };
  }, [user, generateTokenForUser, callId, isCaller]);

  /* ----------------------------------
     AUTO-CANCEL TIMEOUT
  ---------------------------------- */
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (waiting) {
      timeout = setTimeout(() => {
        toast.info("No answer, call timed out.");
        handleCancelCall();
      }, 45000); // 45s timeout
    }
    return () => clearTimeout(timeout);
  }, [waiting, handleCancelCall]);

  /* ----------------------------------
     CALL DURATION TIMER
  ---------------------------------- */
  useEffect(() => {
    if (!call || waiting) return;

    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call, waiting]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center bg-black text-white "
        style={{ height: "90dvh" }}>
        Connecting…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="relative bg-black h-full"
            style={{ height: "90dvh" }}>

            <VideoCallScreen
              onLeave={handleCancelCall}
              patientName={patientName}
              callDuration={duration}
              isWaitingForAcceptance={waiting}
              formatDuration={formatTime}
            />

            {/* WAITING OVERLAY */}
            {waiting && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white z-50">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center text-3xl">
                    {patientName.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-semibold">
                    Calling {patientName}…
                  </h2>
                  <p className="opacity-60 animate-pulse mt-2">
                    Waiting for answer
                  </p>

                  <button
                    onClick={handleCancelCall}
                    className="mt-6 bg-red-600 px-6 py-3 rounded-full"
                  >
                    Cancel Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
