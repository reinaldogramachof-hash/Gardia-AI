import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { count: total } = await supabase
  .from("knowledge_chunks")
  .select("*", { count: "exact", head: true });

const { data: por_tipo } = await supabase
  .from("knowledge_chunks")
  .select("source_type");

const contagem = {};
por_tipo.forEach(r => { contagem[r.source_type] = (contagem[r.source_type] || 0) + 1; });

console.log("═══════════════════════════════════════════");
console.log(" GARDIA AI — BASE DE CONHECIMENTO");
console.log("═══════════════════════════════════════════");
console.log(" Total de chunks:", total);
console.log("");
console.log(" Por tipo:");
Object.entries(contagem).sort((a,b)=>b[1]-a[1]).forEach(([tipo, n]) => {
  const bar = "█".repeat(Math.round(n/3));
  console.log("  " + tipo.padEnd(22) + n.toString().padStart(4) + "  " + bar);
});
console.log("═══════════════════════════════════════════");