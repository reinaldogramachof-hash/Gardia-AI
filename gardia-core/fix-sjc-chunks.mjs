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

// 1. Remover todos os chunks de SJC anteriores
console.log("Removendo chunks antigos de SJC...");
const { error: delError } = await supabase
  .from("knowledge_chunks")
  .delete()
  .eq("source_doc", "Legislacao_Municipal_SJC");

if (delError) console.log("Erro ao deletar:", delError.message);
else console.log("Chunks SJC anteriores removidos!");

// 2. Novos chunks orientados a perguntas reais de sindicos
const chunks = [
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: Qual e o horario de silencio em Sao Jose dos Campos? Ate que horas pode fazer barulho em SJC? RESPOSTA: Em Sao Jose dos Campos a Lei Municipal 8.940/2013 e suas alteracoes (Leis 9.060/2013, 9.843/2018 e 10.775/2018) definem tres faixas horarias: DIURNO de 7h as 19h (domingos e feriados das 9h as 19h), VESPERTINO de 19h as 22h, NOTURNO de 22h as 7h. Limites: ate 70 dB(A) no diurno e 60 dB(A) no noturno em zonas residenciais. Barulho apos as 22h configura perturbacao do sossego. O ruido de vizinhanca e todo aquele produzido em local publico ou privado por proprietario, morador ou hospede capaz de gerar desconforto auditivo."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: Um morador fez barulho as 23h numa sexta-feira em Sao Jose dos Campos. Qual lei se aplica e o que o sindico deve fazer? RESPOSTA: Sexta-feira e dia util em SJC. O periodo noturno comeca as 22h. Barulho as 23h numa sexta VIOLA a Lei Municipal 8.940/2013 de Sao Jose dos Campos. O limite noturno em SJC e de 60 dB(A). O sindico deve: 1) Registrar ocorrencia com data, hora e testemunhas; 2) Notificar formalmente o morador por escrito com AR; 3) Aplicar multa prevista na convencao com base no Art 1.336 IV e paragrafo 2 do Codigo Civil (limite de 5x a contribuicao mensal); 4) Reincidencia: multa de ate 10x por deliberacao de 3/4 dos condominos (Art 1.337 CC). Sanoes municipais: advertencia, multas, embargos e cassacao de alvara conforme Art 14 da Lei 8.940/2013."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: Quais sao os horarios permitidos para obras e reformas em apartamentos em Sao Jose dos Campos? RESPOSTA: Em Sao Jose dos Campos o Decreto Municipal 19.894/2025 enquadra reformas em condominios multifamiliares como Risco I dispensando licenciamento previo. Porem os horarios de obra devem respeitar a Lei 8.940/2013: servicos continuos (betoneira, martelete, furadeira) apenas em DIAS UTEIS das 8h as 16h. Servicos descontinuos das 8h as 18h. DOMINGOS E FERIADOS: qualquer obra depende de autorizacao previa da Secretaria de Defesa do Cidadao. A dispensa de alvará nao isenta o cumprimento das normas tecnicas de seguranca (NBR 16280) nem dos horarios da lei do silencio."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: Quais leis de ruido e silencio existem em Sao Jose dos Campos SJC? Legislacao municipal de SJC sobre barulho e perturbacao do sossego. RESPOSTA: SJC possui um conjunto completo de leis de controle de ruido: Lei 8.940/2013 (Lei do Silencio original), Lei 9.060/2013 (incluiu ruido tonal e regras para eventos e festas em condominios), Lei 9.843/2018 (ampliou para incluir som de veiculos e equipamentos de moradores), Lei 10.775/2018 (atualizacao geral). A fiscalizacao e feita pela Secretaria de Urbanismo e pela Guarda Municipal. As medicoes seguem NBR 10.151 e NBR 10.152 preferencialmente no interior do imovel receptor (Decreto Municipal 15.745/2014). Alarmes: limite de 15 minutos de disparo continuo."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: O que fazer com animais de grande porte ou racas agressivas nas areas comuns de condominios em Sao Jose dos Campos? RESPOSTA: A Lei Municipal 10.807/2023 de SJC exige para caes de racas agressivas (Pitbull, Rottweiler, Mastim Napolitano, American Staffordshire Terrier, Dogo Argentino, Fila Brasileiro, Dobermann, Cane Corso e similares) nas areas comuns: coleira, guia curta de no maximo 2 metros, enforcador e FOCINHEIRA DE GRADE obrigatoria. A Lei 10.908/2024 exige que piscinas com animais de pequeno ou medio porte tenham barreira fisica ou rampas de saida (escada pet) sob multa de R$ 3.000,00. A Lei Complementar 704/2025 regulamenta minimercados de autoatendimento nas areas comuns: area maxima 25m2 com declaracao formal do sindico."
  },
  {
    source_doc: "Legislacao_Municipal_SJC",
    source_type: "legislacao",
    content: "PERGUNTA: Qual e o mercado condominial de Sao Jose dos Campos? Quantos condominios existem em SJC? RESPOSTA: Segundo o Censo IBGE 2022, Sao Jose dos Campos e a cidade mais verticalizada do Vale do Paraiba com 71.500 apartamentos (10.255 apartamentos por 100 mil habitantes). Total de 697.054 habitantes e 247.894 domicilios ocupados. Bairros com maior concentracao condominial: Jardim Aquarius (condominios verticais de alto padrao), Urbanova (condominios horizontais e loteamentos fechados como Alphaville). Administradoras atuantes: Unione, Athenas, Condivale, Scarpel (19 anos), Fesan. Sindicatos: Secovi-SP e Sindiconet. PROCON SJC registrou 14.314 reclamacoes no ultimo ano com destaque para cobrancas indevidas e barulho noturno."
  }
];

console.log("\nInserindo", chunks.length, "chunks SJC reformulados...\n");
let ok = 0;
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  process.stdout.write("[" + (i+1) + "/" + chunks.length + "] vetorizando...");
  const embedding = await embed(c.content);
  const { error } = await supabase.from("knowledge_chunks").insert({
    contract_id: null,
    source_doc: c.source_doc,
    source_type: c.source_type,
    content: c.content,
    embedding,
    metadata: { origem: "sjc_reformulado_v2", versao: "2025" }
  });
  if (error) { console.log(" ERRO:", error.message); }
  else { console.log(" OK"); ok++; }
}

console.log("\n✅ SJC atualizado:", ok, "de", chunks.length, "chunks inseridos");