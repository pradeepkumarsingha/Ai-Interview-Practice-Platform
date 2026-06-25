import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Camera, CameraOff, Mic, MicOff, MonitorUp, PhoneOff } from 'lucide-react';

import DashboardShell from '../components/DashboardShell';
import CodeEditor from '../components/interview/CodeEditor';
import axios from '../api/axiosInstance';

const PEER_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

const InterviewRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);
  
  const myVideo = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef(null);
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:8000';
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const candidate = roomDetails?.candidate;
  const isCandidate = candidate?._id && candidate._id === currentUser?._id;
  const isAdmin = currentUser?.role === "admin";
  const localLabel = isCandidate ? "You (Candidate)" : isAdmin ? "You (Interviewer)" : "You";
  const remoteLabel = isCandidate
    ? "Interviewer"
    : candidate?.name
      ? `${candidate.name} (Candidate)`
      : "Candidate";

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const res = await axios.get(`/interview/room/${meetingId}`);
        setRoomDetails(res.data || null);
      } catch (err) {
        console.error("Failed to load room details", err);
      }
    };

    fetchRoomDetails();
  }, [meetingId]);

  useEffect(() => {
    let cancelled = false;
    let currentStream;
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    const upsertPeer = (peerID, peer) => {
      if (peersRef.current.some((item) => item.peerID === peerID)) return;
      peersRef.current.push({ peerID, peer });
      setPeers([...peersRef.current]);
    };

    const joinRoom = (mediaStream) => {
      if (cancelled) return;

      currentStream = mediaStream || null;
      streamRef.current = mediaStream || null;
      setStream(mediaStream || null);

      if (myVideo.current && mediaStream) {
        myVideo.current.srcObject = mediaStream;
      }

      newSocket.on('all-users', (users) => {
        users.forEach((userId) => {
          if (!userId || userId === newSocket.id) return;
          const peer = createPeer(userId, newSocket.id, mediaStream, newSocket);
          upsertPeer(userId, peer);
        });
      });

      newSocket.on('user-connected', (userId) => {
        if (!userId || userId === newSocket.id) return;
        console.log('Participant joined room:', userId);
      });

      newSocket.on('user-joined', (payload) => {
        if (!payload?.callerID || payload.callerID === newSocket.id) return;
        const peer = addPeer(payload.signal, payload.callerID, mediaStream, newSocket);
        upsertPeer(payload.callerID, peer);
      });

      newSocket.on('receiving-returned-signal', (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      newSocket.on('user-disconnected', (userId) => {
        const peerObj = peersRef.current.find((p) => p.peerID === userId);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        peersRef.current = peersRef.current.filter((p) => p.peerID !== userId);
        setPeers([...peersRef.current]);
      });

      newSocket.on('connect', () => {
        newSocket.emit('join-room', { roomId: meetingId });
      });
      if (newSocket.connected) {
        newSocket.emit('join-room', { roomId: meetingId });
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      if (cancelled) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      setMediaError("");
      joinRoom(mediaStream);
    }).catch(() => {
      navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((audioStream) => {
        if (cancelled) {
          audioStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setMediaError("Camera is unavailable, joined with microphone only.");
        joinRoom(audioStream);
      }).catch((err) => {
        console.error("Error accessing media devices", err);
        setMediaError("Camera and microphone are unavailable, joined as viewer only.");
        joinRoom(null);
      });
    });

    return () => {
      cancelled = true;
      newSocket.disconnect();
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current = [];
      const activeStream = currentStream || streamRef.current;
      activeStream?.getTracks().forEach(track => track.stop());
    };
  }, [backendUrl, meetingId]);

  function createPeer(userToSignal, callerID, stream, socketInstance) {
    const peerOptions = {
      initiator: true,
      trickle: false,
      config: PEER_CONFIG,
    };
    if (stream) peerOptions.stream = stream;

    const peer = new Peer(peerOptions);

    peer.on('signal', (signal) => {
      socketInstance.emit('signal', {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream, socketInstance) {
    const peerOptions = {
      initiator: false,
      trickle: false,
      config: PEER_CONFIG,
    };
    if (stream) peerOptions.stream = stream;

    const peer = new Peer(peerOptions);

    peer.on('signal', (signal) => {
      socketInstance.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  const toggleMute = () => {
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream?.getVideoTracks?.()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const endCall = () => {
    navigate('/dashboard'); // Go back to dashboard on end
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex h-[85vh] w-full max-w-6xl flex-col gap-4 px-4">
          <div className="h-[52%] rounded-3xl border border-slate-700 bg-slate-950/80 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Live Meeting</span>
              <span>{peers.length + 1} participant{peers.length === 0 ? '' : 's'}</span>
            </div>
            <div className={`grid h-[calc(100%-1.75rem)] gap-3 ${peers.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg">
                <video playsInline muted ref={myVideo} autoPlay className="h-full w-full object-cover" />
                {!stream?.getVideoTracks?.().length && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-300">
                    Camera unavailable
                  </div>
                )}
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold text-white">{localLabel}</div>
              </div>

              {peers.length > 0 ? (
                peers.map((peer, index) => (
                  <div key={peer.peerID || index} className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg">
                    <Video peer={peer.peer} />
                    <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold text-white">{remoteLabel}</div>
                  </div>
                ))
              ) : (
                <div className="hidden min-h-0 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 text-center md:flex">
                  <div>
                    <p className="text-base font-semibold text-slate-200">Waiting for the other participant</p>
                    <p className="mt-1 text-sm text-slate-400">Share this same interview room link with admin and candidate.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 py-2">
            <button onClick={toggleMute} className={`p-4 rounded-full shadow-lg transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={toggleVideo} className={`p-4 rounded-full shadow-lg transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {isVideoOff ? <CameraOff size={24} /> : <Camera size={24} />}
            </button>
            <button className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors">
              <MonitorUp size={24} />
            </button>
            <button onClick={endCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-colors">
              <PhoneOff size={24} />
            </button>
          </div>
          {mediaError && (
            <p className="text-center text-sm font-medium text-amber-200">{mediaError}</p>
          )}

          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <CodeEditor socket={socket} roomId={meetingId} />
          </div>
      </div>
    </DashboardShell>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();
  const [hasVideo, setHasVideo] = useState(false);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    const handleStream = (stream) => {
      setHasStream(true);
      setHasVideo(stream.getVideoTracks().some((track) => track.readyState === "live"));
      if (ref.current) ref.current.srcObject = stream;
    };

    peer.on('stream', handleStream);
    return () => {
      peer.removeListener?.('stream', handleStream);
    };
  }, [peer]);

  return (
    <>
      <video playsInline autoPlay ref={ref} className="w-full h-full object-cover" />
      {(!hasStream || !hasVideo) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-sm font-semibold text-slate-300">
          {hasStream ? "Camera unavailable" : "Connecting..."}
        </div>
      )}
    </>
  );
};

export default InterviewRoom;
