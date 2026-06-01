import { db } from './schema.js';
import { logger } from '../utils/logger.js';
import { Toast } from '../components/ui/Toast.js';

const CONDOMINIO_NOME = 'Condomínio Residencial Splendor Patrianni';

export async function seedSplendorPatrianni() {
  try {
    const existente = await db.condominios.where('nome').equals(CONDOMINIO_NOME).first();

    if (existente) {
      const totalInstrucoes = await db.instrucoes
        .where('condominioId').equals(existente.id)
        .count();

      if (totalInstrucoes === 0) {
        await inserirInstrucoesAtivas(existente.id);
        logger.info('seed', 'Instruções ativas inseridas para Splendor Patrianni existente');
      }

      logger.info('seed', 'Splendor Patrianni já existe — seed ignorado');
      return true;
    }

    const agora = Date.now();
    const condominioId = await db.condominios.add({
      nome: CONDOMINIO_NOME,
      endereco: 'Av. [endereço], São José dos Campos — SP',
      torres: 'Torre A e Torre B',
      totalUnidades: 80,
      padrao: 'Alto Padrão',
      criadoEm: agora,
      ativo: 1,
    });

    const postos = await inserirPostos(condominioId);
    const profissionais = await inserirProfissionais();

    await db.fichas.add({
      condominioId,
      versao: 1,
      criadoEm: agora,
      conteudo: criarConteudoFicha(),
    });

    await inserirCoberturas({ condominioId, postos, profissionais });
    await inserirOcorrencias({ condominioId, postos });
    await inserirInstrucoesAtivas(condominioId);

    Toast.success('Splendor Patrianni carregado com sucesso');
    logger.info('seed', 'Splendor Patrianni inserido com sucesso');
    return true;
  } catch (err) {
    logger.error('seed', 'Erro ao executar seed Splendor Patrianni', err);
    return false;
  }
}

async function inserirPostos(condominioId) {
  const postos = [
    { condominioId, nome: 'Guarita Principal', turno: 'integral', ativo: 1 },
    { condominioId, nome: 'Hall Torre A', turno: 'integral', ativo: 1 },
    { condominioId, nome: 'Hall Torre B', turno: 'integral', ativo: 1 },
    { condominioId, nome: 'Ronda Interna', turno: 'integral', ativo: 1 },
  ];

  const ids = await Promise.all(postos.map((posto) => db.postos.add(posto)));
  return mapearPorNome(postos, ids);
}

async function inserirProfissionais() {
  const profissionais = [
    { nome: 'Carlos Eduardo Mendes', cpf: '***.***.***-01', empresaId: 1, cargo: 'Porteiro', turno: 'Diurno A', postoNome: 'Guarita Principal', regime: '12x36', ativo: 1 },
    { nome: 'Rodrigo Santos Lima', cpf: '***.***.***-02', empresaId: 1, cargo: 'Porteiro', turno: 'Noturno A', postoNome: 'Guarita Principal', regime: '12x36', ativo: 1 },
    { nome: 'Andréia Costa Ferreira', cpf: '***.***.***-03', empresaId: 1, cargo: 'Porteira', turno: 'Diurno B', postoNome: 'Hall Torre A/B', regime: '12x36', ativo: 1 },
    { nome: 'Marcos Paulo Oliveira', cpf: '***.***.***-04', empresaId: 1, cargo: 'Porteiro', turno: 'Noturno B', postoNome: 'Hall Torre A/B', regime: '12x36', ativo: 1 },
    { nome: 'Fernanda Alves Souza', cpf: '***.***.***-05', empresaId: 1, cargo: 'Vigilante', turno: 'Diurno A', postoNome: 'Ronda Interna', regime: '12x36', ativo: 1 },
    { nome: 'Thiago Batista Rocha', cpf: '***.***.***-06', empresaId: 1, cargo: 'Vigilante', turno: 'Noturno A', postoNome: 'Ronda Interna', regime: '12x36', ativo: 1 },
    { nome: 'Patrícia Gonçalves', cpf: '***.***.***-07', empresaId: 1, cargo: 'Vigilante', turno: 'Diurno B', postoNome: 'Ronda Interna', regime: '12x36', ativo: 1 },
    { nome: 'Leonardo Carvalho', cpf: '***.***.***-08', empresaId: 1, cargo: 'Vigilante', turno: 'Noturno B', postoNome: 'Ronda Interna', regime: '12x36', ativo: 1 },
    { nome: 'Rosangela Pereira', cpf: '***.***.***-09', empresaId: 1, cargo: 'Aux. Limpeza', turno: '7h–16h', postoNome: 'Limpeza', regime: '6x1', folga: 'Segunda', ativo: 1 },
    { nome: 'Claudia Maria Nunes', cpf: '***.***.***-10', empresaId: 1, cargo: 'Aux. Limpeza', turno: '7h–16h', postoNome: 'Limpeza', regime: '6x1', folga: 'Terça', ativo: 1 },
    { nome: 'Joelma Santos', cpf: '***.***.***-11', empresaId: 1, cargo: 'Aux. Limpeza', turno: '7h–16h', postoNome: 'Limpeza', regime: '6x1', folga: 'Quarta', ativo: 1 },
    { nome: 'Benedita Rodrigues', cpf: '***.***.***-12', empresaId: 1, cargo: 'Aux. Limpeza', turno: '7h–16h', postoNome: 'Limpeza', regime: '6x1', folga: 'Quinta', ativo: 1 },
    { nome: 'Antônio Carlos Braga', cpf: '***.***.***-13', empresaId: 1, cargo: 'Zelador', turno: '8h–17h', postoNome: 'Zeladoria', regime: '6x1', folga: 'Domingo', ativo: 1 },
  ];

  const ids = await Promise.all(profissionais.map((profissional) => db.profissionais.add(profissional)));
  return mapearPorNome(profissionais, ids);
}

