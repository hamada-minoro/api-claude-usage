# Claude Usage API

API Node.js + TypeScript que consulta o consumo do Claude (sessão de 5h e janela semanal de 7 dias) e entrega um payload já formatado para o LCD1602 do ESP32.

Sem banco de dados. Sem Prisma. Cache em memória com TTL.

## Instalação

```bash
npm install
cp .env.example .env
```

Edite o `.env` e preencha `CLAUDE_OAUTH_TOKEN` com o token gerado por:

```bash
claude setup-token
```

> O token é OAuth, ligado à sua conta/assinatura Claude (Pro/Max) — não é a `sk-ant-...` do Console de desenvolvedor.

## Rodando

```bash
npm run dev     # desenvolvimento com reload (tsx watch)
npm run build   # compila para dist/
npm start       # roda o build (dist/server.js)
```

A API escuta em `0.0.0.0`, então fica acessível por outros dispositivos na mesma rede (ESP32, celular).

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status simples da API |
| GET | `/usage/mock` | Payload simulado (sessão 72%, semana 41%) |
| GET | `/usage` | Consumo real, com cache em memória |
| GET | `/debug/cache` | Estado atual do cache (debug) |

### Como `/usage` decide a fonte dos dados

```txt
Se cache existe e ainda não expirou (TTL):
    retorna cache (source: "cache")

Se cache expirou:
    consulta a Anthropic
    atualiza cache
    retorna novo dado (source: "claude")

Se a consulta falhar e existir cache anterior:
    retorna o cache anterior (fallback seguro)

Se a consulta falhar e não houver cache:
    retorna erro controlado { ok: false, error, message }
```

### Como a consulta real funciona

Faz um "ping mínimo" em `POST /v1/messages` da Anthropic com `max_tokens: 1` (não importa a resposta, só os headers). A % de uso vem nos headers:

```txt
anthropic-ratelimit-unified-5h-utilization   → sessão (0 a 1, convertido para %)
anthropic-ratelimit-unified-5h-reset         → epoch (segundos) do reset da sessão
anthropic-ratelimit-unified-7d-utilization   → semana (0 a 1, convertido para %)
anthropic-ratelimit-unified-7d-reset         → epoch (segundos) do reset da semana
```

Implementado isoladamente em [`src/services/claudeUsage.service.ts`](src/services/claudeUsage.service.ts).

## Testes com curl

```bash
curl http://localhost:3333/health
curl http://localhost:3333/usage/mock
curl http://localhost:3333/usage
curl http://localhost:3333/debug/cache
```

Testar pela rede local (para o ESP32 ou celular acessarem depois):

```bash
hostname -I
# exemplo de saída: 192.168.3.12

curl http://192.168.3.12:3333/usage
```

## Payload de resposta

```json
{
  "ok": true,
  "source": "cache | claude | mock",
  "updatedAt": "2026-06-19T10:30:00.000Z",
  "session": {
    "label": "SS",
    "usedPercent": 72,
    "remainingPercent": 28,
    "resetIn": "01:34"
  },
  "week": {
    "label": "SM",
    "usedPercent": 41,
    "remainingPercent": 59,
    "resetIn": "3D08H"
  },
  "display": {
    "sessionLine1": "SS #######72%",
    "sessionLine2": "RST 01:34",
    "weekLine1": "SM ####41%",
    "weekLine2": "RST 3D08H",
    "resetLine1": "SS RST 01:34",
    "resetLine2": "SM RST 3D08H",
    "statusLine1": "WIFI OK",
    "statusLine2": "API OK"
  }
}
```

Em caso de erro:

```json
{
  "ok": false,
  "error": "CLAUDE_UNAVAILABLE",
  "message": "..."
}
```

As linhas em `display` já vêm truncadas/prontas para 16 colunas do LCD1602 — o firmware só precisa imprimir.

## Variáveis de ambiente

```env
PORT=3333
CLAUDE_OAUTH_TOKEN=
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
CACHE_TTL_SECONDS=30
NODE_ENV=development
```

## Estrutura

```txt
src/
├── server.ts                          # bootstrap HTTP
├── app.ts                             # instância Express + rotas
├── config/env.ts                      # leitura de variáveis de ambiente
├── routes/
│   ├── health.routes.ts
│   └── usage.routes.ts
├── services/
│   ├── claudeUsage.service.ts         # consulta real à Anthropic
│   ├── mockUsage.service.ts           # payload simulado
│   └── usage.service.ts               # orquestra cache + consulta real
├── cache/usageCache.service.ts        # cache em memória com TTL
├── utils/
│   ├── progressBar.ts                 # barra "#" e truncamento de linha
│   ├── displayFormatter.ts            # monta as 8 linhas do LCD
│   └── timeFormatter.ts               # countdown HH:MM e XDXXH
└── types/usage.types.ts
```
