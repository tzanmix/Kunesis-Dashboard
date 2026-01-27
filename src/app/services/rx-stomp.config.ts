import { RxStompConfig } from '@stomp/rx-stomp';

export const myRxStompConfig: RxStompConfig = {
  // Connection URL (Use ws:// for standard, wss:// for secure)
  // Note: SockJS fallback often uses http://.../ws-collar/websocket
  // TODO: must be replaced with environment variable in production
  brokerURL: 'ws://localhost:8080/ws-collar/websocket',

  // Headers (optional)
  connectHeaders: {},

  // Heartbeat (check connection every 20s)
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,

  // Auto-reconnect
  reconnectDelay: 200,
  debug: (msg: string) => {
    console.log(new Date(), msg);
  }
};