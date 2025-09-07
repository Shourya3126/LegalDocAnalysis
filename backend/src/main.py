from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from src.routes import analysis, health

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers with /mcp prefix (existing)
app.include_router(analysis.router)
app.include_router(health.router)

# Include routers at root level for Cequence compatibility
# Create new routers without the /mcp prefix
from src.routes import analysis, health

# Create root-level analysis router
root_analysis_router = APIRouter(prefix="/analyze", tags=["analysis"])
root_analysis_router.add_api_route("/upload", analysis.upload_file, methods=["POST"])
root_analysis_router.add_api_route("/query", analysis.query_document, methods=["POST"])

# Create root-level health router  
root_health_router = APIRouter(prefix="", tags=["health"])
root_health_router.add_api_route("/health", health.health, methods=["GET"])

app.include_router(root_analysis_router)
app.include_router(root_health_router)