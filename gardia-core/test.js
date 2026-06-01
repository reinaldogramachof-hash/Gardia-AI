// Teste básico da Gardia (sem RAG ainda — Supabase ainda não configurado)
import { buildSystemPrompt } from './src/prompts/system.prompt.js'

// Testar geração do system prompt
const prompt = buildSystemPrompt({
  contractName: 'Condomínio Splendor Patrianni',
  contractType: 'condominio_vertical',
  userRole: 'sindico',
  userName: 'Reinaldo'
})

console.log('=== SYSTEM PROMPT DA GARDIA ===')
console.log(prompt)
console.log('==============================')
console.log('✅ System prompt gerado com sucesso!')
