// SocketProvider is a context provider that wraps the entire application and provides the socket instance to all components.
// uses socket.io

import React, {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import ENV_PUBLIC from "../ENV_PUBLIC";

export const SocketContext = createContext<{
  socketRef: MutableRefObject<Socket | null>;
  connect: () => void;
  disconnect: () => void;
  connected: boolean;
  notification: string[];
  users: string[];
} | null>(null);

export const useSocket = () => {
  return useContext(SocketContext)!;
};

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notification, setNotification] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setConnected(false);
      socketRef.current = null;
    }
  };
  const connect = () => {
    if (socketRef.current) {
      return;
    }
    socketRef.current = io(ENV_PUBLIC.NEXT_PUBLIC_SOCKET_URL);
    socketRef.current.connect();

    socketRef.current.on("connect", () => {
      setConnected(true);
    });
    socketRef.current.on("notification", (data: string) => {
      setNotification((prevNotifications) => [...prevNotifications, data]);
    });
    socketRef.current.on("users", (data: string[]) => {
      setUsers(data);
    });
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setConnected(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socketRef: socketRef,
        disconnect,
        connect,
        connected,
        notification,
        users,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
