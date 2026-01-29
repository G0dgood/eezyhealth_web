import { StreamVideoClient } from "@stream-io/video-react-sdk";

let videoClient: StreamVideoClient | null = null;

export const getVideoClient = (
  apiKey: string,
  user: { id: string; name?: string; image?: string },
  token: string
) => {
  if (!videoClient) {
    videoClient = new StreamVideoClient({
      apiKey,
      user,
      token,
    });
  }
  return videoClient;
};

export const resetVideoClient = async () => {
  if (videoClient) {
    await videoClient.disconnectUser();
    videoClient = null;
  }
};
