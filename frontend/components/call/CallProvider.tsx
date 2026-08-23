'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { callSignaling, type CallMediaType } from '@/services/callSignaling';
import { getStoredUser } from '@/store/auth';
import { CallWindow } from './CallWindow';
import type { CallStatus, CallType, CallParticipant } from '@/types';

interface CallState {
  open: boolean;
  status: CallStatus;
  type: CallType;
  participant: CallParticipant | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

interface CallContextValue {
  startCall: (receiverId: string, receiverName: string, type: CallType) => void;
}

const CallContext = createContext<CallContextValue>({ startCall: () => {} });
export const useCall = () => useContext(CallContext);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CallState>({
    open: false,
    status: 'idle',
    type: 'audio',
    participant: null,
    localStream: null,
    remoteStream: null,
  });
  const [isMuted, setMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const user = getStoredUser();
    const myId = user?.id ? String(user.id) : 'demo';
    callSignaling.setup(myId, {
      onIncoming: (fromId, fromName, type, callId) => {
        setState({
          open: true,
          status: 'incoming',
          type,
          participant: { id: fromId, name: fromName },
          localStream: null,
          remoteStream: null,
        });
        void callId;
      },
      onRemoteStream: (stream) =>
        setState((s) => ({ ...s, remoteStream: stream, status: 'connected' })),
      onConnected: () => setState((s) => (s.status === 'connecting' ? { ...s, status: 'connected' } : s)),
      onCallEnded: () => setState((s) => ({ ...s, status: 'ended', open: false })),
      onError: (m) => console.error('[call]', m),
    });
    return () => {
      /* Keep the singleton WS subscription alive across React StrictMode remounts */
    };
  }, []);

  const startCall = useCallback((receiverId: string, receiverName: string, type: CallType) => {
    setMuted(false);
    setCameraOff(false);
    callSignaling
      .startCall(receiverId, type as CallMediaType)
      .then((local) => {
        setState({
          open: true,
          status: 'outgoing',
          type,
          participant: { id: receiverId, name: receiverName },
          localStream: local,
          remoteStream: null,
        });
        setState((s) => ({ ...s, status: 'connecting' }));
      })
      .catch((e) => console.error('startCall failed', e));
  }, []);

  const accept = useCallback(() => {
    callSignaling
      .acceptCall()
      .then((local) => {
        setState((s) => ({ ...s, status: 'connecting', localStream: local }));
        setTimeout(() => {
          setState((s) => (s.status === 'connecting' ? { ...s, status: 'connected' } : s));
        }, 1200);
      })
      .catch((e) => console.error('acceptCall failed', e));
  }, []);

  const end = useCallback(() => {
    callSignaling.endCall();
    setState((s) => ({ ...s, status: 'ended', open: false, localStream: null, remoteStream: null }));
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((p) => {
      const next = !p;
      stateRef.current.localStream?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOff((p) => {
      const next = !p;
      stateRef.current.localStream?.getVideoTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  return (
    <CallContext.Provider value={{ startCall }}>
      {children}
      {state.open && state.participant && (
        <CallWindow
          type={state.type}
          participant={state.participant}
          status={state.status}
          localStream={state.localStream}
          remoteStream={state.remoteStream}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onAccept={state.status === 'incoming' ? accept : undefined}
          onEnd={end}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
        />
      )}
    </CallContext.Provider>
  );
}
