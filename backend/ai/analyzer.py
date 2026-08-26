import json

from ai.client import ask_ai


SYSTEM_PROMPT = """
You are an AI Kubernetes DevOps troubleshooting assistant.

Analyze Kubernetes pod investigation data and identify the most likely
root cause of the problem.

Provide:
1. Severity
2. Root Cause
3. Evidence
4. Recommended Fix

Base your diagnosis only on the Kubernetes status, container states,
restart counts, events, and logs provided.

Do not invent information that is not present in the investigation data.
Keep the response clear and practical for a DevOps engineer.
"""


def analyze_investigation(investigation):
    investigation_text = json.dumps(
        investigation,
        indent=2
    )

    user_prompt = f"""
Analyze the following Kubernetes investigation:

{investigation_text}

Explain the most likely cause of the failure and recommend how to fix it.
"""

    return ask_ai(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )
