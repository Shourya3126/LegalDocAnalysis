## Cequence AI Gateway Integration

This project can route LLM traffic through the Cequence AI Gateway or OpenRouter.

### Toggle

Set environment variable to enable Cequence:

```
CEQUENCE_ENABLED=true
CEQUENCE_BASE_URL=https://legalmind.cequence.ai/v1
CEQUENCE_MCP_ENDPOINT=https://ztaip-y087xwfe-4xp4r634bq-uc.a.run.app/mcp
CEQUENCE_SSE_ENDPOINT=https://ztaip-y087xwfe-4xp4r634bq-uc.a.run.app/sse
```

When disabled (default), the app uses OpenRouter. Ensure `OPENROUTER_API_KEY` is present.

### Auth

The gateway uses OAuth 2.0 Client Credentials with global scope "Agent Integration". Tokens are handled by the gateway; no additional app config is required.

### Notes

- SSE is deprecated from MCP; prefer streamable HTTP when available.
- Backend code selects the base URL via `Config.CEQUENCE_ENABLED`.
AgentLegal: Legal Document Analysis MCP Server
Overview
AgentLegal is a Multi-Cloud Proxy (MCP) server enabling autonomous agents to analyze legal documents via OpenRouter LLMs. Built with FastAPI (backend), React (frontend), and proxied by Cequence AI Gateway, it supports document uploads, clause extraction, and natural language queries. Hosted on Render; MCP published on Smithery.
Setup

Backend (Render):

Repo: agentlegal-backend.
Deploy: Sign in to render.com (no credit card), link GitHub repo, set:
Environment: Python 3.
Build: pip install -r requirements.txt.
Start: uvicorn src.main:app --host 0.0.0.0 --port $PORT.
Env Vars: OPENROUTER_API_KEY=your_key.


URL: https://agentlegal-backend.onrender.com.


Frontend (Render):

Repo: agentlegal-frontend.
Deploy: Link repo, set:
Build: npm install && npm run build.
Publish: build.
Env Vars: REACT_APP_MCP_URL=https://agentlegal-mcp.cequence.ai/mcp.


URL: https://agentlegal-frontend.onrender.com.


Cequence AI Gateway:

Log in (hackathon credentials).
Create App: Upload docs/openapi.json.
Create MCP Server:
Base URL: https://agentlegal-backend.onrender.com.
Path Prefix: /mcp.
Auth: None (public for demo; secure at gateway if needed).
Scopes: legal:read, legal:write, llm:invoke.
Policies: Rate-limit (100/min for legal:write), threat detection.


Deploy: Get MCP URL (e.g., https://agentlegal-mcp.cequence.ai/mcp).
Test: curl https://agentlegal-mcp.cequence.ai/mcp/health.


Smithery:

Go to https://smithery.ai/new.
Add:
Name: AgentLegal MCP Server.
MCP URL: https://agentlegal-mcp.cequence.ai/mcp.
Tools: /mcp/analyze/upload, /mcp/analyze/query, /mcp/analyze/clauses/{type}.
Auth: None.
OpenAPI: Upload docs/openapi.json.


Link: https://smithery.ai/agentlegal-mcp.



Endpoints

POST /mcp/analyze/upload (legal:write): Upload PDF/text.
POST /mcp/analyze/query (legal:read): Query document.
GET /mcp/analyze/clauses/{type} (legal:read): Extract clause (e.g., payment).
GET /mcp/health: Check connectivity.
Auth: None.

Smithery Hosting

https://smithery.ai/agentlegal-mcp

Demo

Video: Shows LangChain/Claude Desktop → MCP → response, frontend UI, Cequence logs.
Run client: python agent_client/demo.py --mcp_url=$MCP_URL.
