from fastapi import FastAPI, Response
import asyncio, os, time

app = FastAPI()

@app.get("/json")
async def json_endpoint(delay_ms: int = 0, status: int = 200):
    """
    Returns small JSON. Use ?delay_ms=NN to simulate server think-time.
    """
    if delay_ms > 0:
        await asyncio.sleep(delay_ms / 1000)
    return Response(
        content=f'{{"ok":true,"ts":{time.time()},"delay_ms":{delay_ms}}}',
        media_type="application/json",
        status_code=status,
    )

@app.get("/bytes")
async def bytes_endpoint(bytes: int = 0, delay_ms: int = 0, status: int = 200):
    """
    Returns N random bytes. Use this to test download throughput/latency.
    """
    if delay_ms > 0:
        await asyncio.sleep(delay_ms / 1000)
    data = os.urandom(max(0, bytes))
    return Response(content=data, media_type="application/octet-stream", status_code=status)
