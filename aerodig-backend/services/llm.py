"""
LLM client — DeepSeek (preferred) com fallback Groq.

Uso atual: gerar resumo PT-BR de 3 linhas para news items.
"""
import os
from typing import Optional

import httpx

DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

PROMPT_TEMPLATE = """Você é um curador clínico do OTTO Aerodigestive Hub. Resuma o artigo abaixo em PT-BR em EXATAMENTE 3 linhas:
- Linha 1: o que o estudo investigou.
- Linha 2: principal achado.
- Linha 3: implicação clínica para o cuidado aerodigestivo pediátrico (ou indique 'aplicabilidade ainda incerta').

Não use markdown. Não adicione cabeçalhos. Mantenha termos em inglês entre parênteses quando consolidados.

Título: {title}
Revista: {journal} ({year})
Abstract: {abstract}
"""


async def summarize_ptbr(
    title: str,
    abstract: str,
    journal: str,
    year: Optional[int],
) -> Optional[str]:
    """Retorna 3 linhas em PT-BR ou None se falhar."""
    prompt = PROMPT_TEMPLATE.format(
        title=title,
        journal=journal,
        year=year or "ano não informado",
        abstract=(abstract or "")[:3500],
    )

    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    if deepseek_key:
        return await _call_openai_compatible(
            DEEPSEEK_URL,
            deepseek_key,
            "deepseek-chat",
            prompt,
        )
    if groq_key:
        return await _call_openai_compatible(
            GROQ_URL,
            groq_key,
            "llama-3.1-8b-instant",
            prompt,
        )
    return None


async def _call_openai_compatible(
    url: str, api_key: str, model: str, prompt: str
) -> Optional[str]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Você é um curador clínico. Responda em PT-BR."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 280,
    }
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return None
