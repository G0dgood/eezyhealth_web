import { StreamClient } from '@stream-io/node-sdk';

const apiKey = '4g6sfwegs7he';
const secret = 'vng293q8xyem3xxt4s8bht87483bxytdudv53s7yzh8z42em3vnt4svqu9hcd6nr';
const client = new StreamClient(apiKey, secret);

async function checkCall() {
  const callId = 'test-call-id-with_underscores_123';
  
  try {
    const call = client.video.call("default", callId);
    await call.getOrCreate({
      data: {
        created_by_id: '123'
      }
    });
    console.log("SUCCESS creating call with underscores!");
  } catch (err) {
    console.error("FAILED validation:", err.message);
  }
}

checkCall();
