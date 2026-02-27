# pancakeswap-ai

PancakeSwap-specific AI tools (skills, plugins, agents) for developers and AI agents integrating the PancakeSwap ecosystem.

## Quick Start

```shell
# Claude Code plugin marketplace
/plugin marketplace add pancakeswap/pancakeswap-ai

# Install individual plugins
/plugin install pancakeswap-trading   # Swap integration (SDK + contracts)
/plugin install pancakeswap-driver    # Swap & liquidity planning + deep links
/plugin install pancakeswap-infinity  # Infinity (v4) hook security foundations
```

Once installed, just ask your agent:

```
Swap 0.1 BNB for USDT on PancakeSwap
```

The agent will read the skill, pick the right integration method, generate working TypeScript, and—if configured—execute the swap autonomously.

## Plugins

| Plugin | Skill | What it does |
|--------|-------|-------------|
| `pancakeswap-trading` | `swap-integration` | Integrate swaps via Routing API, Smart Router SDK, or direct V2/V3 contracts |
| `pancakeswap-driver` | `swap-planner` | Discover tokens, verify contracts, fetch prices, generate swap deep links |
| `pancakeswap-driver` | `liquidity-planner` | Plan LP positions (V2, V3, StableSwap), assess pools, generate liquidity deep links |
| `pancakeswap-infinity` | `infinity-security-foundations` | Security guide for Infinity (v4) hook development — threat models, audit checklists, templates |

### Agent execution model

```
User: "Swap 0.1 BNB for USDT"
        │
        ▼
[PLAN]  swap-planner skill      → generates deep link for UI confirmation
        │
        ▼
[CODE]  swap-integration skill  → generates TypeScript using viem + PancakeSwap SDKs
        │
        ▼
[EXEC]  agent runs via Bash     → executes on-chain, reports tx hash + balances
```

## Supported Chains

| Chain | V2 | V3 | StableSwap | Routing API |
|-------|----|----|------------|-------------|
| BNB Smart Chain (56) | ✅ | ✅ | ✅ | ✅ |
| Ethereum (1) | ❌ | ✅ | ❌ | ✅ |
| Arbitrum One (42161) | ❌ | ✅ | ❌ | ✅ |
| Base (8453) | ❌ | ✅ | ❌ | ✅ |
| zkSync Era (324) | ❌ | ✅ | ❌ | ✅ |
| Linea (59144) | ❌ | ✅ | ❌ | ✅ |
| Polygon zkEVM (1101) | ❌ | ✅ | ❌ | ✅ |
| opBNB (204) | ❌ | ✅ | ❌ | ✅ |
| BSC Testnet (97) | ✅ | ❌ | ❌ | ❌ |

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) | Full project guidelines, plugin structure, development setup |
| [swap-integration SKILL.md](packages/plugins/pancakeswap-trading/skills/swap-integration/SKILL.md) | Complete swap integration reference (Routing API, Smart Router SDK, Direct V2/V3) |
| [swap-planner SKILL.md](packages/plugins/pancakeswap-driver/skills/swap-planner/SKILL.md) | Token discovery, price fetching, deep link generation |
| [swap-integration-expert agent](packages/plugins/pancakeswap-trading/agents/swap-integration-expert.md) | Advanced routing, Permit2, StableSwap, gas optimisation |
| [liquidity-planner SKILL.md](packages/plugins/pancakeswap-driver/skills/liquidity-planner/SKILL.md) | LP position planning (V2, V3, StableSwap) with pool assessment and deep links |
| [infinity-security-foundations SKILL.md](packages/plugins/pancakeswap-infinity/skills/infinity-security-foundations/SKILL.md) | Infinity hook security — threat models, permissions matrix, delta accounting, audit checklist |

## Testing

```shell
# Unit tests (31 tests — helpers, slippage math, address validation)
npm test

# Live testnet swap demo — shows all three agent phases end-to-end
export PRIVATE_KEY=0x<testnet-only-wallet>
node tests/agent-swap-demo.mjs

# LLM evals (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=your-key
npm run test:evals:swap-integration      # graded against correctness + security rubrics
npm run test:evals:swap-planner
npm run test:evals:liquidity-planner     # LP position planning evals
npm run test:evals:infinity-security     # Infinity hook security evals
npx promptfoo view                    # browse results in browser
```

> **Testnet tip:** Get free BSC testnet BNB at https://testnet.bnbchain.org/faucet-smart

## Development

### Requirements

- Node.js >= 22.x
- npm >= 11.7.0

### Setup

```bash
git clone https://github.com/pancakeswap/pancakeswap-ai.git
cd pancakeswap-ai
npm install
```

### Adding a plugin

1. Create `packages/plugins/your-plugin-name/`
2. Add `.claude-plugin/plugin.json` with skill declarations
3. Add `skills/your-skill/SKILL.md` with YAML frontmatter
4. Register in `.claude-plugin/marketplace.json`
5. Run `node scripts/validate-plugin.cjs`
6. Add an eval suite under `evals/suites/your-skill/`

See [CLAUDE.md](CLAUDE.md) for the full contribution guide.

### Eval quality bar

PRs should maintain **≥ 85% pass rate** on all eval suites.

## Resources

- Developer docs: https://developer.pancakeswap.finance/
- PancakeSwap app: https://pancakeswap.finance/
- Smart Router SDK: `@pancakeswap/smart-router`
- Universal Router SDK: `@pancakeswap/universal-router-sdk`
- BSCScan: https://bscscan.com/
- Infinity Core: https://github.com/pancakeswap/infinity-core
- Infinity Hooks: https://github.com/pancakeswap/infinity-hooks

## Contributing

See [CLAUDE.md](CLAUDE.md) for development setup, skill authoring guidelines, and contribution steps.

## License

MIT License — see [LICENSE](LICENSE) for details.
