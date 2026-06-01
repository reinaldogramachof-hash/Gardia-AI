// Agente principal da Gardia AI
// Orquestra: identidade → RAG → resposta

import { buildSystemPrompt, personas } from '../prompts/system.prompt.js'
import { retrieveContext, formatContext } from '../rag/retriever.js'
import 'dotenv/config'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct-q4_K_M'

/**
 * Processa uma mensagem e retorna resposta da Gardia
 * @param {string} userMessage - Mensagem do usuário
 * @param {Object} sessionContext - Contexto da sessão (contrato, papel, histórico)
 * @returns {Promise<string>} - Resposta da Gardia
 */
export async function chat(userMessage, sessionContext = {}) {
  const {
    contractId = null,
    contractName = null,
    contractType = null,
    userRole = 'morador',
    userName = null,
    history = []
  } = sessionContext

  // 1. Recuperar contexto relevante via RAG
  const chunks = await retrieveContext(userMessage, contractId)
  const ragContext = formatContext(chunks)

  // 2. Construir system prompt com contexto
  const systemPrompt = buildSystemPrompt({
    contractName,
    contractType,
    userRole,
    userName,
    additionalContext: ragContext
  })

  // Adicionar persona do papel
  const persona = personas[userRole] || personas.morador
  const fullSystem = ${systemPrompt}\n\n## Instrução de estilo:\n

  // 3. Montar histórico de mensagens
  const messages = [
    ...history,
    { role: 'user', content: userMessage }
  ]

  // 4. Chamar Ollama
  const response = await fetch(${OLLAMA_BASE_URL}/api/chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      system: fullSystem,
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error(Erro na chamada ao Ollama: )
  }

  const data = await response.json()
  return data.message?.content || 'Erro ao processar resposta.'
}
