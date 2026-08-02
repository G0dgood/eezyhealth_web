import { StreamChat } from 'stream-chat';

export interface StreamChatInfo {
  chatApiKey: string;
  chatUserId: string;
  chatUserName: string;
  chatUserToken: string;
  userRole: string;
}

import { streamApiKey } from './config';

const STREAM_CHAT_API_KEY = streamApiKey || "";

let chatClient: StreamChat | null = null;

export const getStreamChatClient = () => {
  if (!chatClient) {
    chatClient = StreamChat.getInstance(STREAM_CHAT_API_KEY);
  }
  return chatClient;
};

export const connectStreamChatUser = async (
  userId: string,
  userName: string,
  userImage: string,
  userToken: string
) => {
  const client = getStreamChatClient();

  // If already connected as the same user, return client
  if (client.userID === userId) return client;
  
  // If connected as different user, disconnect first
  if (client.userID && client.userID !== userId) {
      await client.disconnectUser();
  }

  await client.connectUser(
    {
      id: userId,
      name: userName,
      image: userImage,
    },
    userToken
  );

  return client;
};

export const storeStreamChatInfo = (info: StreamChatInfo) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('streamChatInfo', JSON.stringify(info));
  }
};

export const getStreamChatInfo = (): StreamChatInfo | null => {
  if (typeof window !== 'undefined') {
    const info = localStorage.getItem('streamChatInfo');
    return info ? JSON.parse(info) : null;
  }
  return null;
};

export const disconnectStreamChatUser = async () => {
    const client = getStreamChatClient();
    await client.disconnectUser();
    if (typeof window !== 'undefined') {
        localStorage.removeItem('streamChatInfo');
    }
};
