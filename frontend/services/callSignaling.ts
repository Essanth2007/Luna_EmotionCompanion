// WebRTC call signaling over the Luna Communication WebSocket.
//
// Drives an RTCPeerConnection and exchanges offer/answer/ICE through the
// already-running Communication Service (ws://<host>:8002). The signaling
// server broadcasts events to all peers except the sender, so each client
// filters by `receiver === myId`.

import { communication } from './communication';

export type CallMediaType = 'audio' | 'video';

interface SignalingHandlers {
  onIncoming: (fromId: string, fromName: string, type: CallMediaType, callId: string) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnected: () => void;
  onCallEnded: () => void;
  onError: (message: string) => void;
}

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

class CallSignaling {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private myId: string | null = null;
  private peerId: string | null = null;
  private type: CallMediaType = 'audio';
  private pendingOffer: { fromId: string; sdp: any; callId: string } | null = null;
  private handlers: SignalingHandlers | null = null;
  private setupDone = false;

  setup(myId: string, handlers: SignalingHandlers): void {
    this.myId = myId;
    // Always keep the latest handlers (covers React StrictMode remounts).
    this.handlers = handlers;
    if (this.setupDone) return;

    communication.connect(myId);

    communication.on('call_start', (m: any) => {
      if (m.receiver_id && m.receiver_id !== this.myId) return;
      if (m.caller_id === this.myId) return;
      this.handlers?.onIncoming(
        m.caller_id,
        m.caller_id,
        (m.media_type as CallMediaType) || 'audio',
        m.call_id || `${m.caller_id}-${Date.now()}`,
      );
    });

    communication.on('webrtc_offer', (m: any) => {
      if (m.receiver !== this.myId) return;
      this.pendingOffer = { fromId: m.sender, sdp: m.sdp, callId: m.call_id || '' };
    });

    communication.on('webrtc_answer', (m: any) => {
      if (m.receiver !== this.myId) return;
      this.receiveAnswer(m.sdp);
    });

    communication.on('webrtc_ice_candidate', (m: any) => {
      if (m.receiver !== this.myId) return;
      this.receiveIce(m.candidate);
    });

    communication.on('call_end', () => {
      this.handlers?.onCallEnded();
      this.cleanup();
    });

    this.setupDone = true;
  }

  private ensurePc(): RTCPeerConnection {
    if (!this.pc) {
      this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      this.pc.onicecandidate = (e) => {
        if (e.candidate && this.peerId) {
          communication.send('webrtc_ice_candidate', {
            sender: this.myId,
            receiver: this.peerId,
            candidate: e.candidate,
          });
        }
      };
      this.pc.ontrack = (e) => {
        this.handlers?.onRemoteStream(e.streams[0]);
      };
    }
    return this.pc;
  }

  // ── Outgoing ────────────────────────────────────────────────────────────────
  async startCall(receiverId: string, type: CallMediaType): Promise<MediaStream> {
    this.peerId = receiverId;
    this.type = type;
    const stream = await navigator.mediaDevices.getUserMedia(
      type === 'video' ? { video: true, audio: true } : { audio: true },
    );
    this.localStream = stream;
    const pc = this.ensurePc();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const callId = `${this.myId}-${Date.now()}`;
    communication.send('call_start', {
      call_id: callId,
      caller_id: this.myId,
      receiver_id: receiverId,
      media_type: type,
    });
    communication.send('webrtc_offer', {
      sender: this.myId,
      receiver: receiverId,
      sdp: offer.sdp,
      call_id: callId,
    });
    return stream;
  }

  // ── Incoming ────────────────────────────────────────────────────────────────
  async acceptCall(): Promise<MediaStream> {
    if (!this.pendingOffer) {
      throw new Error('No pending offer to accept');
    }
    const { fromId, sdp, callId } = this.pendingOffer;
    this.peerId = fromId;
    this.pendingOffer = null;

    const stream = await navigator.mediaDevices.getUserMedia(
      this.type === 'video' ? { video: true, audio: true } : { audio: true },
    );
    this.localStream = stream;
    const pc = this.ensurePc();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    communication.send('webrtc_answer', {
      sender: this.myId,
      receiver: fromId,
      sdp: answer.sdp,
      call_id: callId,
    });
    return stream;
  }

  rejectCall(): void {
    communication.send('call_reject', {
      call_id: `${this.myId}-${Date.now()}`,
      user_id: this.myId,
    });
    this.pendingOffer = null;
    this.cleanup();
  }

  private async receiveAnswer(sdp: any): Promise<void> {
    if (this.pc) await this.pc.setRemoteDescription({ type: 'answer', sdp });
    this.handlers?.onConnected();
  }

  private async receiveIce(candidate: any): Promise<void> {
    try {
      if (this.pc && candidate) await this.pc.addIceCandidate(candidate);
    } catch {
      /* ignore late candidates */
    }
  }

  endCall(): void {
    communication.send('call_end', {
      call_id: `${this.myId}-${Date.now()}`,
      user_id: this.myId,
    });
    this.handlers?.onCallEnded();
    this.cleanup();
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  private cleanup(): void {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.peerId = null;
  }
}

export const callSignaling = new CallSignaling();
