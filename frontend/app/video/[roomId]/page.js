"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

export default function VideoCallPage() {
  const params = useParams();
  const roomId = params?.roomId;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const wsRef = useRef(null);

  function sendSignal(type, payload) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS not ready, skipping", type);
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type,
        payload,
        sender: "frontend",
      })
    );
  }

  async function initMediaAndPeer() {
    try {
      console.log("Requesting camera + mic...");
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Got local stream");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        console.log("Received remote track");
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate");
          sendSignal("ice", event.candidate);
        }
      };

      peerConnectionRef.current = pc;

      const isOfferer = Math.random() > 0.5;
      console.log("Is offerer:", isOfferer);

      if (isOfferer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("Sending offer");
        sendSignal("offer", offer);
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert(
        "Unable to access camera/mic. Please allow permissions and reload the page."
      );
    }
  }

  useEffect(() => {
  if (!roomId) return;

  const wsUrl = "ws://127.0.0.1:8000/ws/video/" + roomId + "/";
  console.log("Connecting WebSocket:", wsUrl);

  const ws = new WebSocket(wsUrl);
  wsRef.current = ws;

  ws.onopen = () => {
    console.log("WebSocket connected");
    initMediaAndPeer();
  };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const { type, payload } = message;
      console.log("Signal received:", type);

      const pc = peerConnectionRef.current;
      if (!pc) {
        console.warn("No peerConnection yet");
        return;
      }

      if (type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Sending answer");
        sendSignal("answer", answer);
      } else if (type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      } else if (type === "ice") {
        try {
          await pc.addIceCandidate(payload);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-slate-950 text-white">
      <h1 className="text-2xl font-semibold">
        Video Room: <span className="font-mono">{roomId}</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-slate-300">You</span>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-2xl border border-slate-700"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-slate-300">Peer</span>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-2xl border border-slate-700"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Share this link with the other person. When both are here, the call
        connects automatically.
      </p>
    </div>
  );
}
