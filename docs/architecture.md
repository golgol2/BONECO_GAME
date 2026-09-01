# Arquitetura — Boneco do Abismo RPG

## Objetivo

Engine modular para RPG de ação multiplayer 2D/2.5D, inicialmente
voltada para celulares em orientação horizontal 16:9 e preparada
para desktop.

## Estrutura inicial

- `apps/client`: jogo PixiJS/WebGL.
- `packages/core`: loop de simulação e infraestrutura básica.
- `packages/shared`: tipos e contratos compartilhados.
- `PERSONAGEM`: referências-fonte do personagem.

## Regras

- simulação fixa em 60 Hz;
- renderização interpolada;
- resolução lógica 1280x720;
- câmera desacoplada da posição visual;
- Y-sort baseado nos pés;
- colisão do personagem baseada em pequena região nos pés;
- movimento estruturado para oito direções;
- conteúdo futuro orientado a dados;
- cliente não será autoridade de posição, dano, itens ou recompensa.

## Próximos módulos

- renderer
- animation
- physics
- assets
- world
- gameplay
- network
- server
- editor
- ui
- tools

## Física — Fatia 2A

O módulo `@boneco/physics` é independente do PixiJS.

A posição física do personagem representa o ponto dos pés.

O collider inicial é um círculo pequeno, atualmente com raio de 12
unidades lógicas.

Obstáculos do cenário usam AABBs.

A resolução inicial de movimento acontece separadamente nos eixos X e Y,
permitindo deslizamento ao longo de paredes sem usar o tamanho completo
do sprite como colisão.

O renderer apenas desenha o estado resultante; ele não decide a colisão.

## Core — Fatia 2B

A câmera 2D passou a ser responsabilidade de `@boneco/core`.

`Camera2D` recebe dimensões do mundo e viewport e calcula apenas a
posição lógica da câmera. Ela não depende do PixiJS.

O estado de transformação de entidades também foi extraído para
`EntityTransform`.

Cada entidade mantém:

- posição anterior;
- posição atual;
- interpolação visual entre os dois estados.

O renderer consome o estado interpolado, sem possuir a autoridade sobre
a posição lógica da entidade.

## World — Fatia 2C

O mapa deixou de ser definido diretamente no cliente.

`@boneco/world` contém a definição lógica do mundo, incluindo:

- ID estável;
- versão;
- dimensões;
- spawn;
- ruínas;
- parâmetros de colisão.

A colisão das ruínas é derivada dos dados do mapa e não do renderer.

Isso permite que mapas futuros sejam carregados por JSON/schema sem
alterar a lógica de movimento ou física.

O cliente apenas transforma a definição do mundo em representação
visual PixiJS.

## Renderer - Fatia 2D

O pacote `@boneco/renderer` concentra a organização visual PixiJS.

Layers formais:

- farBackground;
- floor;
- backProps;
- entities;
- frontProps;
- vfx;
- ui.

A câmera movimenta apenas `worldRoot`. A layer de UI permanece fixa
na viewport.

Entidades usam Y-sort centralizado pela posição lógica dos pés através
de `ySortValue`.

O cliente deixou de manter diretamente um container genérico de mundo.

## Animation - Fatia 3A

O pacote `@boneco/animation` define a base orientada a dados das
animações.

Estados previstos:

- idle;
- walk;
- run;
- attack;
- defend;
- hurt;
- death;
- interact;
- ability.

Sockets mínimos obrigatórios:

- ROOT;
- FOOT_L;
- FOOT_R;
- HAND_L;
- HAND_R;
- WEAPON_GRIP;
- WEAPON_CENTER;
- WEAPON_TIP;
- CORE;
- HEAD;
- VFX_ORIGIN.

Cada frame possui duração própria, sockets e suporte a eventos.

Nesta fase as imagens FRONT, BACK e PROFILE continuam sendo fallback
estático. Nenhum frame de animação foi inventado.