async function inserirCoberturas({ condominioId, postos, profissionais }) {
  const agora = Date.now();

  await db.coberturas.bulkAdd([
    {
      condominioId,
      postoId: postos['Guarita Principal'],
      profissionalId: profissionais['Carlos Eduardo Mendes'],
      status: 'concluida',
      inicio: agora - 48 * 60 * 60 * 1000,
      fim: agora - 36 * 60 * 60 * 1000,
      briefingTexto: 'Briefing de exemplo — Splendor Patrianni.',
      briefingGeradoEm: agora - 48 * 60 * 60 * 1000,
      briefingLidoEm: agora - 47 * 60 * 60 * 1000,
      turno: 'Diurno',
    },
    {
      condominioId,
      postoId: postos['Guarita Principal'],
      profissionalId: profissionais['Rodrigo Santos Lima'],
      status: 'em_andamento',
      inicio: agora - 2 * 60 * 60 * 1000,
      turno: 'Noturno',
    },
  ]);
}

async function inserirOcorrencias({ condominioId, postos }) {
  await db.ocorrencias.bulkAdd([
    {
      condominioId,
      postoId: postos['Guarita Principal'],
      tipo: 'Acesso',
      gravidade: 'baixa',
      descricao: 'Visitante sem agendamento para apto A1203. Autorizado pelo morador via interfone após contato.',
      criadoEm: timestampDeOntem(14, 32),
      resolvidaEm: timestampDeOntem(14, 35),
    },
    {
      condominioId,
      postoId: postos['Guarita Principal'],
      tipo: 'Barulho',
      gravidade: 'media',
      descricao: 'Reclamação de barulho no apto B0804. Porteiro entrou em contato via interfone. Situação normalizada.',
      criadoEm: timestampDeOntem(22, 17),
      resolvidaEm: timestampDeOntem(22, 25),
    },
    {
      condominioId,
      postoId: postos['Ronda Interna'],
      tipo: 'Infraestrutura',
      gravidade: 'media',
      descricao: 'Iluminação apagada no corredor Torre B andar 17. Zelador notificado para verificação pela manhã.',
      criadoEm: timestampDeHoje(3, 45),
      resolvidaEm: null,
    },
    {
      condominioId,
      postoId: postos['Guarita Principal'],
      tipo: 'Acesso',
      gravidade: 'baixa',
      descricao: 'Prestador de manutenção de elevadores sem agendamento prévio. Aguardou autorização da administração (15 min). Liberado.',
      criadoEm: timestampDeHoje(8, 21),
      resolvidaEm: timestampDeHoje(8, 36),
    },
  ]);
}

