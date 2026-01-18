"""Frontend Agent factory."""

import os
from pathlib import Path

from deepagents import create_deep_agent
from deepagents.backends import StateBackend
from langchain_openai import ChatOpenAI

from src.prompts import SYSTEM_PROMPT
from src.skills import SkillsMiddleware
from src.subagents import SUBAGENTS
from src.tools import fetch_url, http_request, web_search

# Skills directory path
SKILLS_DIR = Path(__file__).parent.parent / "skills"
ASSISTANT_ID = "frontend-agent"


def create_frontend_agent():
    """Create frontend development agent with StateBackend.

    All files stored in LangGraph state and streamed to UI.
    File organization by path convention:
    - /memory/* → Agent memory files (shown in memory panel)
    - Everything else → App/code files (shown in filesystem panel)

    No persistent filesystem - everything is per-session and virtual.
    """
    tools = [http_request, web_search, fetch_url]

    # Single StateBackend - paths are preserved as-is
    def backend_factory(rt):
        return StateBackend(rt)

    middleware = [
        SkillsMiddleware(
            skills_dir=SKILLS_DIR,
            assistant_id=ASSISTANT_ID,
            auto_inject_skills=["frontend-design"],  # Always inject this skill
        ),
    ]

    # Get model from environment, default to Claude Opus 4.5 via OpenRouter
    model_name = os.environ.get("MODEL", "anthropic/claude-opus-4.5")
    
    # OpenRouter configuration
    openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
    
    if openrouter_api_key:
        # Use OpenRouter
        model = ChatOpenAI(
            model=model_name,
            api_key=openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            max_tokens=20000,
            default_headers={
                "HTTP-Referer": os.environ.get("SITE_URL", "http://localhost:5173"),
                "X-Title": os.environ.get("SITE_NAME", "DeepAgents Open Lovable"),
            },
        )
    else:
        # Fallback to direct Anthropic API if no OpenRouter key
        from langchain_anthropic import ChatAnthropic
        # Strip provider prefix if present (e.g., "anthropic:claude-sonnet-4-5-20250929")
        if ":" in model_name:
            model_name = model_name.split(":", 1)[1]
        elif "/" in model_name:
            model_name = model_name.split("/", 1)[1]
        model = ChatAnthropic(
            model_name=model_name,
            max_tokens=20000,
        )

    return create_deep_agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=tools,
        middleware=middleware,
        backend=backend_factory,
        subagents=SUBAGENTS,
    )


# Entry point for langgraph.json
agent = create_frontend_agent()
