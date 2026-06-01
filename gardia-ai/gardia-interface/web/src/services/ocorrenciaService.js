import { db } from '../db/schema.js';

export const OcorrenciaService = {
  async listar(condominioId, filtros = {}) {
    const itens = await db.ocorrencias.where('condominioId').equals(Number(condominioId)).toArray();
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();

    return itens
      .filter((item) => {
        if (filtros.abertas && item.resolvidaEm) return false;
        if (filtros.criticas && String(item.gravidade || '').toLowerCase() !== 'critico') return false;
        if (filtros.periodo === 'hoje' && Number(item.criadoEm || 0) < inicioHoje) return false;
        return true;
      })
      .sort((a, b) => Number(b.criadoEm || 0) - Number(a.criadoEm || 0));
  },

  async listarAbertas(condominioId) {
    const itens = await db.ocorrencias.where('condominioId').equals(Number(condominioId)).toArray();
    return itens
      .filter((item) => !item.resolvidaEm)
      .sort((a, b) => Number(b.criadoEm || 0) - Number(a.criadoEm || 0));
  },

  async criar({ condominioId, tipo, gravidade, descricao, fotoBlob = null }) {
    return db.ocorrencias.add({
      condominioId: Number(condominioId),
      postoId: null,
      tipo,
      gravidade,
      descricao,
      fotoBlob,
      criadoEm: Date.now(),
      resolvidaEm: null,
    });
  },

  async resolver(ocorrenciaId) {
    return db.ocorrencias.update(Number(ocorrenciaId), { resolvidaEm: Date.now() });
  },
};