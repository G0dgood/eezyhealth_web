 "use client";
 
 import { useState } from "react";
 import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
 
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
   const [isMuted, setIsMuted] = useState(false);
   const [speakerOn, setSpeakerOn] = useState(true);
 
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
     <div className="h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-between py-20 px-6">
       <div className="text-center space-y-4">
         <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center text-5xl font-semibold shadow-xl">
           {name.charAt(0)}
         </div>
         <h2 className="text-3xl font-semibold">{name}</h2>
         <p className="text-gray-400 text-lg">
           {isConnected ? formatTime(duration) : "Calling..."}
         </p>
       </div>
 
       <div className="flex items-center gap-8 px-8 py-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
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
       </div>
     </div>
   );
 }
