import { db } from '../db/schema.js';
import { logger } from '../utils/logger.js';

const PDF_WORKER_URL = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
const LIMITE_PALAVRAS_CHUNK = 450;

export const DocumentoService = {
  async salvarPDF(condominioId, titulo, arrayBuffer) {
    try {
      const texto = await extrairTextoDoPdf(arrayBuffer);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const documento = await persistirDocumento({
        condominioId,
        tipo: 'pdf',
        titulo,
        texto,
        tamanhoBytes: blob.size,
        blob,
      });
      logger.info('DocumentoService.salvarPDF', 'Documento PDF salvo', { documentoId: documento.id, totalChunks: documento.totalChunks });
      return documento;
    } catch (err) {
      logger.error('DocumentoService.salvarPDF', 'Erro ao salvar PDF', err);
      throw err;
    }
  },

  async salvarTexto(condominioId, titulo, textoPlano) {
    try {
      const blob = new Blob([textoPlano], { type: 'text/plain;charset=utf-8' });
      const documento = await persistirDocumento({
        condominioId,
        tipo: 'texto',
        titulo,
        texto: textoPlano,
        tamanhoBytes: blob.size,
      });
      logger.info('DocumentoService.salvarTexto', 'Documento de texto salvo', { documentoId: documento.id, totalChunks: documento.totalChunks });
      return documento;
    } catch (err) {
      logger.error('DocumentoService.salvarTexto', 'Erro ao salvar texto', err);
      throw err;
    }
  },

  async listar(condominioId) {
    try {
      const documentos = await db.documentos.where('condominioId').equals(Number(condominioId)).toArray();
      return documentos
        .map(({ blob, ...documento }) => documento)
        .sort((a, b) => (b.criadoEm ?? 0) - (a.criadoEm ?? 0));
    } catch (err) {
      logger.error('DocumentoService.listar', 'Erro ao listar documentos', err);
      throw err;
    }
  },

  async buscarChunks(condominioId) {
    try {
      return db.chunks.where('condominioId').equals(Number(condominioId)).toArray();
    } catch (err) {
      logger.error('DocumentoService.buscarChunks', 'Erro ao buscar chunks', err);
      throw err;
    }
  },

  async excluir(documentoId) {
    try {
      await db.transaction('rw', db.documentos, db.chunks, async () => {
        await db.chunks.where('documentoId').equals(Number(documentoId)).delete();
        await db.documentos.delete(Number(documentoId));
      });
      logger.info('DocumentoService.excluir', 'Documento excluido', { documentoId });
    } catch (err) {
      logger.error('DocumentoService.excluir', 'Erro ao excluir documento', err);
      throw err;
    }
  },

  async obterBlob(documentoId) {
    try {
      const documento = await db.documentos.get(Number(documentoId));
      return documento?.blob ?? null;
    } catch (err) {
      logger.error('DocumentoService.obterBlob', 'Erro ao obter blob do documento', err);
      throw err;
    }
  },
};

export function chunkearTexto(texto) {
  const paragrafos = String(texto || '').split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
  const chunks = [];
  let acumulado = [];
  let palavrasAcumuladas = 0;

  paragrafos.forEach((paragrafo) => {
    quebrarParagrafo(paragrafo).forEach((bloco) => {
      const palavrasBloco = contarPalavras(bloco);
      if (palavrasAcumuladas + palavrasBloco > LIMITE_PALAVRAS_CHUNK && acumulado.length) {
        chunks.push(acumulado.join('\n\n'));
        acumulado = [];
        palavrasAcumuladas = 0;
      }
      acumulado.push(bloco);
      palavrasAcumuladas += palavrasBloco;
    });
  });

  if (acumulado.length) chunks.push(acumulado.join('\n\n'));
  return chunks;
}

async function persistirDocumento({ condominioId, tipo, titulo, texto, tamanhoBytes, blob = null }) {
  const agora = Date.now();
  const chunks = chunkearTexto(texto).map((chunkTexto, ordem) => ({
    condominioId: Number(condominioId),
    ordem,
    texto: chunkTexto,
  }));

  return db.transaction('rw', db.documentos, db.chunks, async () => {
    const documentoId = await db.documentos.add({
      condominioId: Number(condominioId),
      tipo,
      titulo: String(titulo || '').trim(),
      tamanhoBytes,
      totalChunks: chunks.length,
      criadoEm: agora,
      atualizadoEm: agora,
      blob,
    });

    if (chunks.length) {
      await db.chunks.bulkAdd(chunks.map((chunk) => ({ ...chunk, documentoId })));
    }

    return db.documentos.get(documentoId);
  });
}

async function extrairTextoDoPdf(arrayBuffer) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL.toString();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const paginas = [];

  for (let paginaAtual = 1; paginaAtual <= pdf.numPages; paginaAtual += 1) {
    const pagina = await pdf.getPage(paginaAtual);
    const conteudo = await pagina.getTextContent();
    const textoPagina = conteudo.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
    if (textoPagina) paginas.push(textoPagina);
    await aguardarRespiro();
  }

  return paginas.join('\n\n');
}

function quebrarParagrafo(paragrafo) {
  const palavras = paragrafo.split(/\s+/).filter(Boolean);
  if (palavras.length <= LIMITE_PALAVRAS_CHUNK) return [paragrafo];

  const blocos = [];
  for (let indice = 0; indice < palavras.length; indice += LIMITE_PALAVRAS_CHUNK) {
    blocos.push(palavras.slice(indice, indice + LIMITE_PALAVRAS_CHUNK).join(' '));
  }
  return blocos;
}

function contarPalavras(texto) {
  return texto.split(/\s+/).filter(Boolean).length;
}

function aguardarRespiro() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
