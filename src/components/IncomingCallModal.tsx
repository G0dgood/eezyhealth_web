"use client";

import { Call } from "@stream-io/video-react-sdk";

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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[360px] text-center space-y-4 shadow-xl animate-in fade-in zoom-in duration-200">

        <h2 className="text-xl font-semibold">Incoming Call</h2>

        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-3xl">
          {call.state.createdBy?.name?.charAt(0) || "?"}
        </div>

        <p className="text-gray-600">
          Call from <b>{call.state.createdBy?.name || "Unknown"}</b>
        </p>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={onReject}
            className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
          >
            Reject
          </button>

          <button
            onClick={onAccept}
            className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
          >
            Accept
          </button>
        </div>

      </div>
    </div>
  );
}
