"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "../../../lib/api";

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hh = ((hours + 11) % 12) + 1; // 0–23 -> 1–12
  return `${hh}:${minutes} ${ampm}`;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [me, setMe] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);

  const otherName = searchParams.get("name") || "Your connection";

  // 1) Fetch current user from /api/auth/me/
  useEffect(() => {
    async function fetchMe() {
      try {
        const data = await apiGet("/api/auth/me/");
        setMe(data);
        console.log("Me:", data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    }
    fetchMe();
  }, []);

  // 2) Load chat history from REST API
  useEffect(() => {
    if (!roomId) return;

    async function loadHistory() {
      try {
        const data = await apiGet(`/api/chat/${roomId}/messages/`);
        const mapped = data.map((m) => ({
          system: false,
          message: m.text,
          senderName: m.sender_name,
          createdAt: m.created_at, // ISO string from backend
        }));
        console.log("History messages:", mapped);
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [roomId]);

  // 3) WebSocket connection for new messages
  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    ws.onopen = () => {
      console.log("WebSocket connected to room", roomId);
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("INCOMING:", data);

        // Normalize createdAt so every message has something usable
        const incoming = {
          ...data,
          createdAt:
            data.createdAt || // camelCase from consumer
            data.created_at || // just in case snake_case sneaks in
            (!data.system ? new Date().toISOString() : null), // fallback for non-system
        };

        setMessages((prev) => [...prev, incoming]);
      } catch (e) {
        console.error("Error parsing message", e);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnectionStatus("disconnected");
    };

    setSocket(ws);

    return () => ws.close();
  }, [roomId]);

  // 4) Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (!input.trim()) return;

    const payload = {
      message: input.trim(),
      senderName: me?.username || "User",
    };

    console.log("OUTGOING:", payload);
    socket.send(JSON.stringify(payload));
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Small helper to show a nice status pill
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return { text: "Connected", className: "bg-green-100 text-green-700" };
      case "connecting":
        return {
          text: "Connecting…",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "error":
      case "disconnected":
        return { text: "Disconnected", className: "bg-red-100 text-red-700" };
      default:
        return {
          text: "Connecting…",
          className: "bg-yellow-100 text-yellow-700",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-2xl px-4 py-6 flex flex-col">
        {/* Header with other user name + status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Chat with {otherName}
            </h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusInfo.className}`}
            >
              {statusInfo.text}
            </span>
          </div>
          <button
            onClick={() => router.push("/connections")}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to connections
          </button>
        </div>

        {/* messages */}
        <div className="border rounded-xl bg-white shadow-sm h-96 mb-4 p-3 overflow-y-auto space-y-2 flex flex-col">
          {loadingHistory && (
            <p className="text-sm text-slate-400">Loading messages…</p>
          )}

          {!loadingHistory && messages.length === 0 && (
            <p className="text-sm text-slate-400">
              No messages yet. Say hi 👋
            </p>
          )}

          {messages.map((msg, index) => {
            if (msg.system) {
              return (
                <div
                  key={index}
                  className="max-w-[80%] mx-auto px-3 py-2 rounded-lg text-xs bg-slate-100 text-slate-500 text-center"
                >
                  {msg.message}
                </div>
              );
            }

            const isMe =
              me &&
              msg.senderName &&
              msg.senderName.toLowerCase() === me.username.toLowerCase();

            return (
              <div
                key={index}
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm mb-1 ${
                  isMe
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-slate-200 text-slate-900 self-start mr-auto"
                }`}
              >
                <p className="text-[10px] opacity-70 mb-1">
                  {isMe ? "You" : msg.senderName || "Partner"}
                </p>
                <p>{msg.message}</p>
                {msg.createdAt && (
                  <p className="text-[10px] opacity-60 mt-1 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                )}
              </div>
            );
          })}

          {/* dummy div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>

        {/* input */}
        <div className="flex gap-2">
          <textarea
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300"
            disabled={
              !socket ||
              socket.readyState !== WebSocket.OPEN ||
              !me // wait until we know who the user is
            }
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
