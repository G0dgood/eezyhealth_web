"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";

export default function DoctorCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = params.get("callId")!;
  const patientName = params.get("patientName") || "Patient";
  const isCaller = params.get("isCaller") === "true";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [waiting, setWaiting] = useState(isCaller);
  const [duration, setDuration] = useState(0);

  /* ----------------------------------
     INIT STREAM VIDEO CLIENT
  ---------------------------------- */
  useEffect(() => {
    if (!user) return;

    let videoClient: StreamVideoClient;

    const init = async () => {
      try {
        const response = await generateTokenForUser({ userId: user.uid }).unwrap();
        // Prefer videoToken if available, otherwise fallback to streamToken/token
        const token = response.videoToken || response.streamToken || response.token;
        const apiKey = response.apiKey || "4g6sfwegs7he";

        if (!apiKey) {
          throw new Error("API Key is missing");
        }

        videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.uid,
            name: user.displayName || "Doctor",
            image: user.photoURL || undefined,
          },
          token,
        });

        const streamCall = videoClient.call("default", callId);

        await streamCall.join({
          create: isCaller, //  only doctor creates if they are the caller
        });

        if (isCaller) {
          await streamCall.ring();
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
      videoClient?.disconnectUser();
    };
  }, [user, generateTokenForUser, callId, isCaller]);

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
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Connecting…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="relative h-screen bg-black">

            {/* VIDEO */}
            <SpeakerLayout participantsBarPosition="bottom" />

            {/* CONTROLS */}
            <div className="absolute bottom-6 w-full flex justify-center">
              <CallControls onLeave={() => call.endCall()} />
            </div>

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
                    onClick={() => call.endCall()}
                    className="mt-6 bg-red-600 px-6 py-3 rounded-full"
                  >
                    Cancel Call
                  </button>
                </div>
              </div>
            )}

            {/* TIMER */}
            {!waiting && (
              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white  text-[10px]  md:text-[12px]">
                {formatTime(duration)}
              </div>
            )}
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