async function inserirInstrucoesAtivas(condominioId) {
  const agora = Date.now();
  const expiracaoUmMes = agora + 30 * 24 * 60 * 60 * 1000;
  const expiracaoUmaSemana = agora + 7 * 24 * 60 * 60 * 1000;

  await db.instrucoes.bulkAdd([
    {
      condominioId,
      texto: 'Empresa de manutenção dos elevadores (ElevaTech) realizará revisão anual nesta semana. Técnicos usam uniforme azul com logo ElevaTech. Crachá LARANJA. Acesso ao subsolo e casa de máquinas liberado entre 8h e 17h. Acompanhar obrigatoriamente.',
      prioridade: 'urgente',
      ativa: true,
      criadoEm: agora - 2 * 60 * 60 * 1000,
      expiradoEm: expiracaoUmaSemana,
    },
    {
      condominioId,
      texto: 'Síndico Marcelo Patrianni (apto A1001) está viajando até 25/05. Contato de emergência exclusivo pelo celular (12) 99123-4567. Não acionar interfone do apartamento.',
      prioridade: 'normal',
      ativa: true,
      criadoEm: agora - 24 * 60 * 60 * 1000,
      expiradoEm: expiracaoUmaSemana,
    },
    {
      condominioId,
      texto: 'Salão de Festas Torre A reservado para o próximo sábado das 14h às 23h pelo apto B1504 (Maria Clara). Barulho autorizado até 22h30. Confirmar identidade de convidados na entrada.',
      prioridade: 'normal',
      ativa: true,
      criadoEm: agora - 6 * 60 * 60 * 1000,
      expiradoEm: expiracaoUmMes,
    },
    {
      condominioId,
      texto: 'ATENÇÃO: Câmera CAM 07 (Garagem Torre B nível -1) está offline para manutenção. Fazer rondas com frequência dobrada nessa área até normalização.',
      prioridade: 'urgente',
      ativa: true,
      criadoEm: agora - 3 * 60 * 60 * 1000,
      expiradoEm: expiracaoUmaSemana,
    },
    {
      condominioId,
      texto: 'Mudança autorizada: apto A0802 (família Nakamura). Empresa de mudança autorizada a usar entrada de serviço e elevador de carga entre 9h e 18h somente. Máximo 2 funcionários por vez.',
      prioridade: 'normal',
      ativa: true,
      criadoEm: agora - 1 * 60 * 60 * 1000,
      expiradoEm: expiracaoUmaSemana,
    },
  ]);
}

