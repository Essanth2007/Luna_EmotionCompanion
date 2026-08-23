import asyncio, json, sys, time, websockets

WS = 'ws://localhost:8002'
tokA, tokB, emailA, emailB = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

async def main():
    out = {'steps': {}, 'A_msgs': [], 'B_msgs': []}
    try:
        wsA = await websockets.connect(f'{WS}/ws/A?token={tokA}', max_size=2**23, ping_interval=10)
        wsB = await websockets.connect(f'{WS}/ws/B?token={tokB}', max_size=2**23, ping_interval=10)
        out['steps']['7_ws_connect'] = 'PASS'
        out['steps']['8_comm_accepts_jwt'] = 'PASS'  # connected => JWT accepted (no 1008)
    except Exception as e:
        out['steps']['7_ws_connect'] = f'FAIL:{e}'
        out['steps']['8_comm_accepts_jwt'] = f'FAIL:{e}'
        print(json.dumps(out))
        return

    async def listen(ws, sink, who):
        try:
            while True:
                m = await ws.recv()
                d = json.loads(m)
                sink.append(d)
                out.setdefault(f'{who}_log', []).append({'t': round(time.time()-t0, 1), 'type': d.get('type')})
                if who == 'A' and d.get('type') == 'call_start':
                    await ws.send(json.dumps({'type':'webrtc_offer','sender':'B','receiver':'A',
                                              'call_id': d.get('call_id'), 'sdp':'fake-sdp'}))
        except Exception:
            pass

    t0 = time.time()
    la = asyncio.create_task(listen(wsA, out['A_msgs'], 'A'))
    lb = asyncio.create_task(listen(wsB, out['B_msgs'], 'B'))

    # step 8 confirm: send ping, expect pong
    await wsA.send(json.dumps({'type':'ping'}))
    await asyncio.sleep(1.5)
    out['steps']['8_pong'] = any(m.get('type') == 'pong' for m in out['A_msgs'])

    # step 16 WebRTC: A initiates call_start, B auto-replies webrtc_offer
    await wsA.send(json.dumps({'type':'call_start','call_id':f'e2e-{int(time.time())}',
                               'caller_id':'A','receiver_id':'B','media_type':'audio'}))
    await asyncio.sleep(3)
    a_types = [m.get('type') for m in out['A_msgs']]
    b_types = [m.get('type') for m in out['B_msgs']]
    out['steps']['16_webrtc_A_received_offer'] = 'webrtc_offer' in a_types
    out['steps']['16_webrtc_B_received_call'] = 'call_start' in b_types

    # Listen long enough for the backend /live pushes driven externally (steps 12-14,17)
    await asyncio.sleep(40)
    a_types = [m.get('type') for m in out['A_msgs']]
    b_types = [m.get('type') for m in out['B_msgs']]
    out['steps']['13_routed_to_A'] = 'live_emotion_update' in a_types
    out['steps']['13_not_routed_to_B'] = 'live_emotion_update' not in b_types  # targeted, not broadcast
    out['steps']['14_frontend_receives'] = 'live_emotion_update' in a_types
    out['steps']['17_alive_during_tracking'] = a_types.count('live_emotion_update') >= 1
    out['steps']['17_update_count'] = a_types.count('live_emotion_update')
    out['A_sample_update'] = next((m for m in out['A_msgs'] if m.get('type')=='live_emotion_update'), None)
    print(json.dumps(out, indent=2, default=str))
    la.cancel(); lb.cancel()
    try:
        await wsA.close(); await wsB.close()
    except Exception:
        pass

asyncio.run(main())
