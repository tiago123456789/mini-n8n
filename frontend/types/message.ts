export type SenderTypes = "user" | "assistant";

interface Message {
  id: string;
  content: string;
  sender: SenderTypes;
  timestamp: Date;
}

export default Message;
