import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const CONTRACT_ID = "354f5903-5f32-4e1a-b688-d2771c597696";
const DOCS_PATH = "C:/dev/gardia-ai/knowledge-base/contratos/splendor-patrianni";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

function chunkText(text, maxChars = 2000) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 50);
}

function getSourceType(f) {
  if (f.includes("REGIMENTO")) return "regulamento";
  if (f.includes("CONTRATO"))  return "contrato_fornecedor";
  if (f.includes("POP") || f.includes("MANUAL")) return "boa_pratica";
  return "boa_pratica";
}

const arquivos = readdirSync(DOCS_PATH).filter(f => f.endsWith(".md"));
console.log("Documentos:", arquivos.length, "| Contrato:", CONTRACT_ID);
console.log("");

let total = 0, inseridos = 0;

for (const arquivo of arquivos) {
  const texto = readFileSync(join(DOCS_PATH, arquivo), "utf8");
  const chunks = chunkText(texto);
  const tipo = getSourceType(arquivo);
  console.log("Processando:", arquivo, "→", chunks.length, "chunks [" + tipo + "]");

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write("  [" + (i+1) + "/" + chunks.length + "] vetorizando...");
    try {
      const embedding = await embed(chunks[i]);
      const { error } = await supabase.from("knowledge_chunks").insert({
        contract_id: CONTRACT_ID,
        source_doc: arquivo.replace(".md", ""),
        source_type: tipo,
        content: chunks[i],
        embedding,
        metadata: { arquivo, chunk_index: i, total_chunks: chunks.length }
      });
      if (error) console.log(" ERRO:", error.message);
      else { console.log(" OK"); inseridos++; }
    } catch (e) { console.log(" FALHA:", e.message); }
    total++;
  }
  console.log("");
}

console.log("═══════════════════════════════════════");
console.log(" Total processado: " + total + " chunks");
console.log(" Total inserido:   " + inseridos + " chunks");
console.log("═══════════════════════════════════════");
console.log(" Splendor Patrianni carregado na Gardia!");