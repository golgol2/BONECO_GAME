# Boneco do Abismo RPG

Engine e jogo do **Boneco do Abismo**, desenvolvidos como um RPG de ação
2D/2.5D modular, com arquitetura preparada para evolução até multiplayer
autoritativo.

O projeto não é uma demonstração descartável. A estrutura atual já contém
núcleo de engine, física, renderer, mundo, animações, combate, inimigos,
inventário, equipamentos, drops, HUD, editor de animações e pipeline de
geração de sprites.

> **Estado atual:** desenvolvimento ativo.
>
> O cliente local já é executável e testável, mas o jogo ainda não está
> completo. Servidor multiplayer, persistência, construção, crafting,
> profissões, quests, conteúdo final e publicação mobile ainda não foram
> implementados.

---

## 1. Visão do projeto

A direção visual oficial é um **side-scroller 2.5D com profundidade limitada**.

O personagem se movimenta em um espaço lógico com três conceitos separados:

- **X**: deslocamento horizontal principal;
- **Y**: profundidade dentro da faixa jogável;
- **Z**: altura física usada por pulo e futuramente plataformas.

A posição física do personagem representa os **pés**, e não o centro ou o
tamanho total do sprite.

Isso permite:

- Y-sort consistente;
- colisão independente da arte;
- sprites de tamanhos diferentes;
- armas separadas do corpo;
- profundidade visual sem alterar a física vertical;
- futuro suporte a personagens e equipamentos diferentes.

A resolução lógica atual é:

```text
1280 × 720
16:9
```bash
# BONECO_RUN
set -euo pipefail

echo "===== CONFIRMAÇÃO ====="
echo "PWD: $(pwd)"
echo "Branch: $(git branch --show-current)"
git status --short

if [ "$(pwd)" != "/media/allana/Dados240/GAME_BONECO" ]; then
  echo "ERRO: diretório incorreto."
  exit 1
fi

if [ "$(git branch --show-current)" != "main" ]; then
  echo "ERRO: branch atual não é main."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "ERRO: remote origin não configurado."
  exit 1
fi

echo
echo "===== GERANDO README COMPLETO ====="

cat > README.md <<'EOF'
# Boneco do Abismo RPG

Engine e jogo do **Boneco do Abismo**, desenvolvidos como um RPG de ação 2D/2.5D modular, com arquitetura preparada para evolução até multiplayer autoritativo.

O projeto não é uma demonstração descartável. O repositório já contém uma base funcional de engine, renderer, física, mundo, animações, combate, inimigos, inventário, equipamentos, drops, HUD, editor de animações e pipeline de processamento de assets.

> **Status:** desenvolvimento ativo.
>
> O cliente atual já é executável e testável. Servidor multiplayer, persistência, construção, crafting, profissões, quests, conteúdo final, otimização mobile e publicação ainda não estão concluídos.

---

## 1. Objetivo

Construir uma engine modular e, sobre ela, finalizar o RPG de ação multiplayer do Boneco do Abismo.

Direção atual:

- RPG de ação;
- visual 2D/2.5D;
- câmera lateral elevada com profundidade limitada;
- foco inicial em celular horizontal 16:9;
- preparado para desktop;
- movimento cardinal;
- armas e corpo separados;
- animações orientadas a dados;
- conteúdo orientado a dados;
- servidor autoritativo no multiplayer;
- arquitetura preparada para mapas, vilas, profissões, crafting e progressão.

---

## 2. Estado atual

Já existe no repositório:

- monorepo TypeScript com npm workspaces;
- cliente Vite + PixiJS;
- loop de simulação em passo fixo;
- interpolação de renderização;
- câmera lógica 2D;
- espaço lógico X/Y/Z;
- projeção de profundidade;
- Y-sort;
- colisão circular nos pés;
- colisão contra AABBs;
- mapa orientado a dados;
- layers formais de renderização;
- iluminação 2D;
- personagem com frente, costas e perfil;
- espelhamento horizontal;
- animações runtime geradas de vídeos;
- editor de animações;
- chroma key;
- marcadores de timeline;
- velocidade individual por animação;
- pausa especial no primeiro frame do idle;
- sockets-base;
- armas separadas do corpo;
- ataque com windup/active/recovery;
- hitbox melee;
- vida, dano, hurt, invulnerabilidade e morte;
- knockback;
- inimigos orientados a dados;
- IA básica;
- ataque inimigo;
- inventário;
- equipamentos;
- loot tables;
- drops no mundo;
- coleta de drops;
- HUD;
- click/tap-to-move;
- seleção e ataque por alvo;
- testes automatizados;
- build de produção.

Último estado validado conhecido:

- 43 arquivos de teste;
- 167 testes passando;
- typecheck passando;
- build Vite passando;
- git diff --check passando.

