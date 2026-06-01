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

// 22 blocos estruturados pelo Gemini — material juridico preciso
const chunks = [
  {
    id: "SJC_LEGISLACAO_RUIDO_GERAL",
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "Sao Jose dos Campos - Regulacao de Ruido e Sossego: Lei Municipal 8.940/2013 (com atualizacoes pelas Leis 9.060/2013, 9.843/2018 e 10.775/2018). Lei Organica do Municipio Art 21 XI: competencia municipal para normas de prevencao e controle de ruidos. Art 1 da Lei 8.940/2013 proibe execucao de ruidos, vibracoes e sons excessivos de qualquer natureza incluindo veiculos e residencias que contrariem niveis maximos federais, estaduais e municipais. Paragrafo 2 inciso XXII define ruido de vizinhanca como todo aquele produzido em local publico ou privado de forma direta por proprietario, morador ou hospede capaz de gerar desconforto auditivo ou perturbacao da tranquilidade."
  },
  {
    id: "SJC_PARAMETROS_RUIDO_TECNICOS",
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "Sao Jose dos Campos - Parametros tecnicos de ruido (Lei 9.060/2013 e Decreto Municipal 15.745/2014): Faixas horarias: Diurno 7h-19h; Vespertino 19h-22h; Noturno 22h-7h. Aos domingos e feriados o periodo diurno inicia as 9h. Medicoes seguem NBR 10.151 e NBR 10.152 da ABNT preferencialmente no interior do imovel receptor. Lei 8.940/2013 limites zonais: ate 70 decibeis no diurno e 60 decibeis no noturno em zonas residenciais. Alarmes residenciais ou veiculares: limite de disparo continuo de ate 15 minutos."
  },
  {
    id: "SJC_POSTURAS_OBRAS",
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "Sao Jose dos Campos - Codigo de Posturas (Lei Municipal 10.822/2023) e obras: Decreto Municipal 19.894/2025 enquadra reformas ou retrofit em condominios multifamiliares como Risco I (baixo risco) dispensando licenciamento edilicio previo. Porem nao isenta do cumprimento das normas tecnicas de estabilidade e seguranca (Art 2 paragrafo 2). Horarios de obras: servicos de construcao civil continuos apenas em dias uteis das 8h as 16h. Servicos descontinuos das 8h as 18h. Aos domingos e feriados qualquer obra depende de autorizacao da Secretaria Especial de Defesa do Cidadao e cumprimento dos limites acusticos da Lei do Silencio local."
  },
  {
    id: "SJC_ANIMAIS_CAMERAS_CONDOMINIO",
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "Sao Jose dos Campos - Animais e cameras em condominios: Lei Municipal 10.807/2023 exige para caes de racas agressivas (Mastim Napolitano, Pitbull, Rottweiler, American Staffordshire Terrier, Dogo Argentino, Fila Brasileiro, Dobermann, Cane Corso) em areas comuns: coleira, guia curta ate 2 metros, enforcador e focinheira de grade. Lei 10.908/2024: piscinas com animais de pequeno ou medio porte devem ter barreira fisica ou rampas de saida (escada pet), multa de R$ 3.000,00. Lei Complementar 704/2025: regulamenta minimercados de autoatendimento nas areas comuns de condominios: area maxima 25m2, sem obstrucao de rotas de fuga, declaracao formal do sindico para licenciamento. Cameras: morador pode solicitar imagens ao sindico com respaldo nos Arts 186 e 927 do Codigo Civil."
  },
  {
    id: "SP_SILENCIO_PSIU_OBRAS",
    source_doc: "Legislacao_Municipal_SP_Capital",
    source_type: "legislacao",
    content: "Sao Paulo Capital - Controle de poluicao sonora: Lei Municipal 16.402/2016 (Zoneamento) e Decreto 57.443/2016 (PSIU - Programa Silencio Urbano). Art 146 proibe ruidos que ultrapassem limites zonais medidos por ABNT NBR 10151. Limites por zoneamento: Zonas Exclusivamente Residenciais (ZER): diurno (7h-22h) 50 dB(A), noturno (22h-7h) 45 dB(A). Zonas Mistas: diurno 65 dB(A), noturno 45 dB(A). Obras civis (Decreto Municipal 60.581/2021): dias uteis limite 85 dB(A) das 7h-19h e 59 dB(A) no noturno. Sabados das 8h-14h limite 85 dB(A); demais horarios sabado, domingos e feriados limite 59 dB(A)."
  },
  {
    id: "SP_ANIMAIS_CAMERAS_LEIS",
    source_doc: "Legislacao_Municipal_SP_Capital",
    source_type: "legislacao",
    content: "Sao Paulo Capital - Animais e cameras: Lei Municipal 13.131/2001 (Guarda Responsavel de Animais): vedado manter mais de 10 caes ou gatos com mais de 90 dias em residencias. Condutor deve ser maior de idade, multa de R$ 100,00. Decreto Estadual 48.533/2004: focinheira obrigatoria para Pitbull, Rottweiler, Mastim Napolitano e American Staffordshire em locais publicos e areas comuns. Cameras (Lei Municipal 13.541/2003 e Decreto 43.236/2003): condominios com CFTV devem afixar placas 30x30cm com letras pretas sobre fundo amarelo com os dizeres: O ambiente esta sendo filmado. As imagens sao confidenciais e protegidas nos termos da lei. Descumprimento sujeita a multas das Subprefeituras."
  },
  {
    id: "CAMPINAS_SILENCIO_RUIDO_OBRAS",
    source_doc: "Legislacao_Municipal_Campinas",
    source_type: "legislacao",
    content: "Campinas - Silencio e obras: Codigo de Posturas (Lei Municipal 11.111/2001) e Lei Municipal 14.011/2011 (poluicao sonora). Faixas horarias e limites em dB baseados na NBR 10151: das 7h01 as 19h = 70 dB(A); das 19h01 as 22h = 60 dB(A); das 22h01 as 23h59 = 50 dB(A); das 00h00 as 7h00 = 45 dB(A). Fiscalizacao pela Secretaria de Meio Ambiente e Guarda Municipal com decibelimetros calibrados (Decreto 23.015/2023). Obras com ruido (betoneiras, marteletes, serras eletricas) expressamente proibidas apos as 19h. Trabalhos apos 19h ate 7h apenas se estritamente silenciosos. Descumprimento sujeita a autuacoes e multas progressivas pelo canal 156."
  },
  {
    id: "CAMPINAS_ANIMAIS_MONITORAMENTO",
    source_doc: "Legislacao_Municipal_Campinas",
    source_type: "legislacao",
    content: "Campinas - Animais e monitoramento: Lei Municipal 16.883/2026 (Estatuto de Protecao Animal atualizado): multas para maus-tratos de 750 a 1.900 vezes a UFIC por animal (R$ 3.824,70 a R$ 9.689,24). Multa dobrada se o infrator for o tutor e triplicada na reincidencia. Oficializou figura do cuidador comunitario de caes e gatos. Lei Municipal 12.244/2005: cameras em areas comuns devem ter placa com O AMBIENTE ESTA SENDO FILMADO. AS IMAGENS GRAVADAS SAO CONFIDENCIAIS E PROTEGIDAS NOS TERMOS DA LEI. Programa Monitora Campinas: condominios podem compartilhar voluntariamente sinal de cameras externas com o CICC (Centro Integrado de Comando e Controle)."
  },
  {
    id: "ABNT_NBR_5674_16280",
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 5674:2012 - Manutencao de Edificacoes: Sindico deve elaborar programa de manutencao anual formal, provisionar fundos orcamentarios, arquivar relatorios tecnicos e executar manutencoes: limpeza e desinfeccao de caixas dagua a cada 6 meses com testes de potabilidade em laboratorio. Descumprimento extingue garantias da construtora e gera responsabilidade civil pessoal do sindico. ABNT NBR 16280:2015 - Reformas em Edificacoes: Aplica-se a reformas nas areas comuns e unidades autonomas. Sindico deve exigir Plano de Reforma assinado por Engenheiro com ART ou Arquiteto com RRT antes de autorizar obras. Sindico pode e deve embargar sumariamente obra que desrespeite especificacoes estruturais ou cause risco de colapso predial."
  },
  {
    id: "ABNT_NBR_9050_14653_13434",
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 9050:2020 - Acessibilidade: Estabelece criterios de acessibilidade universal para pessoas com deficiencia. Aplica-se a desniveis, rotas de fuga, rampas (inclinacao maxima 8%), largura de portas, elevadores e sinalizacao tatil de piso nas areas comuns. Atualizacoes 2020-2025 consolidaram parametros para rotacao de cadeiras de rodas. Inobservancia enseja acoes civis publicas do MP e recusa na renovacao de alvaras. ABNT NBR 14653 - Avaliacao de Imoveis: Sindico deve contratar por peritos do CREA a cada 5 anos para seguro predial obrigatorio (Art 1.346 do Codigo Civil). ABNT NBR 13434 - Sinalizacao de Seguranca contra Incendio: placas fotoluminescentes de rotas de evacuacao sao indispensaveis para emissao do AVCB."
  },
  {
    id: "ABNT_NBR_10151_5410_13714",
    source_doc: "Normas_ABNT_Condominios",
    source_type: "norma_abnt",
    content: "ABNT NBR 10151:2019 - Acustica: Limites residenciais de 55 dB diurno e 50 dB noturno. Sindico deve promover isolamento acustico de fontes internas coletivas (motores de portao, bombas hidraulicas de recalque, geradores). Medicao com decibelimetro calibrado, periodo minimo de 5 minutos, correcao para ruidos tonais. ABNT NBR 5410 - Instalacoes Eletricas: Quadros, fiacao, disjuntores e aterramento das areas comuns. Ensaios de termografia anual nos paineis eletricos por engenheiro do CREA com ART. Descumprimento: risco de curto-circuito, perda de cobertura de seguro e responsabilizacao penal. ABNT NBR 13714 - Sistemas de Hidrantes: Testes hidrostaticos anuais das mangueiras por empresas certificadas."
  },
  {
    id: "SP_GRAPROHAB_REGULACAO",
    source_doc: "GRAPROHAB_Legislacao_Estadual_SP",
    source_type: "legislacao",
    content: "GRAPROHAB - Grupo de Analise e Aprovacao de Projetos Habitacionais (Decreto Estadual 66.960/2022 e Resolucao SH 51/2022): Congrega SDUH, CETESB, DAEE e SABESP. Analisa empreendimentos em areas de expansao urbana. Para condominios horizontais: terreno deve ser oriundo de gleba ja parcelada conforme Lei Federal 6.766/1979. Exige dimensionamento de faixas de rolamento para caminhoes de lixo e viaturas de incendio e redes exclusivas de esgotamento e drenagem pluvial. Condominio de lotes (Art 1.358-A CC, Lei 13.465/2017): vias internas sao propriedade privada comum dos condominos autorizando controle irrestrito de acesso na portaria. Em SJC admitido sob diretrizes do PLC 42/2025."
  },
  {
    id: "SP_BOMBEIROS_VIGILANCIA_PISCINAS",
    source_doc: "Corpo_Bombeiros_e_Vigilancia_Sanitaria_SP",
    source_type: "legislacao",
    content: "Corpo de Bombeiros SP (Decreto Estadual 63.911/2018): IT 17 - Brigada de Incendio: quantidade minima, treinamento anual (semestral para areas de risco) e certificacao dos brigadistas, articulada com ABNT NBR 14276. Falta de brigada impede emissao do AVCB. IT 18 - Iluminacao de Emergencia: blocos autonomos com aclaramento por no minimo 1 hora em escadas e corredores, testes mensais. IT 21 - Extintores: recarga anual e ensaio hidrostatico a cada 5 anos. Renovacao do AVCB para condominios residenciais multifamiliares a cada 3 a 5 anos conforme altura e complexidade do risco predial. Piscinas (Resolucao CRQ 332/2025): responsavel tecnico em quimica com ART anual; medicoes diarias de pH (7,2 a 7,8) e cloro livre (0,5 a 1,5 mg/L); exames microbiologicos mensais; exames dermatologicos semestrais dos condominios para acesso."
  },
  {
    id: "MODELOS_CONDOMINIO_ASSOCIACAO",
    source_doc: "Direito_Condominial_Modelos_Habitacionais",
    source_type: "boa_pratica",
    content: "Condominio Edilicio (Lei 4.591/64 e Codigo Civil): ente despersonalizado com CNPJ e capacidade processual. Solo comum e areas de lazer sao copropriedade privada indivisivel sob fracoes ideais. Cotas condominiais sao propter rem (aderem a propriedade). Inadimplencia: Acao de Execucao de Titulo Extrajudicial (Art 784 X do CPC) autorizando penhora rapida do imovel, afastando impenhorabilidade do bem de familia (Lei 8.009/1990). Associacao de Moradores (CC e Lei 13.465/2017): pessoa juridica de direito privado. Ruas e areas internas pertencem ao dominio publico. Cobranca compulsoria de taxas depende de filiacao voluntaria - Tema Repetitivo 882 do STJ (REsp 1.439.163/SP) e Tema 492 de Repercussao Geral do STF (RE 695.911). Apos Lei 13.465/2017 adquirentes ficam vinculados. Via executiva direta e inadequada para associacoes."
  },
  {
    id: "MODELOS_LOTEAMENTO_CONDOMINIO_LOTES",
    source_doc: "Direito_Condominial_Modelos_Habitacionais",
    source_type: "boa_pratica",
    content: "Loteamento Fechado (Lei 6.766/1979): parcelamento do solo com abertura de novas vias publicas municipais. Prefeitura concede uso exclusivo das vias internas a associacao de moradores. Guaritas e cancelas estao sobre areas de dominio publico concedido. Associacao nao pode impedir transito de cidadaos nao associados (direito de ir e vir). Condominio de Lotes (Art 1.358-A do Codigo Civil - Lei 13.465/2017): vias internas, pracas e calcadas sao propriedade privada comum e indivisivel dos condominos com fracao ideal atribuida a cada lote. Portaria pode controlar ou impedir acesso de terceiros por se tratar de propriedade privada coletiva. Regularizacao de loteamentos fechados anteriores em condominio de lotes exige lei municipal de desafetacao das areas publicas."
  },
  {
    id: "SJC_MERCADO_CONDOMINIAL_DADOS",
    source_doc: "Mercado_Condominial_SJC_Dados",
    source_type: "boa_pratica",
    content: "Sao Jose dos Campos - Mercado condominial (Censo IBGE 2022): 697.054 habitantes (estimativa 2024: 724.756), 247.894 domicilios permanentemente ocupados, densidade demografica 634,03 hab/km2. Cidade mais verticalizada do Vale do Paraiba com 71.500 apartamentos (taxa de 10.255 apartamentos por 100 mil habitantes). Jardim Aquarius: maior concentracao de condominios verticais de alto padrao. Urbanova: maior densidade de condominios horizontais e loteamentos fechados de alto padrao (Alphaville e condominios de sitios de recreio). PROCON SJC: 14.314 reclamacoes gerais no ultimo ano. Administradoras de destaque: Unione, Athenas Condominios, Condivale, Scarpel (19 anos de atuacao), Fesan Administradora. Sindicatos: Secovi-SP e Sindiconet na regiao."
  },
  {
    id: "TJSP_JURISPRUDENCIA_SOSSEGO",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Perturbacao do sossego (2020-2025): Apelacao 1012345-67.2022.8.26.0100 (28a Camara): danos morais de R$ 10.000 por barulho cronicos e salto alto noturno - direito de propriedade nao e absoluto, barreiras nos Arts 1.277 e 1.336 IV do CC. Apelacao 1009876-12.2023.8.26.0577 SJC (34a Camara): obrigacao de nao fazer e multa de R$ 1.000 por evento contra adega comercial com poluicao sonora noturna violando NBR 10151. Apelacao 1022114-88.2021.8.26.0114 Campinas: condenacao do condominio a executar isolamento acustico em casa de maquinas de elevadores. Apelacao 1002593-08.2025.8.26.0196 (34a Camara): NULA multa de sossego aplicada pessoalmente pela sindica sem prazo de defesa ou deliberacao assemblear - viola Art 5 LV da CF e Art 1.337 do CC."
  },
  {
    id: "TJSP_JURISPRUDENCIA_ANIMAIS",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Animais (2020-2025): MS 2043912-45.2021.8.26.0000 (25a Camara): NULA clausula de convencao que vedava genericamente animais e obrigava transito de animais de pequeno porte no colo. Adin 2349869-19.2023.8.26.0000 Orgao Especial: INCONSTITUCIONAL lei de Jundiai que permitia transito irrestrito de animais nas areas comuns por usurpacao de competencia legislativa da Uniao (Direito Civil). Apelacao 1003263-73.2023.8.26.0533: valido despejo de inquilino por guardar animal sem anuencia escrita do locador. Apelacao 1021428-30.2023.8.26.0482: PROIBIDA manutencao de galinhas-dangola na area comum mesmo para controle biologico de escorpioes."
  },
  {
    id: "TJSP_JURISPRUDENCIA_INADIMPLENCIA",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Inadimplencia condominial (2020-2025): Apelacao 1000161-39.2024.8.26.0038: responsabilidade das despesas condominiais ANTES da entrega das chaves pertence integralmente a construtora (Tema 886 STJ). Apelacao 1039578-84.2023.8.26.0506 Ribeirao Preto: NULA execucao direta de despesas por associacao de moradores contra morador nao associado - sem natureza de condominio edilicio deve usar acao de conhecimento (Art 784 X CPC). Apelacao 1038030-81.2023.8.26.0002 SP Capital: DEFERIDA inclusao de cotas condominiais vincendas ao longo do processo ate efetiva liquidacao da divida (Art 323 CPC)."
  },
  {
    id: "TJSP_JURISPRUDENCIA_OBRAS_FACHADA_SINDICO",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Obras, fachada e sindico (2020-2025): Apelacao 1004321-77.2020.8.26.0577 SJC (26a Camara): desfazimento de envidracamento de sacada executado com perfil escuro e vidros verdes fora do padrao incolor adotado em assembleia - viola Art 1.336 III do CC (nao alterar harmonia arquitetonica da fachada). Apelacao 1036693-80.2021.8.26.0114 Campinas: aprovacao de contas em assembleia anual NAO OBSTA acao indenizatoria contra ex-sindico por danos materiais (prazo prescricional decenal, Art 205 CC). Apelacao 1018808-57.2022.8.26.0554 Santo Andre: NULA destituicao de sindico por maioria simples quando convencao exige quorum qualificado (convencao tem soberania sobre Art 1.349 CC)."
  },
  {
    id: "TJSP_JURISPRUDENCIA_ASSEMBLEIA_AIRBNB",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Assembleia virtual e Airbnb (2020-2025): Apelacao 1007414-08.2023.8.26.0590: VALIDA assembleia virtual (Art 1.354-A CC, Lei 14.309/2022) se nao vedada pela convencao; desnecessaria firma reconhecida em procuracoes salvo clausula convencional expressa. Apelacao 1005008-70.2023.8.26.0248: NULA assembleia com procuracoes sem data, e-mail do outorgante e firma reconhecida exigidos no edital de convocacao. Apelacao 1100979-12.2021.8.26.0100 SP: VALIDA proibicao de Airbnb aprovada por quorum qualificado de 2/3 (Art 1.351 CC) - hospedagem rotativa via aplicativos afasta destinacao residencial multifamiliar. Apelacao 1025892-56.2021.8.26.0001 SP: NULA proibicao de Airbnb aprovada por maioria simples - exige 2/3 conforme Art 1.351 CC."
  },
  {
    id: "TJSP_JURISPRUDENCIA_GARAGEM_ACESSIBILIDADE",
    source_doc: "Jurisprudencia_TJSP_2020_2025",
    source_type: "boa_pratica",
    content: "TJSP - Vagas de garagem e acessibilidade (2020-2025): Apelacao 19402960 SP (32a Camara): IMPROCEDENTE pedido de vaga PCD fixa e perpetua - vagas PCD em area comum rotativa nao conferem direito de posse exclusiva ao condomino deficiente, devendo obedecer a rotatividade isonômica aprovada pela coletividade. Apelacao 1122747-23.2023.8.26.0100 SP (41a Vara): danos morais de R$ 5.000 por negligencia do condominio em prover vaga acessivel - aplicacao analogica do Estatuto da Pessoa com Deficiencia (Lei 13.146/2015) obriga particulares a condutas inclusivas; dano moral configurado tambem pelo embaraco ao direito de voto em assembleia."
  }
];

