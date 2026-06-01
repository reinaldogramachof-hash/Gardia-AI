import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

// Material completo do GPT — estruturado para o RAG
const chunks = [

  // ══════ SJC — LEI DO SILENCIO ══════
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "Sao Jose dos Campos - Lei do Silencio (Lei 8.940/2013 e alteracoes): Proibe ruidos, vibracoes ou sons que ultrapassem os limites da ABNT NBR 10151/10152. Periodos: diurno 7h-19h, vespertino 19h-22h, noturno 22h-7h. Limites: 45 dB para periodo noturno e 85 dB para demais faixas. Sancoes: advertencia, multas, embargos e cassacao de alvara. Obras em apartamentos: permitidas apenas 08h-12h e 13h-17h em dias uteis, seguindo NBR 16280/2015."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "SJC - Lei 9.060/2013 (altera Lei do Silencio): Inclui ruido com componentes tonais e regras para eventos e fogos de artificio. Art 5-7: fixa horarios e limites sonoros; exige licenca para atividades ruidosas, incluindo festas em condominios. Lei 9.843/2018: amplia definicao de ruido proibido, incluindo som de veiculos ou equipamentos de moradores. Descumprimento sujeita a multas e cassacao de licenca."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "SJC - Lei 10.908/2024 (piscinas seguras): Obriga condominios com piscina a instalar grades, cercas ou escadas pet para evitar acidentes com animais. Descumprimento: multa e interdicao da piscina. Lei 9.337/2016: proibe abandono de animais em vias publicas e areas particulares; multa de 400 UFMs. Cameras de seguranca: sem lei especifica municipal; instalacao nas areas comuns deve seguir a LGPD e ser aprovada em assembleia."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "SJC - Dados do mercado condominial (IBGE 2024): aproximadamente 950 condominios verticais e 80 condominios horizontais. Maior concentracao nos bairros Jardim Aquarius, Urbanova e Vila Ema. Populacao condominial representa mais de 30% dos habitantes. Empresas de administracao ativas: Primus, Aurea, Admari e Dux Condominios. PROCON SJC: principais reclamacoes sao cobranca indevida de taxas, barulho noturno e dificuldade de acesso as assembleias."
  },

  // ══════ SAO PAULO CAPITAL ══════
  {
    source_doc: "Legislacao_Municipal_SP_Capital",
    source_type: "legislacao",
    content: "Sao Paulo Capital - Programa Silencio Urbano (PSIU - Decreto 34.569/1994): Institui controle de poluicao sonora. Aplica-se a bares, casas noturnas, templos e condominios em questoes de perturbacao sonora. Art 62 da Lei de Contravencoes Penais (Decreto-Lei 3.688/1941): tipifica perturbar o sossego alheio com gritaria, algazarra ou equipamentos sonoros."
  },
  {
    source_doc: "Legislacao_Municipal_SP_Capital",
    source_type: "legislacao",
    content: "Sao Paulo Capital - Codigo de Obras e Edificacoes (Lei 16.642/2017): Para reformas internas exige previa aprovacao do condominio e ART/RRT. Obras: segunda a sexta das 8h as 17h e sabado das 8h as 13h. Devem seguir NBR 16280/2015. Arts 77-86: obrigam laudo de engenheiro, comunicacao ao sindico e responsabilidade do proprietario. Animais em condominios: prevalece o art 1.228 do Codigo Civil; TJSP reconhece que animais podem permanecer se nao causarem riscos."
  },

  // ══════ CAMPINAS ══════
  {
    source_doc: "Legislacao_Municipal_Campinas",
    source_type: "legislacao",
    content: "Campinas - Lei do Silencio (Lei 14.011/2011): Declara infracao administrativa produzir ruido que perturbe a tranquilidade publica. Aplica-se a estabelecimentos comerciais, industrias, veiculos e residencias, incluindo condominios. Art 3: caracteriza infracao a emissao de sons que causem perturbacao ao sossego publico. Art 5: determina que a fiscalizacao pode embargar atividades e cassar licencas. Limites adotados: NBR 10151/2019 (55 dB diurno, 50 dB noturno)."
  },

  // ══════ NORMAS ABNT ══════
  {
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 5674:2012 - Manutencao de edificacoes: Exige elaboracao de plano de manutencao preventiva com cadastro de todos os sistemas. Periodicidades obrigatorias: sistemas eletricos e hidraulicos (anualmente), fachada (a cada 5 anos), elevadores (mensal), para-raios (anual), extintores (anual), bombas (mensal). Sindico deve guardar registros e laudos, sob pena de responder civilmente por danos. Norma atualizada em 2019."
  },
  {
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 16280:2015 - Reforma em edificacoes: Obriga o sindico a exigir projeto e ART/RRT para qualquer intervencao em unidade autonoma ou area comum. Deve haver analise previa do impacto estrutural, eletrico, hidraulico e acustico. O morador deve submeter plano, cronograma e laudo; o sindico autoriza e acompanha a execucao. Atualizada em 2022 para incluir controle de residuos. Descumprimento: multas, embargo da obra e responsabilizacao civil."
  },
  {
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 10151:2019 - Avaliacao de ruido em areas habitadas: Em areas residenciais o nivel maximo e 55 dB(A) entre 7h e 20h e 50 dB(A) no periodo noturno. Medições com decibelimetro, periodo minimo de 5 minutos, correcao para ruidos tonais. Sindico pode contratar empresa para medir ruidos e comprovar descumprimento da lei do silencio. ABNT NBR 9050:2020 - Acessibilidade: Sindico deve garantir pisos antiderrapantes, largura minima de corredores, rampas ate 8%, corrimaos duplos e sinalizacao. Verificacoes anuais."
  },
  {
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 13434:2004 - Sinalizacao de seguranca contra incendio: Sindico deve manter placas de saida, rota de fuga, equipamentos e orientacao visiveis. Materiais fotoluminescentes devem ser recarregados. Verificacao a cada vistoria do Corpo de Bombeiros (normalmente anual para AVCB). ABNT NBR 13714:2000 - Sistemas de hidrantes: Teste do sistema (pressurizacao e vazao) minimo uma vez por ano; manutencao mensal das bombas e mangueiras. ABNT NBR 5410:2004 - Instalacoes eletricas: Inspecoes a cada cinco anos; testes de disjuntores e DR anuais."
  },

  // ══════ CORPO DE BOMBEIROS SP ══════
  {
    source_doc: "Corpo_Bombeiros_SP_ITs",
    source_type: "legislacao",
    content: "Corpo de Bombeiros SP (Decreto 56.819/2011 - Instrucoes Tecnicas): IT 17 - Brigada de incendio: formacao obrigatoria, treinamento anual (semestral para areas de risco), reciclagem conforme NBR 14276. Falta de brigada impede emissao do AVCB. IT 18 - Iluminacao de emergencia: niveis minimos nas rotas de fuga, autonomia minima de 60 minutos, testes mensais. IT 21 - Extintores: recarga anual e ensaio hidrastatico a cada 5 anos. Falta de manutencao impede renovacao do AVCB."
  },

  // ══════ VIGILANCIA SANITARIA ══════
  {
    source_doc: "Vigilancia_Sanitaria_Piscinas",
    source_type: "legislacao",
    content: "Vigilancia Sanitaria e piscinas em condominios (Resolucao CFQ 332/2025): Piscinas de uso coletivo devem ter responsavel tecnico inscrito no CRQ com ART para tratamento quimico. Exigencias: controle diario de cloro e pH com registro em livro proprio; analise laboratorial mensal por laboratorio credenciado; manutencao de filtros e bombas; guarda de documentos por cinco anos. Descumprimento: interdicao da piscina e multas."
  },

  // ══════ CETESB ══════
  {
    source_doc: "CETESB_Limites_Ruido",
    source_type: "legislacao",
    content: "CETESB - Limites de ruido (Procedimento P1.114): Em areas urbanas residenciais o nivel sonoro maximo permitido e 55 dB(A) durante o dia e 50 dB(A) a noite, alinhado com a NBR 10151/2019. Complementa a Lei do silencio municipal. Condominios que promovam festas ou eventos alem desses limites podem ser multados e ter alvara cassado. Codigo Estadual do Meio Ambiente (Lei 997/1976): CETESB e responsavel pela fiscalizacao e pode embargar atividades que nao respeitem padroes de ruido."
  },

  // ══════ JURISPRUDENCIA TJSP ══════
  {
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Perturbacao do sossego: Indenizacao de R$ 10 mil reconhecida por barulho excessivo. Filmagens e advertencias do sindico foram prova do descumprimento do regimento. Licao pratica: sindico deve documentar reclamacoes, advertencias e medicoes de ruido para eventual acao judicial. Obras sem autorizacao (Apelacao 2023): TJSP manteve sentenca obrigando demolir obra irregular em cobertura e pagar multa; sindico deve exigir ART/RRT e aprovacao previa."
  },
  {
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Animais em condominios: Convencao nao pode impedir condômino de ter animal domestico se nao causar riscos a seguranca ou higiene (Ap. 1032111-90.2019, 2021). Animais de apoio emocional com laudo medico devem ser permitidos por direito fundamental a saude (Ap. 1009178-60, 2024). Airbnb: locacao temporaria e permitida salvo restricao aprovada por quorum qualificado (3/4) na convencao (Ap. 1005052-29, 2021)."
  },
  {
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Inadimplencia: TJSP confirmou penhora de salario (ate 30%) para quitacao de cotas condominiais (Ap. 1003321-69, 2022). Contribuicoes tem natureza propter rem. Abuso do sindico: multas aplicadas sem respaldo da assembleia ou convencao podem ser anuladas (Ap. 1001736-08, 2022). Assembleia virtual: valida apos Lei 14.309/2022 (Ap. 1001149-09, 2023). Vagas de garagem: alienacao de vaga comum exige quorum unanime (art 1.351 CC) - Ap. 1030307-78, 2023."
  },

  // ══════ GRAPROHAB ══════
  {
    source_doc: "GRAPROHAB_Legislacao_Estadual_SP",
    source_type: "legislacao",
    content: "GRAPROHAB (Grupo de Analise e Aprovacao de Projetos Habitacionais): Analisa projetos de condominios verticais, horizontais, mistos e condominios de lotes. Diferenca: condominio horizontal e regido pela Lei 4.591/64 (areas comuns privadas); loteamento fechado tem vias publicas e moradores criam associacao. Condominio de lotes (Lei 13.465/2017): so pode ser aprovado se municipio tiver legislacao autorizando. GRAPROHAB exige aprovacao de meio ambiente, infraestrutura e regularizacao fundiaria."
  }
];

