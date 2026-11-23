# BrasilCenter Ribeirão Preto: página de vagas

Página de demonstração desenvolvida por Melissa Suelen Chiarato Pereira no estágio supervisionado de Análise e Desenvolvimento de Sistemas (Multivix). Ela reúne, para quem procura emprego ou estágio em Ribeirão Preto - SP, as funções da unidade da BrasilCenter, como é o trabalho, os benefícios e as etapas da seleção, e traz um teste rápido que diz se a pessoa já atende aos requisitos divulgados pela empresa.

A página não é um canal oficial da BrasilCenter e não coleta dados. Todos os botões de candidatura levam ao portal oficial de vagas, [Vem ser BCC](https://vemprabcc.gupy.io/).

## Como rodar

Precisa só do Node.js 18 ou mais novo. Não há dependências para instalar.

```bash
npm run dev     # prévia em http://127.0.0.1:4177
npm test        # testes das regras do teste "Posso me candidatar?"
npm run build   # gera a pasta dist/ para publicação
```

## Estrutura

| Arquivo | O que faz |
|---|---|
| index.html | conteúdo da página e ícones (sprite SVG) |
| styles.css | layout, cores, fontes e versões para celular |
| candidatura.js | regras do teste: requisitos por função e número do protocolo |
| app.js | menu do celular, barra de atalhos e a conversa do teste |
| site.config.js | endereço do portal oficial de vagas |
| server.mjs | servidor local da prévia |
| scripts/build.mjs | copia os arquivos do site para dist/ |
| testes/candidatura.test.mjs | testes das regras com o executor nativo do Node |

## Regras do teste

- Atendimento, vendas e administrativo: 18 anos ou mais e ensino médio completo (faculdade em andamento ou completa também vale).
- Estágio de nível superior: estar cursando faculdade.
- Quando a área escolhida não cabe no perfil, o resultado indica as outras funções que cabem.
- A resposta sobre deficiência só mostra o aviso das vagas para pessoas com deficiência.

O resultado é orientativo. Os requisitos de cada vaga estão na descrição dela no portal.

## Fontes das informações

- Cartão CNPJ da filial (02.917.443/0003-39).
- Portal Vem ser BCC, consultado em novembro de 2026.
- Comunicados da empresa de abril e maio de 2024 e matéria de outubro de 2026 sobre o processo seletivo.

## Imagens e fontes tipográficas

As fotos são ilustrativas, não são da unidade, e foram recortadas a partir do Wikimedia Commons:

- Atendente: USDA, domínio público.
- Central de atendimento: Defensoría del Pueblo de la Ciudad de Buenos Aires, CC BY-SA 4.0.
- Sala em São Paulo: Carlos Ebert, CC BY 2.0.
- Home office: Comissão Europeia, Christophe Licoppe, CC BY 4.0.

Fontes Bricolage Grotesque, Hanken Grotesk e IBM Plex Mono, sob a SIL Open Font License (licenças em assets/fonts).