---

## 3. Conceito espacial

O jogo utiliza três conceitos separados de posição.

### X

Eixo horizontal principal.

```text
← esquerda                    direita →
```

### Y

Profundidade dentro da faixa jogável.

```text
fundo
  ↑
  |
  |
  ↓
frente
```

### Z

Altura física independente.

```text
        personagem
             ●
             |
             | Z
             |
-------------+------------- chão
```

O salto altera Z.

A perspectiva visual depende de Y.

A posição física continua baseada nos pés.

---

## 4. Resolução e simulação

Resolução lógica atual:

```text
1280 × 720
16:9
```

A simulação utiliza passo fixo, estruturado atualmente para 60 Hz.

A renderização interpola entre estado anterior e atual.

Fluxo:

```text
simulação fixa
    ↓
estado lógico
    ↓
interpolação
    ↓
renderização
```

---

## 5. Stack

### Principal

- TypeScript
- Node.js
- npm workspaces
- Vite
- PixiJS 8
- Vitest
- jsdom

### Ferramentas de assets

- Python 3
- Pillow
- FFmpeg
- ffprobe

### Previsto

- servidor Node.js;
- WebSocket;
- SQLite;
- PostgreSQL;
- Capacitor;
- Playwright.

---

## 6. Estrutura do repositório

```text
GAME_BONECO/
│
├── apps/
│   └── client/
│
├── packages/
│   ├── animation/
│   ├── core/
│   ├── gameplay/
│   ├── physics/
│   ├── renderer/
│   ├── shared/
│   └── world/
│
├── content/
│   └── animations/
│
├── docs/
│
├── PERSONAGEM/
├── VIDEOS/
├── Texturas/
│
├── scripts/
├── tools/
│
├── package.json
├── package-lock.json
├── tsconfig.base.json
└── README.md
```

---

## 7. apps/client

Cliente visual principal.

Responsabilidades:

- inicializar PixiJS;
- montar a cena;
- carregar assets;
- conectar módulos da engine;
- processar input;
- renderizar jogador;
- renderizar inimigos;
- renderizar mundo;
- renderizar HUD;
- executar o editor local;
- converter clique da tela em coordenadas do mundo.

Arquivos importantes:

```text
apps/client/src/game.ts
apps/client/src/main.ts
apps/client/src/app-shell.ts
apps/client/src/input.ts
apps/client/vite.config.ts
```

---

## 8. game.ts

Arquivo:

```text
apps/client/src/game.ts
```

É o principal orquestrador do runtime atual.

Integra:

- PixiJS;
- PlayerController;
- ClickMoveController;
- EnemySystem;
- DropSystem;
- HudSystem;
- LightingSystem;
- PlayerRuntimeAnimator;
- Camera2D;
- WorldSceneView;
- WeaponView.

O objetivo arquitetural é manter `game.ts` como compositor e orquestrador, evitando colocar nele regras que pertencem aos módulos de gameplay, física, mundo ou animação.

---

## 9. App Shell

Arquivo:

```text
apps/client/src/app-shell.ts
```

Telas atuais:

- Painel;
- Jogo;
- Editor de Animação.

`BonecoGame` é criado ao entrar no jogo e destruído ao sair.

Isso evita manter ativos:

- loops;
- listeners;
- recursos PixiJS;
- controles;
- timers.

---

## 10. Input

Arquivo:

```text
apps/client/src/input.ts
```

O teclado permanece como fallback de desenvolvimento.

Controles atuais:

```text
W / ArrowUp       cima
S / ArrowDown     baixo
A / ArrowLeft     esquerda
D / ArrowRight    direita
Shift             correr
Space             ataque manual
J                 pular
```

O sistema principal de navegação atual é por clique/toque.

Quando movimento de teclado é detectado, a navegação automática é cancelada.

---

## 11. Click / Tap to Move

Arquivo:

```text
apps/client/src/controllers/click-move-controller.ts
```

O jogador toca ou clica no chão para definir um destino.

O movimento automático utiliza somente um eixo por vez.

Exemplo:

```text
INÍCIO ●────────────┐
                    │
                    │
                    ● DESTINO
```

Durante a navegação automática:

```text
x != 0, y = 0
```

ou:

```text
x = 0, y != 0
```

Nunca ocorre movimento diagonal lógico automático.

Isso reduz a necessidade de sprites diagonais.

---

## 12. Ordem da navegação

A implementação atual executa primeiro o maior deslocamento.

Exemplo:

```text
dx = 500
dy = 80
```

Resultado:

```text
X primeiro
Y depois
```

A rota simples atual possui até dois segmentos ortogonais.

---

## 13. Limitação atual da navegação

A navegação ainda não é um pathfinder completo.

Ela consegue:

- definir destino;
- caminhar em rota ortogonal;
- virar entre eixos;
- respeitar a física de colisão existente.

Ainda não consegue criar automaticamente vários waypoints para contornar obstáculos complexos.

Próxima evolução importante:

```text
pathfinding ortogonal
+
waypoints
+
replanejamento
```

---

## 14. Ataque por alvo

Clique ou toque em inimigo seleciona um `targetId`.

Fluxo:

1. identifica o inimigo;
2. guarda seu ID;
3. acompanha sua posição runtime;
4. aproxima o jogador;
5. alinha X ou Y;
6. escolhe direção cardinal;
7. para;
8. solicita ataque.

Fluxo simplificado:

```text
CLICK NO INIMIGO
       ↓
    targetId
       ↓
 acompanhar posição
       ↓
   aproximar
       ↓
    alinhar
       ↓
 direção cardinal
       ↓
     ataque
```

---

## 15. Ataque sem diagonal

Mesmo quando jogador e inimigo estão diagonalmente posicionados, o sistema realinha antes do golpe.

Direções de ataque:

- up;
- down;
- left;
- right.

Não é necessário um sprite de ataque diagonal para essa versão do sistema.

---

## 16. PlayerController

Arquivo:

```text
apps/client/src/controllers/player-controller.ts
```

Responsável por:

- posição lógica;
- movimento;
- colisão;
- direção;
- corrida;
- salto;
- Z;
- ataque;
- vida;
- dano;
- hurt;
- invulnerabilidade;
- knockback;
- morte;
- estado lógico de animação.

O renderer não decide essas regras.

---

## 17. Core

Pacote:

```text
packages/core
```

Arquivos:

```text
camera.ts
entity-state.ts
fixed-step.ts
game-loop.ts
```

Responsabilidades:

- loop;
- fixed step;
- câmera;
- transformação;
- interpolação.

---

## 18. Camera2D

Arquivo:

```text
packages/core/src/camera.ts
```

Trabalha com coordenadas lógicas e não depende do PixiJS.

Atualmente acompanha principalmente o eixo X.

---

## 19. EntityTransform

Arquivo:

```text
packages/core/src/entity-state.ts
```

Mantém:

- posição anterior;
- posição atual;
- interpolação.

Isso desacopla renderização da simulação.

---

## 20. Física

Pacote:

```text
packages/physics
```

Responsabilidades atuais:

- círculo contra AABB;
- movimento de círculo contra AABBs;
- resolução separada por eixo;
- AABB contra AABB.

Não depende do PixiJS.

---

## 21. Collider dos pés

O personagem não usa o tamanho inteiro da imagem como collider.

Collider atual:

```text
círculo
raio = 12
```

Conceito:

```text
       sprite
         |
         |
        / \
       /   \
        (●)
        pés
```

Isso permite trocar sprites sem alterar a física principal.

---

## 22. Renderer

Pacote:

```text
packages/renderer
```

Responsabilidades:

- layers;
- projeção de profundidade;
- Y-sort;
- organização visual.

O renderer não decide combate.

---

## 23. Layers

A composição atual trabalha com conceitos como:

```text
sky
farBackground
backgroundProps
floor
backProps
entities
frontProps
foreground
vfx
foregroundVfx
lighting
ui
```

A UI permanece fixa na viewport.

---

## 24. Projeção 2.5D

Arquivo:

```text
packages/renderer/src/depth-projection.ts
```

A posição Y altera escala visual.

No mapa atual:

```text
farScale  = 0.72
nearScale = 1.18
```

A escala depende da profundidade Y e não da altura Z.

---

## 25. Y-sort

A ordem visual usa a posição lógica dos pés.

Conceito:

```text
menor Y → mais atrás
maior Y → mais à frente
```

O tamanho visual da sprite não define a ordem.

---

## 26. World

Pacote:

```text
packages/world
```

Arquivos principais:

```text
default-world.ts
types.ts
validate.ts
collision.ts
```

O mapa não é definido diretamente em `game.ts`.

---

## 27. Mundo atual

Arquivo:

```text
packages/world/src/default-world.ts
```

Dimensão:

```text
3200 × 720
```

Playfield:

```text
minY = 420
maxY = 670
```

Spawn atual:

```text
x = 640
y = 545
```

---

## 28. WorldDefinition

Contém:

- ID;
- versão;
- dimensões;
- spawn;
- playfield;
- iluminação;
- materiais;
- ruínas;
- enemy spawns.

O objetivo é manter o conteúdo configurável por dados.

---

## 29. WorldSceneView

Arquivo:

```text
apps/client/src/views/world-scene-view.ts
```

Transforma dados do mundo em representação PixiJS.

Não deve decidir física ou gameplay.

---

## 30. Materiais

Assets:

