from fastapi import APIRouter

router = APIRouter(prefix="/mcp")

@router.get("/health")
async def health():
    return {"status": "ok"}