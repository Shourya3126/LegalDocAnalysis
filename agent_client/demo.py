import argparse
from langchain_mcp_adapters import MCPAgent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mcp_url", required=True)
    args = parser.parse_args()

    agent = MCPAgent(
        mcp_url=args.mcp_url
    )

    doc_id = "3eb0f4c0-3288-4935-b243-fbbf8ebb45f5"  # Replace with actual doc_id
    response = agent.invoke({"messages": f"What is the grace period for premium payment in contract with doc_id: {doc_id}"})
    print(response)

if __name__ == "__main__":
    main()