O cliente já mantém estado lógico `idle` ou `walk`, preparando a
substituição futura por clips reais sem alterar gameplay ou física.

## Gameplay / Weapons - Fatia 3B

Armas são entidades de dados separadas do corpo do personagem.

Uma definição de arma possui:

- ID estável;
- versão;
- asset separado;
- pivô;
- grip;
- centro;
- ponta;
- origem de VFX;
- escala mínima, máxima e padrão;
- uma ou mais hitboxes.

`WeaponInstance` mantém apenas o estado da arma equipada.

`resolveWeaponAttachment` calcula a transformação da arma a partir do
socket do personagem e do grip da arma.

O corpo do personagem não contém espada fixa.

O sistema suporta espelhamento e prepara a aplicação futura dos sockets
WEAPON_GRIP, WEAPON_CENTER e WEAPON_TIP por frame.

Hitboxes pertencem à definição da arma e não ao tamanho visual do
personagem.

## Combat - Fatia 3C.2

O cliente agora consome `AttackController`.

O ataque usa Espaço e percorre:

- windup;
- active;
- recovery.

A hitbox visual de depuração só aparece na fase `active`.

A arma é renderizada como objeto separado do corpo. A geometria atual é
provisória e será substituída por asset real posteriormente.

O estado lógico de animação muda para `attack` durante o golpe e volta
para `idle` ou `walk` quando o ataque termina.

Os offsets visuais atuais ainda são fallback. O objetivo posterior é
substituí-los pelos sockets por frame definidos no módulo animation.

## Combat - Fatia 3D

Foi introduzido dano real em uma entidade-alvo.

O alvo possui `Health` independente do renderer.

A hitbox do ataque é calculada em coordenadas do mundo conforme a
direção do personagem.

A colisão entre hitbox de ataque e alvo usa AABB x AABB no módulo
`@boneco/physics`.

Cada ataque possui um `sequence` crescente.

O alvo só pode receber dano uma vez por `sequence`, impedindo múltiplos
hits durante vários ticks da mesma janela `active`.

O alvo atual é apenas uma entidade de teste para validar o ciclo:

input -> ataque -> janela ativa -> colisão -> dano -> morte.

## Combat - Fatia 3E

Foi criado `DamageReceiver`, responsável por receber dano e controlar
invulnerabilidade temporária.

O fluxo atual é:

hit -> DamageReceiver -> Health -> hurt -> knockback -> death.

Durante a janela de invulnerabilidade novos danos são ignorados.

Knockback é retornado pelo gameplay como vetor e aplicado pelo cliente
ao estado visual/lógico da entidade-alvo.

O alvo de teste muda temporariamente de opacidade durante `hurt` e
invulnerabilidade.

Ao chegar a zero de vida o alvo entra em estado morto e deixa de aceitar
novos danos.

Essa implementação ainda usa um alvo local de teste. A regra de dano
permanece independente do PixiJS.

## Enemy Runtime - Fatia 4A

O alvo de combate deixou de manter regras próprias dentro de
`game.ts`.

Foi criado `EnemyDefinition`, orientado a dados, contendo:

- id;
- versão;
- nome;
- vida máxima;
- dimensões físicas;
- velocidade.

`EnemyInstance` representa o runtime do inimigo e mantém:

- posição;
- velocidade;
- Health;
- DamageReceiver;
- hurt;
- knockback;
- morte.

O renderer continua responsável apenas pela representação visual.

O `TRAINING_DUMMY` é a primeira definição de inimigo e substitui o alvo
temporário hardcoded anterior.

## Enemy Collection - Fatia 4B

O mundo agora possui `enemySpawns` orientados a dados.

Cada spawn informa:

- ID da instância;
- enemyId;
- posição X;
- posição Y.

O gameplay possui um registry de `EnemyDefinition`.

O cliente cria uma coleção de `EnemyInstance` a partir dos spawns do
mapa.

