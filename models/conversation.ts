export interface IConversation {
  users: string[];
  group?: {
    admins: string[];
    groupName: null | string;
    groupImage: null | string;
  };

  seen: {
    [key: string]: string;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
  theme: string;
}

export interface IMessage {
  id?: string;
  sender: string;
  content: string;
  replyTo?: string;
  file?: {
    name: string;
    size: number;
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  type: "text" | "image" | "file" | "sticker" | "removed";
  reactions: {
    [key: string]: number;
  };
}


export interface IStickerCollection {
  name: string;
  thumbnail: string;
  icon: string;
  id: string;
  stickers: {
    id: string;
    spriteURL: string;
  }[];
}

export type IStickerCollections = IStickerCollection[];