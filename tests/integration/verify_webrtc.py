import asyncio, json, sys, time, websockets

WS = 'ws://localhost:8002'
tokA, tokB = sys.argv[1], sys.argv[2]

async def client(token, user, user_other, label):
    url = f'{WS}/ws/{user}?token={token}'
    print(f'[{label}] connecting {url}', flush=True)
    try:
        async with websockets.connect(url, max_size=2**23, ping_interval=10) as ws:
            print(f'[{label}] CONNECTED', flush=True)
            if label == 'A':
                await asyncio.sleep(2)
                call = {'type':'call_start','call_id':f'call-{int(time.time())}','caller_id':user,'receiver_id':user_other,'media_type':'audio'}
                print(f'[{label}] SEND call_start', flush=True)
                await ws.send(json.dumps(call))
            while True:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=10)
                except asyncio.TimeoutError:
                    print(f'[{label}] timeout', flush=True)
                    break
                m = json.loads(raw)
                print(f'[{label}] RECV {m.get("type")}', flush=True)
                if label == 'B' and m.get('type') == 'call_start':
                    offer = {'type':'webrtc_offer','sender':user,'receiver':m.get('caller_id'),'call_id':m.get('call_id'),'sdp':'fake'}
                    print(f'[{label}] SEND webrtc_offer', flush=True)
                    await ws.send(json.dumps(offer))
    except Exception as e:
        print(f'[{label}] ERROR {e!r}', flush=True)

async def main():
    a = asyncio.create_task(client(tokA, 'qa', 'qa2', 'A'))
    await asyncio.sleep(1)
    b = asyncio.create_task(client(tokB, 'qa2', 'qa', 'B'))
    await asyncio.gather(a, b)

asyncio.run(main())
