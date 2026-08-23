/**
 * Call Service
 * Provides a clean interface for audio/video calls.
 * The WebRTC signaling layer is prepared here — replace the mock adapter
 * with a real WebSocket/signaling server when the backend is ready.
 */

import type { Call, CallHistoryEntry, CallType } from '@/types';

// ─── Mock call history ────────────────────────────────────────────────────────

const mockHistory: CallHistoryEntry[] = [
  {
    id: '1',
    type: 'video',
    participant: { id: 'luna', name: 'Luna AI', avatar: undefined },
    status: 'answered',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    duration: 720,
  },
  {
    id: '2',
    type: 'audio',
    participant: { id: 'luna', name: 'Luna AI', avatar: undefined },
    status: 'answered',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    duration: 480,
  },
  {
    id: '3',
    type: 'audio',
    participant: { id: 'luna', name: 'Luna AI', avatar: undefined },
    status: 'missed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: '4',
    type: 'video',
    participant: { id: 'luna', name: 'Luna AI', avatar: undefined },
    status: 'answered',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
    duration: 960,
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export const callService = {
  /**
   * Initiate a call.
   * In production this would create a WebRTC offer and send it via signaling.
   */
  initiateCall: async (receiverId: string, type: CallType): Promise<{ data: Call | null; error: string | null }> => {
    // TODO: replace with real WebRTC signaling
    // const offer = await peerConnection.createOffer();
    // return signaling.emit('call:initiate', { receiverId, type, offer });
    return {
      data: {
        callId:     Date.now().toString(),
        callerId:   'current_user',
        receiverId,
        type,
        status:     'outgoing',
        startedAt:  new Date().toISOString(),
      },
      error: null,
    };
  },

  /**
   * Accept an incoming call.
   */
  acceptCall: async (callId: string): Promise<{ data: Call | null; error: string | null }> => {
    // TODO: create answer and send via signaling
    return {
      data: { callId, callerId: 'remote', receiverId: 'current_user', type: 'audio', status: 'connected' },
      error: null,
    };
  },

  /**
   * Reject / end a call.
   */
  endCall: async (_callId: string): Promise<{ data: null; error: string | null }> => {
    // TODO: signaling.emit('call:end', { callId });
    return { data: null, error: null };
  },

  /**
   * Reject a call.
   */
  rejectCall: async (_callId: string): Promise<{ data: null; error: string | null }> => {
    // TODO: signaling.emit('call:reject', { callId });
    return { data: null, error: null };
  },

  /**
   * Get call history.
   */
  getHistory: async (): Promise<{ data: CallHistoryEntry[]; error: string | null }> => {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockHistory, error: null };
  },

  /**
   * Save a completed call to history (called locally after hang-up).
   */
  saveToHistory: (entry: CallHistoryEntry): void => {
    mockHistory.unshift(entry);
  },
};
