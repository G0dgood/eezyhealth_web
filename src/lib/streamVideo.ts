import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

const STREAM_API_KEY = "4g6sfwegs7he";

let videoClient: StreamVideoClient | null = null;

export const getStreamVideoClient = () => {
  return videoClient;
};

export const connectStreamVideoUser = (
  userId: string,
  userName: string,
  userImage: string,
  userToken: string
) => {
  // Check if client is already connected with the same user
  const currentUser = (videoClient as any)?.state?.currentUser || (videoClient as any)?.user;
  
  if (videoClient && currentUser?.id === userId) {
    return videoClient;
  }

  if (videoClient) {
    videoClient.disconnectUser();
  }

  const user: User = {
    id: userId,
    name: userName,
    image: userImage,
  };

  videoClient = new StreamVideoClient({ apiKey: STREAM_API_KEY, user, token: userToken });
  return videoClient;
};

export const disconnectStreamVideoUser = async () => {
  if (videoClient) {
    await videoClient.disconnectUser();
    videoClient = null;
  }
};
