from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
import os

def create_agent():
    client = MultiServerMCPClient(
        {
            "legal_analysis": {
                "transport": "streamable_http",
                "url": os.getenv("MCP_URL")
            }
        }
    )
    tools = client.get_tools()
    return create_react_agent("openrouter/openai/gpt-4o", tools)