O ataque não possui mais um alvo único. Durante a janela ativa, a
hitbox é testada contra todas as entidades inimigas vivas.

Cada inimigo mantém seu próprio `lastHitAttackSequence`, permitindo que
um mesmo golpe acerte vários inimigos, mas nunca aplique múltiplos hits
no mesmo inimigo durante a mesma sequência.

## Enemy AI - Fatia 4C

A IA básica dos inimigos foi adicionada ao gameplay.

Estados atuais:

- idle;
- chase;
- hurt;
- dead.

Cada `EnemyDefinition` possui:

- moveSpeed;
- detectionRadius;
- stopDistance.

`decideEnemyAi` recebe apenas dados lógicos e retorna uma decisão de
movimento, sem dependência de PixiJS.

Inimigos fora do raio ficam parados.

Dentro do raio eles perseguem o jogador até `stopDistance`.

`hurt` interrompe perseguição temporariamente.

`dead` tem prioridade máxima e impede movimento.

## Enemy Attack - Fatia 4D

Inimigos agora possuem ataque básico contra o jogador.

Cada `EnemyDefinition` inclui:

- attackRange;
- attackDamage;
- attackCooldownSeconds.

`EnemyAttackController` controla o cooldown de forma independente do
renderer.

O jogador agora possui `Health` e `DamageReceiver`.

Ao receber ataque:

- dano é aplicado;
- hurt temporário é ativado;
- existe janela de invulnerabilidade;
- knockback simples é aplicado;
- ao zerar vida o estado passa para `death`;
- movimento é bloqueado enquanto morto.

O feedback de hurt, invulnerabilidade e morte ainda é visualmente
provisório por opacidade.

## PlayerController - Fatia 4E.2

A lógica runtime do jogador foi removida de `game.ts` e concentrada em
`PlayerController`.

O controlador é responsável por:

- posição lógica;
- movimento;
- colisão dos pés;
- direção;
- ataque;
- Health;
- DamageReceiver;
- hurt;
- invulnerabilidade;
- knockback;
- morte;
- estado lógico de animação.

`game.ts` permanece responsável pela composição da cena e pelo vínculo
entre estado lógico e representação PixiJS.

Essa separação prepara o jogador para autoridade futura do servidor sem
acoplar regras de gameplay ao renderer.

## EnemySystem - Fatia 4E.3

A coleção de inimigos, spawn, IA, ataques, atualização visual e resolução
de golpes do jogador foi removida de `game.ts`.

`EnemySystem` agora é responsável por:

- criar inimigos a partir de `enemySpawns`;
- manter `EnemyInstance`;
- atualizar IA;
- movimentar inimigos;
- processar ataques inimigos;
- resolver hitbox do jogador contra múltiplos inimigos;
- limitar um hit por ataque e por inimigo;
- atualizar hurt, invulnerabilidade, morte e Y-sort;
- destruir recursos visuais das entidades.

`game.ts` passa a atuar principalmente como orquestrador da cena.

## Items and Inventory - Fatia 5A

A base de itens foi adicionada ao `@boneco/gameplay`.

`ItemDefinition` possui:

- ID estável;
- versão;
- nome;
- categoria;
- tamanho máximo de stack;
- assetId.

`ItemCatalog` registra e resolve definições por ID.

`Inventory` possui capacidade por slots e suporta:

- stacks;
- preenchimento parcial;
- limite por item;
- adição;
- remoção;
- contagem.

Loot é orientado a dados através de `LootTable`.

Cada entrada possui:

- itemId;
- chance;
- quantidade mínima;
- quantidade máxima.

`rollLoot` aceita uma fonte aleatória injetável, permitindo testes
determinísticos e futura autoridade do servidor.

Os primeiros materiais são `abyss_shard` e `old_iron`.

Nesta etapa drops ainda não possuem representação no mundo.

## World Drops - Fatia 5B