```text
apps/client/public/assets/materials/
```

Categorias atuais:

```text
door/
floor/
roof/
wall/
```

Carregador:

```text
apps/client/src/views/world-material-catalog.ts
```

---

## 31. Iluminação

Arquivos:

```text
apps/client/src/systems/lighting-system.ts
apps/client/src/systems/lighting-model.ts
```

O sistema atual possui:

- escuridão ambiente;
- luz do jogador;
- luzes estáticas;
- raio;
- intensidade;
- flicker;
- escala de revelação.

---

## 32. Animation

Pacote:

```text
packages/animation
```

Estados previstos:

```text
idle
walk
run
attack
defend
hurt
death
interact
ability
jump
```

---

## 33. Sockets

Sockets mínimos previstos:

```text
ROOT
FOOT_L
FOOT_R
HAND_L
HAND_R
WEAPON_GRIP
WEAPON_CENTER
WEAPON_TIP
CORE
HEAD
VFX_ORIGIN
```

Podem ser utilizados para:

- armas;
- partículas;
- magia;
- efeitos;
- luz;
- acessórios;
- hitboxes;
- itens.

---

## 34. Personagem

Fontes originais:

```text
PERSONAGEM/FRONT.jpg
PERSONAGEM/BACK.jpg
PERSONAGEM/PROFILE.jpg
```

O perfil pode ser espelhado para representar esquerda.

---

## 35. Chroma

Ferramenta:

```text
tools/process_character_chroma.py
```

Saída runtime:

```text
apps/client/public/assets/personagem/runtime/
```

Arquivos atuais:

```text
FRONT.png
BACK.png
PROFILE.png
```

---

## 36. Vídeos de animação

Pasta:

```text
VIDEOS/
```

Fontes atuais:

```text
ABAIXANDO_EFICANDOABAIXADO_.mp4
ANDADO_DECOSTA.mp4
ANDADO_DE_FRENTE.mp4
ANDANDO_PARA_DIREITA.mp4
CORRENDO_DE_COSTA.mp4
CORRENDO_DE_FRENTE.mp4
CORRENDO_PARA_DIREITA.mp4
PARADO_DE_FRENTE.mp4
PULANDO.mp4
```

---

## 37. Editor de animações

Código:

```text
apps/client/src/editor/
```

Recursos atuais:

- seleção de fonte;
- preview de MP4;
- play/pause;
- avanço de frame;
- retorno de frame;
- timeline;
- slider;
- chroma key em tempo real;
- original/recortado;
- tolerância;
- feather;
- marcadores;
- drag de marcadores;
- velocidade por animação;
- salvar;
- carregar;
- processar uma sprite;
- substituir vídeo-base compatível.

---

## 38. Configurações das animações

Pasta:

```text
content/animations/
```

Arquivos atuais:

```text
crouch.animation.json
idle_down.animation.json
jump.animation.json
run_down.animation.json
run_right.animation.json
run_up.animation.json
walk_down.animation.json
walk_right.animation.json
walk_up.animation.json
```

---

## 39. Schema de animação

Conceitos atuais:

```text
schemaVersion
sourceId
sourceFile
state
direction
mirrorX
playbackRate
firstFrameHoldMs
chroma
markers
```

Campos adicionados posteriormente permanecem opcionais quando necessário para compatibilidade com arquivos antigos.

---

## 40. Idle

Clip:

```text
idle_down
```

Fonte:

```text
PARADO_DE_FRENTE.mp4
```

Possui pausa de:

```text
firstFrameHoldMs = 10000
```

Comportamento:

```text
primeiro frame
↓
10 segundos
↓
loop completo
↓
primeiro frame
↓
10 segundos
↓
loop completo
↓
repete
```

---

## 41. Pipeline de sprites

Ferramenta:

```text
tools/generate_animation_sprites.py
```

Pipeline:

```text
MP4
+
animation.json
↓
extração
↓
resize
↓
chroma
↓
union alpha bbox
↓
crop uniforme
↓
PNG RGBA
↓
manifest.json
↓
catalog.json
```

---

## 42. Gerar sprites

Todos:

```text
npm run sprites:generate
```

Uma animação:

```text
python3 tools/generate_animation_sprites.py --source-id walk_right
```

---

## 43. Runtime de animações

Pasta:

```text
apps/client/public/assets/animations/
```

Estrutura:

```text
animations/
├── catalog.json
├── idle_down/
├── jump/
├── run_down/
├── run_right/
├── run_up/
├── walk_down/
├── walk_right/
└── walk_up/
```

---

## 44. Catálogo runtime atual

Clips atuais:

```text
idle_down
jump
run_down
run_right
run_up
walk_down
walk_right
walk_up
```

O lado esquerdo utiliza espelhamento quando permitido.

---

## 45. Crouch

