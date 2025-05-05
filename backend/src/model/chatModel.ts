import { model, Schema } from "mongoose";
import { IChat } from "../interfaces/interfaces";

const ChatSchema: Schema<IChat> = new Schema<IChat>({

  userId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  chats: [{
    sender: {
      type: String
    },
    receiver: {
      type: String
    },
    message: {
      type: String
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "raw"]
    },
    date: {
      type: Date,
      default: new Date()
    }
  }]
},
  {
    timestamps: true
  }
);


const Chat = model<IChat>('chat', ChatSchema)
export default Chat

