export function formatarData(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('pt-BR');
}

export function formatarHora(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarDataHora(ts) {
  if (!ts) return '';
  return `${formatarData(ts)} ${formatarHora(ts)}`;
}

export function tempoRelativo(ts) {
  if (!ts) return '';
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diffInSeconds = (Date.now() - new Date(ts).getTime()) / 1000;

  if (diffInSeconds < 60) return rtf.format(Math.floor(-diffInSeconds), 'second');
  if (diffInSeconds < 3600) return rtf.format(Math.floor(-diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(Math.floor(-diffInSeconds / 3600), 'hour');
  return rtf.format(Math.floor(-diffInSeconds / 86400), 'day');
}

export function formatarTurno(turno) {
  if (!turno) return '';
  const str = String(turno).toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}
