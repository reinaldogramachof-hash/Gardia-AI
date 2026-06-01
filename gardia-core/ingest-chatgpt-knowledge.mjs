import { createClient } from "@supabase/supabase-js";
const { config } = await import("dotenv");
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function embed(text) {
  const res = await fetch(OLLAMA + "/api/embeddings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  return (await res.json()).embedding;
}

const chunks = [

  // ══════ CODIGO CIVIL — ARTIGOS COMPLETOS ══════
  {
    id: "CC_ART_1331",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.331 CC: Pode haver em edificacoes partes que sao propriedade exclusiva e partes que sao propriedade comum dos condominos. Paragrafo 1: Apartamentos, escritorios, salas, lojas e sobrelojas sujeitam-se a propriedade exclusiva, podendo ser alienadas livremente, exceto abrigos para veiculos que nao poderao ser alienados a pessoas estranhas sem autorizacao expressa na convencao (Lei 12.607/2012). Paragrafo 2: Solo, estrutura, telhado, redes de agua, esgoto, gas e eletricidade e acesso ao logradouro publico sao partes comuns e nao podem ser alienados separadamente. Paragrafo 5: O terraco de cobertura e parte comum salvo disposicao contraria da escritura. Aplicacao: delimita o que e propriedade privativa do morador e o que pertence a coletividade."
  },
  {
    id: "CC_ART_1332_1333_1334",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.332 CC: Institui-se o condominio edilicio por ato entre vivos ou testamento registrado no CRI, devendo constar: discriminacao das unidades exclusivas, fracoes ideais e fim a que se destinam. Aplicacao: verifica destinacao original (residencial) e cota de rateio por fracao ideal. Art 1.333 CC: A convencao deve ser subscrita por no minimo 2/3 das fracoes ideais e torna-se obrigatoria para todos os titulares. Para ser oposta a terceiros deve ser registrada no CRI. Aplicacao: legitima a cobranca e penalidades mesmo sem registro no CRI. Art 1.334 CC: A convencao determinara a quota proporcional e modo de pagamento das contribuicoes dos condominos. Promitentes compradores sao equiparados a proprietarios."
  },
  {
    id: "CC_ART_1335",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.335 CC - Direitos do condomino: I - usar, fruir e livremente dispor das suas unidades; II - usar das partes comuns conforme sua destinacao sem excluir os demais compossuidores; III - votar nas deliberacoes da assembleia e delas participar, estando quite. Aplicacao pratica: o sindico usa este dispositivo para barrar o voto e a participacao de condominos inadimplentes nas assembleias. Inadimplente nao pode votar nem participar de qualquer assembleia (fisica ou virtual) conforme REsp 2.034.453/SP do STJ."
  },
  {
    id: "CC_ART_1336",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.336 CC - Deveres do condomino: I - contribuir para as despesas na proporcao das fracoes ideais; II - nao realizar obras que comprometam a seguranca da edificacao; III - nao alterar a forma e a cor da fachada, partes e esquadrias externas; IV - nao utilizar suas partes de maneira prejudicial ao sossego, salubridade e seguranca dos possuidores ou aos bons costumes. Paragrafo 1: Inadimplente sujeito a juros moratórios convencionados ou 1% ao mes e multa de ate 2% sobre o debito. Paragrafo 2: O condomino que nao cumprir os deveres II a IV pagara multa prevista na convencao nao podendo ser superior a 5 vezes o valor da contribuicao mensal. E a principal ferramenta para coibir inadimplencia, embargar alteracoes de fachada e punir violacoes ao sossego."
  },
  {
    id: "CC_ART_1337",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.337 CC - Comportamento antissocial: O condomino ou possuidor que nao cumpre reiteradamente seus deveres podera por deliberacao de 3/4 dos condominos restantes ser constrangido a pagar multa correspondente ate ao quintuplo (5x) do valor da contribuicao, conforme a gravidade e reiteracao. Paragrafo unico: O condomino ou possuidor que por seu reiterado comportamento antissocial gerar incompatibilidade de convivencia podera ser constrangido a pagar multa correspondente ao decuplo (10x) do valor da contribuicao ate que delibere a assembleia geral. Aplicacao: dispositivo maximo para moradores antisociais recidivos (som alto cronico, agressoes), apos aprovacao por quorum de 3/4."
  },
  {
    id: "CC_ART_1338_1339_1340",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.338 CC - Locacao de garagem: Resolvendo o condomino alugar sua vaga, deve preferir em condicoes iguais qualquer dos condominos a estranhos. Aplicacao: morador deve oferecer vaga primeiro aos vizinhos antes de terceiros. Art 1.339 CC: Direitos as partes comuns sao inseparaveis da propriedade exclusiva. E permitido ao condomino alienar parte acessoria a outro condomino, so podendo faze-lo a terceiro se o ato constitutivo permitir. Aplicacao: impede venda de vaga de garagem a terceiros sem autorizacao da Convencao. Art 1.340 CC: Despesas relativas a partes comuns de uso exclusivo de um condomino incumbem a quem delas se serve. Aplicacao: sindico cobra diretamente do morador manutencoes em area comum de uso exclusivo como cobertura."
  },
  {
    id: "CC_ART_1341",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.341 CC - Obras no condominio: I - voluptuarias: exigem voto de 2/3 dos condominos; II - uteis: voto da maioria dos condominos. Paragrafo 1: Obras ou reparacoes NECESSARIAS podem ser realizadas independentemente de autorizacao pelo sindico. Paragrafo 2: Se urgentes e com despesas excessivas, o sindico realiza e comunica imediatamente a assembleia. Paragrafo 3: Necessarias nao urgentes com despesas excessivas somente apos autorizacao da assembleia. Paragrafo 4: O condomino que realizar obras necessarias sera reembolsado. Aplicacao: guia oficial do sindico para aprovacoes de reformas — voluptuarias (2/3), uteis (maioria simples), necessarias urgentes (sindico executa diretamente)."
  },
  {
    id: "CC_ART_1342_1343_1344_1345",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.342 CC: Obras em acrescimo nas partes comuns para facilitar ou aumentar utilizacao exigem aprovacao de 2/3 dos votos. Art 1.343 CC: Construcao de novo pavimento ou novo edificio com novas unidades depende de aprovacao da UNANIMIDADE dos condominos. Art 1.344 CC: Ao proprietario do terraco de cobertura incumbem as despesas de sua conservacao para nao causar danos as unidades inferiores. Aplicacao: obriga morador da cobertura a reparar vazamentos e infiltracoes decorrentes da sua laje privativa. Art 1.345 CC: O adquirente de unidade responde pelos debitos do alienante em relacao ao condominio, inclusive multas e juros moratórios. Aplicacao: sindico pode cobrar do novo comprador os debitos herdados do antigo proprietario inadimplente."
  },
  {
    id: "CC_ART_1346_1347_1348",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.346 CC: E OBRIGATORIO o seguro de toda a edificacao contra risco de incendio ou destruicao total ou parcial. Sindico responde pessoalmente se nao contratar e renovar a apolice anual. Art 1.347 CC: A assembleia escolhera um sindico que pode nao ser condomino para administrar o condominio por prazo NAO SUPERIOR A 2 ANOS renovavel. Base legal para contratacao de sindicos profissionais. Art 1.348 CC - Competencias do sindico: I-convocar assembleia; II-representar o condominio ativa e passivamente em juizo; III-comunicar procedimentos judiciais; IV-cumprir e fazer cumprir a convencao e regimento; V-conservar as partes comuns; VI-elaborar orcamento anual; VII-cobrar contribuicoes e impor multas; VIII-prestar contas anualmente; IX-realizar o seguro da edificacao."
  },
  {
    id: "CC_ART_1349_1350_1351",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.349 CC: A assembleia pode destituir o sindico por maioria absoluta em assembleia especialmente convocada. Art 1.350 CC: O sindico DEVE convocar ANUALMENTE a Assembleia Geral Ordinaria (AGO) para aprovar orcamento, contribuicoes e prestar contas. Se o sindico nao convocar, 1/4 dos condominos pode faze-lo. Se a assembleia nao se reunir o juiz decide. Art 1.351 CC (com redacao da Lei 14.405/2022): Depende de aprovacao de 2/3 dos votos dos condominos a ALTERACAO DA CONVENCAO e a mudanca da DESTINACAO do edificio ou unidade imobiliaria. Aplicacao: regula quorum de 2/3 para alterar a Convencao e para proibir ou autorizar Airbnb."
  },
  {
    id: "CC_ART_1352_1353_1354",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.352 CC: Deliberacoes da assembleia tomadas em 1a convocacao por maioria de votos dos presentes que representem pelo menos metade das fracoes ideais. Votos proporcionais as fracoes ideais. Art 1.353 CC (Lei 14.309/2022): Em 2a convocacao a assembleia pode deliberar por maioria dos presentes. Permite converter a reuniao em sessao permanente por ate 90 dias para atingir quorum qualificado. Votos da 1a sessao ficam registrados. Art 1.354 CC: A assembleia nao pode deliberar se TODOS os condominos nao forem convocados. Sindico deve garantir envio inequivoco a 100% dos proprietarios para evitar anulacao judicial da assembleia."
  },
  {
    id: "CC_ART_1354A_1355_1356_1357_1358_1358A",
    source_doc: "Codigo_Civil_Lei_10406_2002",
    source_type: "legislacao",
    content: "Art 1.354-A CC (Lei 14.309/2022 - Assembleia Virtual): Convocacao, realizacao e deliberacao de assembleias podem dar-se de forma ELETRONICA desde que: nao vedada na convencao; preservados os direitos de voz, debate e voto. Condominio nao responde por problemas de conexao dos condominos. Ata pode ser lavrada e assinada eletronicamente. Art 1.355 CC: Assembleias extraordinarias podem ser convocadas pelo sindico ou por 1/4 dos condominos. Art 1.356 CC: Pode haver conselho fiscal com 3 membros por ate 2 anos para dar parecer sobre as contas do sindico. Art 1.357 CC: Edificacao destruida ou ameacando ruina: deliberacao por maioria de metade mais uma das fracoes ideais sobre reconstrucao ou venda. Art 1.358-A CC (Lei 13.465/2017 - Condominio de Lotes): Pode haver em terrenos partes de propriedade exclusiva (lotes) e partes comuns. Aplica-se ao condominio de lotes o mesmo do condominio edilicio."
  },

  // ══════ STJ — SUMULAS E TEMAS REPETITIVOS ══════
  {
    id: "STJ_SUMULA_260",
    source_doc: "STJ_Jurisprudencia_Condominio",
    source_type: "legislacao",
    content: "Sumula 260 do STJ (06/03/2002): A convencao de condominio aprovada, ainda que sem registro, e eficaz para regular as relacoes entre os condominos. Aplicacao: o sindico pode cobrar cotas e exigir penalidades mesmo sem a Convencao registrada no CRI. O registro so e necessario para gerar efeitos contra terceiros (erga omnes). Processos paradigma: REsp 270.232/SP, REsp 180.838/SP, REsp 163.605/SP."
  },
  {
    id: "STJ_SUMULA_449",
    source_doc: "STJ_Jurisprudencia_Condominio",
    source_type: "legislacao",
    content: "Sumula 449 do STJ (02/06/2010): A vaga de garagem que possui matricula propria no registro de imoveis NAO constitui bem de familia para efeito de penhora. Aplicacao: vaga com matricula individualizada pode ser penhorada e leiloada por divida de cotas condominiais mesmo que o apartamento seja bem de familia. Nota 2024 (REsp 2.095.402/SC): o leilao da vaga deve ser restrito aos demais condominos do edificio conforme Art 1.331 paragrafo 1 do CC. Processos paradigma: EREsp 595.099/RS."
  },
  {
    id: "STJ_SUMULA_478",
    source_doc: "STJ_Jurisprudencia_Condominio",
    source_type: "legislacao",
    content: "Sumula 478 do STJ (13/06/2012): Na execucao de credito relativo a cotas condominiais, este tem PREFERENCIA sobre o hipotecario. Aplicacao: em leilao judicial do imovel do inadimplente, a divida com o condominio e paga ANTES do financiamento bancario garantido por hipoteca. O credito condominial propter rem tem prioridade sobre a hipoteca. Processos paradigma: AgRg REsp 1.039.117/SP, AgRg REsp 856.350/PR."
  },
  {
    id: "STJ_TEMA_882_886_1024",
    source_doc: "STJ_Jurisprudencia_Condominio",
    source_type: "legislacao",
    content: "STJ Tema Repetitivo 882 (11/03/2015): Taxas de manutencao criadas por associacoes de moradores NAO OBRIGAM os nao associados ou que a elas nao anuiram. Associacao deve provar que aquisicao ocorreu sob vigencia da Lei 13.465/2017 e obrigacao consta no contrato registrado. Creditos associativos nao sao titulos executivos extrajudiciais — exige acao de conhecimento. REsp 1.439.163/SP. STJ Tema 886 (08/04/2015): Responsabilidade das cotas condominiais e de quem tem a posse direta (imissao na posse). Construtora responde ate a entrega das chaves ao comprador. REsp 1.345.331/RS. STJ Tema 1.024 (11/09/2019): Juros de mora sobre cotas condominiais atrasadas calculados a partir de cada vencimento mensal (mora ex re), nao a partir da citacao. REsp 1.834.152/SP."
  },
  {
    id: "STJ_RESP_ANIMAIS_AIRBNB_VOTO",
    source_doc: "STJ_Jurisprudencia_Condominio",
    source_type: "legislacao",
    content: "STJ REsp 1.783.078/DF - Animais: Condominio nao pode proibir genericamente posse de animais nas unidades, mas e valido o regulamento que impede transito de caes sem guia ou focinheira em areas comuns por motivos de seguranca e higiene. STJ REsp 1.819.069/DF - Airbnb: Condominio edilicio residencial pode restringir ou proibir locacao de curta temporada por plataformas digitais desde que haja proibicao expressa na Convencao aprovada por quorum qualificado. STJ REsp 2.034.453/SP - Voto: Condomino inadimplente nao pode participar de discussoes nem votar em qualquer assembleia geral fisica ou virtual (Art 1.335 III CC). Nao cabe alegacao de ofensa a dignidade."
  },

  // ══════ ESOCIAL CONDOMINIAL ══════
  {
    id: "ESOCIAL_CONDOMINIOS_EVENTOS",
    source_doc: "eSocial_Obrigacoes_Trabalhistas_Condominios",
    source_type: "boa_pratica",
    content: "eSocial para condominios (classificacao tributaria 99 - Pessoas Juridicas em Geral): Cadastro inicial exige Certificado Digital A1 ou A3. Eventos: S-1000 (dados do empregador), S-1005 (estabelecimento/CNAE), S-1020 (FPAS e Terceiros). Condominio sem funcionarios envia S-1299 Sem Movimento. Prazos: S-2200 admissao ate o dia ANTERIOR ao inicio das atividades; S-1200 folha de pagamento ate dia 7 do mes subsequente; S-2210 acidente de trabalho (CAT) ate o primeiro dia util seguinte (imediato em caso de obito); S-2220 e S-2240 ate dia 15 do mes subsequente."
  },
  {
    id: "ESOCIAL_MULTAS_PENALIDADES",
    source_doc: "eSocial_Obrigacoes_Trabalhistas_Condominios",
    source_type: "boa_pratica",
    content: "Multas por atraso no eSocial para condominios: Admissao fora do prazo (S-2200): R$ 3.000 por trabalhador nao registrado, dobra na reincidencia. Afastamentos omitidos (S-2230): R$ 1.812,87 a R$ 181.284,63. ASO exame ocupacional em atraso (S-2220): com base no Art 201 da CLT. CAT em atraso (S-2210): multa variavel com patamar inicial de R$ 403,54. Omissao SST/PGR (S-2240): R$ 1.812,87 a R$ 181.284,63. Dados cadastrais desatualizados: R$ 600,00 por cadastro. Omissao da RAIS: R$ 425,64 a R$ 42.564,00."
  },
  {
    id: "SINDIFICIO_PISOS_SALARIAIS_BENEFICIOS",
    source_doc: "Convencao_Coletiva_SINDIFICIO_SP",
    source_type: "boa_pratica",
    content: "Convencao Coletiva SINDIFICIO SP - Pisos salariais 2024/2025 e 2025/2026: Gerente Condominial R$ 4.053,68 / R$ 4.317,17. Gerente Predial R$ 3.063,47. Zelador R$ 2.054,63 / R$ 2.188,18. Porteiro, Vigia, Recepcionista, Controlador de Acesso, Folguista, Operador CFTV R$ 1.968,16 / R$ 2.096,09. Faxineiros e demais R$ 1.881,71 / R$ 2.004,02. Beneficios obrigatorios: VT para 12x36 com desconto limitado a 3% (nao 6%). VR e VA reajustados em 10% sem natureza salarial. Plano de saude com ate 12 consultas medicas anuais. Horas extras: adicional minimo de 50%."
  },
  {
    id: "INSS_FGTS_CONDOMINIO",
    source_doc: "eSocial_Obrigacoes_Trabalhistas_Condominios",
    source_type: "boa_pratica",
    content: "FGTS e INSS para condominios: FGTS aliquota 8% da remuneracao mensal, recolhimento pelo FGTS Digital via PIX, vencimento dia 20 do mes subsequente. Atraso afeta emissao do CRF. INSS: Contribuicao Previdenciaria Patronal (CPP) 20% sobre folha de pagamento. RAT 2% para CNAE 8112-5/00 (condominios prediais) multiplicado pelo FAP (0,5 a 2,0). Terceiros FPAS 566: 4,5% total (2,5% Salario Educacao + 0,2% INCRA + 1,5% SESC + 0,3% SEBRAE). Sindico remunerado: condominio recolhe 20% de cota patronal e retém 11% de INSS na fonte. Sindico profissional: autonomo sem vinculo CLT, mas dados e remuneracao devem constar no eSocial."
  },
  {
    id: "PORTEIRO_ZELADOR_JORNADA",
    source_doc: "eSocial_Obrigacoes_Trabalhistas_Condominios",
    source_type: "boa_pratica",
    content: "Funcionarios tipicos de condominio: Porteiro CBO 5174-10 — escala predominante 12x36, adicional noturno 20% sobre horas entre 22h e 5h, intervalo minimo de 11h entre turnos. Zelador CBO 5141-20 — representado pelo SINDIFICIOS em SP, atua como preposto direto fiscalizando areas comuns e instalacoes eletricas e hidraulicas. Sindico profissional: prestador de servicos autonomo, sem vinculo CLT. Se receber pro-labore ou isencao habitual da taxa, o condominio obrigatorio declara no eSocial e recolhe 20% INSS patronal + retencao de 11% na fonte sobre o valor equivalente."
  },

  // ══════ LGPD EM CONDOMINIOS ══════
  {
    id: "LGPD_CONDOMINIO_CAMERAS_DADOS",
    source_doc: "LGPD_Lei_13709_2018_Condominios",
    source_type: "legislacao",
    content: "LGPD (Lei 13.709/2018) em condominios — dados pessoais coletados: Moradores: nome, CPF, RG, e-mail, telefone, dados de veiculos e biometria (somente com adesao voluntaria). Visitantes: nome, RG, CPF, foto facial, unidade de destino. Cameras CFTV: imagens sao dados pessoais. Cameras devem monitorar APENAS areas comuns (portarias, garagens, elevadores, corredores) sendo ILEGAL dirigi-las a janelas, varandas ou portas de unidades. Prazo de guarda das imagens: sem lei geral, recomenda-se 15 a 30 dias com exclusao segura posterior. TJSP condenou condominio a pagar R$ 8.000 por compartilhamento inadequado de video do elevador."
  },
  {
    id: "LGPD_BIOMETRIA_DPO_OBRIGACOES",
    source_doc: "LGPD_Lei_13709_2018_Condominios",
    source_type: "legislacao",
    content: "LGPD em condominios — biometria e obrigacoes do sindico: Biometria facial e dado pessoal SENSIVEL. Exige consentimento explicito, destacado, livre e opcional. Condominio DEVE oferecer alternativa de acesso (tags, cartoes, senhas) para quem recusar biometria. Para funcionarios o registro biometrico para controle de ponto fundamenta-se em obrigacao legal (Art 74 CLT, Portaria MTE 671/2021) dispensando consentimento. Resolucao ANPD 2/2022: condominios edilícios sao AGENTES DE PEQUENO PORTE dispensados de nomear DPO (Encarregado de Dados). Porem devem disponibilizar canal de comunicacao. Prazo para resposta a titulares: declaracao simplificada em 15 dias, resposta completa em 30 dias."
  },
  {
    id: "LGPD_MULTAS_SANCOES",
    source_doc: "LGPD_Lei_13709_2018_Condominios",
    source_type: "legislacao",
    content: "LGPD — sancoes e multas para condominios: Sancoes administrativas da ANPD (Art 52 da LGPD): advertencias, publicizacao da infracao, bloqueio ou eliminacao de dados. Multas (Resolucao ANPD 4/2023): como condominios nao tem faturamento, ANPD usa tabela especial ponderando gravidade (leve, media, grave), extensao do dano e fatores agravantes. Responsabilizacao civil (Codigo Civil): compartilhamento indevido ou vazamento de imagens em grupos de WhatsApp gera dever de indenizar por danos morais. Sindico que agir com negligencia ou abuso na divulgacao de dados de moradores responde PESSOALMENTE e de forma solidaria com o condominio. Bases legais aceitas: legitimo interesse (CFTV), cumprimento de obrigacao legal (dados de funcionarios), consentimento (biometria de moradores)."
  }
];

console.log("Iniciando insercao de", chunks.length, "chunks — material ChatGPT");
console.log("Cobertura: CC Arts 1331-1358A + STJ Sumulas + eSocial + LGPD");
console.log("");

let inseridos = 0;
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  process.stdout.write("[" + (i+1) + "/" + chunks.length + "] " + c.id.substring(0,40) + "...");
  try {
    const embedding = await embed(c.content);
    const { error } = await supabase.from("knowledge_chunks").insert({
      contract_id: null,
      source_doc: c.source_doc,
      source_type: c.source_type,
      content: c.content,
      embedding,
      metadata: { id: c.id, origem: "chatgpt_research", versao: "2025" }
    });
    if (error) { console.log(" ERRO:", error.message); }
    else { console.log(" OK"); inseridos++; }
  } catch (e) { console.log(" FALHA:", e.message); }
}

console.log("");
console.log("═══════════════════════════════════════════════════");
console.log(" Inseridos: " + inseridos + " de " + chunks.length);
console.log("═══════════════════════════════════════════════════");
console.log(" COBERTURA TOTAL DA GARDIA AGORA:");
console.log("  Codigo Civil Arts 1.331-1.358-A (28 artigos)");
console.log("  STJ Sumulas 260, 449, 478");
console.log("  STJ Temas 882, 886, 1.024");
console.log("  STJ REsp animais, Airbnb, voto inadimplente");
console.log("  eSocial: eventos, prazos, multas");
console.log("  SINDIFICIO: pisos salariais 2024/2025");
console.log("  LGPD: cameras, biometria, DPO, sancoes");