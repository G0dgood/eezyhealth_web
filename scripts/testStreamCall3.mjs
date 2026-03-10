import { StreamClient } from '@stream-io/node-sdk';

const apiKey = '4g6sfwegs7he';
const secret = 'vng293q8xyem3xxt4s8bht87483bxytdudv53s7yzh8z42em3vnt4svqu9hcd6nr';
const client = new StreamClient(apiKey, secret);

async function checkCall() {
  const channelId = "uQXhGmjUUAVjcyZDUxP8uE44tHx2-sGzfSmytI6Na00nMPPAeSbPCxgi1";
  const uniqueCallId = `${channelId}-video-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '');

  console.log("TESTING Call ID:", uniqueCallId);
  try {
    const call = client.video.call("default", uniqueCallId);
    await call.getOrCreate({
      data: {
        created_by_id: '123'
      }
    });
    console.log("SUCCESS creating call with ID length:", uniqueCallId.length);
  } catch (err) {
    console.error("FAILED validation:", err.message);
  }
}

checkCall();
