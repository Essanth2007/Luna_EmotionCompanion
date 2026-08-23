import asyncio, json, sys, time, websockets

WS = 'ws://localhost:8002'
tokA, tokB = sys.argv[1], sys.argv[2]

async def main():
    res = {}
    wsA = await websockets.connect(f'{WS}/ws/A?token={tokA}', max_size=2**23, ping_interval=10)
    wsB = await websockets.connect(f'{WS}/ws/B?token={tokB}', max_size=2**23, ping_interval=10)
    a = []
    async def lA():
        try:
            while True:
                a.append(json.loads(await wsA.recv()))
        except Exception:
            pass
    ta = asyncio.create_task(lA())

    call_id = f'wr-{int(time.time())}'
    # A -> B : call_start
    await wsA.send(json.dumps({'type':'call_start','call_id':call_id,'caller_id':'A','receiver_id':'B','media_type':'audio'}))
    mb = json.loads(await wsB.recv())
    res['B_received_call_start'] = mb.get('type') == 'call_start'

    # B -> A : webrtc_offer
    await wsB.send(json.dumps({'type':'webrtc_offer','sender':'B','receiver':'A','call_id':call_id,'sdp':'fake'}))
    await asyncio.sleep(2)
    res['A_received_webrtc_offer'] = any(x.get('type') == 'webrtc_offer' for x in a)

    # A -> B : webrtc_answer
    await wsA.send(json.dumps({'type':'webrtc_answer','sender':'A','receiver':'B','call_id':call_id,'sdp':'fake'}))
    mb2 = json.loads(await wsB.recv())
    res['B_received_webrtc_answer'] = mb2.get('type') == 'webrtc_answer'

    # A -> B : ice candidate
    await wsA.send(json.dumps({'type':'webrtc_ice_candidate','sender':'A','receiver':'B','call_id':call_id,'candidate':'c1'}))
    mb3 = json.loads(await wsB.recv())
    res['B_received_ice'] = mb3.get('type') == 'webrtc_ice_candidate'

    print(json.dumps(res))
    ta.cancel()
    await wsA.close(); await wsB.close()

asyncio.run(main())
