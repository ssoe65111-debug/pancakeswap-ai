<!-- This file mirrors CLAUDE.md for agent-agnostic discovery. -->
<!-- See CLAUDE.md for the authoritative version. -->

# pancakeswap-ai

AI tools (skills, plugins, agents) for the PancakeSwap ecosystem. Helps developers and AI agents integrate PancakeSwap swaps, discover tokens, and interact with PancakeSwap contracts.

## Overview

This monorepo is adapted for the PancakeSwap ecosystem. It uses Nx for monorepo management, Promptfoo for AI evaluations, and follows agent-agnostic design principles.

## Repository Structure

```
pancakeswap-ai/
├── .claude/                  # Claude Code permissions
├── .claude-plugin/           # Marketplace configuration
├── evals/                    # Promptfoo evaluation suites
│   ├── promptfoo.yaml        # Root eval config
│   ├── rubrics/              # Shared evaluation rubrics
│   └── suites/               # Per-skill eval suites
│       ├── swap-integration/ # pancakeswap-trading skill evals
│       └── swap-planner/     # pancakeswap-driver skill evals
├── packages/
│   └── plugins/              # Claude Code plugins
│       ├── pancakeswap-trading/   # Swap integration skill + expert agent
│       └── pancakeswap-driver/    # Swap planner (deep links) skill
├── scripts/
│   └── validate-plugin.cjs   # Plugin validation
├── CLAUDE.md                 # Project guidelines (Claude Code)
├── AGENTS.md                 # This file (agent-agnostic mirror)
├── nx.json                   # Nx workspace config
├── package.json              # Root package (workspaces)
└── tsconfig.base.json        # Base TypeScript config
```

## Plugins

### pancakeswap-trading

**Purpose:** Integrate PancakeSwap swaps programmatically.

**Skills:**
- `swap-integration` — Complete guide for integrating PancakeSwap swaps using Smart Router SDK, Universal Router SDK, or direct V2/V3 contract calls.

**Agents:**
- `swap-integration-expert` — Sub-spawned for advanced questions about routing, Permit2, gas optimization, and contract integration.

### pancakeswap-driver

**Purpose:** Plan swaps and generate deep links to the PancakeSwap interface.

**Skills:**
- `swap-planner` — Discover tokens, verify contracts, fetch prices, and generate pancakeswap.finance deep links.

## Development

### Requirements

- Node.js >= 22.x
- npm >= 11.7.0

### Setup

```bash
npm install
```

### Code Quality

```bash
# Format
npx nx format:write

# Lint
npx nx run-many --target=lint --all

# Validate plugins
node scripts/validate-plugin.cjs
```

## Evals

```bash
# Run swap-integration evals
npx promptfoo eval --config evals/suites/swap-integration/promptfoo.yaml

# Run swap-planner evals
npx promptfoo eval --config evals/suites/swap-planner/promptfoo.yaml

# View results
npx promptfoo view
```

## PancakeSwap Resources

- Developer Docs: https://developer.pancakeswap.finance/
- PancakeSwap App: https://pancakeswap.finance/
- BSCScan: https://bscscan.com/
- Smart Router SDK: `@pancakeswap/smart-router`
- Universal Router SDK: `@pancakeswap/universal-router-sdk`

## License

MIT
