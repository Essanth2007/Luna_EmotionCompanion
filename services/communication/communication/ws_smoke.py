import asyncio,sys
try: import websockets
except Exception as e: print("WS_LIB_MISSING",e); sys.exit(0)
async def main():
    try:
        async with websockets.connect("ws://127.0.0.1:8002/ws/alice?token=token-alice", open_timeout=8) as ws:
            print("WS_OPEN_OK")
            for _ in range(15):
                try:
                    m=await asyncio.wait_for(ws.recv(),timeout=2); print("WS_MSG",m[:160]); break
                except asyncio.TimeoutError: continue
    except Exception as e: print("WS_ERROR",repr(e))
asyncio.run(main())
