import { StreamClient } from '@stream-io/node-sdk';

const apiKey = '4g6sfwegs7he';
const secret = 'vng293q8xyem3xxt4s8bht87483bxytdudv53s7yzh8z42em3vnt4svqu9hcd6nr';
const client = new StreamClient(apiKey, secret);

async function checkCall() {
  const callId = 'uQXhGmjUUAVjcyZDUxP8uE44tHx2-sGzfSmytI6Na00nMPPAeSbPCxgi1_audio_1741604085427';
  
  try {
    const response = await client.video.queryCalls({
      filter_conditions: { id: callId }
    });
    console.log(JSON.stringify(response.calls[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkCall();
