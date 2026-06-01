import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

// Testar multiplas queries para SJC
const queries = [
  "barulho 23h sexta Sao Jose dos Campos lei silencio",
  "Lei 8940 SJC ruido vizinhanca condominio",
  "horario silencio SJC 70 decibeis noturno",
  "Sao Jose dos Campos perturbacao sossego",
  "SJC legislacao municipal ruido condominio"
];

console.log("=== DIAGNOSTICO DO RAG - SJC ===\n");

for (const q of queries) {
  const emb = await embed(q);
  const { data } = await supabase.rpc("search_knowledge", {
    query_embedding: emb, target_contract_id: null, match_count: 5
  });
  console.log("Query:", q);
  data.forEach((c,i) => {
    const sjc = c.source_doc.includes("SJC") || c.content.includes("Jose dos Campos") ? "✅ SJC" : "   ";
    console.log("  ["+i+1+"] "+sjc+" "+c.source_doc.substring(0,30)+" ("+c.similarity.toFixed(3)+"): "+c.content.substring(0,70)+"...");
  });
  console.log("");
}

// Ver TODOS os chunks de SJC no banco
console.log("=== CHUNKS DE SJC NO BANCO ===");
const { data: sjcChunks } = await supabase
  .from("knowledge_chunks")
  .select("source_doc, source_type, content")
  .or("source_doc.ilike.%SJC%,content.ilike.%Jose dos Campos%")
  .limit(20);

sjcChunks.forEach((c,i) => {
  console.log("["+i+1+"] "+c.source_doc+" | "+c.content.substring(0,100)+"...");
});
console.log("Total chunks SJC encontrados:", sjcChunks.length);