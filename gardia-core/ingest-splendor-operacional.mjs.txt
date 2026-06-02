import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const CONTRACT_ID = "354f5903-5f32-4e1a-b688-d2771c597696";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

// Remover chunks operacionais antigos do Splendor para evitar duplicatas
console.log("Removendo dados operacionais antigos do Splendor...");
const { error: delError } = await supabase
  .from("knowledge_chunks")
  .delete()
  .eq("contract_id", CONTRACT_ID)
  .in("source_doc", [
    "DETALHAMENTO_OPERACIONAL_GARDIA",
    "SPLENDOR_OPERACIONAL_COMPLETO",
    "SPLENDOR_AREAS_LAZER",
    "SPLENDOR_PORTARIA",
    "SPLENDOR_FINANCEIRO",
    "SPLENDOR_MANUTENCAO",
    "SPLENDOR_ASSEMBLEIAS",
    "SPLENDOR_ANIMAIS",
    "SPLENDOR_NORMAS"
  ]);

if (delError) console.log("Aviso ao deletar:", delError.message);
else console.log("Dados antigos removidos!\n");

// Chunks orientados a perguntas reais — checklist completo do Splendor
const chunks = [

  // ══════ ÁREAS DE LAZER ══════
  {
    source_doc: "SPLENDOR_AREAS_LAZER",
    source_type: "regulamento",
    content: "ACADEMIA DO SPLENDOR PATRIANNI — horários e regras: Dias úteis 06h às 23h. Fins de semana e feriados 07h às 22h. Reserva NÃO necessária. Capacidade máxima 10 pessoas. Regras: tênis fechado obrigatório, trazer toalha e garrafa d'água, proibido celular com alto-falante, crianças menores de 12 anos somente com responsável adulto. Equipamentos: 3 esteiras, 2 bicicletas ergométricas, 1 elíptico, multifuncional, pulldown, voador, anilhas e halteres 2kg a 20kg. Manutenção preventiva: toda segunda-feira 08h às 10h (academia pode fechar)."
  },
  {
    source_doc: "SPLENDOR_AREAS_LAZER",
    source_type: "regulamento",
    content: "PISCINA DO SPLENDOR PATRIANNI — horários e regras: Aberta todos os dias das 08h às 22h. Sem necessidade de reserva. Capacidade máxima 30 pessoas. Regras obrigatórias: banho antes de entrar na água, sunga e maiô obrigatórios (bermudão somente com forro interno), proibido vidros de qualquer tipo, crianças menores de 10 anos obrigatoriamente com adulto responsável, proibido alimentos na beira da piscina. Responsável técnico de química: empresa Aqua Clean (CRQ registrado). Laudos mensais disponíveis na administração."
  },
  {
    source_doc: "SPLENDOR_AREAS_LAZER",
    source_type: "regulamento",
    content: "SALÃO DE FESTAS DO SPLENDOR PATRIANNI — como reservar e regras: Disponível sextas-feiras 18h às 24h, sábados 10h às 24h, domingos 10h às 22h. Dias úteis NÃO disponível para eventos (exceto feriados que seguem regra de domingo). Capacidade máxima 80 pessoas. Reserva obrigatória com no mínimo 7 dias de antecedência pelo WhatsApp (12) 99800-0200 ou presencialmente. Taxa de uso R$ 350,00 reembolsável mediante vistoria. Taxa de limpeza R$ 150,00 não reembolsável. Inclui: mesas, cadeiras, geladeira, freezer, fogão industrial, churrasqueira, som ambiente. Não inclui: louças, talheres, toalhas, gelo, bebidas. Horário de encerramento de música: até 22h em dias úteis e domingos, até 23h nas sextas e sábados (Lei do Silêncio de SJC)."
  },
  {
    source_doc: "SPLENDOR_AREAS_LAZER",
    source_type: "regulamento",
    content: "ESPAÇO GOURMET E CHURRASQUEIRA DO SPLENDOR PATRIANNI: Disponível todos os dias das 10h às 22h. Reserva obrigatória com 48h de antecedência pelo WhatsApp da administração. Taxa R$ 100,00 por uso (inclui limpeza). Capacidade 20 pessoas. Inclui: churrasqueira a carvão, bancada, pia, geladeira pequena. Morador é responsável pelo carvão e pela limpeza da grelha após uso. SALÃO DE JOGOS: todos os dias 10h às 22h, capacidade 12 pessoas. Equipamentos: mesa de sinuca, pebolim, ping-pong, TV, videogame. Sem reserva necessária. PLAYGROUND: todos os dias 08h às 20h, até 12 anos, crianças menores de 6 anos obrigatoriamente com adulto."
  },
  {
    source_doc: "SPLENDOR_AREAS_LAZER",
    source_type: "regulamento",
    content: "ESPAÇO PET (PETSHOWER) DO SPLENDOR PATRIANNI: Disponível todos os dias das 07h às 21h. Equipamentos: banheira com chuveiro, mesa de secagem, secador. Reserva necessária com 24h de antecedência via WhatsApp da administração. Tutor é responsável pela limpeza completa após o uso. Área restrita: animais NÃO podem acessar piscina, academia, salão de festas, salão de jogos e playground."
  },

  // ══════ PORTARIA E ACESSO ══════
  {
    source_doc: "SPLENDOR_PORTARIA",
    source_type: "regulamento",
    content: "PORTARIA DO SPLENDOR PATRIANNI — funcionamento e contatos: Portaria física 24 horas. Portaria remota das 23h às 06h com apoio de câmeras. Torre A: ramal 100. Torre B: ramal 101. Emergências: ramal 199. WhatsApp da portaria: (12) 99800-0100. PROTOCOLO DE VISITANTES: 1) Visitante informa nome e unidade na portaria. 2) Porteiro liga para o morador para autorização. 3) Morador autoriza por ligação ou aplicativo. 4) Visitante registra documento (RG ou CNH). 5) Porteiro libera o acesso. Visitantes recorrentes: morador pode pré-autorizar por WhatsApp."
  },
  {
    source_doc: "SPLENDOR_PORTARIA",
    source_type: "regulamento",
    content: "DELIVERIES E PRESTADORES DE SERVIÇO NO SPLENDOR PATRIANNI: Deliveries ficam na portaria — entregadores NÃO entram nas torres. Exceção: entregas volumosas (móveis, eletrodomésticos) com morador presente. Encomendas guardadas por até 5 dias úteis. Prestadores de serviço devem ser previamente autorizados pelo morador, com registro de nome, empresa, documento e unidade de destino. Porteiro anota horário de entrada e saída. MUDANÇAS: permitidas segunda a sexta 08h às 17h e sábados 08h às 12h. Proibido domingos e feriados. Aviso prévio de 48h obrigatório. Taxa de mudança R$ 200,00 (proteção dos elevadores). Uso obrigatório do elevador de serviço."
  },
  {
    source_doc: "SPLENDOR_PORTARIA",
    source_type: "regulamento",
    content: "VEÍCULOS E GARAGEM DO SPLENDOR PATRIANNI: Cadastro de veículos obrigatório na administração com documento do veículo e CNH. Limite: 1 vaga por unidade. Vagas 01 a 80 correspondem às unidades 101 a 1020. Visitas com veículo: porteiro emite senha de visitante — não pode usar vagas fixas. Vagas de visitante: 10 vagas na entrada. Velocidade máxima na garagem: 10 km/h. Proibido lavar veículo na garagem, guardar materiais ou móveis nas vagas. Carga e descarga: área específica junto à rampa — máximo 20 minutos."
  },

  // ══════ FINANCEIRO ══════
  {
    source_doc: "SPLENDOR_FINANCEIRO",
    source_type: "regulamento",
    content: "TAXA CONDOMINIAL DO SPLENDOR PATRIANNI: Valor atual (2025) R$ 620,00 por unidade (rateio igualitário). Vencimento: todo dia 10 de cada mês. Formas de pagamento: boleto bancário (enviado por email até dia 5), PIX (CNPJ do condomínio), débito automático (solicitar na administração). Multa por atraso: 2% + juros de 1% ao mês a partir do dia 11 (conforme Art. 1.336 §1 do CC). Sem prazo de carência. Cobrança judicial após 3 meses de inadimplência. Fundo de reserva: 10% da taxa mensal (R$ 62,00 por unidade). Saldo atual do fundo: R$ 48.000,00. Balancete disponibilizado até o dia 15 de cada mês via email e aplicativo."
  },

  // ══════ MANUTENÇÃO ══════
  {
    source_doc: "SPLENDOR_MANUTENCAO",
    source_type: "regulamento",
    content: "MANUTENÇÃO E CHAMADOS DO SPLENDOR PATRIANNI: Zelador Chefe José Carlos disponível 07h às 18h — (12) 99800-0001. Plantão noturno: portaria ramal 100 ou 101. Administradora Unione: (12) 3900-0000 segunda a sexta 08h às 18h. Como abrir chamado: WhatsApp do zelador, aplicativo do condomínio (aba Chamados) ou registro na portaria. Urgências (vazamento, falta de energia em área comum, elevador parado): ligar ramal 199. Tempo de resposta: urgências até 2 horas, chamados normais até 48 horas úteis. Contratos vigentes: elevadores Thyssenkrupp (emergência 0800-722-8282), piscina Aqua Clean (semanal), dedetização PestControl (trimestral), jardim Verde Vivo (terças-feiras)."
  },
  {
    source_doc: "SPLENDOR_MANUTENCAO",
    source_type: "regulamento",
    content: "AVCB E SEGURANÇA CONTRA INCÊNDIO DO SPLENDOR PATRIANNI: AVCB válido até dezembro/2026. Extintores: recarga anual (última janeiro/2025). Mangueiras: teste anual. Iluminação de emergência: teste mensal. Brigada de incêndio: 6 brigadistas treinados (último treinamento março/2025). CÂMERAS: 24 câmeras cobrindo todas as áreas comuns (halls, garagem, elevadores, portaria, áreas de lazer). Imagens guardadas por 30 dias. Acesso às imagens: somente síndico, administradora e mediante decisão judicial (LGPD — condomínio é agente de tratamento de dados). Elevadores Thyssenkrupp: manutenção toda segunda-feira 09h às 11h."
  },

  // ══════ ASSEMBLEIAS ══════
  {
    source_doc: "SPLENDOR_ASSEMBLEIAS",
    source_type: "regulamento",
    content: "ASSEMBLEIAS E GOVERNANÇA DO SPLENDOR PATRIANNI: AGO (Assembleia Geral Ordinária): março de cada ano. Próxima AGO: março/2026. Como participar: presencial no salão de festas ou virtual pelo Zoom (link enviado na convocação). Procuração aceita física ou digital (Art. 1.354-A CC, Lei 14.309/2022). Convocação com mínimo 5 dias de antecedência por email, WhatsApp e quadro de avisos. Quórum: deliberações ordinárias por maioria dos presentes em 2ª convocação; alteração da convenção e obras voluptuárias por 2/3 de todos os condôminos; destituição do síndico por maioria absoluta; comportamento antissocial (multa 10x) por 3/4 dos restantes. Conselho Fiscal: 3 membros, presidente Maria Silva (apto 502-A), reuniões mensais toda primeira segunda-feira."
  },

  // ══════ ANIMAIS ══════
  {
    source_doc: "SPLENDOR_ANIMAIS",
    source_type: "regulamento",
    content: "ANIMAIS DE ESTIMAÇÃO NO SPLENDOR PATRIANNI: Permitidos cães e gatos de qualquer porte. Animais exóticos somente dentro das unidades. Cadastro obrigatório: nome do animal, raça, peso, vacinas em dia (carteirinha exigida na portaria). Áreas permitidas: todas as áreas comuns com guia. Áreas restritas: piscina, academia, salão de festas, salão de jogos, playground. Elevadores: animais usam o elevador de serviço. Guia obrigatória máximo 2 metros em todas as áreas comuns. Fezes: recolhimento obrigatório (sacos disponíveis na portaria). Raças agressivas (Pitbull, Rottweiler, Dogo, Fila Brasileiro, Mastim): guia curta, focinheira e enforcador obrigatórios (Lei Municipal SJC 10.807/2023). Latido excessivo pode gerar notificação e multa por perturbação do sossego."
  },

  // ══════ SÍNDICO E CONTATOS ══════
  {
    source_doc: "SPLENDOR_SINDICO_CONTATOS",
    source_type: "regulamento",
    content: "SÍNDICO E CONTATOS DO SPLENDOR PATRIANNI: Síndico: Reinaldo Gramacho — (12) 99700-0000 — sindico@splendorpatrianni.com.br — atendimento segunda a sexta 09h às 12h e 14h às 18h — mandato até março/2026. Administradora Unione: (12) 3900-0000 — contato@unione.com.br — segunda a sexta 08h às 18h — Av. Andrômeda 500, Jardim Aquarius, SJC. Canais de comunicação: WhatsApp portaria (12) 99800-0100, WhatsApp administração (12) 99800-0200, email contato@splendorpatrianni.com.br, aplicativo Condomínio App (iOS e Android — código de acesso na portaria), quadro de avisos nos halls das torres A e B."
  },

  // ══════ NORMAS INTERNAS ══════
  {
    source_doc: "SPLENDOR_NORMAS",
    source_type: "regulamento",
    content: "NORMAS DE SILÊNCIO E OBRAS NO SPLENDOR PATRIANNI: Horário de silêncio: 22h às 07h em dias úteis, 23h às 09h em fins de semana (Lei Municipal 8.940/2013 de SJC). Festas em unidades: encerrar música até o horário de silêncio. Obras e reformas: somente dias úteis das 08h às 16h para serviços com ruído. Comunicação prévia ao síndico com projeto e ART/RRT obrigatória. Proibido fins de semana sem autorização especial. Morador responde por danos à estrutura e áreas comuns. Entulho: morador deve contratar caçamba externa. LIXO: depositar no andar até as 22h para coleta pelo zelador. Reciclagem: segunda, quarta e sexta (caixas azuis nos halls). Proibido lixo em corredores e escadas."
  }
];

