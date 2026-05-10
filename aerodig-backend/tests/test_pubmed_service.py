"""Testa o parser de XML do PubMed sem fazer chamadas de rede."""
from services.pubmed import parse_efetch_xml

SAMPLE_XML = """<?xml version="1.0"?>
<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation>
      <PMID Version="1">12345678</PMID>
      <Article>
        <Journal>
          <Title>International Journal of Pediatric Otorhinolaryngology</Title>
        </Journal>
        <ArticleTitle>Pediatric airway laryngomalacia outcomes</ArticleTitle>
        <Abstract>
          <AbstractText>This is a study of laryngomalacia outcomes.</AbstractText>
        </Abstract>
        <ArticleDate>
          <Year>2025</Year>
          <Month>03</Month>
          <Day>15</Day>
        </ArticleDate>
      </Article>
      <MeshHeadingList>
        <MeshHeading><DescriptorName UI="D018896">Laryngomalacia</DescriptorName></MeshHeading>
        <MeshHeading><DescriptorName UI="D007821">Larynx</DescriptorName></MeshHeading>
      </MeshHeadingList>
    </MedlineCitation>
    <PubmedData>
      <ArticleIdList>
        <ArticleId IdType="pubmed">12345678</ArticleId>
        <ArticleId IdType="doi">10.1016/example</ArticleId>
      </ArticleIdList>
    </PubmedData>
  </PubmedArticle>
</PubmedArticleSet>
"""


def test_parse_efetch_extracts_pmid_and_title():
    items = parse_efetch_xml(SAMPLE_XML)
    assert len(items) == 1
    art = items[0]
    assert art["pmid"] == "12345678"
    assert "laryngomalacia" in art["title"].lower()
    assert art["doi"] == "10.1016/example"
    assert "Laryngomalacia" in art["mesh_terms"]


def test_parse_efetch_handles_invalid_xml():
    items = parse_efetch_xml("<not valid xml")
    assert items == []
