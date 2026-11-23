// Regras do teste "Posso me candidatar?": requisitos divulgados pela empresa e número do protocolo.
(function (raiz) {
  'use strict';

  const FUNCOES = Object.freeze({
    atendimento: 'Atendimento (call center)',
    vendas: 'Vendas',
    administrativo: 'Administrativo',
    estagio: 'Estágio de nível superior',
  });
  const ORDEM = ['atendimento', 'vendas', 'administrativo', 'estagio'];
  const OPCOES = {
    idade: ['menor', 'maior'],
    escolaridade: ['fundamental', 'medio-cursando', 'medio-completo', 'superior-cursando', 'superior-completo'],
    interesse: ORDEM,
    pcd: ['sim', 'nao', 'prefiro-nao-dizer'],
  };
  const COM_ENSINO_MEDIO = ['medio-completo', 'superior-cursando', 'superior-completo'];

  const doisDigitos = n => String(n).padStart(2, '0');

  // RP-AAAAMMDD-HHMM, com a hora local de quem fez o teste.
  function numeroProtocolo(data) {
    const dia = data.getFullYear() + doisDigitos(data.getMonth() + 1) + doisDigitos(data.getDate());
    return 'RP-' + dia + '-' + doisDigitos(data.getHours()) + doisDigitos(data.getMinutes());
  }

  // O que falta para a função: 18 anos e ensino médio completo; no estágio, estar na faculdade.
  function faltas(funcao, perfil) {
    if (funcao === 'estagio') return perfil.escolaridade === 'superior-cursando' ? [] : ['faculdade'];
    const lista = [];
    if (perfil.idade !== 'maior') lista.push('idade');
    if (!COM_ENSINO_MEDIO.includes(perfil.escolaridade)) lista.push('escolaridade');
    return lista;
  }

  function avaliar(perfil) {
    for (const [campo, aceitas] of Object.entries(OPCOES)) {
      if (!aceitas.includes(perfil[campo])) throw new Error('Resposta inválida em ' + campo);
    }
    const avisoPcd = perfil.pcd === 'sim';
    const motivos = faltas(perfil.interesse, perfil);
    if (!motivos.length) return { situacao: 'pode', funcoes: [perfil.interesse], motivos, avisoPcd };
    const outras = ORDEM.filter(f => f !== perfil.interesse && !faltas(f, perfil).length);
    return { situacao: outras.length ? 'outras' : 'ainda-nao', funcoes: outras, motivos, avisoPcd };
  }

  raiz.BccCandidatura = Object.freeze({ FUNCOES, avaliar, numeroProtocolo });
})(globalThis);
