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
 
       <div className="flex items-center gap-10">
         <button
           onClick={toggleMute}
           className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
             isMuted ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
           }`}
         >
           {isMuted ? <MicOff size={26} /> : <Mic size={26} />}
         </button>
 
         <button
           onClick={onEnd}
           className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl hover:bg-red-700 transition"
         >
           <PhoneOff size={32} />
         </button>
 
         <button
           onClick={toggleSpeaker}
           className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
             speakerOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500"
           }`}
         >
           {speakerOn ? <Volume2 size={26} /> : <VolumeX size={26} />}
         </button>
       </div>
     </div>
   );
 }
