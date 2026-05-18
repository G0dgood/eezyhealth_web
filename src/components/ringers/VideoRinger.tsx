"use client";

import { Video, PhoneOff } from "lucide-react";
import Image from "next/image";

type Props = {
  callerName: string;
  callerImage?: string;
  onAccept: () => void;
  onReject: () => void;
};

export default function VideoRinger({
  callerName,
  callerImage,
  onAccept,
  onReject,
}: Props) {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-between py-20 z-[9999] text-white animate-in fade-in duration-300">
      <div className="flex flex-col items-center space-y-6 mt-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 shadow-2xl relative z-10">
            {callerImage ? (
              <Image
                src={callerImage}
                alt={callerName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                {callerName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping z-0 scale-150"></div>
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse z-0 scale-125 delay-75"></div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{callerName}</h2>
          <p className="text-lg text-gray-300 flex items-center justify-center gap-2">
            <Video size={18} />
            Incoming Video Call...
          </p>
        </div>
      </div>

      <div className="flex items-center gap-16 mb-10">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <PhoneOff size={28} />
          </button>
          <span className="text-sm font-medium text-gray-400">Decline</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 animate-bounce"
          >
            <Video size={28} />
          </button>
          <span className="text-sm font-medium text-gray-400">Accept</span>
        </div>
      </div>
    </div>
  );
}
