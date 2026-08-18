# External Source Index

Only sources backed by an adapter in `backend/app/integrations/` are retained here.

| Source | Adapter | Credential | Status |
| --- | --- | --- | --- |
| GitHub | `github_service.py` | optional token | implemented; end-to-end verified |
| Hacker News | `hn_service.py` | none | implemented; end-to-end verified |
| arXiv | `arxiv_service.py` | none | implemented; acceptance pending |
| OpenAlex | `openalex_service.py` | provider-dependent | implemented; acceptance pending |
| Stack Exchange | `stackexchange_service.py` | optional key | implemented; acceptance pending |
| Product Hunt | `producthunt_service.py` | token | implemented; acceptance pending |
| SEC EDGAR | `sec_service.py` | none; user agent required | implemented; acceptance pending |
| RSS | `rss_service.py` | none | implemented; acceptance pending |
| Semantic Scholar | `semantic_scholar_service.py` | optional | implemented; acceptance pending |
| Papers with Code | `papers_with_code_service.py` | none | implemented; acceptance pending |
| DEV Community | `devto_service.py` | none | implemented; acceptance pending |
| Remote OK | `remoteok_service.py` | none | implemented; acceptance pending |
| Reddit | `reddit_service.py` | OAuth | stub; not operational |

Provider behavior, quotas, and authentication requirements can change. Revalidate against each provider's official documentation before production use.