console.log("Iniciando insercao de", chunks.length, "chunks operacionais do Splendor Patrianni...\n");

let inseridos = 0;
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  process.stdout.write("[" + (i+1) + "/" + chunks.length + "] " + c.source_doc + "...");
  try {
    const embedding = await embed(c.content);
    const { error } = await supabase.from("knowledge_chunks").insert({
      contract_id: CONTRACT_ID,
      source_doc: c.source_doc,
      source_type: c.source_type,
      content: c.content,
      embedding,
      metadata: { origem: "onboarding_checklist_v1", versao: "2025", condominio: "Splendor Patrianni" }
    });
    if (error) { console.log(" ERRO:", error.message); }
    else { console.log(" OK"); inseridos++; }
  } catch (e) { console.log(" FALHA:", e.message); }
}

console.log("\n══════════════════════════════════════════════════");
console.log(" Inseridos: " + inseridos + " de " + chunks.length + " chunks operacionais");
console.log(" Cobertura do Splendor Patrianni agora:");
console.log("  Academia, Piscina, Salão de Festas, Gourmet");
console.log("  Playground, Salão de Jogos, Espaço Pet");
console.log("  Portaria, Visitantes, Deliveries, Mudanças");
console.log("  Veículos, Taxa condominial, Manutenção");
console.log("  AVCB, Assembleias, Animais, Síndico");
console.log("  Normas de silêncio e obras");
console.log("══════════════════════════════════════════════════");
