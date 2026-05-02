from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import pytesseract
from PIL import Image
import io
import platform

from profile_analyzer import ProfileAnalyzer

load_dotenv()

# Set Tesseract path for Windows if not in PATH
if platform.system() == "Windows":
    default_tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(default_tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = default_tesseract_path

app = FastAPI(title="AI LinkedIn Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# DATA MODELS
# ==============================
class ProfileInput(BaseModel):
    target_role: str
    resume_text: str
    linkedin_profile_text: str

class ProfileResponse(BaseModel):
    ats_score: float
    skill_match_percent: float
    missing_skills: List[str]
    suggestions: List[str]
    linkedin_suggestions: Dict[str, Any]
    semantic_similarity_score: float
    predicted_roles: Optional[List[str]] = None

# ==============================
# ENDPOINTS
# ==============================
@app.post("/analyze", response_model=ProfileResponse)
async def analyze_profile_endpoint(input_data: ProfileInput):
    """
    Main analysis endpoint using the ProfileAnalyzer model.
    """
    if not input_data.resume_text and not input_data.linkedin_profile_text:
        raise HTTPException(status_code=400, detail="At least one profile text (Resume or LinkedIn) is required")
    
    try:
        # Initialize analyzer for the specific role
        analyzer = ProfileAnalyzer(input_data.target_role)
        
        # Perform analysis
        result = analyzer.analyze(input_data.resume_text, input_data.linkedin_profile_text)
        
        # Debug logging to identify structure
        print(f"--- [DEBUG] AI Service Analyze Response ---")
        print(f"ATS Score: {result.get('ATS Score')}")
        print(f"LinkedIn Suggestions keys: {list(result.get('LinkedIn Suggestions', {}).keys())}")
        print(f"-------------------------------------------")

        # Map result to the response model (converting keys to match Pydantic model)
        return ProfileResponse(
            ats_score=result["ATS Score"],
            skill_match_percent=result["Skill Match %"],
            missing_skills=result["Missing Skills"],
            suggestions=result["Suggestions"],
            linkedin_suggestions=result["LinkedIn Suggestions"],
            semantic_similarity_score=result["Semantic Similarity Score"],
            predicted_roles=result.get("Predicted Roles", [])
        )
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal analysis error: {str(e)}")

@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded image using Tesseract OCR.
    """
    try:
        # Check if Tesseract is installed
        try:
            pytesseract.get_tesseract_version()
        except Exception:
            raise HTTPException(
                status_code=400, 
                detail="Tesseract OCR engine not found on the server. Please install it to use image-to-text features."
            )

        # Read file contents
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image file received.")
            
        image = Image.open(io.BytesIO(contents))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        if not text.strip():
            return {"text": "", "message": "No text detected in the image or image quality is too low."}
            
        return {"text": text.strip()}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}

if __name__ == "__main__":
    import uvicorn
    # Check for Tesseract engine at startup
    try:
        pytesseract.get_tesseract_version()
    except Exception:
        print("\n" + "!" * 50)
        print("WARNING: TESSERACT OCR NOT FOUND")
        print("Image extraction will fail until Tesseract is installed.")
        print("Download at: https://github.com/UB-Mannheim/tesseract/wiki")
        print("!" * 50 + "\n")
        
    uvicorn.run(app, host="127.0.0.1", port=8000)
    