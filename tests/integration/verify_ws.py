import asyncio, json, sys, websockets

WS = 'ws://localhost:8002'
token = sys.argv[1]
user = sys.argv[2]

async def main():
    url = f'{WS}/ws/{user}?token={token}'
    got = []
    try:
        async with websockets.connect(url, max_size=2**23, ping_interval=10) as ws:
            got.append('CONNECTED')
            try:
                await ws.send(json.dumps({'type': 'ping'}))
            except Exception as e:
                got.append('ping_err:' + str(e))
            while True:
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=25)
                    got.append('MSG:' + msg)
                except asyncio.TimeoutError:
                    got.append('TIMEOUT_NO_MORE')
                    break
                except Exception as e:
                    got.append('RECV_ERR:' + str(e))
                    break
    except Exception as e:
        got.append('CONNECT_ERR:' + str(e))
    with open('ws_out.txt', 'w') as f:
        f.write('\n'.join(got))

asyncio.run(main())
