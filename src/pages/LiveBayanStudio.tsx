import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { formatDuration, generateShareableLinks } from '../utils/bayan-logic';
import {
  Mic,
  MicOff,
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
  Send,
  AlertCircle,
  Settings,
  Shield,
  ThumbsUp,
  XCircle,
  Pin,
  CheckCircle2,
  Trash2,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';

export interface ModeratedQuestion {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  pinned: boolean;
}

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

  // Local Media State (Microphone & Screen Sharing ONLY - NO CAMERA)
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLive, setIsLive] = useState(isAdmin);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Audio volume level visualizer (0 to 100)
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio Device selection
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Screen privacy disclosure modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Attendees, Chat & Q&A
  const [attendees, setAttendees] = useState<Array<{ id: string; name: string; role: string; isMuted: boolean }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; senderName: string; text: string; timestamp: string; isHost: boolean }>>([]);
  const [questionsQueue, setQuestionsQueue] = useState<ModeratedQuestion[]>([]);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'qna' | 'chat' | 'attendees'>('qna');
  const [chatInput, setChatInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [questionSubmittedMsg, setQuestionSubmittedMsg] = useState(false);

  // Connection & Sharing
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // References
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Visualizer Meter
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
      console.warn('AudioContext visualization setup warning:', e);
    }
  }, []);

  // Enumerate Audio Devices (Microphones ONLY)
  const loadAudioDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevs = devices.filter((d) => d.kind === 'audioinput');
      setMicrophones(audioDevs);
      if (audioDevs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioDevs[0].deviceId);
      }
    } catch (err) {
      console.warn('Enumerate audio devices warning:', err);
    }
  };

  // Start Microphone Stream (No Video / No Camera)
  const startMicrophone = async (micId?: string) => {
    try {
      setPermissionError(null);
      const constraints: MediaStreamConstraints = {
        video: false, // Strict camera-free constraint
        audio: micId ? { deviceId: { exact: micId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;
      setIsMicOn(true);
      setupAudioMeter(stream);
      await loadAudioDevices();
    } catch (err: any) {
      console.warn('Microphone access warning:', err);
      setPermissionError(
        'مائیکروفون کی اجازت حاصل نہیں ہو سکی، براہ کرم براؤزر کی سیٹنگز میں مائیکروفون فعال فرمائیں۔'
      );
    }
  };

  const stopMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const toggleMic = () => {
    if (micStreamRef.current) {
      const audioTracks = micStreamRef.current.getAudioTracks();
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

  const handleMicChange = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    stopMicrophone();
    await startMicrophone(deviceId);
  };

  // Native Screen Sharing (`getDisplayMedia`)
  const requestScreenShareWithPrivacy = () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
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

      // Listen for native browser floating bar "Stop sharing"
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
      if (err.name !== 'NotAllowedError') {
        setPermissionError('اسکرین شیئرنگ منسوخ یا غیر فعال ہو گئی ہے۔');
      }
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

  // Recording Engine (Captures Mic Audio + Screen Stream if active)
  const handleStartRecording = () => {
    const audioTrack = micStreamRef.current?.getAudioTracks()[0];
    const videoTrack = screenStreamRef.current?.getVideoTracks()[0];

    const combinedTracks: MediaStreamTrack[] = [];
    if (videoTrack) combinedTracks.push(videoTrack);
    if (audioTrack) combinedTracks.push(audioTrack);

    if (combinedTracks.length === 0) {
      alert('براہ کرم ریکارڈنگ شروع کرنے سے پہلے مائیکروفون فعال فرمائیں۔');
      return;
    }

    const streamToRecord = new MediaStream(combinedTracks);

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

      recorder.start(1000);
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
        titleUrdu: currentSession?.titleUrdu || 'تعلیم الدین اکیڈمی - محفوظ لائیو بیان',
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
      setSavedSuccessMsg('بیان کامیابی کے ساتھ تعلیم الدین اکیڈمی کے علمی آرکائیو میں محفوظ ہو گیا ہے۔');
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // WebSocket signaling & room state
  useEffect(() => {
    if (isAdmin) {
      startMicrophone();
    }

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
            name: isAdmin ? siteConfig.speakerNameUrdu : 'حاضرِ مجلس ' + Math.floor(Math.random() * 100),
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
          setQuestionsQueue(msg.payload.questions || []);
          setIsLive(msg.payload.isLive);
          setIsScreenSharing(msg.payload.isScreenSharing);
          setIsRecording(msg.payload.isRecording);
          if (msg.payload.questionsOpen !== undefined) setQuestionsOpen(msg.payload.questionsOpen);
        } else if (msg.type === 'questions-queue-update') {
          setQuestionsQueue(msg.payload.questions || []);
        } else if (msg.type === 'approved-questions-update') {
          setQuestionsQueue(msg.payload.questions || []);
        } else if (msg.type === 'questions-open-status') {
          setQuestionsOpen(msg.payload.questionsOpen);
        } else if (msg.type === 'chat-message') {
          setMessages((prev) => [...prev, msg.payload]);
        } else if (msg.type === 'bayan-status-update') {
          if (msg.payload.isLive !== undefined) setIsLive(msg.payload.isLive);
          if (msg.payload.isScreenSharing !== undefined) setIsScreenSharing(msg.payload.isScreenSharing);
          if (msg.payload.isRecording !== undefined) setIsRecording(msg.payload.isRecording);
        } else if (msg.type === 'attendee-joined') {
          setAttendees((prev) => [...prev, msg.payload]);
        } else if (msg.type === 'attendee-left') {
          setAttendees((prev) => prev.filter((a) => a.id !== msg.payload.id));
        }
      } catch (e) {
        console.error(e);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('disconnected');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    return () => {
      stopMicrophone();
      stopScreenShare();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [selectedRoomCode, isAdmin]);

  // HTTP Polling fallback when WebSocket is disconnected or unsupported on serverless host
  useEffect(() => {
    let pollTimer: any = null;

    const fetchRoomStateRest = async () => {
      try {
        const role = isAdmin ? 'host' : 'attendee';
        const res = await fetch(`/api/rooms/${selectedRoomCode}/state?role=${role}`);
        if (res.ok) {
          const data = await res.json();
          setQuestionsQueue(data.questions || []);
          setMessages(data.messages || []);
          setIsLive(data.isLive);
          setIsScreenSharing(data.isScreenSharing);
          setIsRecording(data.isRecording);
          if (data.questionsOpen !== undefined) setQuestionsOpen(data.questionsOpen);
          setConnectionStatus('connected');
        }
      } catch {
        // Quiet fallback
      }
    };

    if (connectionStatus === 'disconnected' || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      fetchRoomStateRest();
      pollTimer = setInterval(fetchRoomStateRest, 3000);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [selectedRoomCode, isAdmin, connectionStatus]);

  // Submit Listener Question with REST Fallback
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'submit-question',
          roomCode: selectedRoomCode,
          payload: {
            senderName: 'حاضرِ مجلس',
            text: questionInput.trim(),
          },
        })
      );
    } else {
      try {
        await fetch(`/api/rooms/${selectedRoomCode}/submit-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: 'حاضرِ مجلس',
            text: questionInput.trim(),
          }),
        });
      } catch (err) {
        console.error('Submit question error:', err);
      }
    }

    setQuestionInput('');
    setQuestionSubmittedMsg(true);
    setTimeout(() => setQuestionSubmittedMsg(false), 4000);
  };

  // Host Q&A Moderator Action with REST Fallback
  const handleModerateQuestion = async (questionId: string, action: 'approve' | 'reject' | 'answer' | 'pin' | 'delete') => {
    if (!isAdmin) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'moderate-question',
          roomCode: selectedRoomCode,
          payload: { questionId, action },
        })
      );
    } else {
      try {
        const res = await fetch(`/api/rooms/${selectedRoomCode}/moderate-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, action }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions) setQuestionsQueue(data.questions);
        }
      } catch (err) {
        console.error('Moderate question error:', err);
      }
    }
  };

  // Host Toggle Questions Open/Close
  const handleToggleQuestionsOpen = () => {
    if (!isAdmin || !wsRef.current) return;
    const nextState = !questionsOpen;
    setQuestionsOpen(nextState);
    wsRef.current.send(
      JSON.stringify({
        type: 'toggle-questions-open',
        roomCode: selectedRoomCode,
        payload: { questionsOpen: nextState },
      })
    );
  };

  // Chat Message Action
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'chat-message',
        roomCode: selectedRoomCode,
        payload: {
          senderName: isAdmin ? siteConfig.speakerNameUrdu : 'حاضرِ مجلس',
          text: chatInput.trim(),
          isHost: isAdmin,
        },
      })
    );
    setChatInput('');
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
      currentSession?.titleUrdu || 'Taleem Ud Deen Academy',
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
      currentSession?.titleUrdu || 'Taleem Ud Deen Academy',
      lang
    );
    window.open(links.whatsappShareUrl, '_blank');
  };

  const pendingQuestionsCount = questionsQueue.filter((q) => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Branding & Session Actions */}
      <div className="bg-[#0F382A] text-stone-100 rounded-xl p-5 border border-[#C5A059]/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C5A059] font-sans font-semibold">
              TALEEM UD DEEN ACADEMY
            </span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="text-xs font-mono text-stone-300">
              روم کوڈ: {selectedRoomCode}
            </span>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 me-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>ریکارڈنگ جاری ({formatDuration(recordingSeconds)})</span>
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
            >
              <Settings className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>مائیک ترتیبات</span>
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

      {/* Admin Audio Device Settings Panel */}
      {isAdmin && showDeviceSettings && (
        <div className="p-4 bg-stone-50 border border-stone-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold font-urdu text-stone-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0F382A]" />
              <span>مائیکروفون ڈیوائس ترتیبات (Microphone Device Settings)</span>
            </h3>
            <button
              onClick={() => setShowDeviceSettings(false)}
              className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              بند کریں
            </button>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              مائیکروفون منتخب کریں (Microphone Input)
            </label>
            <select
              value={selectedMicId}
              onChange={(e) => handleMicChange(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:border-[#0F382A] focus:outline-none"
            >
              {microphones.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || `مائیکروفون (${m.deviceId.slice(0, 6)})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {savedSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm font-urdu flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main Studio Grid: Viewport & Controls (8 cols) + Q&A & Discussion Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Viewport & Studio Control Suite */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video bg-[#0F382A] rounded-xl overflow-hidden border border-[#C5A059]/40 shadow-md flex items-center justify-center">
            {/* Viewport Content: Shared Screen or Islamic Branded Waiting Card */}
            {isScreenSharing ? (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              /* Camera-Free Serene Islamic Branded Waiting Card */
              <div className="text-center p-8 space-y-5 text-stone-100 max-w-lg mx-auto">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#0B281E] border-2 border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-inner">
                  <Radio className="w-10 h-10 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
                    TALEEM UD DEEN ACADEMY
                  </span>
                  <h2 className="text-2xl font-urdu font-bold text-white">
                    تعليم الدين اكيڈمي - لائیو صوتی بیان
                  </h2>
                  <p className="text-sm font-urdu text-stone-300">
                    مقررِ محترم: {siteConfig.speakerNameUrdu}
                  </p>
                </div>

                {/* Real-time Live Audio Wave Indicator */}
                <div className="p-3 bg-[#0B281E]/80 border border-[#C5A059]/30 rounded-lg flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 h-6">
                    {[20, 40, 60, 80, 100, 80, 60, 40, 20].map((threshold, idx) => (
                      <span
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          isMicOn && audioLevel >= threshold
                            ? 'h-6 bg-[#C5A059]'
                            : 'h-2 bg-stone-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-urdu text-stone-200">
                    {isMicOn ? 'صوتی نشریات آن لائن جاری ہے' : 'مائیکروفون خاموش ہے'}
                  </span>
                </div>
              </div>
            )}

            {/* In-Video Status Badges */}
            <div className="absolute top-4 start-4 flex items-center gap-2 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded border border-white/10 z-10 font-sans">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isLive ? 'LIVE AUDIO' : 'SCHEDULED'}</span>
              <span aria-hidden="true" className="text-stone-500">|</span>
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{attendees.length}</span>
            </div>

            {/* Screen Sharing Indicator */}
            {isScreenSharing && (
              <div className="absolute bottom-4 end-4 bg-emerald-950/80 backdrop-blur-xs text-emerald-200 text-xs px-3 py-1 rounded border border-emerald-800 font-urdu z-10 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>اسکرین شیئرنگ جاری ہے</span>
              </div>
            )}
          </div>

          {/* Host Broadcast & Media Controls Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Microphone Toggle & Meter */}
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-md">
                  <button
                    onClick={toggleMic}
                    className={`p-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      isMicOn ? 'text-emerald-800 hover:bg-emerald-100' : 'text-rose-700 hover:bg-rose-100'
                    }`}
                    title={isMicOn ? t.muteMic : t.unmuteMic}
                  >
                    {isMicOn ? <Mic className="w-4 h-4 text-emerald-700" /> : <MicOff className="w-4 h-4 text-rose-600" />}
                  </button>

                  <div className="flex items-center gap-0.5 w-12 h-3" title={`صوتی سطح: ${audioLevel}%`}>
                    {[20, 40, 60, 80, 100].map((threshold) => (
                      <span
                        key={threshold}
                        className={`w-2 h-full rounded-xs transition-colors duration-75 ${
                          isMicOn && audioLevel >= threshold
                            ? threshold >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Native Screen Share Toggle */}
                <button
                  onClick={requestScreenShareWithPrivacy}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isScreenSharing
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4 text-[#0F382A]" />}
                  <span>{isScreenSharing ? 'اسکرین شیئر بند کریں' : 'اسکرین شیئر کریں'}</span>
                </button>

                {/* Session Recording Toggle */}
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  <Disc className={`w-4 h-4 ${isRecording ? 'animate-spin' : 'text-rose-600'}`} />
                  <span>{isRecording ? t.stopRecording : t.startRecording}</span>
                </button>

                {/* Questions Toggle */}
                <button
                  onClick={handleToggleQuestionsOpen}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    questionsOpen
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-600 border-stone-300'
                  }`}
                  title={questionsOpen ? 'سوالات کھلے ہیں' : 'سوالات بند ہیں'}
                >
                  {questionsOpen ? <Unlock className="w-4 h-4 text-emerald-700" /> : <Lock className="w-4 h-4 text-stone-500" />}
                  <span>{questionsOpen ? 'سوالات کھلے ہیں' : 'سوالات بند ہیں'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-600 font-urdu flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-700" />
                  <span>براہِ راست صوتی درس جاری ہے (صرف سننے کی اجازت ہے)</span>
                </span>
              </div>
            )}

            {/* Connection Health Indicator */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{connectionStatus === 'connected' ? 'رابطہ مستحکم ہے' : 'جاری رابطہ...'}</span>
            </div>
          </div>

          {/* Recording Finished Download / Archive Box */}
          {recordedBlobUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold font-urdu text-amber-900">
                  بیان کی ریکارُڈ شدہ فائل تیار ہے ({formatDuration(recordingSeconds)})
                </h4>
                <a
                  href={recordedBlobUrl}
                  download={`taleemuddeen-bayan-${selectedRoomCode}.webm`}
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  فائل ڈاؤن لوڈ کریں (.webm)
                </a>
              </div>
              <p className="text-xs text-amber-800 font-sans">
                آپ اس لائیو آڈیو اور اسکرین شیئرنگ ریکارڈنگ کو تعلیم الدین اکیڈمی کے عمومی کتب خانے میں شامل کر سکتے ہیں۔
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSaveToArchive}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors cursor-pointer"
                >
                  علمی آرکائیو میں محفوظ کریں
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Moderated Q&A / Live Chat / Attendees */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-stone-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('qna')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'qna'
                  ? 'border-b-2 border-[#0F382A] text-[#0F382A] font-semibold bg-stone-50/50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>سوال و جواب</span>
              {pendingQuestionsCount > 0 && isAdmin && (
                <span className="text-[10px] bg-amber-200 text-amber-900 font-mono px-1.5 py-0.2 rounded font-bold">
                  {pendingQuestionsCount}
                </span>
              )}
            </button>

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
              onClick={() => setActiveTab('attendees')}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'attendees'
                  ? 'border-b-2 border-[#0F382A] text-[#0F382A] font-semibold bg-stone-50/50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.attendeesList} ({attendees.length})</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {/* Moderated Q&A Tab */}
            {activeTab === 'qna' && (
              <div className="space-y-3">
                {isAdmin && (
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                    <span>مظور شدہ سوالات ہی حاضرین کے سامنے ظاہر ہوں گے۔</span>
                    <button
                      onClick={handleToggleQuestionsOpen}
                      className="text-[#0F382A] font-bold hover:underline cursor-pointer"
                    >
                      {questionsOpen ? 'سوالات بند کریں' : 'سوالات کھولیں'}
                    </button>
                  </div>
                )}

                {questionsQueue.length === 0 ? (
                  <div className="text-center text-stone-400 py-12 font-sans">
                    ابھی تک کوئی منظور شدہ سوال موجود نہیں ہے۔
                  </div>
                ) : (
                  questionsQueue.map((q) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border space-y-2 ${
                        q.pinned
                          ? 'bg-[#0F382A]/5 border-[#C5A059]'
                          : q.status === 'pending'
                          ? 'bg-amber-50/80 border-amber-300'
                          : q.status === 'approved'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-800 flex items-center gap-1">
                          {q.pinned && <Pin className="w-3 h-3 text-[#C5A059]" />}
                          <span>سوال از: {q.senderName}</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{q.timestamp}</span>
                      </div>

                      <p className="text-stone-800 font-sans leading-relaxed">{q.text}</p>

                      {/* Status badge for non-admin */}
                      {!isAdmin && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium pt-1">
                          {q.status === 'answered' ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> جواب دیا جا چکا ہے
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> منظور شدہ
                            </span>
                          )}
                        </div>
                      )}

                      {/* Host Moderation Control Suite */}
                      {isAdmin && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[11px]">
                          <div className="flex items-center gap-1">
                            {q.status !== 'approved' && (
                              <button
                                onClick={() => handleModerateQuestion(q.id, 'approve')}
                                className="px-2 py-1 bg-emerald-700 text-white rounded text-[10px] hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                                title="منظور کریں"
                              >
                                <ThumbsUp className="w-3 h-3" /> منظور کریں
                              </button>
                            )}

                            {q.status !== 'answered' && (
                              <button
                                onClick={() => handleModerateQuestion(q.id, 'answer')}
                                className="px-2 py-1 bg-[#0F382A] text-white rounded text-[10px] hover:bg-[#0B281E] cursor-pointer flex items-center gap-1"
                                title="جواب دیں"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#C5A059]" /> جواب دیں
                              </button>
                            )}

                            <button
                              onClick={() => handleModerateQuestion(q.id, 'pin')}
                              className={`px-2 py-1 rounded text-[10px] border cursor-pointer ${
                                q.pinned ? 'bg-[#C5A059] text-stone-900 border-[#C5A059]' : 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                              title="پن کریں"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {q.status === 'pending' && (
                              <button
                                onClick={() => handleModerateQuestion(q.id, 'reject')}
                                className="p-1 text-stone-500 hover:text-amber-700 rounded cursor-pointer"
                                title="مسترد کریں"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleModerateQuestion(q.id, 'delete')}
                              className="p-1 text-stone-500 hover:text-rose-600 rounded cursor-pointer"
                              title="حذف کریں"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-stone-400 py-12 font-sans">
                    {t.noChatYet}
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border ${
                        m.isHost ? 'bg-[#0F382A]/5 border-[#0F382A]/20' : 'bg-stone-50 border-stone-200'
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
              </div>
            )}

            {/* Attendees Tab */}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Input Box for Listener Question or Chat */}
          {activeTab === 'qna' && !isAdmin && (
            <form onSubmit={handleSubmitQuestion} className="p-3 border-t border-stone-200 bg-stone-50 space-y-2">
              {questionSubmittedMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-urdu">
                  سوال ارسال کر دیا گیا ہے اور جائزہ لے کر منظور کیا جائے گا۔
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  disabled={!questionsOpen}
                  placeholder={questionsOpen ? 'اپنا تحریری سوال ادب کے ساتھ لکھیں...' : 'سوالات فی الوقت بند ہیں'}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] disabled:bg-stone-100"
                />
                <button
                  type="submit"
                  disabled={!questionsOpen}
                  className="px-3.5 py-2 bg-[#0F382A] hover:bg-[#0B281E] disabled:bg-stone-300 text-white rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {activeTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اپنا پیغام تحریر کریں..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#0F382A] hover:bg-[#0B281E] text-white rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Screen Sharing Privacy Disclosure Modal */}
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
                  Taleem Ud Deen Academy Screen Privacy Protocol
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-700 bg-stone-50 p-4 rounded-lg border border-stone-200 font-urdu">
              <p>
                <strong>ضروری ہدایات برائے مفتی فیصل حیات صاحب:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>
                  براؤزر کے اگلے ڈائیلاگ میں صرف <strong>مطلوبہ درسی ٹیب (Tab)</strong> یا <strong>پی ڈی ایف / سلائیڈ ونڈو</strong> منتخب فرمائیں۔
                </li>
                <li>
                  پوری اسکرین (Entire Screen) منتخب کرنے سے پرہیز فرمائیں تاکہ کمپیوٹر کے ذاتی نوٹیفکیشن یا نجی فائلز سامنے نہ آئیں۔
                </li>
                <li>
                  اسکرین شیئرنگ کسی بھی وقت "اسکرین شیئر بند کریں" بٹن سے روکی جا سکتی ہے۔
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrivacyModal(false)}
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
