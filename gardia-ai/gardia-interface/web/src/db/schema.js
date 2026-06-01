import Dexie from 'dexie';

export const db = new Dexie('GardiaDB');

db.version(1).stores({
  condominios: '++id, nome, criadoEm, ativo',
  postos: '++id, condominioId, nome, turno, ativo',
  fichas: '++id, condominioId, versao, criadoEm',
  profissionais: '++id, nome, cpf, empresaId, ativo',
  usuarios: '++id, perfil, membro, condominioId, ativo',

  coberturas: '++id, postoId, profissionalId, condominioId, status, inicio',
  ocorrencias: '++id, condominioId, postoId, tipo, gravidade, criadoEm, resolvidaEm',
  rondas: '++id, postoId, condominioId, agendadaEm, realizadaEm',

  equipamentos: '++id, condominioId, tipo, nome, proximaManutencao, ativo',
  comunicados: '++id, condominioId, criadoEm, aprovadoEm',

  unidades: '++id, condominioId, numero, bloco',
  moradores: '++id, unidadeId, condominioId, nome, tipo, ativo',
  areas_comuns: '++id, condominioId, nome, capacidade, ativo',
  reservas: '++id, areaId, condominioId, moradorId, data, horarioInicio, horarioFim, status',
  documentos: '++id, condominioId, titulo, tipo, criadoEm',
  solicitacoes: '++id, condominioId, moradorId, tipo, status, criadoEm, resolvidaEm',

  cameras: '++id, condominioId, nome, streamUrl, areaId, ativo',
  integracoes: '++id, condominioId, tipo, config, ativo',
  eventos_acesso: '++id, condominioId, timestamp, tipo, origem',
});

db.version(2).stores({
  turnos: '++id, condominioId, postoId, profissionalId, status, inicio, fim',
  instrucoes: '++id, condominioId, prioridade, ativo, criadoEm',
  mensagens: '++id, turnoId, condominioId, remetente, criadoEm',
  logPrestadores: '++id, condominioId, prestadorId, data, entrada, saida',
  logAcesso: '++id, turnoId, condominioId, direcao, criadoEm',
  perfilProfissional: '++id, profissionalId, condominioId, atualizadoEm',
  chunks: '++id, documentoId, condominioId, ordem',
});

export default db;
