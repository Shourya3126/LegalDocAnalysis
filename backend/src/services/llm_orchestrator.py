from openai import OpenAI
from src.config import Config
import os

class LLMOrchestrator:
    def __init__(self):
        Config.validate()
        # Choose base URL and key based on gateway toggle
        if Config.CEQUENCE_ENABLED:
            base_url = Config.CEQUENCE_BASE_URL
        else:
            base_url = Config.OPENROUTER_BASE_URL

        self.client = OpenAI(
            base_url=base_url,
            api_key=os.getenv("OPENAI_API_KEY")
        )

    def analyze(self, doc_text: str, query: str, persona: str = "lawyer"):
        prompt = f"As a {persona}, analyze legal document: {doc_text[:1000]}. {query}"
        model = "openai/gpt-4o-mini" if "simple" in query.lower() else "openai/gpt-4o-mini"
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"LLM API error: {str(e)}")