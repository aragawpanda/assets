# Node endpoint and service types

This document describes the **types of services or endpoints** that an Infinite blockchain node (Drive) can expose. It serves as a single reference to understand what each one is, what it is for, and who consumes it, in both Cosmos/CometBFT and EVM contexts. The information is based on [Drive documentation](https://docs.infinitedrive.xyz/es/drive/services/catalog/node0-infinite/#configuraci%C3%B3n-de-puertos) (service catalog, port configuration) and the [blockchain node port reference](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/), plus standard Cosmos SDK and Ethereum terminology.

The default ports cited correspond to **service 0 (Mainnet)**; for Testnet and other services an offset is applied (see Drive documentation).

**Note:** The current consensus engine is **CometBFT** (successor to Tendermint Core since 2022). CometBFT is used as the primary name; where it adds context, the previous name is indicated.

---

## Quick classification

| Category | Services | Primary use |
|----------|----------|--------------|
| **Network (required for node)** | P2P, RPC (CometBFT) | Consensus and low-level queries |
| **Public API (optional)** | gRPC, gRPC-Web, REST, JSON-RPC HTTP, JSON-RPC WebSocket | Wallets, dApps, explorers, tools |
| **Monitoring (optional)** | Prometheus, EVM Metrics, Geth Metrics | Metrics and observability |

**Identifiers (key names)** to uniquely reference each service:

| Key name | Service |
|----------|---------|
| `p2p` | P2P |
| `comet-rpc` | RPC CometBFT |
| `grpc` | gRPC |
| `grpc-web` | gRPC-Web |
| `rest` | REST API |
| `json-rpc-http` | JSON-RPC HTTP |
| `json-rpc-ws` | JSON-RPC WebSocket |
| `prometheus` | Prometheus |
| `evm-metrics` | EVM Metrics |
| `geth-metrics` | Geth Metrics |
| `abci` | ABCI (internal, do not expose) |
| `pprof` | pprof (development, do not expose) |

**Note:** P2P is not an "endpoint" that wallets or dApps connect to; it is node-to-node communication. Public RPC listings (e.g. chainlist) typically refer to **JSON-RPC HTTP/WebSocket** (EVM) and **gRPC/gRPC-Web** and **REST** (Cosmos). In `network-data.json`, the **`p2p`** key can still be used under `endpoints` to list **P2P seeds** (and optionally persistent peers) so node operators have a single place to copy seed URLs; each entry uses the same `{ "url", "primary?" }` shape, with `url` being e.g. `seed-id@host:26656`.

---

## 1. P2P (port 26656)

**Key name:** `p2p`

**Required for node:** Yes (to participate in the network).

- **What it is:** **Peer-to-peer** communication port of the **CometBFT** consensus engine (formerly Tendermint Core). Blocks, transactions, and consensus messages flow through it between nodes.
- **What it's for:** Peer discovery, blockchain synchronization, and consensus. Not intended for end clients (wallets, dApps) to connect.
- **Who uses it:** Only other nodes in the network (seeds, persistent peers). Not exposed as an "endpoint" in chainlist-style listings or in `network-data.json` for end users.
- **Reference:** [Drive – P2P](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#p2p-port-26656); CometBFT P2P.

---

## 2. RPC CometBFT (port 26657)

**Key name:** `comet-rpc`

**Required for node:** No. **Optional** if you want external queries or a public RPC.

- **What it is:** **CometBFT RPC API** (formerly Tendermint) (HTTP and WebSocket). Exposes node status, blocks, transactions, and ABCI queries.
- **What it's for:** Low-level blockchain queries (blocks, txs, status), transaction submission, and use by development and infrastructure tools. It is the layer below application APIs (gRPC, REST, JSON-RPC EVM).
- **Who uses it:** Explorers, indexers, operations scripts, RPC aggregators. User wallets and dApps typically use gRPC/REST (Cosmos) or JSON-RPC (EVM), not this RPC directly.
- **Reference:** [Drive – RPC](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#rpc-port-26657); CometBFT RPC.

---

## 3. gRPC (port 9090)

**Key name:** `grpc`

**Optional.** Enable if you offer a public API or wallet/application connections for Cosmos.

- **What it is:** **Cosmos SDK gRPC** server for application state queries (accounts, balances, modules, etc.).
- **What it's for:** High-performance, typed queries. The recommended standard in Cosmos for applications and wallets that talk to the node.
- **Who uses it:** Cosmos wallets, explorers, backends that query state (bank, staking, gov, etc.). Not accessible from the browser without a proxy; for browser use gRPC-Web.
- **Reference:** [Drive – gRPC](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#grpc-port-9090); Cosmos SDK gRPC.

---

## 4. gRPC-Web (port 9091)

**Key name:** `grpc-web`

**Optional.** Enable if web applications or browser wallets need to query the node.

- **What it is:** **gRPC-Web** server: same contract as gRPC but accessible from the browser (HTTP/1.1).
- **What it's for:** Same queries as gRPC (Cosmos SDK) but from frontends and web wallets without deploying a separate gRPC-Web proxy.
- **Who uses it:** Cosmos dApps and wallets that run in the browser. Requires gRPC (9090) to be enabled.
- **Reference:** [Drive – gRPC-Web](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#grpc-web-port-9091); Cosmos SDK gRPC-Web.

---

## 5. REST API (port 1317)

**Key name:** `rest`

**Optional.** Enable for compatibility with legacy applications or REST preference.

- **What it is:** **Cosmos SDK REST API** (HTTP). The "legacy" query interface; many projects prioritize gRPC.
- **What it's for:** HTTP (GET/POST) queries to chain state. Useful for simple integrations or tools that already speak REST.
- **Who uses it:** Legacy applications, scripts, some explorers. For new things gRPC is usually preferred.
- **Reference:** [Drive – REST API](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#rest-api-port-1317); Cosmos SDK API (Legacy REST).

---

## 6. JSON-RPC HTTP (port 8545)

**Key name:** `json-rpc-http`

**Optional.** Enable for EVM wallets (MetaMask), dApps, and Ethereum tools.

- **What it is:** **Ethereum JSON-RPC over HTTP** endpoint. Exposes standard Ethereum methods (`eth_*`, `net_*`, `web3_*`) for the EVM embedded in the chain.
- **What it's for:** Enabling Ethereum-compatible clients (MetaMask, Remix, Web3.js, Ethers.js) to query balances, send transactions, and call contracts without changing API.
- **Who uses it:** MetaMask and other EVM wallets, dApps, Remix, Hardhat, etc. The one typically listed in chainlist and `network-data.json` as public RPC (protocol `https`).
- **Reference:** [Drive – JSON-RPC HTTP](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#json-rpc-http-port-8545); Ethereum JSON-RPC (EIP-1474, etc.).

---

## 7. JSON-RPC WebSocket (port 8546)

**Key name:** `json-rpc-ws`

**Optional.** Enable if you need real-time events (new blocks, logs, confirmations).

- **What it is:** Same **Ethereum JSON-RPC** API but over **WebSocket**. Allows subscriptions (`eth_subscribe`) to events.
- **What it's for:** Real-time notifications (new blocks, contract logs, transaction status) without HTTP polling.
- **Who uses it:** Reactive dApps, backends that listen for events, live dashboards. In public listings it usually appears as second protocol (e.g. `wss://`) alongside HTTP.
- **Reference:** [Drive – JSON-RPC WebSocket](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#json-rpc-websocket-port-8546); Ethereum JSON-RPC over WebSocket.

---

## 8. Prometheus (port 26660)

**Key name:** `prometheus`

**Optional.** For node monitoring only.

- **What it is:** **Prometheus metrics** endpoint for the CometBFT engine (consensus, network, node performance).
- **What it's for:** Scraping metrics for Grafana, alerts, and operational monitoring. Not a blockchain API for end users.
- **Who uses it:** Prometheus, Grafana, infrastructure teams. Not listed as a public endpoint for wallets or dApps.
- **Reference:** [Drive – Prometheus](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#prometheus-port-26660).

---

## 9. EVM Metrics (port 6065)

**Key name:** `evm-metrics`

**Optional.** For EVM layer monitoring only.

- **What it is:** **Prometheus metrics** specific to the EVM: execution, gas, transaction processing.
- **What it's for:** Performance analysis and EVM usage on the node.
- **Who uses it:** Monitoring tools. Not an RPC for applications.
- **Reference:** [Drive – EVM Metrics](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#evm-metrics-port-6065).

---

## 10. Geth Metrics (port 8100)

**Key name:** `geth-metrics`

**Optional.** For monitoring only, in Geth-compatible format.

- **What it is:** **Geth-format metrics** (Ethereum client) for integration with monitoring stacks already used on Ethereum networks.
- **What it's for:** Reusing dashboards and alerts designed for Geth without changing the metrics format.
- **Who uses it:** Geth-compatible monitoring tools. Not an API endpoint for users.
- **Reference:** [Drive – Geth Metrics](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/#geth-metrics-port-8100).

---

## Unexposed services (reference only)

- **ABCI (26658)** — **Key name:** `abci`. Internal CometBFT ↔ application communication. Must not be exposed.
- **pprof (6060)** — **Key name:** `pprof`. Profiling/debug in development. Do not expose in production.

---

## Relationship to `network-data.json` and public listings

In the [network-data.json](NETWORK_DATA_JSON_SCHEMA.md) schema, the **`endpoints`** object uses **service key names** as keys (same as in the table above). Supported keys include public APIs and **`p2p`** for listing P2P seeds (so node operators can copy seed URLs from one place). Internal or local-only services (ABCI, pprof, Prometheus, EVM Metrics, Geth Metrics) are not included in `endpoints`.

| Node service type | Key in `endpoints` | Typical use in listings |
|-------------------|--------------------|-------------------------|
| P2P (26656) | `p2p` | P2P seeds / persistent peers (node operators) |
| RPC CometBFT (26657) | `comet-rpc` | Explorers, indexers |
| gRPC (9090) | `grpc` | Cosmos wallets, apps |
| gRPC-Web (9091) | `grpc-web` | Browser Cosmos apps |
| REST API (1317) | `rest` | Legacy Cosmos apps |
| JSON-RPC HTTP (8545) | `json-rpc-http` | Public RPC for MetaMask / chainlist |
| JSON-RPC WebSocket (8546) | `json-rpc-ws` | Public RPC for real-time subscriptions |

Each key has an array of `{ "url", "primary?" }` objects. Use an empty array `[]` when the service is not offered for that network. Chainlist `rpc` is built from URLs in `json-rpc-http` and `json-rpc-ws` (primary first).

---

## Summary table

| Key name | Service | Port (default) | Required | Protocol/standard | Who consumes it |
|----------|---------|----------------|----------|-------------------|-----------------|
| `p2p` | P2P | 26656 | Yes | CometBFT P2P | Other nodes |
| `comet-rpc` | RPC CometBFT | 26657 | No | CometBFT RPC | Infra, explorers, scripts |
| `grpc` | gRPC | 9090 | No | Cosmos SDK gRPC | Cosmos wallets/apps |
| `grpc-web` | gRPC-Web | 9091 | No | gRPC-Web | Web Cosmos apps |
| `rest` | REST API | 1317 | No | Cosmos SDK REST (legacy) | Legacy apps, scripts |
| `json-rpc-http` | JSON-RPC HTTP | 8545 | No | Ethereum JSON-RPC | MetaMask, dApps, chainlist |
| `json-rpc-ws` | JSON-RPC WebSocket | 8546 | No | Ethereum JSON-RPC WS | Real-time dApps |
| `prometheus` | Prometheus | 26660 | No | Prometheus | Monitoring |
| `evm-metrics` | EVM Metrics | 6065 | No | Prometheus | EVM monitoring |
| `geth-metrics` | Geth Metrics | 8100 | No | Geth metrics | Monitoring |

---

## Sources

- [Infinite Mainnet (node0-infinite) – Environment variables and ports](https://docs.infinitedrive.xyz/es/drive/services/catalog/node0-infinite/#configuraci%C3%B3n-de-puertos) — Drive Documentation  
- [Port reference: Blockchain nodes](https://docs.infinitedrive.xyz/es/drive/services/ports/blockchain-nodes/) — Drive Documentation  
- Cosmos SDK: [gRPC](https://docs.cosmos.network/main/run-node/interact-node#using-grpc), [REST](https://docs.cosmos.network/main/run-node/interact-node#using-rest), [API](https://docs.cosmos.network/main/run-node/interact-node)  
- CometBFT (formerly Tendermint Core): [RPC](https://docs.cometbft.com/v0.38/spec/rpc/), P2P  
- Ethereum: [JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/), EIP-1474
