import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { formatDuration, generateShareableLinks, getPipPositionClasses } from '../utils/bayan-logic';
import { StudioMode, PipPosition } from '../types';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  Disc,
  Users,
  MessageSquare,
  HelpCircle,
  Share2,
  Copy,
  Check,
  PhoneOff,
  Hand,
  VolumeX,
  UserX,
  Send,
  AlertCircle,
  Settings,
  Shield,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
} from 'lucide-react';

export const LiveBayanStudio: React.FC = () => {
  const {
    t,
    lang,
    selectedRoomCode,
    isAdmin,
    siteConfig,
    sessions,
    saveRecording,
    updateSessionStatus,
  } = useApp();

  const currentSession = sessions.find((s) => s.roomCode === selectedRoomCode) || sessions[0];

  // Studio Modes: 'camera' (Mode A) | 'screen' (Mode B) | 'pip' (Mode C)
  const [studioMode, setStudioMode] = useState<StudioMode>('camera');
  const [pipPosition, setPipPosition] = useState<PipPosition>('bottom-right');
  const [pipVisible, setPipVisible] = useState(true);

  // Local Media State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLive, setIsLive] = useState(isAdmin);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Audio level visualizer state (0 to 100)
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Device selectors
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Screen privacy disclosure modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<StudioMode | null>(null);

  // Attendees & Chat
  const [attendees, setAttendees] = useState<Array<{ id: string; name: string; role: string; isMuted: boolean; handRaised: boolean }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; senderName: string; text: string; timestamp: string; isHost: boolean; isQuestion?: boolean }>>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'qna' | 'attendees'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isQuestionInput, setIsQuestionInput] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);

  // Connection & Sharing
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // References
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Visualizer Setup
  const setupAudioMeter = useCallback((stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('AudioContext visualization initialization:', e);
    }
  }, []);

  // Enumerate Media Devices
  const loadDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === 'videoinput');
      const audioDevs = devices.filter((d) => d.kind === 'audioinput');
      setCameras(videoDevs);
      setMicrophones(audioDevs);

      if (videoDevs.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevs[0].deviceId);
      }
      if (audioDevs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioDevs[0].deviceId);
      }
    } catch (err) {
      console.warn('Enumerate devices warning:', err);
    }
  };

  // Start Camera with specified or default constraints
  const startCamera = async (camId?: string, micId?: string) => {
    try {
      setPermissionError(null);
      const constraints: MediaStreamConstraints = {
        video: camId ? { deviceId: { exact: camId } } : true,
        audio: micId ? { deviceId: { exact: micId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (pipVideoRef.current) {
        pipVideoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
      setIsMicOn(true);
      setupAudioMeter(stream);
      await loadDevices();
    } catch (err: any) {
      console.warn('Camera/mic access unavailable or denied:', err);
      setPermissionError(
        'براؤزر نے کیمرہ یا مائیکروفون کی اجازت قبول نہیں کی، براہ کرم براؤزر کی سیٹنگز سے اجازت عنایت فرمائیں۔'
      );
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isMicOn;
      audioTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsMicOn(nextState);
      if (!nextState) setAudioLevel(0);
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isCameraOn;
      videoTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsCameraOn(nextState);
    } else {
      setIsCameraOn(!isCameraOn);
    }
  };

  // Change Camera Device
  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
    }
    await startCamera(deviceId, selectedMicId);
  };

  // Change Mic Device
  const handleMicChange = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => t.stop());
    }
    await startCamera(selectedCameraId, deviceId);
  };

  // Native Screen Sharing with Privacy Enforcement
  const requestScreenShareWithPrivacy = (targetMode: StudioMode) => {
    if (isScreenSharing) {
      // Screen is already sharing, switch mode directly
      setStudioMode(targetMode);
      broadcastModeChange(targetMode, pipPosition, pipVisible);
      return;
    }
    setPendingMode(targetMode);
    setShowPrivacyModal(true);
  };

  const confirmStartScreenShare = async () => {
    setShowPrivacyModal(false);
    try {
      setPermissionError(null);
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }
      setIsScreenSharing(true);

      const targetMode = pendingMode || 'screen';
      setStudioMode(targetMode);
      broadcastModeChange(targetMode, pipPosition, pipVisible);

      // Listen for browser native "Stop sharing" floating bar
      screenStream.getVideoTracks()[0].onended = () => {
        handleNativeScreenShareEnd();
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'bayan-status-update',
            roomCode: selectedRoomCode,
            payload: { isScreenSharing: true },
          })
        );
      }
    } catch (err: any) {
      console.warn('Screen share cancelled or denied:', err);
      // Return cleanly to Mode A (Camera)
      setStudioMode('camera');
      broadcastModeChange('camera', pipPosition, pipVisible);
      if (err.name !== 'NotAllowedError') {
        setPermissionError('اسکرین شیئرنگ منسوخ یا غیر فعال ہو گئی ہے۔');
      }
    } finally {
      setPendingMode(null);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
    setStudioMode('camera');
    broadcastModeChange('camera', pipPosition, pipVisible);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'bayan-status-update',
          roomCode: selectedRoomCode,
          payload: { isScreenSharing: false },
        })
      );
    }
  };

  const handleNativeScreenShareEnd = () => {
    setIsScreenSharing(false);
    screenStreamRef.current = null;
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setStudioMode('camera');
    broadcastModeChange('camera', pipPosition, pipVisible);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'bayan-status-update',
          roomCode: selectedRoomCode,
          payload: { isScreenSharing: false },
        })
      );
    }
  };

  // Broadcast Studio Mode to Attendees via WebSocket
  const broadcastModeChange = (mode: StudioMode, position: PipPosition, visible: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'studio-mode-changed',
          roomCode: selectedRoomCode,
          payload: {
            studioMode: mode,
            pipPosition: position,
            pipVisible: visible,
          },
        })
      );
    }
  };

  // Mode Selection Handler
  const handleSelectStudioMode = (newMode: StudioMode) => {
    if (!isAdmin) return;
    if (newMode === 'camera') {
      if (isScreenSharing) {
        stopScreenShare();
      }
      setStudioMode('camera');
      broadcastModeChange('camera', pipPosition, pipVisible);
    } else {
      // 'screen' or 'pip'
      requestScreenShareWithPrivacy(newMode);
    }
  };

  // PiP Corner Position Changer
  const handleSetPipPosition = (pos: PipPosition) => {
    setPipPosition(pos);
    broadcastModeChange(studioMode, pos, pipVisible);
  };

  const handleTogglePipVisibility = () => {
    const next = !pipVisible;
    setPipVisible(next);
    broadcastModeChange(studioMode, pipPosition, next);
  };

  // MediaRecorder API implementation
  const handleStartRecording = () => {
    const streamToRecord = screenStreamRef.current || localStreamRef.current;
    if (!streamToRecord) {
      alert('براہ کرم ریکارڈنگ شروع کرنے سے پہلے کیمرہ یا اسکرین فعال فرمائیں۔');
      return;
    }

    try {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const recorder = new MediaRecorder(
        streamToRecord,
        MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined
      );

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
      };

      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'bayan-status-update',
            roomCode: selectedRoomCode,
            payload: { isRecording: true },
          })
        );
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'bayan-status-update',
          roomCode: selectedRoomCode,
          payload: { isRecording: false },
        })
      );
    }
  };

  const handleSaveToArchive = async () => {
    if (!recordedBlobUrl) return;
    try {
      await saveRecording({
        title: currentSession?.title || 'Live Recorded Bayan',
        titleUrdu: currentSession?.titleUrdu || 'براہِ راست محفوظ بیان',
        speaker: siteConfig.speakerName,
        speakerUrdu: siteConfig.speakerNameUrdu,
        category: currentSession?.category || 'General',
        categoryUrdu: currentSession?.categoryUrdu || 'عام خطاب',
        duration: formatDuration(recordingSeconds),
        durationSeconds: recordingSeconds,
        videoUrl: recordedBlobUrl,
        thumbnailUrl: '/src/assets/images/bayan_masjid_interior_1792917985772.jpg',
        visibility: 'public',
        downloadsAllowed: true,
      });
      setSavedSuccessMsg('بیان کامیابی کے ساتھ علمی ذخیرے میں محفوظ ہو گیا ہے۔');
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // WebSocket signaling and room connection
  useEffect(() => {
    startCamera();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/bayan`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      ws.send(
        JSON.stringify({
          type: 'join-room',
          roomCode: selectedRoomCode,
          payload: {
            name: isAdmin ? siteConfig.speakerName : 'حاضرِ مجلس ' + Math.floor(Math.random() * 100),
            role: isAdmin ? 'host' : 'attendee',
            bayanId: currentSession?.id,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room-state') {
          setAttendees(msg.payload.attendees);
          setMessages(msg.payload.messages || []);
          setIsLive(msg.payload.isLive);
          setIsScreenSharing(msg.payload.isScreenSharing);
          setIsRecording(msg.payload.isRecording);
          if (msg.payload.studioMode) setStudioMode(msg.payload.studioMode);
          if (msg.payload.pipPosition) setPipPosition(msg.payload.pipPosition);
          if (msg.payload.pipVisible !== undefined) setPipVisible(msg.payload.pipVisible);
        } else if (msg.type === 'attendee-joined') {
          setAttendees((prev) => [...prev, msg.payload]);
        } else if (msg.type === 'attendee-left') {
          setAttendees((prev) => prev.filter((a) => a.id !== msg.payload.id));
        } else if (msg.type === 'attendee-updated') {
          setAttendees((prev) =>
            prev.map((a) => (a.id === msg.payload.id ? { ...a, ...msg.payload } : a))
          );
        } else if (msg.type === 'chat-message') {
          setMessages((prev) => [...prev, msg.payload]);
        } else if (msg.type === 'bayan-status-update') {
          if (msg.payload.isLive !== undefined) setIsLive(msg.payload.isLive);
          if (msg.payload.isScreenSharing !== undefined) setIsScreenSharing(msg.payload.isScreenSharing);
          if (msg.payload.isRecording !== undefined) setIsRecording(msg.payload.isRecording);
        } else if (msg.type === 'studio-mode-changed') {
          if (msg.payload.studioMode) setStudioMode(msg.payload.studioMode);
          if (msg.payload.pipPosition) setPipPosition(msg.payload.pipPosition);
          if (msg.payload.pipVisible !== undefined) setPipVisible(msg.payload.pipVisible);
        } else if (msg.type === 'removed-by-host') {
          alert('آپ کو اس مجلس سے خارج کر دیا گیا ہے۔');
          window.location.href = '/';
        }
      } catch (e) {
        console.error(e);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    return () => {
      stopCamera();
      stopScreenShare();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [selectedRoomCode, isAdmin]);

  // Sync PiP video ref when mode changes to 'pip'
  useEffect(() => {
    if (studioMode === 'pip' && localStreamRef.current && pipVideoRef.current) {
      pipVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [studioMode, pipVisible]);

  // Send Chat Message or Question
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'chat-message',
        roomCode: selectedRoomCode,
        payload: {
          senderName: isAdmin ? siteConfig.speakerName : 'حاضرِ مجلس',
          text: chatInput.trim(),
          isHost: isAdmin,
          isQuestion: isQuestionInput,
        },
      })
    );
    setChatInput('');
  };

  // Toggle Hand Raise (Attendee Q&A)
  const handleToggleHand = () => {
    const next = !hasHandRaised;
    setHasHandRaised(next);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'raise-hand',
          roomCode: selectedRoomCode,
          payload: { handRaised: next },
        })
      );
    }
  };

  // Host Moderator Controls
  const handleMuteAttendee = (attendeeId: string, currentMuted: boolean) => {
    if (!isAdmin || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'mute-attendee',
        roomCode: selectedRoomCode,
        payload: { attendeeId, isMuted: !currentMuted },
      })
    );
  };

  const handleRemoveAttendee = (attendeeId: string) => {
    if (!isAdmin || !wsRef.current) return;
    if (confirm('کیا آپ واقعی اس شریک کو مجلس سے خارج کرنا چاہتے ہیں؟')) {
      wsRef.current.send(
        JSON.stringify({
          type: 'remove-attendee',
          roomCode: selectedRoomCode,
          payload: { attendeeId },
        })
      );
    }
  };

  const handleEndSessionForAll = () => {
    if (!isAdmin) return;
    if (confirm('کیا آپ تمام شرکاء کے لیے یہ بیان ختم کرنا چاہتے ہیں؟')) {
      setIsLive(false);
      if (currentSession) {
        updateSessionStatus(currentSession.id, 'ended');
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'bayan-status-update',
            roomCode: selectedRoomCode,
            payload: { isLive: false },
          })
        );
      }
    }
  };

  const handleCopyLink = () => {
    const links = generateShareableLinks(
      window.location.origin,
      selectedRoomCode,
      currentSession?.titleUrdu || 'Islamic Bayan',
      lang
    );
    navigator.clipboard.writeText(links.joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const links = generateShareableLinks(
      window.location.origin,
      selectedRoomCode,
      currentSession?.titleUrdu || 'Islamic Bayan',
      lang
    );
    window.open(links.whatsappShareUrl, '_blank');
  };

  const questionsCount = messages.filter((m) => m.isQuestion).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Status, Title, Studio Mode Selector & Room Info */}
      <div className="bg-[#0F382A] text-stone-100 rounded-xl p-5 border border-[#C5A059]/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-[#C5A059] font-sans">
              {isAdmin ? t.studioTitle : 'مجلسِ بیان'}
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-xs font-mono text-stone-300">
              کمرہ: {selectedRoomCode}
            </span>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{t.recordingActive} ({formatDuration(recordingSeconds)})</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-urdu font-bold text-white">
            {lang === 'ur' ? currentSession?.titleUrdu : currentSession?.title}
          </h1>
        </div>

        {/* Share & Admin Session Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{t.shareViaWhatsapp}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? t.linkCopied : t.copyLink}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowDeviceSettings(!showDeviceSettings)}
              className="px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              title="آلات و ترتیبات"
            >
              <Settings className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>سیٹنگز</span>
            </button>
          )}

          {isAdmin && isLive && (
            <button
              onClick={handleEndSessionForAll}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-800 hover:bg-rose-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{t.endLiveBroadcast}</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission or device alert */}
      {permissionError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-md text-amber-900 text-xs font-urdu flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Admin Device Settings Panel */}
      {isAdmin && showDeviceSettings && (
        <div className="p-4 bg-stone-50 border border-stone-300 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold font-urdu text-stone-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0F382A]" />
              <span>آڈیو اور ویڈیو آلات کی ترتیبات (Device Settings)</span>
            </h3>
            <button
              onClick={() => setShowDeviceSettings(false)}
              className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              بند کریں
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                کیمرہ منتخب کریں (Camera)
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:border-[#0F382A] focus:outline-none"
              >
                {cameras.map((c) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `کیمرہ (${c.deviceId.slice(0, 6)})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                مائیکروفون منتخب کریں (Microphone)
              </label>
              <select
                value={selectedMicId}
                onChange={(e) => handleMicChange(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:border-[#0F382A] focus:outline-none"
              >
                {microphones.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label || `مائیک (${m.deviceId.slice(0, 6)})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Studio Mode Selector (Mode A: Camera, Mode B: Screen, Mode C: PiP) */}
      {isAdmin && (
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold font-urdu text-stone-700 me-2">
              نشریاتی طریقہ کار (Studio Mode):
            </span>

            {/* Mode A */}
            <button
              onClick={() => handleSelectStudioMode('camera')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                studioMode === 'camera'
                  ? 'bg-[#0F382A] text-white border-[#0F382A] font-semibold'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>موڈ الف: کیمرہ و صوتی درس</span>
            </button>

            {/* Mode B */}
            <button
              onClick={() => handleSelectStudioMode('screen')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                studioMode === 'screen'
                  ? 'bg-[#0F382A] text-white border-[#0F382A] font-semibold'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>موڈ ب: صرف اسکرین شیئرنگ</span>
            </button>

            {/* Mode C */}
            <button
              onClick={() => handleSelectStudioMode('pip')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                studioMode === 'pip'
                  ? 'bg-[#0F382A] text-white border-[#0F382A] font-semibold'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>موڈ ج: اسکرین مع کیمرہ تصویر در تصویر (PiP)</span>
            </button>
          </div>

          {/* Mode C specific corner & visibility controls */}
          {studioMode === 'pip' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-sans">کیمرہ کونہ:</span>
              <button
                onClick={() => handleSetPipPosition('bottom-right')}
                className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                  pipPosition === 'bottom-right' ? 'bg-[#C5A059] text-stone-900 font-bold border-[#C5A059]' : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="نیچے دائیں"
              >
                نیچے دائیں
              </button>
              <button
                onClick={() => handleSetPipPosition('bottom-left')}
                className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                  pipPosition === 'bottom-left' ? 'bg-[#C5A059] text-stone-900 font-bold border-[#C5A059]' : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="نیچے بائیں"
              >
                نیچے بائیں
              </button>
              <button
                onClick={() => handleSetPipPosition('top-right')}
                className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                  pipPosition === 'top-right' ? 'bg-[#C5A059] text-stone-900 font-bold border-[#C5A059]' : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="اوپر دائیں"
              >
                اوپر دائیں
              </button>
              <button
                onClick={() => handleSetPipPosition('top-left')}
                className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                  pipPosition === 'top-left' ? 'bg-[#C5A059] text-stone-900 font-bold border-[#C5A059]' : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title="اوپر بائیں"
              >
                اوپر بائیں
              </button>

              <button
                onClick={handleTogglePipVisibility}
                className="ms-2 px-2.5 py-1 text-[11px] border rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1 cursor-pointer"
                title={pipVisible ? 'کیمرہ کی تصویر چھپائیں' : 'کیمرہ کی تصویر دکھائیں'}
              >
                {pipVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{pipVisible ? 'چھپائیں' : 'دکھائیں'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {savedSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm font-urdu flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main Studio Grid: Video Surface (8 cols) + Side Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Broadcast Video Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video bg-stone-900 rounded-xl overflow-hidden border border-stone-800 shadow-md flex items-center justify-center">
            {/* Primary Viewport */}
            {studioMode === 'camera' ? (
              /* Mode A: Camera as Primary */
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={isAdmin} // Mute local preview to prevent acoustic feedback
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              />
            ) : (
              /* Mode B & Mode C: Screen Share as Primary */
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            )}

            {/* In Mode C (Camera + Screen PiP): Secondary Floating Camera Viewport */}
            {studioMode === 'pip' && isCameraOn && pipVisible && (
              <div
                className={`absolute ${getPipPositionClasses(
                  pipPosition
                )} w-36 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 border-[#C5A059] shadow-xl z-20 bg-stone-950 transition-all duration-300`}
              >
                <video
                  ref={pipVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 start-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded font-urdu">
                  {siteConfig.speakerNameUrdu}
                </div>
              </div>
            )}

            {/* When camera is off and not screen sharing */}
            {studioMode === 'camera' && !isCameraOn && (
              <div className="text-center p-8 text-stone-400 space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-stone-500" />
                </div>
                <p className="text-sm font-urdu text-stone-300">
                  {isAdmin
                    ? 'کیمرہ بند ہے۔ براہ کرم نشریات کے لیے کیمرہ کھولیں۔'
                    : 'مقرر محترم کا کیمرہ فی الوقت بند ہے۔ صوتی درس جاری ہے۔'}
                </p>
              </div>
            )}

            {/* In-Video Status Overlays */}
            <div className="absolute top-4 start-4 flex items-center gap-2 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded border border-white/10 z-10">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-sans">{isLive ? t.sessionLiveBadge : t.sessionScheduledBadge}</span>
              <span aria-hidden="true" className="text-stone-500">|</span>
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{attendees.length}</span>
            </div>

            {/* Active Mode Badge */}
            <div className="absolute bottom-4 end-4 bg-black/70 backdrop-blur-xs text-[#C5A059] text-[11px] px-2.5 py-1 rounded border border-[#C5A059]/40 z-10 font-urdu">
              {studioMode === 'camera' && 'موڈ الف: کیمرہ'}
              {studioMode === 'screen' && 'موڈ ب: اسکرین'}
              {studioMode === 'pip' && 'موڈ ج: اسکرین + PiP'}
            </div>

            {/* Recording Watermark Disclosure */}
            {isRecording && (
              <div className="absolute top-4 end-4 bg-rose-950/80 backdrop-blur-xs text-rose-200 text-xs px-2.5 py-1 rounded border border-rose-800/60 font-sans z-10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>REC</span>
              </div>
            )}

            {/* Floating Speaker / Mic Indicator */}
            <div className="absolute bottom-4 start-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded border border-white/10 flex items-center gap-2 font-urdu z-10">
              <span>{siteConfig.speakerNameUrdu}</span>
              {!isMicOn && <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </div>
          </div>

          {/* Broadcast & Media Controls Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Host Controls */}
            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Mic Toggle with Volume Indicator */}
                <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2 py-1 rounded-md">
                  <button
                    onClick={toggleMic}
                    className={`p-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      isMicOn
                        ? 'text-emerald-800 hover:bg-emerald-100'
                        : 'text-rose-700 hover:bg-rose-100'
                    }`}
                    title={isMicOn ? t.muteMic : t.unmuteMic}
                  >
                    {isMicOn ? <Mic className="w-4 h-4 text-emerald-700" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Real-time volume level meter (5 segments) */}
                  <div className="flex items-center gap-0.5 w-12 h-3" title={`صوتی سطح: ${audioLevel}%`}>
                    {[20, 40, 60, 80, 100].map((threshold) => (
                      <span
                        key={threshold}
                        className={`w-2 h-full rounded-xs transition-colors duration-75 ${
                          isMicOn && audioLevel >= threshold
                            ? threshold >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Camera Toggle */}
                <button
                  onClick={toggleCamera}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCameraOn
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  }`}
                  title={isCameraOn ? t.turnOffCamera : t.turnOnCamera}
                >
                  {isCameraOn ? <VideoIcon className="w-4 h-4 text-emerald-700" /> : <VideoOff className="w-4 h-4" />}
                  <span>{isCameraOn ? t.turnOffCamera : t.turnOnCamera}</span>
                </button>

                {/* Screen Share Action */}
                <button
                  onClick={isScreenSharing ? stopScreenShare : () => requestScreenShareWithPrivacy('screen')}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isScreenSharing
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4 text-[#0F382A]" />}
                  <span>{isScreenSharing ? t.stopScreenShare : t.shareScreen}</span>
                </button>

                {/* Record Action */}
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`px-3 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  <Disc className={`w-4 h-4 ${isRecording ? 'animate-spin' : 'text-rose-600'}`} />
                  <span>{isRecording ? t.stopRecording : t.startRecording}</span>
                </button>
              </div>
            ) : (
              /* Attendee Controls */
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleHand}
                  className={`px-4 py-2 text-xs font-semibold rounded-md border flex items-center gap-2 transition-colors cursor-pointer ${
                    hasHandRaised
                      ? 'bg-[#C5A059] text-[#0F382A] border-[#C5A059]'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span>{hasHandRaised ? t.handRaised : t.raiseHand}</span>
                </button>

                <span className="text-xs text-stone-500 font-sans">
                  {t.audioMutedByHost}
                </span>
              </div>
            )}

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{connectionStatus === 'connected' ? t.connectionStable : 'جاری رابطہ...'}</span>
            </div>
          </div>

          {/* Recording Download / Save Prompt if recording finished */}
          {recordedBlobUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold font-urdu text-amber-900">
                  بیان کی ریکارڈنگ تیار ہے ({formatDuration(recordingSeconds)})
                </h4>
                <a
                  href={recordedBlobUrl}
                  download={`bayan-${selectedRoomCode}.webm`}
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  فائل ڈاؤن لوڈ کریں (.webm)
                </a>
              </div>
              <p className="text-xs text-amber-800 font-sans">
                آپ اس ریکارڈنگ کو عوامی لائبریری میں شامل کر سکتے ہیں تاکہ جو احباب حاضر نہیں ہو سکے وہ بعد میں مستفید ہو سکیں۔
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSaveToArchive}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors cursor-pointer"
                >
                  ریکارڈ شدہ ذخیرے میں محفوظ کریں
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Discussion Chat / Moderated Q&A / Attendees */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-stone-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'border-b-2 border-[#0F382A] text-[#0F382A] font-semibold bg-stone-50/50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.liveChat}</span>
            </button>

            <button
              onClick={() => setActiveTab('qna')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'qna'
                  ? 'border-b-2 border-[#0F382A] text-[#0F382A] font-semibold bg-stone-50/50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{t.qnaTab}</span>
              {questionsCount > 0 && (
                <span className="text-[10px] bg-[#C5A059]/20 text-[#0F382A] font-mono px-1.5 py-0.2 rounded">
                  {questionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('attendees')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'attendees'
                  ? 'border-b-2 border-[#0F382A] text-[#0F382A] font-semibold bg-stone-50/50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.attendeesList}</span>
              <span className="text-[10px] bg-stone-100 font-mono px-1.5 py-0.2 rounded">
                {attendees.length}
              </span>
            </button>
          </div>

          {/* Tab Body: Messages or Attendees */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {activeTab === 'chat' && (
              <>
                {messages.length === 0 ? (
                  <div className="text-center text-stone-400 py-12 font-sans">
                    {t.noChatYet}
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border ${
                        m.isHost
                          ? 'bg-[#0F382A]/5 border-[#0F382A]/20'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className={`font-semibold ${m.isHost ? 'text-[#0F382A]' : 'text-stone-800'}`}>
                          {m.senderName} {m.isHost && '(میزبان)'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{m.timestamp}</span>
                      </div>
                      <p className="text-stone-800 leading-relaxed font-sans">{m.text}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'qna' && (
              <>
                {questionsCount === 0 ? (
                  <div className="text-center text-stone-400 py-12 font-sans">
                    {t.noQuestionsYet}
                  </div>
                ) : (
                  messages
                    .filter((m) => m.isQuestion)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                          <span>سوال از: {q.senderName}</span>
                          <span className="text-[10px] font-mono text-stone-400">{q.timestamp}</span>
                        </div>
                        <p className="text-stone-800 font-sans leading-relaxed">{q.text}</p>
                      </div>
                    ))
                )}
              </>
            )}

            {activeTab === 'attendees' && (
              <div className="space-y-2">
                {attendees.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center font-semibold text-[11px] text-stone-700">
                        {a.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-medium text-stone-800">{a.name}</span>
                        {a.role === 'host' && (
                          <span className="text-[10px] text-[#0F382A] font-semibold ms-1">
                            (میزبان)
                          </span>
                        )}
                        {a.handRaised && (
                          <span className="text-[10px] text-amber-700 font-medium ms-1 flex items-center gap-0.5">
                            ✋ سوال
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Moderator action buttons */}
                    {isAdmin && a.role !== 'host' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMuteAttendee(a.id, a.isMuted)}
                          className="p-1 text-stone-500 hover:text-stone-900 rounded cursor-pointer"
                          title={a.isMuted ? 'کھولیں' : 'خاموش کرائیں'}
                        >
                          {a.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-stone-600" />}
                        </button>
                        <button
                          onClick={() => handleRemoveAttendee(a.id)}
                          className="p-1 text-stone-500 hover:text-rose-600 rounded cursor-pointer"
                          title={t.removeAttendee}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input Box */}
          {(activeTab === 'chat' || activeTab === 'qna') && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isQuestionInput}
                    onChange={(e) => setIsQuestionInput(e.target.checked)}
                    className="rounded text-[#0F382A] focus:ring-0"
                  />
                  <span>یہ ایک سوال ہے</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isQuestionInput ? t.askQuestionPlaceholder : 'اپنا پیغام تحریر کریں...'}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#0F382A] hover:bg-[#0B281E] text-white rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title={t.send}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Screen Privacy Disclosure Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0F382A]">
                <Shield className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold font-urdu text-[#0F382A]">
                  اسکرین شیئرنگ و رازداری کی احتیاط
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Screen Sharing Privacy & Security
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-700 bg-stone-50 p-4 rounded-lg border border-stone-200 font-urdu">
              <p>
                <strong>ضروری ہدایات برائے محترم والد صاحب:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>
                  براؤزر کی اگلی ونڈو میں صرف <strong>مطلوبہ ٹیب (Tab)</strong> یا <strong>درسی کتاب/پی ڈی ایف ونڈو</strong> منتخب فرمائیں۔
                </li>
                <li>
                  پوری اسکرین (Entire Screen) منتخب کرنے سے پرہیز فرمائیں تاکہ کمپیوٹر کے ذاتی نوٹیفکیشن یا دیگر نجی فائلز شرکاء کے سامنے نہ آئیں۔
                </li>
                <li>
                  اسکرین شیئرنگ کسی بھی وقت فوری طور پر "اسکرین شیئرنگ بند کریں" بٹن کے ذریعے روکی جا سکتی ہے۔
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPrivacyModal(false);
                  setPendingMode(null);
                }}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
              >
                منسوخ کریں
              </button>
              <button
                onClick={confirmStartScreenShare}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>اجازت دیں اور اسکرین منتخب کریں</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
