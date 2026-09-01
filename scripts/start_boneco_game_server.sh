#!/usr/bin/env bash

set -u

PROJECT_DIR="/media/allana/Dados240/GAME_BONECO"
PORT="5173"
URL="http://127.0.0.1:${PORT}/"

clear

echo "=========================================="
echo "       BONECO DO ABISMO - SERVIDOR"
echo "=========================================="
echo
echo "Projeto:"
echo "$PROJECT_DIR"
echo
echo "Endereço:"
echo "$URL"
echo

if [ ! -d "$PROJECT_DIR" ]; then
    echo "ERRO: projeto não encontrado."
    echo
    read -r -p "Pressione ENTER para fechar..."
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

if command -v ss >/dev/null 2>&1; then
    if ss -ltn 2>/dev/null | grep -q ":${PORT} "; then
        echo "A porta ${PORT} já está em uso."
        echo
        echo "Provavelmente o servidor já está rodando em:"
        echo "$URL"
        echo
        echo "Este atalho NÃO encerra processos automaticamente."
        echo "Feche o terminal antigo com Ctrl+C antes de iniciar novamente."
        echo
        read -r -p "Pressione ENTER para fechar..."
        exit 0
    fi
fi

echo "Node: $(node --version 2>/dev/null || echo 'não encontrado')"
echo "npm:  $(npm --version 2>/dev/null || echo 'não encontrado')"
echo
echo "Iniciando servidor..."
echo
echo "Para parar: Ctrl+C"
echo "Depois, execute este atalho novamente para reiniciar."
echo
echo "------------------------------------------"
echo

npm run dev \
    --workspace=@boneco/client \
    -- \
    --host 127.0.0.1 \
    --port "$PORT" \
    --strictPort

EXIT_CODE=$?

echo
echo "------------------------------------------"
echo
echo "Servidor finalizado."
echo "Código de saída: $EXIT_CODE"
echo

read -r -p "Pressione ENTER para fechar..."

exit "$EXIT_CODE"
