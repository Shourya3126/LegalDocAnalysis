from pydantic import BaseModel

class UploadResponse(BaseModel):
    doc_id: str

class QueryRequest(BaseModel):
    doc_id: str
    query: str

class QueryResponse(BaseModel):
    response: str

class ClauseResponse(BaseModel):
    clause_text: str