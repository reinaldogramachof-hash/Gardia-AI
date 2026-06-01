import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { chat } from './src/agents/gardia.agent.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.GARDIA_PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'gardia-core' });
});

// Endpoint POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { pergunta, contract_id, contexto = {} } = req.body;

  if (!pergunta) {
    return res.status(400).json({ error: 'A propriedade "pergunta" e obrigatoria.' });
  }

  try {
    let sessionContext = {
      contractId: contract_id || null,
      userRole: contexto.userRole || 'morador',
      userName: contexto.userName || null,
      history: contexto.history || []
    };

    // Se houver um contractId, buscar informacoes do contrato no Supabase para contextualizar o prompt
    if (sessionContext.contractId) {
      const { data: contrato, error } = await supabase
        .from('contracts')
        .select('name, type')
        .eq('id', sessionContext.contractId)
        .single();

      if (contrato && !error) {
        sessionContext.contractName = contrato.name;
        sessionContext.contractType = contrato.type;
      }
    }

    // Chama o agente inteligente da Gardia (RAG + Ollama)
    const resultado = await chat(pergunta, sessionContext);
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro no processamento do chat:', error);
    res.status(500).json({
      error: 'Erro interno ao processar a resposta da Gardia.',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`=== Servidor Gardia Core ativo na porta ${PORT} ===`);
});
