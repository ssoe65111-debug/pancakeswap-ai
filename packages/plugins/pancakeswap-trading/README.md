# pancakeswap-trading

AI-powered assistance for integrating PancakeSwap swaps into applications.

## Overview

This plugin provides a `swap-integration` skill and a `swap-integration-expert` agent to help developers integrate PancakeSwap token swaps into frontends, backends, and smart contracts.

## Installation

```bash
claude plugin add @pancakeswap/pancakeswap-trading
```

## Skills

### swap-integration

Guides you through integrating PancakeSwap swaps using the recommended approach for your use case:

- **Smart Router SDK** — On-chain routing using `@pancakeswap/smart-router`
- **Universal Router SDK** — Transaction encoding using `@pancakeswap/universal-router-sdk`
- **Direct Contract Calls** — Interacting with PancakeSwap router contracts directly

## Agents

### swap-integration-expert

A specialized expert agent for complex PancakeSwap swap integration questions. Sub-spawned automatically by the `swap-integration` skill for advanced scenarios.

## Supported Chains

| Chain | Chain ID |
|-------|----------|
| BNB Smart Chain | 56 |
| Ethereum | 1 |
| Arbitrum One | 42161 |
| Base | 8453 |
| Polygon | 137 |
| zkSync Era | 324 |
| Linea | 59144 |
| opBNB | 204 |

## License

MIT
