# Arquitetura da Gardia AI

## Visão geral
Duas camadas de inteligência:
- Camada 1: Conhecimento universal do segmento condominial
- Camada 2: Conhecimento específico por contrato (CNPJ)

## Componentes principais
- Gardia Core: orquestrador principal (agente, RAG, tools)
- Gardia Ingest: pipeline de ingestão de documentos por contrato
- Gardia Interface: web app e WhatsApp (futuro)
- Supabase: banco de dados + pgvector para embeddings

## Fluxo de decisão
1. Identificação → quem é? qual papel? qual contrato?
2. RAG → busca conhecimento geral + específico do contrato
3. Decisão → responde / age / escalona
4. Ação → ferramenta / notificação / documento

## Modelos
- Principal: qwen2.5:7b-instruct-q4_K_M (via Ollama local)
- Embeddings: nomic-embed-text (via Ollama local)
- Produção futura: Claude API (Anthropic)
