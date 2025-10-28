"""
STT (Speech-to-Text) API
Whisper API를 사용하여 음성을 텍스트로 변환
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from openai import OpenAI
import os
import tempfile
from typing import Dict

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(..., description="오디오 파일 (webm, mp3, wav 등)")
) -> Dict[str, str]:
    """
    음성을 텍스트로 변환
    
    Args:
        audio: 업로드된 오디오 파일
        
    Returns:
        Dict: {"text": "변환된 텍스트"}
    """
    try:
        # 임시 파일로 저장 (Whisper API는 파일 경로가 필요)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Whisper API 호출
        with open(temp_audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ko"  # 한국어 지정
            )
        
        # 임시 파일 삭제
        os.unlink(temp_audio_path)
        
        return {
            "text": transcription.text
        }
        
    except Exception as e:
        # 에러 시 임시 파일 정리
        if 'temp_audio_path' in locals():
            try:
                os.unlink(temp_audio_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail=f"음성 변환 실패: {str(e)}"
        )


@router.post("/transcribe-realtime")
async def transcribe_audio_realtime(
    audio: UploadFile = File(...),
    language: str = "ko"
) -> Dict[str, str]:
    """
    실시간 음성 변환 (짧은 음성 최적화)
    
    Args:
        audio: 업로드된 오디오 파일
        language: 언어 코드 (기본: ko)
        
    Returns:
        Dict: {"text": "변환된 텍스트", "language": "ko"}
    """
    try:
        # 파일 크기 확인 (10MB 제한)
        content = await audio.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=400,
                detail="파일 크기가 너무 큽니다 (최대 10MB)"
            )
        
        # 임시 파일 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Whisper API 호출
        with open(temp_audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="text"  # 텍스트만 반환
            )
        
        # 임시 파일 삭제
        os.unlink(temp_audio_path)
        
        # response_format="text"일 때는 문자열로 반환됨
        text = transcription if isinstance(transcription, str) else transcription.text
        
        return {
            "text": text,
            "language": language
        }
        
    except Exception as e:
        if 'temp_audio_path' in locals():
            try:
                os.unlink(temp_audio_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail=f"실시간 음성 변환 실패: {str(e)}"
        )

