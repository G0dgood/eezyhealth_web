export const notifyMissedCall = async (params: {
  calleeId: string;
  callerName: string;
  callId: string;
  callType: string;
}) => {
  try {
    const response = await fetch('/api/calls/notify-missed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error('Failed to notify missed call');
    }
  } catch (error) {
    console.error('Error notifying missed call:', error);
  }
};
