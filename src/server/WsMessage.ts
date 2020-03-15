export interface WsMessage {
  type: string;
  payload?: any;
  client?: WebSocket;
  any?: any;
}
