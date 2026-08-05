import React, { useState } from 'react';
import {
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, PhoneOff, FileText, Copy, Check } from "lucide-react";

interface VideoCallScreenProps {
  onLeave: () => void;
  patientName: string;
  callDuration: number;
  isWaitingForAcceptance: boolean;
  formatDuration: (seconds: number) => string;
}

// Liquid-glass control bar wired to the Stream call so the buttons actually work.
const GlassCallControls: React.FC<{ onLeave: () => void; onToggleNotes: () => void }> = ({
  onLeave,
  onToggleNotes,
}) => {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const micState = useMicrophoneState() as any;
  const camState = useCameraState() as any;
  const micMuted = micState?.isMute ?? micState?.status !== "enabled";
  const camOff = camState?.isMute ?? camState?.status !== "enabled";

  const baseBtn =
    "w-14 h-14 rounded-full flex items-center justify-center transition-colors";
  const onStyle = "bg-white/15 hover:bg-white/25 text-white";
  const offStyle = "bg-white text-gray-900 hover:bg-white/90";

  return (
    <div className="flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl z-10">
      <button
        onClick={() => call?.microphone.toggle()}
        className={`${baseBtn} ${micMuted ? offStyle : onStyle}`}
        title={micMuted ? "Unmute" : "Mute"}
      >
        {micMuted ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <button
        onClick={() => call?.camera.toggle()}
        className={`${baseBtn} ${camOff ? offStyle : onStyle}`}
        title={camOff ? "Turn camera on" : "Turn camera off"}
      >
        {camOff ? <VideoOff size={22} /> : <Video size={22} />}
      </button>

      <button
        onClick={onToggleNotes}
        className={`${baseBtn} ${onStyle}`}
        title="Take notes"
      >
        <FileText size={22} />
      </button>

      <button
        onClick={onLeave}
        className={`${baseBtn} bg-red-500 hover:bg-red-600 text-white`}
        title="End call"
      >
        <PhoneOff size={22} />
      </button>
    </div>
  );
};

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  onLeave,
  patientName,
  callDuration,
  isWaitingForAcceptance,
  formatDuration,
}) => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-900 relative rounded-2xl overflow-hidden shadow-xl">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <h2 className="text-xl font-bold">{patientName}</h2>
          <p className="text-[10px] md:text-[12px] opacity-80">
            {isWaitingForAcceptance ? "Calling…" : formatDuration(callDuration)}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* Liquid-glass controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center w-full z-10">
        <GlassCallControls onLeave={onLeave} onToggleNotes={() => setIsNotesModalOpen(true)} />
      </div>

      {/* Notes Modal Overlay */}
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
    </div>
  );
};

export default VideoCallScreen;
