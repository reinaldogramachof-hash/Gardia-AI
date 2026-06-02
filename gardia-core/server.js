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

  // Se tiver contrato: busca 4 chunks do contrato + 3 universais
  if (contractId) {
    const [contratoRes, universalRes] = await Promise.all([
      supabase.rpc("search_knowledge", {
        query_embedding: emb, target_contract_id: contractId, match_count: 4
      }),
      supabase.rpc("search_knowledge", {
        query_embedding: emb, target_contract_id: null, match_count: 3
      })
    ]);

    const contratoChunks = (contratoRes.data || []).filter(c => c.contract_id !== null);
    const universalChunks = (universalRes.data || []).filter(c => c.contract_id === null);

    // Contrato primeiro, depois universais
    return [...contratoChunks, ...universalChunks].slice(0, k);
  }

  // Sem contrato: busca geral
  const { data } = await supabase.rpc("search_knowledge", {
    query_embedding: emb, target_contract_id: null, match_count: k
  });
  return data || [];
}

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", model: MODEL }));

// Status da base
app.get("/api/knowledge/status", async (req, res) => {
  const { count } = await supabase
    .from("knowledge_chunks")
    .select("*", { count: "exact", head: true });
  res.json({ total_chunks: count, status: "ok" });
});

// Chat com STREAMING
app.post("/api/chat", async (req, res) => {
  const {
    message, pergunta, texto,
    contractId = null, contractName = null,
    contractType = null, userRole = "operador",
    userName = null, history = [],
    stream: useStream = true
  } = req.body;

  const userMessage = message || pergunta || texto;
  if (!userMessage) return res.status(400).json({ error: "message obrigatorio" });

  try {
    // 1. RAG
    const chunks = await retrieveContext(userMessage, contractId);
    const context = chunks.map((c,i) => "["+i+1+"] "+c.source_doc+":\n"+c.content).join("\n\n---\n\n");

    // 2. System prompt
    const persona = personas[userRole] || personas.morador;
    const system = buildSystemPrompt({ contractName, contractType, userRole, userName })
      + "\n\n## Estilo:\n" + persona
      + "\n\nResponda com base nos trechos juridicos e operacionais fornecidos."
      + "\nSe houver informacoes especificas do condominio nos trechos, priorize-as."
      + "\nCite leis e artigos especificos quando relevante.";

    // 3. Mensagem com contexto
    const userMsg = chunks.length > 0
      ? "Trechos da base de conhecimento:\n\n" + context + "\n\n---\nPergunta: " + userMessage
      : userMessage;

    // 4. STREAMING RESPONSE
    if (useStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Fontes", JSON.stringify([...new Set(chunks.map(c => c.source_doc))]));

      const ollamaRes = await fetch(OLLAMA + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          system,
          messages: [...history, { role: "user", content: userMsg }],
          stream: true,
          options: { temperature: 0.1 }
        })
      });

      const reader = ollamaRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              res.write("data: " + JSON.stringify({ token: json.message.content }) + "\n\n");
            }
            if (json.done) {
              res.write("data: [DONE]\n\n");
            }
          } catch {}
        }
      }
      res.end();

    } else {
      // Resposta completa (fallback sem streaming)
      const ollamaRes = await fetch(OLLAMA + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, system,
          messages: [...history, { role: "user", content: userMsg }],
          stream: false,
          options: { temperature: 0.1 }
        })
      });
      const data = await ollamaRes.json();
      res.json({
        resposta: data.message?.content || "Erro ao processar.",
        fontes: [...new Set(chunks.map(c => c.source_doc))],
        chunks_usados: chunks.length
      });
    }

  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.GARDIA_PORT || 3001;
app.listen(PORT, () => {
  console.log("Gardia Core rodando em http://localhost:" + PORT);
  console.log("Modelo:", MODEL);
  console.log("Streaming: ATIVO");
});