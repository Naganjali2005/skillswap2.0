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

        const incoming = {
          ...data,
          createdAt:
            data.createdAt ||
            data.created_at ||
            (!data.system ? new Date().toISOString() : null),
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

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          text: "Connected",
          className: "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
        };
      case "connecting":
        return {
          text: "Connecting…",
          className: "bg-yellow-900/60 text-yellow-300 border border-yellow-700",
        };
      case "error":
      case "disconnected":
        return {
          text: "Disconnected",
          className: "bg-red-900/60 text-red-300 border border-red-700",
        };
      default:
        return {
          text: "Connecting…",
          className: "bg-yellow-900/60 text-yellow-300 border border-yellow-700",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center">
      <div className="w-full max-w-2xl px-4 py-5 sm:py-7 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
              {otherName[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                Chat with {otherName}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${statusInfo.className}`}
              >
                {statusInfo.text}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/connections")}
            className="text-[11px] sm:text-xs text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
          >
            Back to connections
          </button>
        </div>

        {/* Messages box */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/70 h-96 mb-4 p-3 sm:p-4 overflow-y-auto flex flex-col space-y-2">
          {loadingHistory && (
            <p className="text-xs sm:text-sm text-slate-400">
              Loading messages…
            </p>
          )}

          {!loadingHistory && messages.length === 0 && (
            <p className="text-xs sm:text-sm text-slate-400">
              No messages yet. Say hi 👋
            </p>
          )}

          {messages.map((msg, index) => {
            if (msg.system) {
              return (
                <div
                  key={index}
                  className="max-w-[80%] mx-auto px-3 py-1.5 rounded-lg text-[11px] bg-slate-800/80 text-slate-300 text-center"
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
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs sm:text-sm mb-1 ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-800 text-slate-100 rounded-bl-sm"
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
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400"
            disabled={
              !socket ||
              socket.readyState !== WebSocket.OPEN ||
              !me
            }
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