function criarConteudoFicha() {
  return {
    condominioNome: CONDOMINIO_NOME,
    endereco: 'Av. [endereço], São José dos Campos — SP',
    torres: 'Torre A e Torre B — 20 andares cada, 2 unidades por andar, total 80 unidades',
    layout: {
      entradaPrincipal: 'Av. [nome] — cancela eletrônica + pedestres. Guarita à direita com vidro blindado, monitor CFTV e controles. Câmeras CAM 01 (externa) e CAM 02 (interna).',
      entradaServico: 'Rua lateral — manual + campainha.',
      viaInterna: 'Velocidade máx. 10 km/h. Esquerda: Hall Torre A. Direita: Hall Torre B. Fundo: garagem (subsolo). CAM 03 (via), CAM 04 (Torre A), CAM 05 (Torre B).',
      garagem: 'Nível -1 Torre A: vagas 001–040. Nível -1 Torre B: vagas 041–080. Nível -2: 20 vagas visitantes, 4 vagas serviço, gerador, depósito. CAMs 06–09.',
      areaLazer: 'Entre torres: piscina adulto + infantil, academia, salão festas Torre A (80 pessoas), salão festas Torre B (40 pessoas), espaço gourmet, playground, sala de jogos, pet place. CAMs 10–12.',
    },
    cameras: [
      { id: 'CAM 01', local: 'Entrada principal — externa', cobertura: 'Cancela e rua' },
      { id: 'CAM 02', local: 'Entrada principal — interna', cobertura: 'Via de entrada' },
      { id: 'CAM 03', local: 'Via interna', cobertura: 'Circulação entre torres' },
      { id: 'CAM 04', local: 'Frente Torre A', cobertura: 'Hall e acesso' },
      { id: 'CAM 05', local: 'Frente Torre B', cobertura: 'Hall e acesso' },
      { id: 'CAM 06', local: 'Garagem -1 Torre A', cobertura: 'Vagas e circulação' },
      { id: 'CAM 07', local: 'Garagem -1 Torre B', cobertura: 'Vagas e circulação' },
      { id: 'CAM 08', local: 'Garagem -2 visitantes', cobertura: 'Vagas e circulação' },
      { id: 'CAM 09', local: 'Garagem -2 gerador/depósito', cobertura: 'Área técnica' },
      { id: 'CAM 10', local: 'Piscina', cobertura: 'Deck e piscinas' },
      { id: 'CAM 11', local: 'Área de lazer', cobertura: 'Academia e entorno' },
      { id: 'CAM 12', local: 'Pet place', cobertura: 'Área cercada' },
      { id: 'CAM 13', local: 'Corredor Torre A — térreo', cobertura: 'Hall' },
      { id: 'CAM 14', local: 'Corredor Torre B — térreo', cobertura: 'Hall' },
    ],
    regraDeAcesso: {
      moradores: 'Com tag: cancela automática. Sem tag: verificar visualmente e/ou documento, liberar manualmente. Dúvida: solicitar documento com cordialidade.',
      visitantes: 'Aguarda na guarita. Ligar para o apto: "Sr./Sra. [nome], tem um(a) [visitante] aqui." Autorizado: registrar doc, crachá AZUL, orientar estacionamento. Não autorizado: informar cordialmente. Visitantes não sobem desacompanhados em caso de dúvida.',
      prestadores: 'Verificar na agenda. Agendado: doc + crachá LARANJA + elevador de serviço. Não agendado: ligar para apto ou administração antes de liberar. Crachá LARANJA devolvido na saída.',
      delivery: 'Entregadores NÃO sobem às torres. Notificar morador via interfone. Morador desce ou autoriza porteiro a receber (só itens pequenos). Perecíveis: insistir no contato; se não atender em 5 min, orientar entregador a contatar diretamente.',
    },
    pontosCriticos: [
      { local: 'Portão garagem Torre A', situacao: 'Sensor de fechamento sensível', acao: 'Verificar se fechou completamente. Acionar manualmente pelo painel da guarita se necessário.' },
      { local: 'Elevador Torre B — Cabine 2', situacao: 'Histórico de pane quando sobrecarregado', acao: 'Se parar entre andares: acionar empresa de manutenção imediatamente.' },
      { local: 'Gerador (subsolo nível -2)', situacao: 'Acionamento automático em até 10s de queda de energia', acao: 'Se não acionar: chamar zelador imediatamente.' },
      { local: 'Bomba d\'água (reservatório Torre A)', situacao: 'Ruído anormal indica necessidade de manutenção', acao: 'Registrar e acionar zelador.' },
      { local: 'Iluminação escada emergência Torre B (andares 15–20)', situacao: 'Lâmpadas com vida útil reduzida', acao: 'Verificar nas rondas. Reportar ao zelador para substituição.' },
    ],
    contatoEmergencia: {
      samu: '192',
      bombeiros: '193',
      policia: '190',
      defesaCivil: '199',
      enel: '0800 722 2196',
      sabesp: '0800 055 0195',
      sindico: '(12) 99123-4567',
      subsindico: '(12) 99234-5678',
      zelador: '(12) 99345-6789',
      supervisorSeguranca: '(12) 99456-7890',
      gerenteOperacional: '(12) 99567-8901',
      elevadores: '(12) 3912-3456',
      gerador: '(12) 3923-4567',
    },
    situacoesEspeciais: [
      { unidade: 'A1502', situacao: 'Morador com mobilidade reduzida — usa cadeira de rodas', instrucao: 'Garantir acesso preferencial. Elevador social tem prioridade. Oferecer ajuda com volumes.' },
      { unidade: 'A0301', situacao: 'Moradora idosa com rotina de caminhada noturna', instrucao: 'Não alarmar — é rotina conhecida. Cumprimentar e verificar se está bem.' },
      { unidade: 'B2001', situacao: 'Cobertura — animal de grande porte (pastor alemão)', instrucao: 'Confirmar uso de focinheira antes de liberar nas áreas comuns.' },
      { unidade: 'B1204', situacao: 'Histórico de conflito por barulho com vizinhos', instrucao: 'Registrar qualquer reclamação com hora e descrição. Acionar supervisor se recorrente.' },
    ],
    rotinas: [
      { horario: '06h–08h', ocorrencia: 'Saída de moradores para trabalho; entrada equipe limpeza', atencao: 'Confirmar credencial dos funcionários de limpeza' },
      { horario: '07h–09h', ocorrencia: 'Crianças saindo com responsáveis para escola', atencao: 'Atenção redobrada no portão — nunca liberar criança sozinha' },
      { horario: '12h–14h', ocorrencia: 'Pico de delivery de almoço', atencao: 'Não liberar entregadores para subir' },
      { horario: '17h–20h', ocorrencia: 'Pico de retorno de moradores', atencao: 'Cancela com maior fluxo' },
      { horario: '18h–22h', ocorrencia: 'Uso intenso das áreas de lazer', atencao: 'Verificar se apenas moradores e convidados autorizados' },
      { horario: '22h', ocorrencia: 'Início do horário de silêncio', atencao: 'Verificar área de lazer e orientar moradores sobre volume' },
      { horario: '23h–05h', ocorrencia: 'Fluxo mínimo', atencao: 'Atenção máxima — qualquer movimentação incomum deve ser investigada' },
    ],
    protocolos: {
      incendio: 'Não abrir portas sem verificar temperatura. Acionar alarme (guarita e halls). Ligar 193. Notificar moradores via interfone. Evacuação pelas escadas — NUNCA elevadores. Aguardar Bombeiros na entrada.',
      acidente: 'Garantir segurança do socorrista. Ligar 192 (SAMU). Não mover vítima. Notificar supervisor e síndico. Preservar cena.',
      invasao: 'Não confrontar. Observar características. Acionar colega via rádio. Ligar 190. Registrar detalhes.',
      elevadorPreso: 'Manter contato via interfone. Tranquilizar: "Estamos acionando a empresa. O(a) sr./sra. está seguro(a)." Acionar empresa de elevadores. Não abrir manualmente.',
      faltaEnergia: 'Verificar se é interno ou regional. Zelador para quadro geral. Aguardar gerador (10s). Se não acionar: empresa de manutenção. Blecaute geral: ENEL 0800 722 2196.',
    },
    circuitoRonda: [
      'Guarita / Entrada principal',
      'Hall de entrada Torre A',
      'Garagem nível -1 Torre A',
      'Garagem nível -2 Torre A',
      'Escada emergência Torre A (amostragem a cada 3 andares)',
      'Telhado / Casa de máquinas Torre A',
      'Hall de entrada Torre B',
      'Garagem nível -1 Torre B',
      'Garagem nível -2 Torre B',
      'Escada emergência Torre B (verificação andares 15–20 com atenção especial)',
      'Telhado / Casa de máquinas Torre B',
      'Piscina e deck',
      'Academia',
      'Salão de festas',
      'Espaço gourmet',
      'Playground',
      'Pet place',
      'Jardins e perímetro externo',
    ],
    padraoAtendimento: 'Alto padrão: tratamento sempre formal (senhor/senhora). Proatividade: antecipar necessidades. Discrição absoluta sobre rotinas de moradores. Linguagem padrão: "Bom dia/tarde/noite! Posso ajudá-lo(a)?" e "Bem-vindo(a) de volta, Sr./Sra. [nome]."',
    slas: {
      coberturaPortaria: 'Substituto em até 2 horas',
      coberturaDemai: 'Substituto em até 4 horas',
      frequenciaRonda: 'Máximo 60 minutos entre rondas',
      relatorioMensal: 'Até dia 5 do mês seguinte',
    },
  };
}

function timestampDeHoje(hora, minuto) {
  const data = new Date();
  data.setHours(hora, minuto, 0, 0);
  return data.getTime();
}

function timestampDeOntem(hora, minuto) {
  const data = new Date();
  data.setDate(data.getDate() - 1);
  data.setHours(hora, minuto, 0, 0);
  return data.getTime();
}

function mapearPorNome(registros, ids) {
  return registros.reduce((mapa, registro, index) => {
    mapa[registro.nome] = ids[index];
    return mapa;
  }, {});
}
