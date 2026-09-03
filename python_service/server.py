"""
The Hayatabad Model School - Face Recognition FastAPI Microservice
Runs on localhost:8001 providing instant face verification and identification APIs.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import sys
import os

# Ensure current folder is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from face_engine import verify_two_faces, identify_live_face

app = FastAPI(
    title="The Hayatabad Model School Face Recognition Service",
    description="High-performance real-time face matching service for student attendance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifyRequest(BaseModel):
    live_image: str
    admission_image: str
    threshold: Optional[float] = 70.0


class CandidateStudent(BaseModel):
    id: str
    studentId: str
    fullName: str
    photoUrl: str
    rollNo: Optional[str] = None
    className: Optional[str] = None
    sectionName: Optional[str] = None


class IdentifyRequest(BaseModel):
    live_image: str
    candidates: List[dict]
    threshold: Optional[float] = 68.0


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Hayatabad Model School Face Recognition Microservice",
        "version": "1.0.0"
    }


@app.post("/verify")
def verify_endpoint(req: VerifyRequest):
    if not req.live_image:
        raise HTTPException(status_code=400, detail="live_image is required")
    if not req.admission_image:
        raise HTTPException(status_code=400, detail="admission_image is required")

    result = verify_two_faces(
        live_source=req.live_image,
        admission_source=req.admission_image,
        threshold=req.threshold or 70.0
    )
    return result


@app.post("/identify")
def identify_endpoint(req: IdentifyRequest):
    if not req.live_image:
        raise HTTPException(status_code=400, detail="live_image is required")
    if not req.candidates or len(req.candidates) == 0:
        raise HTTPException(status_code=400, detail="candidates list is empty")

    result = identify_live_face(
        live_source=req.live_image,
        candidates=req.candidates,
        threshold=req.threshold or 68.0
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
