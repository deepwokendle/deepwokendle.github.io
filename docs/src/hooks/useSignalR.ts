import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getApiUrl, apiGetChatMessages } from '../services/api';
import { showToast } from '../utils/toast';

export interface ChatMessage {
  id?: string;
  user: string;
  message: string;
  isSystem?: boolean;
}

const HISTORY_PAGE = 10;

export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const sendQueueRef = useRef<{ user: string; message: string }[]>([]);
  const historyOffsetRef = useRef(0);
  const hasMoreRef = useRef(true);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const flushQueue = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    while (
      sendQueueRef.current.length > 0 &&
      conn.state === signalR.HubConnectionState.Connected
    ) {
      const item = sendQueueRef.current.shift()!;
      try {
        await conn.invoke('SendMessage', item.user, item.message);
      } catch {
        sendQueueRef.current.unshift(item);
        break;
      }
    }
  }, []);

  const loadOlderMessages = useCallback(async (): Promise<boolean> => {
    if (!hasMoreRef.current) return false;
    try {
      const res = await apiGetChatMessages(historyOffsetRef.current, HISTORY_PAGE);
      if (!res.ok) return false;
      const data: { externalId: string; username: string; message: string }[] = await res.json();
      if (data.length < HISTORY_PAGE) {
        hasMoreRef.current = false;
        setHasMoreHistory(false);
      }
      if (data.length === 0) return false;
      historyOffsetRef.current += data.length;
      const historyMsgs: ChatMessage[] = data.map(m => ({
        id: m.externalId,
        user: m.username,
        message: m.message,
      }));
      setMessages(prev => {
        const existingIds = new Set(prev.filter(m => m.id).map(m => m.id!));
        const newMsgs = historyMsgs.filter(m => !existingIds.has(m.id!));
        return [...newMsgs, ...prev];
      });
      return data.length > 0;
    } catch {
      return false;
    }
  }, []);

  // Load initial history on mount
  useEffect(() => {
    loadOlderMessages();
  }, []);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(getApiUrl() + '/chatHub', {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (id: string, user: string, message: string) => {
      addMessage({ id, user, message });
    });
    conn.on('ReceiveSystemMessage', (message: string) => {
      addMessage({ user: 'System', message, isSystem: true });
    });
    conn.on('RateLimited', (reason: string) => {
      showToast.error(reason);
    });
    conn.on('Unauthorized', (reason: string) => {
      showToast.error(reason);
    });
    conn.onclose(() => setIsConnected(false));
    conn.onreconnecting(() => setIsConnected(false));
    conn.onreconnected(() => { setIsConnected(true); flushQueue(); });

    connectionRef.current = conn;
    conn.start()
      .then(() => { setIsConnected(true); flushQueue(); })
      .catch(() => {});

    return () => { conn.stop(); };
  }, [addMessage, flushQueue]);

  const sendMessage = useCallback(async (message: string) => {
    const username = localStorage.getItem('username');
    if (!username) throw new Error('Not logged in');

    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      sendQueueRef.current.push({ user: username, message });
      try {
        if (conn) await conn.start();
        await flushQueue();
      } catch {
        console.warn("Couldn't connect, message queued");
      }
    } else {
      await conn.invoke('SendMessage', username, message);
    }
  }, [flushQueue]);

  return { messages, sendMessage, isConnected, loadOlderMessages, hasMoreHistory };
}
