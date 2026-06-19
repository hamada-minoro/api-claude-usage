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

Preencha também `DEVICE_API_KEY` com uma chave própria (qualquer string longa e aleatória). É **obrigatória**: sem ela configurada, `/usage` e `/usage/mock` respondem `500 DEVICE_API_KEY_NOT_CONFIGURED` para qualquer chamada.

```bash
openssl rand -hex 24
```

## Rodando

```bash
npm run dev     # desenvolvimento com reload (tsx watch)
npm run build   # compila para dist/
npm start       # roda o build (dist/server.js)
```

A API escuta em `0.0.0.0`, então fica acessível por outros dispositivos na mesma rede (ESP32, celular).

## Endpoints

| Método | Rota | Descrição | Exige `x-device-key` |
|---|---|---|---|
| GET | `/health` | Status simples da API | Não |
| GET | `/usage/mock` | Payload simulado (sessão 72%, semana 41%) | **Sim** |
| GET | `/usage` | Consumo real, com cache em memória | **Sim** |
| GET | `/debug/cache` | Estado atual do cache (debug) | Não |

### Autenticação do dispositivo

`/usage` e `/usage/mock` exigem o header `x-device-key` com o valor exato de `DEVICE_API_KEY` do `.env`. Sem o header (ou com valor errado), a API responde `401 UNAUTHORIZED`:

```bash
curl http://localhost:3333/usage
# {"ok":false,"error":"UNAUTHORIZED","message":"Header x-device-key ausente ou invalido"}

curl -H "x-device-key: SUA_CHAVE_AQUI" http://localhost:3333/usage
# {"ok":true, ...}
```

O ESP32 já manda esse header automaticamente (configurado no portal Wi-Fi, junto com SSID e URL da API).

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
curl -H "x-device-key: SUA_CHAVE_AQUI" http://localhost:3333/usage/mock
curl -H "x-device-key: SUA_CHAVE_AQUI" http://localhost:3333/usage
curl http://localhost:3333/debug/cache
```

Testar pela rede local (para o ESP32 ou celular acessarem depois):

```bash
hostname -I
# exemplo de saída: 192.168.3.12

curl -H "x-device-key: SUA_CHAVE_AQUI" http://192.168.3.12:3333/usage
```

## Payload de resposta

```json
{
  "ok": true,
  "source": "cache | claude | mock",
  "updatedAt": "2026-06-19T10:30:00.000Z",
  "serverEpoch": 1781850608,
  "session": {
    "label": "SS",
    "usedPercent": 72,
    "remainingPercent": 28,
    "resetIn": "01:34",
    "resetAtEpoch": 1781856228
  },
  "week": {
    "label": "SM",
    "usedPercent": 41,
    "remainingPercent": 59,
    "resetIn": "3D08H",
    "resetAtEpoch": 1782138588
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

> `serverEpoch` e `resetAtEpoch` (unix time, segundos) existem para o ESP32 calcular o countdown da sessão **localmente**, com segundos, sem precisar consultar a API a cada tick de relógio. `sessionLine2` e `resetLine1` ficam no payload por completude/debug via curl, mas o firmware atual ignora esses dois campos e monta o texto do countdown sozinho a partir do epoch.

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
CACHE_TTL_SECONDS=120
NODE_ENV=development
DEVICE_API_KEY=
```

> `CACHE_TTL_SECONDS=120`: cada consulta real à Anthropic gasta 1 token (mínimo, via `max_tokens: 1`), mesmo assim é consumo na sua conta. TTL maior = menos chamadas reais ao Claude.

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
