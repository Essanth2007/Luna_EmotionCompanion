import asyncio, json, time, wave, io, os
import websockets, httpx

WS = 'ws://localhost:8002'
BE = 'http://localhost:8000'
EMAIL_A = 'e2e@example.com'
EMAIL_B = 'e2e2@example.com'
PWD = 'secret123'


def make_wav(path):
    sr = 16000
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        import struct, math
        for i in range(sr):
            v = int(12000 * math.sin(2 * math.pi * 220 * i / sr))
            w.writeframes(struct.pack('<h', v))


def login(email):
    r = httpx.post(f'{BE}/api/v1/auth/login',
                   data={'username': email, 'password': PWD}, timeout=10)
    r.raise_for_status()
    return r.json()['access_token']


async def main():
    out = {}
    tokA, tokB = login(EMAIL_A), login(EMAIL_B)
    a_msgs, b_msgs = [], []
    wav = os.path.join(os.path.dirname(__file__), 'sample.wav')
    make_wav(wav)

    async def listen(ws, sink):
        try:
            while True:
                m = json.loads(await ws.recv()); sink.append(m)
        except Exception:
            pass

    wsA = await websockets.connect(f'{WS}/ws/A?token={tokA}', max_size=2**23)
    wsB = await websockets.connect(f'{WS}/ws/B?token={tokB}', max_size=2**23)
    la = asyncio.create_task(listen(wsA, a_msgs))
    lb = asyncio.create_task(listen(wsB, b_msgs))

    # ---- WebRTC: both directions ----
    await wsA.send(json.dumps({'type': 'call_start', 'call_id': 'e2e-test',
                               'caller_id': 'A', 'receiver_id': 'B', 'media_type': 'audio'}))
    await asyncio.sleep(2)
    # B auto-replies offer -> A should receive
    if any(m.get('type') == 'call_start' for m in b_msgs):
        await wsB.send(json.dumps({'type': 'webrtc_offer', 'sender': 'B',
                                   'receiver': 'A', 'call_id': 'e2e-test', 'sdp': 'fake'}))
    await asyncio.sleep(2)
    if any(m.get('type') == 'webrtc_offer' for m in a_msgs):
        await wsA.send(json.dumps({'type': 'webrtc_answer', 'sender': 'A',
                                   'receiver': 'B', 'call_id': 'e2e-test', 'sdp': 'fake'}))
    await asyncio.sleep(1)
    await wsA.send(json.dumps({'type': 'webrtc_ice_candidate', 'sender': 'A',
                               'receiver': 'B', 'call_id': 'e2e-test', 'candidate': 'c1'}))
    await wsB.send(json.dumps({'type': 'webrtc_ice_candidate', 'sender': 'B',
                               'receiver': 'A', 'call_id': 'e2e-test', 'candidate': 'c2'}))
    await asyncio.sleep(2)

    a_types = [m.get('type') for m in a_msgs]
    b_types = [m.get('type') for m in b_msgs]
    out['webrtc_B_received_call'] = 'call_start' in b_types
    out['webrtc_A_received_offer'] = 'webrtc_offer' in a_types
    out['webrtc_B_received_answer'] = 'webrtc_answer' in b_types
    out['webrtc_A_received_ice'] = 'webrtc_ice_candidate' in a_types
    out['webrtc_B_received_ice'] = 'webrtc_ice_candidate' in b_types

    # ---- Live emotion: trigger analysis as A, expect targeted delivery ----
    with open(wav, 'rb') as f:
        files = {'audio': ('sample.wav', f, 'audio/wav')}
        r = httpx.post(f'{BE}/api/v1/analysis/live?session_id=TESTSESS',
                       files=files, headers={'Authorization': f'Bearer {tokA}'}, timeout=30)
    out['analysis_status'] = r.status_code
    out['analysis_body'] = r.json() if r.status_code < 300 else r.text
    await asyncio.sleep(4)

    a_types = [m.get('type') for m in a_msgs]
    b_types = [m.get('type') for m in b_msgs]
    out['live_A_received'] = 'live_emotion_update' in a_types
    out['live_B_not_received'] = 'live_emotion_update' not in b_types  # targeted, not broadcast
    out['live_A_update'] = next((m for m in a_msgs if m.get('type') == 'live_emotion_update'), None)

    la.cancel(); lb.cancel()
    try:
        await wsA.close(); await wsB.close()
    except Exception:
        pass
    try:
        os.remove(wav)
    except Exception:
        pass

    all_ok = all([
        out['webrtc_B_received_call'], out['webrtc_A_received_offer'],
        out['webrtc_B_received_answer'], out['webrtc_A_received_ice'],
        out['webrtc_B_received_ice'], out['analysis_status'] == 200,
        out['live_A_received'], out['live_B_not_received'],
    ])
    out['RESULT'] = 'PASS' if all_ok else 'FAIL'
    print(json.dumps(out, indent=2, default=str))
    raise SystemExit(0 if all_ok else 1)


asyncio.run(main())