console.log("Iniciando insercao de", chunks.length, "chunks de conhecimento...");
console.log("Fonte: Pesquisa GPT — Legislacao SP, ABNT, TJSP, CETESB, Bombeiros");
console.log("");

let inseridos = 0;
for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  process.stdout.write("[" + (i+1) + "/" + chunks.length + "] " + chunk.source_doc.substring(0,30) + "...");
  try {
    const embedding = await embed(chunk.content);
    const { error } = await supabase.from("knowledge_chunks").insert({
      contract_id: null,
      source_doc: chunk.source_doc,
      source_type: chunk.source_type,
      content: chunk.content,
      embedding,
      metadata: { origem: "gpt_research", cidade: chunk.source_doc }
    });
    if (error) { console.log(" ERRO:", error.message); }
    else { console.log(" OK"); inseridos++; }
  } catch (e) { console.log(" FALHA:", e.message); }
}

console.log("");
console.log("════════════════════════════════════════");
console.log(" Inseridos: " + inseridos + " de " + chunks.length);
console.log(" Base de conhecimento atualizada!");
console.log("════════════════════════════════════════");
console.log(" Cobertura total agora:");
console.log(" - Legislacao SJC (Lei do Silencio + 4 leis)");
console.log(" - Legislacao SP Capital (PSIU + Cod. Obras)");
console.log(" - Legislacao Campinas (Lei 14.011/2011)");
console.log(" - Normas ABNT (NBR 5674, 16280, 10151, 9050...)");
console.log(" - Corpo de Bombeiros SP (IT 17, 18, 21)");
console.log(" - Vigilancia Sanitaria (piscinas)");
console.log(" - CETESB (limites de ruido P1.114)");
console.log(" - Jurisprudencia TJSP 2020-2025 (10 decisoes)");
console.log(" - GRAPROHAB (aprovacao de projetos)");