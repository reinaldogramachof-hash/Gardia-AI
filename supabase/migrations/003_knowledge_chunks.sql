CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  source_doc  TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
                'legislacao','norma_abnt','boa_pratica',
                'convencao','regulamento','contrato_fornecedor',
                'ata_assembleia','template')),
  content     TEXT NOT NULL,
  embedding   vector(768),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(768),
  target_contract_id UUID DEFAULT NULL,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID, contract_id UUID, source_doc TEXT,
  source_type TEXT, content TEXT, similarity FLOAT
)
LANGUAGE SQL STABLE AS
$$
  SELECT id, contract_id, source_doc, source_type, content,
         1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks
  WHERE contract_id IS NULL OR contract_id = target_contract_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;