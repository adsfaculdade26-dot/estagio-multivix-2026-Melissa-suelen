(() => {
  'use strict';
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);

  // Menu do celular.
  const botaoMenu = $('.menu-toggle');
  const menu = $('#menu');
  function abrirMenu(aberto) {
    menu.classList.toggle('aberto', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }
  botaoMenu.addEventListener('click', () => abrirMenu(botaoMenu.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', evento => { if (evento.target.closest('a')) abrirMenu(false); });
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) { abrirMenu(false); botaoMenu.focus(); }
  });
  document.addEventListener('click', evento => {
    if (menu.classList.contains('aberto') && !evento.target.closest('.site-header')) abrirMenu(false);
  });

  // Barra do celular: só aparece depois que os botões da abertura saem da tela.
  const barra = $('.barra-celular');
  if ('IntersectionObserver' in window) {
    barra.classList.add('escondida');
    new IntersectionObserver(([entrada]) => {
      barra.classList.toggle('escondida', entrada.isIntersecting || entrada.boundingClientRect.top > 0);
    }).observe($('.abertura .botoes'));
  }

  // Teste "Posso me candidatar?" em forma de conversa.
  const { FUNCOES, avaliar, numeroProtocolo } = window.BccCandidatura;
  const portal = (window.BCC_CONFIG || {}).portal || 'https://vemprabcc.gupy.io/';
  const log = $('#chat-log');
  const opcoes = $('#chat-opcoes');
  const semPressa = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PERGUNTAS = [
    {
      campo: 'idade',
      falas: ['Olá! Vou te ajudar a ver se você já pode se candidatar.', 'São quatro perguntas rápidas. Qual é a sua idade?'],
      opcoes: [['menor', 'Menos de 18 anos'], ['maior', '18 anos ou mais']],
    },
    {
      campo: 'escolaridade',
      falas: ['E até onde você estudou?'],
      opcoes: [['fundamental', 'Ensino fundamental'], ['medio-cursando', 'Ensino médio em andamento'], ['medio-completo', 'Ensino médio completo'], ['superior-cursando', 'Faculdade em andamento'], ['superior-completo', 'Faculdade completa']],
    },
    {
      campo: 'interesse',
      falas: ['Qual área chama mais a sua atenção?'],
      opcoes: [['atendimento', 'Atendimento'], ['vendas', 'Vendas'], ['administrativo', 'Administrativo'], ['estagio', 'Estágio']],
    },
    {
      campo: 'pcd',
      falas: ['Última: você é pessoa com deficiência? Pergunto só para mostrar as vagas PcD.'],
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['prefiro-nao-dizer', 'Prefiro não dizer']],
    },
  ];
  const NOME_NA_FRASE = { atendimento: 'atendimento', vendas: 'vendas', administrativo: 'administrativo' };
  const MOTIVO = {
    idade: f => 'As vagas de ' + NOME_NA_FRASE[f] + ' pedem 18 anos ou mais.',
    escolaridade: f => 'As vagas de ' + NOME_NA_FRASE[f] + ' pedem ensino médio completo.',
    faculdade: () => 'O estágio de nível superior é para quem está cursando faculdade.',
  };
  const DICA = {
    idade: 'Quando completar 18 anos, faça o teste de novo.',
    escolaridade: 'Quando concluir o ensino médio, faça o teste de novo.',
    faculdade: 'Quando estiver cursando faculdade, o estágio fica aberto para você.',
  };

  let respostas = {};
  let rotulos = [];
  let rodada = 0;

  const esperar = ms => new Promise(pronto => setTimeout(pronto, semPressa ? 0 : ms));
  const rolar = () => { log.scrollTop = log.scrollHeight; };

  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  async function falar(texto, minhaRodada) {
    const digitando = criar('p', 'msg msg-pagina digitando');
    digitando.setAttribute('aria-hidden', 'true');
    digitando.append(criar('span'), criar('span'), criar('span'));
    log.append(digitando);
    rolar();
    await esperar(550 + Math.min(texto.length * 12, 700));
    digitando.remove();
    if (minhaRodada !== rodada) return false;
    log.append(criar('p', 'msg msg-pagina', texto));
    rolar();
    return true;
  }

  async function perguntar(indice, focar = indice > 0) {
    const minhaRodada = rodada;
    const pergunta = PERGUNTAS[indice];
    for (const fala of pergunta.falas) {
      if (!(await falar(fala, minhaRodada))) return;
    }
    const grupo = criar('div', 'opcoes-grupo');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', pergunta.falas[pergunta.falas.length - 1]);
    for (const [valor, rotulo] of pergunta.opcoes) {
      const botao = criar('button', 'opcao', rotulo);
      botao.type = 'button';
      botao.addEventListener('click', () => responder(indice, valor, rotulo));
      grupo.append(botao);
    }
    opcoes.replaceChildren(grupo);
    if (focar) grupo.querySelector('button').focus({ preventScroll: true });
  }

  function responder(indice, valor, rotulo) {
    respostas[PERGUNTAS[indice].campo] = valor;
    rotulos.push(rotulo);
    opcoes.replaceChildren();
    log.append(criar('p', 'msg msg-pessoa', rotulo));
    rolar();
    if (indice + 1 < PERGUNTAS.length) perguntar(indice + 1);
    else concluir();
  }

  function lista(tag, classe, itens) {
    const el = criar(tag, classe);
    for (const item of itens) el.append(criar('li', '', item));
    return el;
  }

  function linkPortal(texto, classe) {
    const a = criar('a', classe, texto);
    a.href = portal;
    a.target = '_blank';
    a.rel = 'noopener';
    a.append(criar('span', 'sr', ' (abre o portal oficial em nova aba)'));
    return a;
  }

  function montarProtocolo(resultado, interesse) {
    const cartao = criar('article', 'protocolo protocolo-' + resultado.situacao);
    cartao.setAttribute('aria-labelledby', 'protocolo-titulo');

    const topo = criar('div', 'protocolo-topo');
    topo.append(criar('span', 'protocolo-rotulo-topo', 'Protocolo'), criar('strong', 'protocolo-numero', numeroProtocolo(new Date())), criar('span', 'protocolo-estado', 'Atendimento concluído'));
    cartao.append(topo);

    const titulos = {
      pode: 'Você já pode se candidatar',
      outras: FUNCOES[interesse] + ' ainda não, mas há outro caminho',
      'ainda-nao': 'Ainda não, mas guarde esta página',
    };
    const titulo = criar('h3', 'protocolo-titulo', titulos[resultado.situacao]);
    titulo.id = 'protocolo-titulo';
    titulo.tabIndex = -1;
    cartao.append(titulo);

    if (resultado.situacao === 'pode') {
      cartao.append(criar('p', '', 'Seu perfil atende aos requisitos básicos divulgados para ' + FUNCOES[interesse] + '.'));
    } else {
      cartao.append(lista('ul', 'protocolo-motivos', resultado.motivos.map(m => MOTIVO[m](interesse))));
    }

    if (resultado.funcoes.length) {
      cartao.append(criar('p', 'protocolo-rotulo', resultado.situacao === 'pode' ? 'Função indicada' : 'Com o seu perfil, você já pode se candidatar a'));
      cartao.append(lista('ul', 'protocolo-funcoes', resultado.funcoes.map(f => FUNCOES[f])));
      cartao.append(criar('p', 'protocolo-rotulo', 'Próximos passos'));
      cartao.append(lista('ol', 'protocolo-passos', ['Cadastre o currículo no portal Vem ser BCC.', 'Escolha uma vaga de Ribeirão Preto - SP.', 'Faça a primeira etapa on-line.']));
    } else {
      const dicas = resultado.motivos.map(m => DICA[m]);
      if (interesse === 'estagio') dicas.push('Atendimento, vendas e administrativo pedem 18 anos e ensino médio completo.');
      cartao.append(criar('p', 'protocolo-rotulo', 'Enquanto isso'));
      cartao.append(lista('ul', 'protocolo-dicas', dicas));
    }

    if (resultado.avisoPcd) {
      cartao.append(criar('p', 'protocolo-pcd', 'Todas as vagas também são abertas para pessoas com deficiência, e algumas são exclusivas. No portal, procure as que trazem PcD no título.'));
    }

    const botoes = criar('div', 'protocolo-botoes');
    botoes.append(linkPortal(resultado.funcoes.length ? 'Ir para o portal de vagas' : 'Conhecer o portal', resultado.funcoes.length ? 'botao' : 'botao botao-contorno-claro'));
    const refazer = criar('button', 'botao botao-texto', 'Refazer o teste');
    refazer.type = 'button';
    refazer.addEventListener('click', recomecar);
    botoes.append(refazer);
    cartao.append(botoes);

    cartao.append(criar('p', 'protocolo-nota', 'Resultado orientativo, com base nos requisitos divulgados pela empresa. Os requisitos de cada vaga estão na descrição dela no portal.'));
    return cartao;
  }

  async function concluir() {
    const minhaRodada = rodada;
    if (!(await falar('Pronto! Aqui está o seu protocolo.', minhaRodada))) return;
    const resultado = avaliar(respostas);
    const cartao = montarProtocolo(resultado, respostas.interesse);
    // No resultado, a conversa vira um resumo e o protocolo aparece inteiro, sem rolagem dentro da caixa.
    const resumo = criar('p', 'msg msg-resumo');
    resumo.append(criar('strong', '', 'Suas respostas: '), rotulos.join(', ') + '.');
    log.replaceChildren(resumo, cartao);
    log.classList.add('com-resultado');
    cartao.scrollIntoView({ block: 'nearest', behavior: semPressa ? 'auto' : 'smooth' });
    cartao.querySelector('.protocolo-titulo').focus({ preventScroll: true });
  }

  function recomecar() {
    rodada += 1;
    respostas = {};
    rotulos = [];
    log.classList.remove('com-resultado');
    log.replaceChildren();
    opcoes.replaceChildren();
    perguntar(0, true);
  }

  // A conversa só começa quando o teste aparece na tela, para as falas não correrem sem ninguém ver.
  let comecou = false;
  function comecar() {
    if (comecou) return;
    comecou = true;
    perguntar(0);
  }
  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) { observador.disconnect(); comecar(); }
    }, { threshold: 0.25 });
    observador.observe($('.chat'));
  } else {
    comecar();
  }
})();
