# GARDIA AI — Instruções para o Agente Claude Code

## Visão do Projeto
Gardia é um agente de IA especialista em gestão condominial brasileira.
Opera como cérebro operacional de condomínios verticais, horizontais
e associações de moradores.

## Stack
- Runtime local: Ollama (Qwen 2.5 7B / Llama 3.2 3B)
- Embeddings: nomic-embed-text via Ollama
- Vector DB: Supabase pgvector
- Backend: Node.js + Express (ES Modules)
- Linguagem: JavaScript

## Estrutura do projeto
- gardia-core/     → núcleo da IA (agentes, RAG, tools, API)
- gardia-ingest/   → pipeline de ingestão de documentos
- gardia-interface/→ interfaces web e futuramente WhatsApp
- knowledge-base/  → base de conhecimento universal
- supabase/        → migrations e configurações do banco
- docs/            → documentação e decisões de arquitetura

## Regras de desenvolvimento
1. Sempre usar ES Modules (import/export)
2. Variáveis de ambiente via .env (nunca hardcodar chaves)
3. Toda função de RAG deve respeitar o contract_id
4. Migrations SQL sempre versionadas em /supabase/migrations/
5. Comentários em PT-BR
6. NUNCA vazar dados de um contrato para outro (RLS obrigatório)

## Arquitetura de decisão da Gardia
1. Identificar: quem fala? qual papel? qual contrato?
2. Recuperar: RAG geral + RAG do contrato
3. Raciocinar: contexto + histórico + regras
4. Agir: responde / executa tool / escalona para humano

## Quando escalonar para humano
- Decisões financeiras acima de R$ 1.000
- Conflitos com histórico de violência
- Emergências (bombeiros, SAMU, polícia)
- Interpretação jurídica de alto impacto
- Qualquer dúvida sobre aplicação de multa acima de 5x
