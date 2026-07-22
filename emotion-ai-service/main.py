from fastapi import FastAPI

app = FastAPI(
    title="Emotion AI Service",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "service": "Emotion AI Service",
        "status": "running",
        "version": "1.0.0"
    }