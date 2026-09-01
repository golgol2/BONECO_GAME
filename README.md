# Boneco do Abismo RPG

Engine e jogo do Boneco do Abismo.

## Objetivo

Construir uma engine modular para um RPG de ação multiplayer 2D/2.5D,
com foco inicial em celulares na horizontal 16:9 e suporte posterior
a desktop.

## Stack inicial

- TypeScript
- Vite
- PixiJS / WebGL
- Vitest
- Node.js
- servidor autoritativo posteriormente via WebSocket

## Estrutura

- `apps/client`: cliente do jogo.
- `packages/core`: loop, tempo e infraestrutura da engine.
- `packages/shared`: tipos e contratos compartilhados.
- `docs`: documentação técnica.
- `PERSONAGEM`: imagens-fonte do personagem.

## Desenvolvimento

Instalar dependências:

    npm install

Executar cliente:

    npm run dev

## Validação

Executar:

    npm run check

## Controles atuais

- W / seta para cima
- S / seta para baixo
- A / seta para esquerda
- D / seta para direita

## Estado da primeira fatia

A resolução lógica inicial é 1280x720 em proporção 16:9.

A simulação utiliza passo fixo de 60 Hz e a renderização possui
interpolação entre estados.

O personagem possui quatro direções lógicas:

- frente;
- costas;
- esquerda;
- direita.

As referências atuais são:

- `PERSONAGEM/FRONT.jpg`
- `PERSONAGEM/BACK.jpg`
- `PERSONAGEM/PROFILE.jpg`

O perfil é espelhado para representar a direção oposta.

A posição lógica do personagem é baseada nos pés, preparando a engine
para colisão independente das dimensões visuais do sprite.

O Y-sort também utiliza a posição dos pés.

## Próximas etapas

1. sistema de entidades e componentes;
2. câmera modular;
3. física e colisões;
4. assets orientados a dados;
5. animações e sockets;
6. arma modular;
7. editor de mapa;
8. servidor autoritativo;
9. multiplayer;
10. conteúdo completo do jogo.