Existe configuração:

```text
content/animations/crouch.animation.json
```

Mas ainda não existe clip runtime integrado para crouch.

Esse estado precisa de suporte apropriado no exportador/runtime antes da integração completa.

---

## 46. PlayerRuntimeAnimator

Arquivo:

```text
apps/client/src/animation/player-runtime-animation.ts
```

Fluxo:

1. carrega catálogo;
2. carrega manifests;
3. registra clips;
4. procura estado/direção;
5. calcula frame;
6. aplica mirror;
7. usa fallback se necessário.

---

## 47. RuntimeAnimationModel

Arquivo:

```text
apps/client/src/animation/runtime-animation-model.ts
```

Responsável por:

- modelo do manifest;
- validação;
- cálculo de frame;
- animações segmentadas;
- pausa de primeiro frame;
- lookup de direção.

---

## 48. Fallback visual

Arquivo:

```text
apps/client/src/animation/player-animation-fallback.ts
```

Usado quando não existe clip runtime para determinado estado/direção.

Também fornece sockets temporários.

---

## 49. Gameplay

Pacote:

```text
packages/gameplay
```

Contém:

- ataque;
- dano;
- vida;
- armas;
- inimigos;
- IA;
- inventário;
- equipamentos;
- loot;
- drops;
- hitboxes.

Regras de gameplay devem permanecer independentes do renderer sempre que possível.

---

## 50. AttackController

Arquivo:

```text
packages/gameplay/src/attack-controller.ts
```

Fases:

```text
idle
windup
active
recovery
```

Somente `active` representa a janela ofensiva.

---

## 51. Melee Hitbox

Arquivo:

```text
packages/gameplay/src/melee-hitbox.ts
```

Calcula hitbox em coordenadas do mundo conforme direção cardinal.

A imagem da arma encostar visualmente no alvo não é a regra de dano.

---

## 52. Armas

Arquivos:

```text
packages/gameplay/src/weapon-types.ts
packages/gameplay/src/default-weapons.ts
packages/gameplay/src/weapon-transform.ts
packages/gameplay/src/weapon-instance.ts
```

Uma arma pode possuir:

- ID;
- versão;
- asset;
- pivot;
- grip;
- center;
- tip;
- VFX origin;
- escala;
- hitboxes.

---

## 53. WeaponView

Arquivo:

```text
apps/client/src/views/weapon-view.ts
```

Responsável pela representação visual da arma.

O visual atual ainda é provisório.

A estrutura permite substituição por asset real sem alterar a lógica central.

---

## 54. Vida

Arquivo:

```text
packages/gameplay/src/health.ts
```

Mantém vida atual, vida máxima e estado de morte.

---

## 55. DamageReceiver

Arquivo:

```text
packages/gameplay/src/damage-receiver.ts
```

Fluxo:

```text
hit
↓
DamageReceiver
↓
Health
↓
hurt
↓
invulnerabilidade
↓
knockback
↓
death
```

---

## 56. Inimigos

Arquivos:

```text
packages/gameplay/src/enemy-types.ts
packages/gameplay/src/enemy-instance.ts
packages/gameplay/src/default-enemies.ts
packages/gameplay/src/enemy-ai.ts
packages/gameplay/src/enemy-attack.ts
```

Definição inicial:

```text
training_dummy
```

---

## 57. EnemyDefinition

Campos atuais:

- id;
- version;
- displayName;
- maxHealth;
- bodyWidth;
- bodyHeight;
- moveSpeed;
- detectionRadius;
- stopDistance;
- attackRange;
- attackDepthRange;
- attackDamage;
- attackCooldownSeconds;
- lootTableId.

---

## 58. EnemySystem

Arquivo:

```text
apps/client/src/systems/enemy-system.ts
```

Responsável por:

- spawn;
- runtime;
- AI;
- movimento;
- ataque;
- hurt;
- morte;
- Y-sort;
- resolução de ataques do jogador;
- hit testing;
- consulta por targetId.

---

## 59. IA atual

Estados:

```text
idle
chase
hurt
dead
```

Ainda faltam:

- pathfinding;
- comportamento em grupo;
- habilidades;
- bosses;
- estados avançados;
- navegação complexa.

---

## 60. Itens

Arquivos:

```text
packages/gameplay/src/item-types.ts
packages/gameplay/src/item-catalog.ts
packages/gameplay/src/default-items.ts
```

Itens atuais incluem:

```text
abyss_shard
old_iron
abyss_blade
```

---

## 61. Inventory

Arquivo:

```text
packages/gameplay/src/inventory.ts
```

Suporta:

- slots;
- stacks;
- maxStack;
- adicionar;
- remover;
- contar;
- preenchimento parcial.

---

## 62. Equipment

Arquivo:

