"use client";

import { useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, FileText, Copy, Check } from "lucide-react";
import { useCallStateHooks, ParticipantView } from "@stream-io/video-react-sdk";

interface Props {
  name: string;
  isConnected: boolean;
  duration: number;
  onEnd: () => void;
  call: any;
}

export default function AudioCallScreen({
  name,
  isConnected,
  duration,
  onEnd,
  call,
}: Props) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [copied, setCopied] = useState(false);

  const toggleMute = async () => {
    if (!call) return;

    if (isMuted) {
      await call.microphone.enable();
    } else {
      await call.microphone.disable();
    }
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setSpeakerOn(!speakerOn);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-between py-12 px-6 rounded-2xl shadow-xl overflow-hidden relative">
      <div className="text-center space-y-4">
        <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center text-5xl font-semibold shadow-xl mx-auto">
          {name.charAt(0)}
        </div>
        <h2 className="text-3xl font-semibold">{name}</h2>
        <p className="text-gray-400 text-lg">
          {isConnected ? formatTime(duration) : "Calling..."}
        </p>
      </div>

      <div className="flex items-center gap-5 px-8 py-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl z-10">
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-white text-gray-900" : "bg-white/15 hover:bg-white/25 text-white"
          }`}
        >
          {isMuted ? <MicOff size={26} /> : <Mic size={26} />}
        </button>

        <button
          onClick={onEnd}
          title="End call"
          className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors text-white"
        >
          <PhoneOff size={32} />
        </button>

        <button
          onClick={toggleSpeaker}
          title={speakerOn ? "Speaker off" : "Speaker on"}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            speakerOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-white text-gray-900"
          }`}
        >
          {speakerOn ? <Volume2 size={26} /> : <VolumeX size={26} />}
        </button>

        <button
          onClick={() => setIsNotesModalOpen(true)}
          title="Take notes"
          className="w-16 h-16 rounded-full flex items-center justify-center transition-colors bg-white/15 hover:bg-white/25 text-white"
        >
          <FileText size={26} />
        </button>
      </div>

      {isNotesModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-blue-400" size={20} />
                Call Notes
              </h3>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write down important notes during the call..."
              className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none text-white placeholder-gray-500"
            />

            <div className="flex items-center justify-between gap-3 mt-2">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(noteText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (e) {
                    console.error("Failed to copy notes", e);
                  }
                }}
                disabled={!noteText.trim()}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm border border-white/10 ${
                  copied
                    ? "bg-green-600/20 text-green-400 border-green-500/30"
                    : "bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy to Clipboard
                  </>
                )}
              </button>

              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="py-2.5 px-6 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 transition-colors text-sm text-white"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden container to play participants' audio streams */}
      <div style={{ display: "none" }}>
        {participants.map((p) => (
          <ParticipantView participant={p} key={p.sessionId} />
        ))}
      </div>
    </div>
  );
}
