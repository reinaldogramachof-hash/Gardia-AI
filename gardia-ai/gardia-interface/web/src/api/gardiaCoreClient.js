const BACKEND_URL = "http://localhost:3001";

// Contrato ativo do Splendor Patrianni
const DEFAULT_CONTRACT = {
  id: "354f5903-5f32-4e1a-b688-d2771c597696",
  name: "Condominio Splendor Patrianni",
  type: "condominio_vertical"
};

export async function* chatComAgenteStream({
  pergunta,
  historico = [],
  contractId = DEFAULT_CONTRACT.id,
  contractName = DEFAULT_CONTRACT.name,
  contractType = DEFAULT_CONTRACT.type,
  userRole = "operador",
  userName = null
}) {
  const history = historico.map(h => ({
    role: h.remetente === "porteiro" || h.remetente === "operador" ? "user" : "assistant",
    content: h.texto
  }));

  const res = await fetch(BACKEND_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: pergunta,
      contractId,
      contractName,
      contractType,
      userRole,
      userName,
      history,
      stream: true
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro Gardia: " + res.statusText);
  }

  // Streaming SSE
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        if (json.token) yield json.token;
      } catch {}
    }
  }
}