```text
packages/gameplay/src/equipment.ts
```

Slots atuais:

```text
weapon
head
body
```

Arma inicial de teste:

```text
abyss_blade
```

---

## 63. Loot

Arquivo:

```text
packages/gameplay/src/loot.ts
```

Loot tables suportam:

- itemId;
- chance;
- quantidade mínima;
- quantidade máxima.

A fonte aleatória pode ser injetada para testes determinísticos e futura autoridade do servidor.

---

## 64. DropSystem

Arquivo:

```text
apps/client/src/systems/drop-system.ts
```

Drops possuem:

- ID;
- item;
- quantidade;
- X;
- Y.

Atualmente são coletados automaticamente por proximidade.

---

## 65. HUD

Arquivos:

```text
apps/client/src/ui/hud-system.ts
apps/client/src/ui/hud-model.ts
```

Exibe:

- vida;
- barra de vida;
- estado;
- arma equipada;
- inventário compacto;
- controles.

O visual ainda é provisório.

---

## 66. Conteúdo fonte e conteúdo derivado

### Fonte

```text
PERSONAGEM/
VIDEOS/
Texturas/
content/
```

### Derivado

```text
apps/client/public/assets/personagem/runtime/
apps/client/public/assets/animations/
apps/client/public/assets/editor/videos/
```

---

## 67. API local do editor

Arquivo:

```text
apps/client/vite.config.ts
```

Em desenvolvimento, disponibiliza endpoints locais para:

- salvar animação;
- carregar animação;
- processar sprite;
- substituir vídeo.

As operações são restritas por sourceId conhecido e não aceitam caminhos arbitrários fornecidos pelo cliente.

---

## 68. Histórico de vídeos

Vídeos substituídos podem ser preservados em:

```text
content/video-history/
```

Essa pasta é ignorada pelo Git.

---

## 69. Requisitos de desenvolvimento

Recomendado:

```text
Node.js 20+
npm
Python 3
FFmpeg
ffprobe
```

Versões utilizadas no desenvolvimento atual:

```text
Node.js 20.x
npm 10.x
Python 3.12
Git 2.43
```

---

## 70. Instalação

```text
npm install
```

---

## 71. Desenvolvimento

```text
npm run dev
```

---

## 72. Typecheck

```text
npm run typecheck
```

---

## 73. Testes

```text
npm run test
```

---

## 74. Build

```text
npm run build
```

---

## 75. Validação completa

```text
npm run check
```

Atualmente executa:

```text
typecheck
+
test
+
build
```

Também executar antes de concluir uma alteração:

```text
git diff --check
```

---

## 76. @boneco/shared

Pasta:

```text
packages/shared
```

Tipos e contratos compartilhados.

Deve permanecer pequeno.

---

## 77. @boneco/core

Pasta:

```text
packages/core
```

Contém:

- loop;
- fixed step;
- câmera;
- transformações;
- interpolação.

---

## 78. @boneco/physics

Pasta:

```text
packages/physics
```

Contém colisão e geometria independentes do renderer.

---

## 79. @boneco/renderer

Pasta:

```text
packages/renderer
```

Contém:

- layers;
- depth;
- Y-sort;
- helpers visuais.

Não decide combate.

---

## 80. @boneco/animation

Pasta:

```text
packages/animation
```

Contém:

- estados;
- sockets;
- tipos;
- validação;
- state machine.

---

## 81. @boneco/world

Pasta:

```text
packages/world
```

Contém:

- mapa;
- playfield;
- spawn;
- materiais;
- ruínas;
- iluminação;
- colisões derivadas.

---

## 82. @boneco/gameplay

Pasta:

```text
packages/gameplay
```

Contém:

- combate;
- armas;
- inimigos;
- vida;
- dano;
- itens;
- inventário;
- equipamentos;
- loot.

---

## 83. Regras arquiteturais

### Renderer não decide gameplay

Renderer desenha.

Gameplay decide:

- dano;
- vida;
- hit;
- morte;
- itens;
- loot.

### Cliente não será autoridade final

No multiplayer, cliente não deverá ser autoridade sobre:

- posição final;
- dano;
- recompensa;
- item;
- moeda;
- crafting;
- progressão.

### Conteúdo orientado a dados

Evitar condicionais específicas espalhadas pelo código.

Preferir:

```text
definition
catalog
schema
registry
```

### Lifecycle

Sistemas que criam recursos devem possuir destruição adequada.

Exemplos:

- listeners;
- timers;
- resources;
- subscriptions;
- containers.

---

## 84. Estado por área

