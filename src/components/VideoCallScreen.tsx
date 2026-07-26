import React from 'react';
import { SpeakerLayout, CallControls } from "@stream-io/video-react-sdk";

interface VideoCallScreenProps {
 onLeave: () => void;
 patientName: string;
 callDuration: number;
 isWaitingForAcceptance: boolean;
 formatDuration: (seconds: number) => string;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
 onLeave,
 patientName,
 callDuration,
 isWaitingForAcceptance,
 formatDuration
}) => {
 return (
  <div className="flex flex-col h-full bg-gray-900 relative">
   {/* Header Overlay for Video */}
   <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
    <div className="text-white">
     <h2 className="text-xl font-bold">{patientName}</h2>
     <p className="text-[10px] md:text-[12px] opacity-80">
      {isWaitingForAcceptance ? "Calling..." : formatDuration(callDuration)}
     </p>
    </div>
   </div>

   <div className="flex-1 flex items-center justify-center">
    <SpeakerLayout participantsBarPosition="bottom" />
   </div>

   <div className="pb-8 flex justify-center w-full">
    <CallControls onLeave={onLeave} />
   </div>
  </div>
 );
};

export default VideoCallScreen;
