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
  onToggleNotes?: () => void;
}

// Liquid-glass control bar wired to the Stream call so the buttons actually work.
const GlassCallControls: React.FC<{ onLeave: () => void; onToggleNotes?: () => void }> = ({
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

      {onToggleNotes && (
        <button
          onClick={onToggleNotes}
          className={`${baseBtn} ${onStyle}`}
          title="Take notes"
        >
          <FileText size={22} />
        </button>
      )}

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
  onToggleNotes,
}) => {
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
        <GlassCallControls onLeave={onLeave} onToggleNotes={onToggleNotes} />
      </div>
    </div>
  );
};

export default VideoCallScreen;