| Área | Estado |
|---|---|
| Monorepo | Implementado |
| Core loop | Implementado |
| Fixed step | Implementado |
| Interpolação | Implementado |
| Camera2D | Implementado |
| Renderer layers | Implementado |
| Y-sort | Implementado |
| Depth scale | Implementado |
| Física dos pés | Implementado |
| Colisão AABB | Implementado |
| Mundo orientado a dados | Implementado |
| Materiais | Implementado inicial |
| Iluminação | Implementada inicial |
| X/Y/Z | Implementado |
| Pulo | Implementado |
| Click/tap-to-move | Implementado V1 |
| Pathfinding completo | Não implementado |
| Walk runtime | Implementado |
| Run runtime | Implementado |
| Idle down | Implementado |
| Jump runtime | Implementado |
| Crouch runtime | Não integrado |
| Attack animation real | Não implementada |
| Sockets por frame completos | Não implementados |
| Weapon system | Implementado base |
| Combate melee | Implementado base |
| Vida/dano | Implementado |
| Inimigos | Implementados base |
| IA | Implementada base |
| Ataque inimigo | Implementado |
| Inventário | Implementado base |
| Equipment | Implementado base |
| Loot | Implementado |
| Drops | Implementados |
| HUD | Implementado base |
| Editor de animação | Implementado V1 |
| Editor de mapa | Não implementado |
| Editor de armas | Não implementado |
| Editor de VFX | Não implementado |
| Áudio | Não implementado |
| Habilidades completas | Não implementadas |
| Quests | Não implementadas |
| Crafting | Não implementado |
| Profissões | Não implementadas |
| Construções | Não implementadas |
| Vilas | Não implementadas |
| Troca entre jogadores | Não implementada |
| Network package | Não implementado |
| Server package | Não implementado |
| Servidor autoritativo | Não implementado |
| Persistência | Não implementada |
| Multiplayer | Não implementado |
| Reconexão | Não implementada |
| Capacitor | Não implementado |
| Publicação do jogo | Não implementada |

---

## 85. Limitações conhecidas

### Navegação

Click-to-move utiliza rota ortogonal simples.

Ainda não contorna obstáculos complexos automaticamente.

### Inimigos

IA ainda é simples e não possui pathfinding.

### Animações

Ainda faltam principalmente:

- ataque;
- defesa;
- hurt;
- morte;
- interação;
- habilidade;
- crouch integrado.

### Sockets

A arquitetura existe, mas partes do runtime ainda utilizam sockets fallback.

### Armas

Visual atual é provisório.

### Cenário

O mapa atual é de desenvolvimento.

### HUD

Funcional, mas provisório.

### Multiplayer

Ainda não existe.

Toda simulação atual é local.

---

## 86. Próximas prioridades

Ordem técnica recomendada:

1. pathfinding ortogonal com waypoints;
2. integração de obstáculos ao navegador;
3. replanejamento de destino;
4. animação real de ataque;
5. sockets por frame;
6. hitbox derivada da arma/socket;
7. hurt;
8. death;
9. interact;
10. ability;
11. finalizar crouch;
12. editor de mapa;
13. schemas de mapas;
14. navegação de inimigos;
15. habilidades físicas e mágicas;
16. HUD avançado;
17. servidor Node.js;
18. protocolo WebSocket;
19. sincronização de dois jogadores;
20. interpolação remota;
21. interesse espacial;
22. persistência;
23. vilas;
24. construções;
25. crafting;
26. profissões;
27. comércio;
28. quests;
29. progressão;
30. bosses;
31. áudio;
32. VFX;
33. otimização mobile;
34. reconexão;
35. segurança;
36. testes de carga;
37. conteúdo final;
38. publicação.

---

## 87. Roadmap macro

### Fundação

Estado: avançado.

Inclui:

- monorepo;
- loop;
- câmera;
- renderer;
- física;
- world;
- jogador.

### Movimento e animação

Estado: avançado.

Inclui:

- editor;
- vídeos;
- sprites;
- walk;
- run;
- idle;
- jump;
- click-to-move.

Falta:

- pathfinding;
- estados restantes;
- sockets completos.

### Gameplay

Estado: base funcional.

Inclui:

- armas;
- combate;
- inimigos;
- dano;
- drops;
- inventário;
- equipamentos.

Falta:

- habilidades;
- progressão;
- conteúdo.

### Ferramentas

Estado: iniciado.

Existe:

- editor de animação.

Faltam:

- editor de mapas;
- editor de armas;
- editor de efeitos;
- editor de conteúdo.

### Multiplayer

Estado: não iniciado.

Faltam:

- network;
- server;
- protocolo;
- autoridade;
- sincronização;
- persistência.

### Sistemas RPG

Estado: não iniciado.

Faltam:

- crafting;
- profissões;
- vilas;
- construção;
- comércio;
- quests;
- progressão.

### Finalização

Estado: não iniciado.

Faltam:

- conteúdo;
- bosses;
- áudio;
- efeitos;
- mobile;
- publicação.

