import { db } from '../db/schema.js';
import { logger } from '../utils/logger.js';

export const CondominioService = {
  async buscarAtivo() {
    try {
      return await db.condominios.where('ativo').equals(1).first();
    } catch (err) {
      logger.error('CondominioService.buscarAtivo', 'Erro ao buscar condominio ativo', err);
      throw err;
    }
  },

  async buscarOcorrenciasRecentes(condominioId, limite = 5) {
    try {
      return await db.ocorrencias
        .where('condominioId').equals(condominioId)
        .reverse()
        .limit(limite)
        .toArray();
    } catch (err) {
      logger.error('CondominioService.buscarOcorrenciasRecentes', 'Erro ao buscar ocorrencias', err);
      throw err;
    }
  },

  async listarAtivos() {
    try {
      const lista = await db.condominios.where('ativo').equals(1).toArray();
      return lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } catch (err) {
      logger.error('CondominioService.listarAtivos', 'Erro ao listar ativos', err);
      throw err;
    }
  },

  async criar({ nome, endereco = '', sindico = '', contatos = '' }) {
    try {
      const novoCondominio = {
        nome,
        endereco,
        sindico,
        contatos,
        criadoEm: new Date().toISOString(),
        ativo: 1
      };
      return await db.condominios.add(novoCondominio);
    } catch (err) {
      logger.error('CondominioService.criar', 'Erro ao criar', err);
      throw err;
    }
  },

  async atualizar(id, dados) {
    try {
      return await db.condominios.update(id, dados);
    } catch (err) {
      logger.error('CondominioService.atualizar', 'Erro ao atualizar', err);
      throw err;
    }
  },

  async arquivar(id) {
    try {
      return await db.condominios.update(id, { ativo: 0 });
    } catch (err) {
      logger.error('CondominioService.arquivar', 'Erro ao arquivar', err);
      throw err;
    }
  }
};
