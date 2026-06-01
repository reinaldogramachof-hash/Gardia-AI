import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { buildSystemPrompt, personas } from "./src/prompts/system.prompt.js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL  = process.env.OLLAMA_MODEL;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

async function retrieveContext(query, contractId, k = 6) {
  const emb = await embed(query);
  const { data } = await supabase.rpc("search_knowledge", {
    query_embedding: emb, target_contract_id: contractId, match_count: k
  });
  return data || [];
}

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", model: MODEL }));

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, contractId = null, contractName = null,
          contractType = null, userRole = "morador",
          userName = null, history = [] } = req.body;

  if (!message) return res.status(400).json({ error: "message obrigatorio" });

  try {
    // 1. RAG
    const chunks = await retrieveContext(message, contractId);
    const context = chunks.map((c,i) => "["+i+1+"] "+c.source_doc+":\n"+c.content).join("\n\n---\n\n");

    // 2. System prompt
    const persona = personas[userRole] || personas.morador;
    const system = buildSystemPrompt({ contractName, contractType, userRole, userName })
      + "\n\n## Estilo:\n" + persona
      + "\n\nResponda APENAS com base nos trechos juridicos fornecidos. Cite leis e artigos especificos."
      + "\nFormato: 1.ANALISE 2.BASE LEGAL 3.CONDUTA 4.PENALIDADE";

    // 3. Mensagem com contexto
    const userMsg = chunks.length > 0
      ? "Trechos da base juridica:\n\n" + context + "\n\n---\nCom base EXCLUSIVAMENTE nesses trechos:\n" + message
      : message;

    // 4. Chamar Ollama
    const ollamaRes = await fetch(OLLAMA + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        system,
        messages: [...history, { role: "user", content: userMsg }],
        stream: false,
        options: { temperature: 0.1 }
      })
    });

    const data = await ollamaRes.json();
    res.json({
      resposta: data.message?.content || "Erro ao processar.",
      fontes: chunks.map(c => c.source_doc),
      chunks_usados: chunks.length
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Status da base
app.get("/api/knowledge/status", async (req, res) => {
  const { count } = await supabase
    .from("knowledge_chunks")
    .select("*", { count: "exact", head: true });
  res.json({ total_chunks: count, status: "ok" });
});

const PORT = process.env.GARDIA_PORT || 3001;
app.listen(PORT, () => {
  console.log("Gardia Core rodando em http://localhost:" + PORT);
  console.log("Modelo:", MODEL);
  console.log("Supabase:", process.env.SUPABASE_URL);
});