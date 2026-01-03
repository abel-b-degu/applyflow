import httpx

OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"
MODEL = "llama3.1:8b"

def generate_cover_letter(company: str, role: str, job_description: str) -> str:
    prompt = f"""
You are an expert career coach.

Write a professional, tailored cover letter for the role below.

Company: {company}
Role: {role}

Job Description:
{job_description}

Rules:
- 3–5 short paragraphs
- No placeholders like [Your Name]
- Mention 2-3 relevant skills from the job description
- Keep it to fit one page
"""

    r = httpx.post(
        OLLAMA_CHAT_URL,
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You write concise, tailored cover letters."},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
        },
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    return data["message"]["content"].strip()
