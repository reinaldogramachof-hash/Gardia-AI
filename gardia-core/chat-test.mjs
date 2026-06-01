import { buildSystemPrompt, personas } from "./src/prompts/system.prompt.js";

const OLLAMA = "http://localhost:11434";
const MODEL  = "qwen2.5:7b-instruct-q4_K_M";

const systemPrompt = buildSystemPrompt({
  contractName: "Splendor Patrianni",
  contractType: "condominio_vertical",
  userRole: "sindico",
  userName: "Reinaldo"
}) + "\n\n## Estilo:\n" + "Responda de forma tecnica e objetiva. Foque em decisoes e base legal.";

const pergunta = "Um morador fez barulho as 23h numa sexta-feira. O regulamento proibe apos 22h em dias uteis e 23h nos fins de semana. Qual a conduta correta e qual artigo do Codigo Civil se aplica?";

console.log("Perguntando para a Gardia...\n");

const res = await fetch(OLLAMA + "/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content: pergunta }],
    stream: false
  })
});

const data = await res.json();
console.log("=== GARDIA RESPONDE ===");
console.log(data.message.content);
console.log("======================");