import React from 'react';
import { useCallStateHooks, CallControls } from "@stream-io/video-react-sdk";
import Image from 'next/image';

interface AudioCallScreenProps {
  onLeave: () => void;
}

const AudioCallScreen: React.FC<AudioCallScreenProps> = ({ onLeave }) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const remoteParticipant = participants.find(p => !p.isLocalParticipant);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white relative">
      <div className="z-10 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-full bg-gray-700 mb-6 overflow-hidden border-4 border-gray-600 shadow-xl relative">
          {remoteParticipant?.image ? (
            <Image 
              src={remoteParticipant.image} 
              alt={remoteParticipant.name || "Participant"} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl font-bold text-gray-400">
              {remoteParticipant?.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{remoteParticipant?.name || "Connected"}</h2>
        <p className="text-gray-400 text-lg mb-8">Audio Call</p>
        
        {/* Pulse Animation Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      </div>

      <div className="absolute bottom-10 w-full flex justify-center">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};

export default AudioCallScreen;
