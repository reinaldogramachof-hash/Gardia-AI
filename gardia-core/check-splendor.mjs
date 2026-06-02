import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const CONTRACT_ID = "354f5903-5f32-4e1a-b688-d2771c597696";
const OLLAMA = "http://localhost:11434";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

const query = "horario funcionamento academia Splendor Patrianni";
const emb = await embed(query);

// Busca APENAS no contrato do Splendor
const { data: contrato } = await supabase.rpc("search_knowledge", {
  query_embedding: emb,
  target_contract_id: CONTRACT_ID,
  match_count: 5
});

console.log("=== BUSCA APENAS NO SPLENDOR ===");
contrato?.forEach((c,i) => {
  const tipo = c.contract_id ? "SPLENDOR" : "UNIVERSAL";
  console.log("["+i+1+"] "+tipo+" ("+c.similarity.toFixed(3)+")", c.source_doc);
  console.log(c.content.substring(0,150)+"...\n");
});