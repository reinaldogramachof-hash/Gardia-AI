export function Dashboard() {
  const el = document.createElement("div");
  el.style.cssText = "padding:32px;color:#f1f5f9;max-width:900px";
  el.innerHTML = `
    <div style="margin-bottom:24px">
      <h1 style="font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:4px">Dashboard</h1>
      <p style="font-size:13px;color:#64748b">Condominio Splendor Patrianni — visao geral operacional</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      ${card("3","Ocorrencias abertas","#f59e0b")}
      ${card("1","Alertas ativos","#ef4444")}
      ${card("2","Contratos vencendo","#6366f1")}
    </div>
    <div style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:20px">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;font-family:monospace">ATIVIDADE RECENTE</div>
      ${item("Ocorrencia registrada","Barulho ap. 302 — 23h sexta","#f59e0b")}
      ${item("Ronda concluida","Turno noturno — porteiro confirmou","#22c55e")}
      ${item("Alerta","Contrato limpeza vence em 8 dias","#6366f1")}
    </div>
  `;
  return el;
}

function card(value, label, color) {
  return `<div style="background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:20px">
    <div style="font-size:32px;font-weight:700;color:${color};line-height:1">${value}</div>
    <div style="font-size:12px;color:#64748b;margin-top:6px">${label}</div>
  </div>`;
}

function item(title, desc, color) {
  return `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #0f172a">
    <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
    <div>
      <div style="font-size:13px;font-weight:500;color:#e2e8f0">${title}</div>
      <div style="font-size:11px;color:#475569;margin-top:2px">${desc}</div>
    </div>
  </div>`;
}