import os
from dotenv import load_dotenv

# Load .env file from project root
load_dotenv()

# Map OPENROUTER_API_KEY to OPENAI_API_KEY
if os.getenv("OPENROUTER_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY")

class Config:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    # Cequence AI Gateway settings
    CEQUENCE_ENABLED = os.getenv("CEQUENCE_ENABLED", "false").lower() in ("1", "true", "yes")
    CEQUENCE_BASE_URL = os.getenv("CEQUENCE_BASE_URL", "https://legalmind.cequence.ai/v1")
    CEQUENCE_MCP_ENDPOINT = os.getenv("CEQUENCE_MCP_ENDPOINT", "https://ztaip-y087xwfe-4xp4r634bq-uc.a.run.app/mcp")
    CEQUENCE_SSE_ENDPOINT = os.getenv("CEQUENCE_SSE_ENDPOINT", "https://ztaip-y087xwfe-4xp4r634bq-uc.a.run.app/sse")

    @classmethod
    def validate(cls):
        # If Cequence gateway is enabled, we skip OpenRouter requirement
        if not cls.CEQUENCE_ENABLED:
            if not cls.OPENROUTER_API_KEY:
                raise ValueError("OPENROUTER_API_KEY is not set in .env file")