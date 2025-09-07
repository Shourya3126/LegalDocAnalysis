from fastapi import APIRouter, UploadFile, File, HTTPException
from src.services.llm_orchestrator import LLMOrchestrator
from src.utils.pdf_processor import extract_text_from_pdf
import uuid
import os
import tempfile

router = APIRouter(prefix="/mcp/analyze", tags=["analysis"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    doc_id = str(uuid.uuid4())
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        
        # Use platform-appropriate temp directory
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"{doc_id}.txt")
        
        with open(temp_file_path, "w", encoding="utf-8") as f:
            f.write(text)
        
        return {"doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.post("/query")
async def query_document(request: dict):
    doc_id = request.get("doc_id")
    query = request.get("query")
    
    if not doc_id or not query:
        raise HTTPException(status_code=400, detail="doc_id and query are required")
    
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, f"{doc_id}.txt")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    
    with open(file_path, "r", encoding="utf-8") as f:
        doc_text = f.read()
    
    llm = LLMOrchestrator()
    try:
        response = llm.analyze(doc_text, query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")