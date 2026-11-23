import test from 'node:test';
import assert from 'node:assert/strict';

await import('../candidatura.js');
const { avaliar, numeroProtocolo, FUNCOES } = globalThis.BccCandidatura;

const perfil = { idade: 'maior', escolaridade: 'medio-completo', interesse: 'atendimento', pcd: 'nao' };

test('protocolo usa RP, a data e a hora', () => {
  assert.equal(numeroProtocolo(new Date(2026, 10, 22, 18, 7)), 'RP-20261122-1807');
  assert.equal(numeroProtocolo(new Date(2027, 0, 3, 9, 5)), 'RP-20270103-0905');
});

test('maior de idade com ensino médio completo pode se candidatar ao atendimento', () => {
  const r = avaliar(perfil);
  assert.equal(r.situacao, 'pode');
  assert.deepEqual(r.funcoes, ['atendimento']);
  assert.deepEqual(r.motivos, []);
});

test('faculdade em andamento ou completa conta como ensino médio completo', () => {
  for (const escolaridade of ['superior-cursando', 'superior-completo']) {
    assert.equal(avaliar({ ...perfil, escolaridade, interesse: 'vendas' }).situacao, 'pode');
  }
});

test('menor de idade não atende ao atendimento e recebe o motivo', () => {
  const r = avaliar({ ...perfil, idade: 'menor' });
  assert.equal(r.situacao, 'ainda-nao');
  assert.deepEqual(r.motivos, ['idade']);
  assert.deepEqual(r.funcoes, []);
});

test('ensino médio incompleto aponta a escolaridade como motivo', () => {
  assert.deepEqual(avaliar({ ...perfil, escolaridade: 'medio-cursando' }).motivos, ['escolaridade']);
  assert.deepEqual(avaliar({ ...perfil, idade: 'menor', escolaridade: 'fundamental' }).motivos, ['idade', 'escolaridade']);
});

test('estágio pede faculdade em andamento, sem exigir 18 anos', () => {
  const r = avaliar({ ...perfil, idade: 'menor', escolaridade: 'superior-cursando', interesse: 'estagio' });
  assert.equal(r.situacao, 'pode');
  assert.deepEqual(r.funcoes, ['estagio']);
});

test('quem quer estágio sem estar na faculdade recebe as outras funções que cabem no perfil', () => {
  const r = avaliar({ ...perfil, interesse: 'estagio' });
  assert.equal(r.situacao, 'outras');
  assert.deepEqual(r.motivos, ['faculdade']);
  assert.deepEqual(r.funcoes, ['atendimento', 'vendas', 'administrativo']);
});

test('menor de idade na faculdade que quer atendimento é encaminhado ao estágio', () => {
  const r = avaliar({ ...perfil, idade: 'menor', escolaridade: 'superior-cursando', interesse: 'atendimento' });
  assert.equal(r.situacao, 'outras');
  assert.deepEqual(r.motivos, ['idade']);
  assert.deepEqual(r.funcoes, ['estagio']);
});

test('estágio com faculdade concluída não cabe, mas as demais funções sim', () => {
  const r = avaliar({ ...perfil, escolaridade: 'superior-completo', interesse: 'estagio' });
  assert.equal(r.situacao, 'outras');
  assert.deepEqual(r.funcoes, ['atendimento', 'vendas', 'administrativo']);
});

test('a resposta sobre deficiência só liga o aviso de vagas PcD', () => {
  assert.equal(avaliar({ ...perfil, pcd: 'sim' }).avisoPcd, true);
  assert.equal(avaliar({ ...perfil, pcd: 'nao' }).avisoPcd, false);
  assert.equal(avaliar({ ...perfil, pcd: 'prefiro-nao-dizer' }).avisoPcd, false);
  assert.equal(avaliar({ ...perfil, pcd: 'sim' }).situacao, 'pode');
});

test('resposta fora das opções é recusada', () => {
  assert.throws(() => avaliar({ ...perfil, interesse: 'gerente' }), /interesse/);
  assert.throws(() => avaliar({ ...perfil, idade: '' }), /idade/);
});

test('cada função tem nome para mostrar no protocolo', () => {
  for (const chave of ['atendimento', 'vendas', 'estagio', 'administrativo']) assert.ok(FUNCOES[chave].length > 3);
});
