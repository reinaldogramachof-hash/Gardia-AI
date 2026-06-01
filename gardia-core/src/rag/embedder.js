// Gerador de embeddings via Ollama (nomic-embed-text)
// Usado para vetorizar documentos e queries do RAG

import 'dotenv/config'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'

/**
 * Gera embedding de um texto via Ollama
 * @param {string} text - Texto a vetorizar
 * @returns {Promise<number[]>} - Vetor de 768 dimensões
 */
export async function generateEmbedding(text) {
  const response = await fetch(${OLLAMA_BASE_URL}/api/embeddings, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBED_MODEL,
      prompt: text
    })
  })

  if (!response.ok) {
    throw new Error(Erro ao gerar embedding: )
  }

  const data = await response.json()
  return data.embedding
}

/**
 * Gera embeddings em lote (para ingestão de documentos)
 * @param {string[]} texts - Array de textos
 * @returns {Promise<number[][]>} - Array de vetores
 */
export async function generateEmbeddings(texts) {
  const embeddings = []
  for (const text of texts) {
    const embedding = await generateEmbedding(text)
    embeddings.push(embedding)
  }
  return embeddings
}