Inimigos agora podem referenciar uma `lootTableId`.

Ao morrer, `EnemySystem` emite `onEnemyDeath` uma única vez.

`DropSystem` recebe esse evento, resolve a loot table e cria drops no
mundo.

Drops possuem:

- ID runtime;
- itemId;
- quantidade;
- posição X/Y.

O jogador coleta automaticamente por proximidade.

A coleta usa o `Inventory` do gameplay e respeita:

- maxStack;
- capacidade;
- coleta parcial.

Se parte de um stack não couber, a quantidade restante continua no
mundo.

A representação visual atual do drop é provisória.

## HUD - Fatia 5C

Foi criado `HudSystem` separado de `game.ts`.

A UI usa a layer fixa `ui` do renderer e exibe:

- vida atual e máxima;
- barra visual de vida;
- estado lógico do personagem;
- inventário compacto;
- controles atuais.

O HUD não mantém estado próprio de gameplay.

Vida e estado vêm de `PlayerController`.

Itens vêm de `DropSystem.inventory`.

`hud-model.ts` transforma dados lógicos em um view model puro,
permitindo testes sem PixiJS.

A interface atual é funcional e provisória; estilos e controles mobile
serão evoluídos posteriormente.

## Equipment - Fatia 5D

Foi criado o sistema lógico de equipamentos.

Slots iniciais:

- weapon;
- head;
- body.

`Equipment` referencia itens existentes no inventário e não duplica
quantidades.

A primeira arma cadastrada é `abyss_blade`.

O item e a definição da arma permanecem separados:

- `ItemDefinition` representa o objeto de inventário;
- `WeaponDefinition` representa pivô, sockets, escala e hitboxes.

O jogador inicia temporariamente com uma `abyss_blade` para validar o
fluxo de equipamento.

O HUD exibe a arma equipada.

A representação geométrica da arma ainda é provisória.

## WeaponView - Fatia 5E

A representação visual da arma foi removida de `game.ts`.

`WeaponView` agora recebe uma `WeaponDefinition` e constrói:

- geometria visual fallback;
- hitboxes de debug;
- transformação de posição;
- rotação;
- escala;
- espelhamento.

O alinhamento usa `resolveWeaponAttachment`, já existente no gameplay.

Nesta etapa ainda são usados sockets fallback por direção para:

- left;
- right;
- up;
- down.

Esses sockets existem apenas como ponte enquanto os sprites estáticos
não possuem sockets reais por frame.

Quando as animações reais estiverem disponíveis, `WeaponView` poderá
receber diretamente `HAND_R`/`WEAPON_GRIP` do frame atual sem alterar a
estrutura da arma.

As hitboxes desenhadas no cliente são apenas visualização de debug. A
autoridade de combate permanece separada.

## Frame Sockets - Fatia 5F

`WeaponView` não recebe mais direção do personagem.

A transformação da arma agora é alimentada diretamente por um
`SocketTransform`.

O fluxo atual é:

AnimationFrameDefinition
→ `HAND_R`
→ WeaponView
→ `resolveWeaponAttachment`
→ transformação visual da arma.

Enquanto os sprites atuais são imagens estáticas, existe
`player-animation-fallback.ts`, que fornece um frame por estado e
direção com sockets compatíveis.

As posições temporárias de mão ficaram centralizadas nesse fallback e
não pertencem mais ao `WeaponView`.

Quando o editor produzir animações reais, o mesmo fluxo poderá consumir
os sockets do frame real sem mudar a API do WeaponView.

## Visual 2.5D Lateral

A direção visual oficial do jogo é um side-scroller 2.5D com
profundidade limitada.

### Espaço lógico

- X: esquerda/direita, eixo principal;
- Y: profundidade limitada, fundo/frente;
- Z: reservado para altura, pulo e plataformas.

A faixa jogável é declarada por `WorldDefinition.playfield`.

### Layers

A composição possui:

- sky;
- farBackground;
- backgroundProps;
- floor;
- backProps;
- entities;
- frontProps;
- foreground;
- vfx;
- foregroundVfx;
- ui.

Objetos em `foreground`, como postes e elementos muito próximos da
câmera, podem ocultar parcialmente o personagem.

Entidades da faixa jogável continuam usando Y-sort pela posição dos pés.

### Cenário provisório

O céu é procedural.

O piso atual é uma referência visual substituível por textura.

As casas atuais são desenhadas em código e pertencem ao background.
Por isso não geram colisão nesta fase.

### Sprites temporários

Os JPGs originais em `PERSONAGEM/` permanecem preservados.

`tools/process_character_chroma.py` gera PNGs transparentes em:

`apps/client/public/assets/personagem/runtime/`

Os arquivos de runtime são derivados e poderão ser substituídos pelos
sprites definitivos posteriormente.

### Armas e ataques

Corpo e arma permanecem independentes.

O pipeline continua:

AnimationFrameDefinition
→ socket da mão
→ WeaponView
→ WeaponDefinition.

Cada arma mantém pivô, grip, centro, ponta, escala, hitbox e origem de
efeitos. Quando as animações definitivas forem produzidas, os sockets
serão definidos por frame no editor.

## Editor Shell - Fatia 6A

O cliente passa a possuir um shell de aplicação separado do runtime do jogo.

Telas atuais:

- Painel;
- Jogo;
- Editor de Animação.

`BonecoGame` só é instanciado ao entrar na tela Jogo e é destruído ao sair.
O editor não depende do loop do jogo nem do `KeyboardInput`.

O primeiro catálogo do Editor de Animação registra os sete vídeos atualmente
presentes em `VIDEOS/`, preservando resolução, FPS e quantidade de frames
observados via `ffprobe`.

A direção horizontal usa o vídeo `right` como fonte e declara `left` como
espelhamento. Não existe asset duplicado para esquerda.

O editor distingue inicialmente:

- `loop`: movimento repetitivo entre `LOOP_START` e `LOOP_END`;
- `segmented`: entrada seguida de uma região de estado/loop, preparada para
  reprodução reversa na saída quando aplicável.

A timeline visual desta fatia ainda não altera frames. Preview de vídeo,
chroma key, marcadores editáveis, sockets e exportação entram nas próximas
fatias.

## Editor Shell - Fatia 6A

O cliente passa a possuir um shell de aplicação separado do runtime do jogo.

Telas atuais:

- Painel;
- Jogo;
- Editor de Animação.

`BonecoGame` só é instanciado ao entrar na tela Jogo e é destruído ao sair.
O editor não depende do loop do jogo nem do `KeyboardInput`.

O primeiro catálogo do Editor de Animação registra os sete vídeos atualmente
presentes em `VIDEOS/`, preservando resolução, FPS e quantidade de frames
observados via `ffprobe`.

A direção horizontal usa o vídeo `right` como fonte e declara `left` como
espelhamento. Não existe asset duplicado para esquerda.

O editor distingue inicialmente:

- `loop`: movimento repetitivo entre `LOOP_START` e `LOOP_END`;
- `segmented`: entrada seguida de uma região de estado/loop, preparada para
  reprodução reversa na saída quando aplicável.

A timeline visual desta fatia ainda não altera frames. Preview de vídeo,
chroma key, marcadores editáveis, sockets e exportação entram nas próximas
fatias.

## Animation Preview - Fatia 6B

Os vídeos originais em `VIDEOS/` continuam preservados.

Para visualização no cliente, cópias são mantidas em:

`apps/client/public/assets/editor/videos/`

O Editor de Animação agora possui:

- preview real de MP4;
- play/pause;
- avanço de um frame;
- retorno de um frame;
- slider de 0 até `frameCount - 1`;
- cursor visual da timeline;
- conversão centralizada entre frame e tempo;
- atualização do frame durante playback.

