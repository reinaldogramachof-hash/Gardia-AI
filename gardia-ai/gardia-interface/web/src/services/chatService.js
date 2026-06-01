import { db } from '../db/schema.js';
import { logger } from '../utils/logger.js';

export const ChatService = {
  async salvarMensagem({ turnoId, condominioId, remetente, texto }) {
    return db.mensagens.add({
      turnoId,
      condominioId,
      remetente,
      texto: texto.trim(),
      criadoEm: Date.now(),
    });
  },

  async listarMensagens(turnoId) {
    return db.mensagens
      .where('turnoId').equals(turnoId)
      .sortBy('criadoEm');
  },

  async buscarContexto(condominioId, turnoId) {
    const ficha = await db.fichas
      .where('condominioId').equals(condominioId)
      .last();

    const limite72h = Date.now() - 72 * 60 * 60 * 1000;
    const ocorrencias = await db.ocorrencias
      .where('condominioId').equals(condominioId)
      .filter((o) => o.criadoEm > limite72h)
      .toArray();

    const instrucoes = await db.instrucoes
      .where('condominioId').equals(condominioId)
      .filter((i) => (i.ativa === true || i.ativa === 1) && (!i.expiradoEm || i.expiradoEm > Date.now()))
      .toArray();

    const historico = await db.mensagens
      .where('turnoId').equals(turnoId)
      .toArray();

    const rondas = await db.rondas
      .where('turnoId').equals(turnoId)
      .toArray()
      .then((itens) => itens.sort((a, b) => (a.finalizadaEm ?? a.realizadaEm ?? 0) - (b.finalizadaEm ?? b.realizadaEm ?? 0)));

    const hoje = new Date().toLocaleDateString('pt-BR');
    const reservas = await db.reservas
      .where('condominioId').equals(condominioId)
      .filter((r) => r.data === hoje)
      .toArray();

    const logPrestadores = await db.logPrestadores
      .where('condominioId').equals(condominioId)
      .filter((l) => l.data === hoje)
      .toArray()
      .then((itens) => itens.sort((a, b) => (a.entrada ?? 0) - (b.entrada ?? 0)));

    const logAcesso = await db.logAcesso
      .where('turnoId').equals(turnoId)
      .toArray()
      .then((itens) => itens.sort((a, b) => (a.criadoEm ?? 0) - (b.criadoEm ?? 0)));

    logger.info('ChatService.buscarContexto', {
      ocorrencias: ocorrencias.length,
      instrucoes: instrucoes.length,
      historico: historico.length,
      rondas: rondas.length,
      reservas: reservas.length,
      logPrestadores: logPrestadores.length,
      logAcesso: logAcesso.length,
    });

    return { ficha, ocorrencias, instrucoes, historico, rondas, reservas, logPrestadores, logAcesso };
  },
};
