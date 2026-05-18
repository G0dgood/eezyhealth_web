"use client";

import { Call } from "@stream-io/video-react-sdk";
import AudioRinger from "./ringers/AudioRinger";
import VideoRinger from "./ringers/VideoRinger";

type Props = {
  call: Call;
  onAccept: () => void;
  onReject: () => void;
};

export default function IncomingCallModal({
  call,
  onAccept,
  onReject,
}: Props) {
  const custom = call.state.custom;
  const createdBy = call.state.createdBy;

  console.log("INCOMING CALL MODAL -> custom:", custom);
  console.log("INCOMING CALL MODAL -> createdBy:", createdBy);

  // Stream's backend sometimes strips custom data on ringing events.
  // Furthermore, if a channel was previously used for audio, the cache may still say "audio".
  // Since we construct the call ID like "channelId-callType-timestamp", its embedded type is the most accurate.
  const isVideoFromString = call.id.includes('-video-');
  const isAudioFromString = call.id.includes('-audio-');

  const callType = isVideoFromString ? "video" : isAudioFromString ? "audio" : custom?.callType;

  // Also provide a fallback for caller name since the ID/custom might be missing it
  const callerName = custom?.callerName || createdBy?.name || "Unknown Caller";
  const callerImage = custom?.callerImage || createdBy?.image;

  if (callType === "video") {
    return (
      <VideoRinger
        callerName={callerName}
        callerImage={callerImage}
        onAccept={onAccept}
        onReject={onReject}
      />
    );
  }

  return (
    <AudioRinger
      callerName={callerName}
      callerImage={callerImage}
      onAccept={onAccept}
      onReject={onReject}
    />
  );
}