---

## 88. Documentação técnica adicional

Arquivo:

```text
docs/architecture.md
```

Esse arquivo registra a evolução técnica por fatias.

Algumas seções podem representar estados históricos já superados.

Para entender o estado atual, considerar nesta ordem:

```text
1. código atual
2. testes atuais
3. README.md
4. docs/architecture.md
5. histórico Git
```

---

## 89. Fonte de verdade

Prioridade:

```text
arquivos locais atuais
↓
branch atual
↓
testes/runtime
↓
histórico Git
↓
documentação
```

Não assumir que documentação antiga está mais correta que o código atual.

---

## 90. GitHub

Repositório:

```text
https://github.com/golgol2/BONECO_GAME
```

Branch principal:

```text
main
```

---

## 91. Filosofia de desenvolvimento

O projeto deve evoluir em fatias pequenas, reversíveis e testáveis.

Uma mudança deve:

- preservar executabilidade;
- possuir testes quando aplicável;
- evitar regressões;
- evitar dependências circulares;
- separar visual de lógica;
- atualizar schemas;
- atualizar documentação;
- executar validações relevantes.

---

## 92. Definição de pronto

Uma tarefa só deve ser considerada concluída quando:

- implementação real existe;
- sintaxe está válida;
- TypeScript compila;
- testes relevantes passam;
- build passa;
- fluxo principal foi executado ou há evidência equivalente;
- não existe regressão conhecida;
- documentação afetada foi atualizada;
- schema afetado foi atualizado;
- `git diff --check` passou;
- limitações restantes foram relatadas.

---

## 93. Entrada rápida

Instalar:

```text
npm install
```

Executar:

```text
npm run dev
```

Validar:

```text
npm run check
git diff --check
```

Gerar sprites:

```text
npm run sprites:generate
```

Arquivos mais importantes para estudar primeiro:

```text
apps/client/src/game.ts
apps/client/src/controllers/player-controller.ts
apps/client/src/controllers/click-move-controller.ts
apps/client/src/systems/enemy-system.ts
apps/client/src/animation/player-runtime-animation.ts
apps/client/src/animation/runtime-animation-model.ts

packages/core/
packages/physics/
packages/renderer/
packages/animation/
packages/gameplay/
packages/world/
```

Pipeline de animação:

```text
VIDEOS/
content/animations/
tools/generate_animation_sprites.py
apps/client/src/editor/
apps/client/public/assets/animations/
```

Próximo gargalo estrutural principal:

```text
pathfinding ortogonal com waypoints
```

Depois:

```text
animação real de ataque
+
sockets por frame
+
integração da arma com sockets reais
```

Depois dessas etapas, o projeto estará melhor preparado para iniciar a camada de rede e servidor autoritativo.
EOF

echo
echo "===== LIMPANDO ARTEFATOS PYTHON DO VERSIONAMENTO ====="

if ! grep -qx '__pycache__/' .gitignore; then
  printf '\n__pycache__/\n' >> .gitignore
fi

if ! grep -qx '*.pyc' .gitignore; then
  printf '*.pyc\n' >> .gitignore
fi

if git ls-files --error-unmatch tools/__pycache__/generate_animation_sprites.cpython-312.pyc >/dev/null 2>&1; then
  git rm --cached tools/__pycache__/generate_animation_sprites.cpython-312.pyc
fi

echo
echo "===== ESTATÍSTICAS README ====="
wc -l README.md
wc -w README.md

echo
echo "===== VALIDANDO ====="

npm run typecheck
npm run test
npm run build
git diff --check

echo
echo "===== STATUS ANTES DO COMMIT ====="
git status --short

echo
echo "===== ADICIONANDO SOMENTE DOCUMENTAÇÃO E LIMPEZA ====="

git add README.md .gitignore

if git ls-files --cached | grep -qE '(^|/)__pycache__/|\.pyc$'; then
  echo "ERRO: ainda existem arquivos Python de cache versionados:"
  git ls-files | grep -E '(^|/)__pycache__/|\.pyc$' || true
  exit 1
fi

echo
echo "===== DIFF STAGED ====="
git diff --cached --stat
git diff --cached --check

if git diff --cached --quiet; then
  echo "Nenhuma alteração para commit."
else
  echo
  echo "===== COMMIT ====="
  git commit -m "docs: expand project documentation and roadmap"

  echo
  echo "===== PUSH ====="
  git push origin main
fi

echo
echo "===== VERIFICAÇÃO FINAL ====="
echo "Branch: $(git branch --show-current)"
echo

git status --short

echo
echo "Últimos commits:"
git log -3 --oneline --decorate

echo
echo "Remote:"
git remote -v

echo
echo "===== README ATUALIZADO E PUBLICADO ====="
```