"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "../../../lib/api";

/* ---------- Helpers ---------- */

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hh = ((hours + 11) % 12) + 1;
  return `${hh}:${minutes} ${ampm}`;
}

function generateMeetLink() {
  return "https://meet.google.com/new";
}

function renderMessageWithLinks(text) {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-indigo-200 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

/* ---------- Component ---------- */

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

  /* ---------- Fetch current user ---------- */
  useEffect(() => {
    async function fetchMe() {
      try {
        const data = await apiGet("/api/auth/me/");
        setMe(data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    }
    fetchMe();
  }, []);

  /* ---------- Load chat history ---------- */
  useEffect(() => {
    if (!roomId) return;

    async function loadHistory() {
      try {
        const data = await apiGet(`/api/chat/${roomId}/messages/`);
        const mapped = data.map((m) => ({
          system: false,
          message: m.text,
          senderName: m.sender_name,
          createdAt: m.created_at,
        }));
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [roomId]);

  /* ---------- WebSocket ---------- */
  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    ws.onopen = () => setConnectionStatus("connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt:
              data.createdAt ||
              data.created_at ||
              (!data.system ? new Date().toISOString() : null),
          },
        ]);
      } catch (e) {
        console.error("Error parsing message", e);
      }
    };

    ws.onerror = () => setConnectionStatus("error");
    ws.onclose = () => setConnectionStatus("disconnected");

    setSocket(ws);
    return () => ws.close();
  }, [roomId]);

  /* ---------- Auto scroll ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- Send text ---------- */
  const handleSend = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !input.trim()) return;

    socket.send(
      JSON.stringify({
        message: input.trim(),
        senderName: me?.username || "User",
      })
    );

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------- Start Video ---------- */
  const handleStartVideoCall = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !me) return;

    const meetLink = generateMeetLink();

    socket.send(
      JSON.stringify({
        message: `📹 Video call link: ${meetLink}`,
        senderName: me.username,
      })
    );

    window.open(meetLink, "_blank");
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center">
      <div className="w-full max-w-2xl px-4 py-5 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
              {otherName[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-base font-semibold">
                Chat with {otherName}
              </h1>
              <span className="text-[10px] text-emerald-400">
                {connectionStatus}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/connections")}
            className="text-xs text-indigo-300 hover:underline"
          >
            Back to connections
          </button>
        </div>

        {/* Messages */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/70 h-96 mb-4 p-3 overflow-y-auto space-y-2">
          {loadingHistory && (
            <p className="text-xs text-slate-400">Loading messages…</p>
          )}

          {!loadingHistory && messages.length === 0 && (
            <p className="text-xs text-slate-400">No messages yet. Say hi 👋</p>
          )}

          {messages.map((msg, i) => {
            const isMe =
              me &&
              msg.senderName?.toLowerCase() === me.username.toLowerCase();

            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-800 text-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="text-[10px] opacity-70 mb-1">
                    {isMe ? "You" : msg.senderName}
                  </p>

                  {/* CLICKABLE LINKS HERE */}
                  <p>{renderMessageWithLinks(msg.message)}</p>

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

        {/* Input */}
        <div className="flex gap-2">
          <button
            onClick={handleStartVideoCall}
            disabled={!socket || !me}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:bg-slate-700"
          >
            📹 Video
          </button>

          <textarea
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />

          <button
            onClick={handleSend}
            disabled={!socket || !me}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:bg-slate-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
