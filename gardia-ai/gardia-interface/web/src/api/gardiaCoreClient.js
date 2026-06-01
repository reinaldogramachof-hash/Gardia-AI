// Cliente local do Agente Gardia
// Redireciona chamadas para o backend gardia-core Express na porta 3001

const BACKEND_URL = "http://localhost:3001";

/**
 * Envia uma mensagem ao backend Gardia Core e retorna a resposta completa
 * Mantido como gerador assíncrono (generator) para compatibilidade com o fluxo de streaming do frontend
 */
export async function* chatComAgenteStream({ pergunta, historico = [], contractId = null, userRole = 'morador', userName = null }) {
  // Formatamos o histórico para o formato aceito pelo backend (role: user/assistant)
  const formattedHistory = historico.map(h => ({
    role: h.remetente === "porteiro" || h.remetente === "operador" ? "user" : "assistant",
    content: h.texto
  }));

  const res = await fetch(BACKEND_URL + "/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pergunta,
      contract_id: contractId,
      contexto: {
        userRole,
        userName,
        history: formattedHistory
      }
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro na comunicacao com o servidor Gardia: " + res.statusText);
  }

  const data = await res.json();
  
  // yield a resposta completa de uma só vez para manter compatibilidade com o loop "for await (const chunk of ...)"
  yield data.resposta || "Nao obtive resposta.";
}