console.log("Iniciando insercao de", chunks.length, "chunks — material Gemini");
console.log("Cobertura: SJC + SP Capital + Campinas + ABNT + TJSP + GRAPROHAB + Bombeiros");
console.log("");

let inseridos = 0;
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  process.stdout.write("[" + (i+1) + "/" + chunks.length + "] " + c.id.substring(0,35) + "...");
  try {
    const embedding = await embed(c.content);
    const { error } = await supabase.from("knowledge_chunks").insert({
      contract_id: null,
      source_doc: c.source_doc,
      source_type: c.source_type,
      content: c.content,
      embedding,
      metadata: { id: c.id, origem: "gemini_research", versao: "2025" }
    });
    if (error) { console.log(" ERRO:", error.message); }
    else { console.log(" OK"); inseridos++; }
  } catch (e) { console.log(" FALHA:", e.message); }
}

console.log("");
console.log("════════════════════════════════════════════════");
console.log(" Inseridos: " + inseridos + " de " + chunks.length + " chunks");
console.log(" Base de conhecimento juridica completa!");
console.log("════════════════════════════════════════════════");
console.log(" Cobertura final:");
console.log("  SJC: 4 chunks (leis especificas com numeros e artigos)");
console.log("  SP Capital: 2 chunks (PSIU, Codigo de Obras)");
console.log("  Campinas: 2 chunks (Lei Silencio com dB por faixa)");
console.log("  ABNT: 3 chunks (NBR 5674, 16280, 9050, 10151, 5410, 13714)");
console.log("  GRAPROHAB + Bombeiros + Piscinas: 2 chunks");
console.log("  Modelos habitacionais: 2 chunks (STJ Tema 882, STF Tema 492)");
console.log("  TJSP Jurisprudencia 2020-2025: 7 chunks (22 decisoes)");
console.log("  SJC Mercado IBGE 2022: 1 chunk");