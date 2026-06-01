import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL  = process.env.OLLAMA_MODEL;

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

// Teste com pergunta especifica de SJC
const pergunta = "Em Sao Jose dos Campos, um morador fez barulho as 23h numa sexta-feira. Qual lei municipal se aplica, qual o limite de dB e qual a conduta correta do sindico?";

console.log("Pergunta:", pergunta);
console.log("");
console.log("Buscando na base...");

const emb = await embed(pergunta);
const { data: chunks } = await supabase.rpc("search_knowledge", {
  query_embedding: emb,
  target_contract_id: null,
  match_count: 5
});

console.log("Chunks recuperados:");
chunks.forEach((c,i) => console.log("["+i+1+"] "+c.source_doc+" ("+c.similarity.toFixed(3)+")"));

const contexto = chunks.map((c,i) => "["+i+1+"] "+c.source_doc+":\n"+c.content).join("\n\n---\n\n");

const res = await fetch(OLLAMA + "/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: MODEL,
    system: "Voce e a Gardia, assistente juridico especialista em gestao condominial brasileira. Responda APENAS com base nos trechos fornecidos. Cite leis e artigos especificos. Formato: 1.ANALISE 2.BASE LEGAL 3.CONDUTA 4.PENALIDADE",
    messages: [{ role: "user", content: "Trechos da base:\n\n" + contexto + "\n\n---\nCom base EXCLUSIVAMENTE nesses trechos:\n" + pergunta }],
    stream: false,
    options: { temperature: 0.0 }
  })
});

const data = await res.json();
console.log("\n=== GARDIA RESPONDE ===");
console.log(data.message.content);
console.log("======================");