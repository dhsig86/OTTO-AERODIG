"""
PubMed E-utilities client.

Doc oficial: https://www.ncbi.nlm.nih.gov/books/NBK25497/
Endpoints:
  - ESearch: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
  - EFetch:  https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
"""
import os
import xml.etree.ElementTree as ET
from typing import Any

import httpx

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
TIMEOUT = 30.0


def _params(extra: dict[str, Any]) -> dict[str, Any]:
    base = {
        "tool": os.getenv("PUBMED_TOOL", "otto-aerodig"),
        "email": os.getenv("PUBMED_EMAIL", "noreply@drdariohart.com"),
    }
    api_key = os.getenv("PUBMED_API_KEY")
    if api_key:
        base["api_key"] = api_key
    base.update(extra)
    return base


async def esearch(query: str, max_results: int = 50, days: int = 14) -> list[str]:
    """Retorna lista de PMIDs para uma query, restrita aos últimos N dias."""
    params = _params(
        {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": max_results,
            "datetype": "pdat",
            "reldate": days,
            "sort": "most+recent",
        }
    )
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(f"{BASE_URL}/esearch.fcgi", params=params)
        r.raise_for_status()
        data = r.json()
    return data.get("esearchresult", {}).get("idlist", [])


async def efetch(pmids: list[str]) -> list[dict[str, Any]]:
    """Retorna metadados estruturados para uma lista de PMIDs."""
    if not pmids:
        return []
    params = _params(
        {
            "db": "pubmed",
            "id": ",".join(pmids),
            "rettype": "abstract",
            "retmode": "xml",
        }
    )
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(f"{BASE_URL}/efetch.fcgi", params=params)
        r.raise_for_status()
        text = r.text
    return parse_efetch_xml(text)


def parse_efetch_xml(xml_text: str) -> list[dict[str, Any]]:
    """Parse a EFetch XML response into a list of article dicts."""
    items: list[dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return items

    for article in root.findall(".//PubmedArticle"):
        pmid_node = article.find(".//PMID")
        title_node = article.find(".//ArticleTitle")
        journal_node = article.find(".//Journal/Title")
        year_node = article.find(".//PubDate/Year")
        month_node = article.find(".//PubDate/Month")
        day_node = article.find(".//PubDate/Day")
        abstract_nodes = article.findall(".//Abstract/AbstractText")
        mesh_nodes = article.findall(".//MeshHeading/DescriptorName")
        doi_node = article.find(".//ArticleId[@IdType='doi']")

        abstract = " ".join(
            (n.text or "") for n in abstract_nodes if n.text
        ).strip()
        mesh = [n.text for n in mesh_nodes if n.text]

        items.append(
            {
                "pmid": pmid_node.text if pmid_node is not None else None,
                "title": (title_node.text or "").strip() if title_node is not None else "",
                "journal": (journal_node.text or "").strip() if journal_node is not None else "",
                "year": int(year_node.text) if year_node is not None and year_node.text else None,
                "month": month_node.text if month_node is not None else None,
                "day": day_node.text if day_node is not None else None,
                "abstract": abstract,
                "mesh_terms": mesh,
                "doi": doi_node.text if doi_node is not None else None,
            }
        )
    return items
