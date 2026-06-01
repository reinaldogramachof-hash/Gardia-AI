import { buildSystemPrompt, personas } from "../prompts/system.prompt.js";
import { retrieveContext, formatContext } from "../rag/retriever.js";
import "dotenv/config";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct-q4_K_M";

export async function chat(userMessage, sessionContext = {}) {
  const {
    contractId = null,
    contractName = null,
    contractType = null,
    userRole = "morador",
    userName = null,
    history = []
  } = sessionContext;

  // 1. Recuperar contexto RAG
  const chunks = await retrieveContext(userMessage, contractId, 5);

  // 2. System prompt minimo (identidade + formato)
  const persona = personas[userRole] || personas.morador;
  const systemPrompt = buildSystemPrompt({ contractName, contractType, userRole, userName })
    + "\n\n## Instrucao de estilo:\n" + persona
    + "\n\nResponda APENAS com base nos trechos juridicos fornecidos pelo usuario."
    + "\nNao cite artigos que nao aparecem nos trechos fornecidos."
    + "\nFormato: 1.ANALISE 2.BASE LEGAL 3.CONDUTA 4.PENALIDADE";

  // 3. Montar mensagem com contexto RAG embutido (arquitetura correta para 7B)
  let userContent = userMessage;
  if (chunks.length > 0) {
    const contexto = chunks
      .map((c, i) => `[${i+1}] ${c.source_doc}:\n${c.content}`)
      .join("\n\n---\n\n");
    userContent = `Trechos da base juridica relevantes:\n\n${contexto}\n\n---\nCom base EXCLUSIVAMENTE nesses trechos, responda:\n${userMessage}`;
  }

  // 4. Montar historico com o system prompt na primeira posicao (padrao oficial Ollama /api/chat)
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userContent }
  ];

  // 5. Chamar Ollama com temperature baixa
  const response = await fetch(OLLAMA_BASE_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.1 }
    })
  });

  if (!response.ok) throw new Error("Erro Ollama: " + response.statusText);

  const data = await response.json();
  return {
    resposta: data.message?.content || "Erro ao processar.",
    chunks_usados: chunks.length,
    fontes: chunks.map(c => c.source_doc)
  };
}