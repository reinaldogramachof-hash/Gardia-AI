import { db } from '../db/schema.js';
import { CoberturaService } from './coberturaService.js';
import { OcorrenciaService } from './ocorrenciaService.js';
import { RondaService } from './rondaService.js';

export const DashboardService = {
  async buscarDadosDashboard(condominioId) {
    const condominioIdNum = Number(condominioId);

    const [coberturas, ocorrenciasAbertas, rondasPendentes, condominio, postos, profissionais] = await Promise.all([
      CoberturaService.listarPainel(condominioIdNum),
      OcorrenciaService.listarAbertas(condominioIdNum),
      RondaService.listarPendentesHoje(condominioIdNum),
      db.condominios.get(condominioIdNum),
      db.postos.where('condominioId').equals(condominioIdNum).toArray(),
      db.profissionais.toArray(),
    ]);

    const profissionaisAtivos = profissionais.filter((item) => item.ativo === 1 || item.ativo === true || item.ativo === undefined);

    return {
      coberturas,
      ocorrenciasAbertas,
      rondasPendentes,
      condominio,
      postos,
      profissionais: profissionaisAtivos,
    };
  },
};