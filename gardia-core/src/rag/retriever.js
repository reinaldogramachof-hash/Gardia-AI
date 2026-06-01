// Recuperador de contexto via Supabase pgvector
// Busca os chunks mais relevantes para uma query

import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './embedder.js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

/**
 * Busca chunks relevantes para uma query
 * @param {string} query - Pergunta do usuário
 * @param {string|null} contractId - ID do contrato (null = busca só no geral)
 * @param {number} matchCount - Número de resultados
 * @returns {Promise<Array>} - Chunks relevantes com similaridade
 */
export async function retrieveContext(query, contractId = null, matchCount = 5) {
  // Gera embedding da query
  const queryEmbedding = await generateEmbedding(query)

  // Busca no Supabase via função RPC
  const { data, error } = await supabase.rpc('search_knowledge', {
    query_embedding: queryEmbedding,
    target_contract_id: contractId,
    match_count: matchCount
  })

  if (error) {
    console.error('Erro na busca vetorial:', error)
    return []
  }

  return data || []
}

/**
 * Formata o contexto recuperado para injetar no prompt
 * @param {Array} chunks - Chunks retornados pelo retriever
 * @returns {string} - Contexto formatado
 */
export function formatContext(chunks) {
  if (!chunks.length) return ''

  const formatted = chunks
    .map((chunk, i) => []  ()\n)
    .join('\n\n')

  return ## Base de conhecimento relevante:\n
}