Os marcadores de loop ainda são apenas visuais.
A próxima fatia transforma esses marcadores em dados editáveis e adiciona
remoção de fundo/chroma key no preview.

## Chroma Preview + Loop - Fatia 6C

O preview do Editor de Animação passa a usar o MP4 como fonte oculta e um
`canvas` como superfície visível.

O canvas suporta:

- chroma key em tempo real;
- tolerância configurável;
- feather/suavização configurável;
- comparação Original / Recortado;
- reprodução contínua;
- navegação por frame já existente.

A remoção de fundo altera somente o alpha do preview e não modifica os MP4
originais.

O transporte possui `Loop: ON/OFF`.

Nesta etapa, `Loop: ON` repete o vídeo completo. Quando os marcadores
`LOOP_START` e `LOOP_END` se tornarem editáveis, o mesmo controle passará a
repetir somente o intervalo selecionado.

O algoritmo de chroma fica separado em `chroma-key.ts`, permitindo testes sem
DOM e reutilização posterior no pipeline de exportação dos sprites.

## Timeline Markers - Fatia 6D

Os marcadores do Editor de Animação passam a ser dados reais por fonte de
vídeo.

Animações `loop` usam:

- `LOOP_START`;
- `LOOP_END`.

Animações `segmented` usam:

- frame 0 como início implícito da entrada;
- `HOLD_START`;
- `HOLD_END`.

Os marcadores podem ser alterados de duas maneiras:

- arrastando diretamente na timeline;
- posicionando o cursor em um frame e usando os botões de marcação.

Os valores permanecem em memória ao alternar entre vídeos durante a mesma
sessão do editor.

Com `Loop: ON`, o elemento `<video>` não usa mais o loop nativo. O editor
controla manualmente a reprodução:

- `loop`: repete `LOOP_START -> LOOP_END`;
- `segmented`: repete `HOLD_START -> HOLD_END`.

Isso prepara animações como abaixar para executar a entrada uma vez, manter
o estado abaixado em loop e posteriormente usar a entrada em reprodução
reversa para levantar.

Persistência em JSON será adicionada depois que o fluxo visual de marcação
for validado.

## Animation Project JSON - Fatia 6E

O Editor de Animação passa a exportar e importar configurações em JSON
versionado.

Schema inicial:

- `schemaVersion`;
- `sourceId`;
- `sourceFile`;
- `state`;
- `direction`;
- `mirrorX`;
- configuração de chroma;
- marcadores da timeline.

O arquivo exportado usa o nome:

`<sourceId>.animation.json`

A exportação não modifica o MP4 original.

O editor também mostra se existem alterações não salvas na configuração
atual.

A persistência de sockets por frame será adicionada ao mesmo schema em versão
posterior, mantendo migração explícita entre versões.

## Editor Local Save API - Fatia 6F

Em desenvolvimento, o Editor de Animação salva configurações diretamente no
workspace através de uma rota local fornecida pelo Vite.

Destino:

`content/animations/<sourceId>.animation.json`

O endpoint aceita somente IDs formados por letras, números, `_` e `-`.
O cliente nunca fornece um caminho de filesystem.

Métodos:

- `PUT /__editor/animations/<sourceId>`: grava configuração;
- `GET /__editor/animations/<sourceId>`: carrega configuração.

A gravação usa arquivo temporário + rename para evitar arquivos parcialmente
gravados.

O endpoint limita cada configuração a 1 MB e existe somente no servidor de
desenvolvimento. A versão publicada do jogo não terá escrita no filesystem.

Os MP4 em `VIDEOS/` continuam sendo fontes originais imutáveis.

## Sprite Runtime - Fatia 6G

O pipeline inicial de geração utiliza:

`MP4 original + content/animations/*.animation.json`

e produz:

`apps/client/public/assets/animations/<sourceId>/`

Cada clip gerado possui:

- frames PNG RGBA;
- tamanho uniforme dentro do clip;
- recorte calculado pela união do alpha de todos os frames;
- `manifest.json`;
- frame original de origem;
- duração por frame;
- direção;
- suporte a `mirrorX`.

Os frames são reduzidos para no máximo 512 px antes do recorte, pois o
personagem atualmente é exibido muito abaixo dessa resolução no runtime.

Nesta fatia, somente estados cíclicos `walk` e `run` são exportados.
Estados segmentados como `jump` permanecem preservados no conteúdo e serão
tratados separadamente para não serem convertidos incorretamente em loops
simples.

O jogo carrega inicialmente `walk_right`.

Comportamento:

- `walk + right`: usa frames gerados;
- `walk + left`: usa os mesmos frames com espelhamento horizontal;
- `walk + up/down`: permanece no fallback enquanto suas configurações não
  forem salvas;
- `idle` e demais estados: permanecem no fallback atual.

O carregamento do runtime é tolerante a ausência do manifest: se o asset não
existir, o jogo continua com o sprite estático.

## Run Runtime - Fatia 6H

O runtime deixa de carregar clips individualmente no `game.ts`.

Agora `PlayerRuntimeAnimator` carrega:

`/assets/animations/catalog.json`

e registra automaticamente todos os clips exportados pelo pipeline.

Isso permite que novas animações `walk/run` entrem no jogo após:

1. salvar a configuração no editor;
2. executar `npm run sprites:generate`;
3. reiniciar/recarregar o cliente.

Corrida:

- Shift esquerdo ou direito solicita `run`;
- velocidade atual: 1.55x a caminhada;
- `run/down`: usa `run_down`;
- `run/up`: usa `run_up`;
- lateral ainda não possui `run_right`;
- enquanto `run_right` não existe, o visual lateral usa `walk_right` como
  fallback, mantendo o estado lógico `run`.

O fallback é somente visual e será removido naturalmente quando o clip
`run/right` existir.

## Gerenciamento individual de sprites

Cada fonte do Editor de Animação possui uma ação de gerenciamento.

O modal permite:

- processar/reprocessar somente o `sourceId` selecionado;
- substituir o vídeo-base;
- preservar o vídeo anterior em `content/video-history/<sourceId>/`;
- manter o mesmo `sourceId`, estado, direção, chroma, velocidade e markers.

Nesta primeira versão, a substituição de vídeo exige compatibilidade de:

- resolução;
- FPS;
- quantidade de frames.

Isso evita invalidar silenciosamente os markers existentes.

Os endpoints de desenvolvimento são restritos a uma allowlist de `sourceId`
conhecidos pelo editor e não aceitam caminhos arbitrários fornecidos pelo
cliente.

O processamento individual usa:

`python3 tools/generate_animation_sprites.py --source-id <id>`

Somente o clip selecionado é regerado. Depois o catálogo é recomposto a
partir dos manifests existentes.

## Controle por destino e combate por alvo

O controle principal do cliente passa a usar click/tap-to-move.

Fluxo atual:

- toque no chão define um destino no mundo;
- a navegação executa somente um eixo por vez;
- não existe movimento diagonal visual;
- a rota simples é composta por até dois segmentos ortogonais;
- o maior deslocamento é executado primeiro;
- toque em inimigo seleciona um `targetId`;
- o jogador realinha X/Y até possuir uma direção cardinal válida;
- dentro do alcance, para, vira para o alvo e solicita o ataque;
- o `AttackController` e a resolução de hitbox existentes continuam responsáveis
  pelas fases e pelo dano;
- teclado permanece temporariamente como fallback de desenvolvimento e cancela
  a navegação automática ao ser usado.

Esta primeira implementação ainda não é um pathfinder completo. A física continua
bloqueando obstáculos normalmente, mas rotas que exigem contorno complexo serão
tratadas posteriormente por um navegador ortogonal com busca de caminho.
