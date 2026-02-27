/**
 * Unit tests for pancakeswap-ai helper logic.
 * Tests the pure functions described in the skill files.
 * Run with: node tests/helpers.test.mjs
 */

import assert from 'node:assert/strict'

// ─────────────────────────────────────────────
// Helpers copied from the skills (pure functions)
// ─────────────────────────────────────────────

const CHAIN_KEYS = {
  56:    'bsc',
  1:     'eth',
  42161: 'arb',
  8453:  'base',
  137:   'polygon',
  324:   'zksync',
  59144: 'linea',
  204:   'opbnb',
}

function buildPancakeSwapLink({ chainId, inputCurrency, outputCurrency, exactAmount, exactField = 'input' }) {
  const chain = CHAIN_KEYS[chainId]
  if (!chain) throw new Error(`Unsupported chainId: ${chainId}`)
  const query = new URLSearchParams({ chain, inputCurrency, outputCurrency })
  if (exactAmount) query.set('exactAmount', exactAmount)
  if (exactField)  query.set('exactField', exactField)
  return `https://pancakeswap.finance/swap?${query.toString()}`
}

function applySlippage(amountOut, slippageBps) {
  // minimumAmountOut = amountOut * (10000 - slippageBps) / 10000
  return (BigInt(amountOut) * (10000n - BigInt(slippageBps))) / 10000n
}

function applySlippageIn(amountIn, slippageBps) {
  // maximumAmountIn = amountIn * (10000 + slippageBps) / 10000
  return (BigInt(amountIn) * (10000n + BigInt(slippageBps))) / 10000n
}

function isValidEvmAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

function isNativeSymbol(value) {
  return ['BNB', 'ETH', 'MATIC'].includes(value.toUpperCase())
}

// Known token addresses from the skill
const KNOWN_TOKENS = {
  WBNB:  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  BUSD:  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  USDT:  '0x55d398326f99059fF775485246999027B3197955',
  USDC:  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  CAKE:  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  ETH:   '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  BTCB:  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
}

// ─────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name}`)
    console.log(`     ${err.message}`)
    failed++
  }
}

// ─────────────────────────────────────────────
// SUITE 1: buildPancakeSwapLink
// ─────────────────────────────────────────────

console.log('\n📦 buildPancakeSwapLink')

test('BSC BNB → CAKE link has correct chain and currencies', () => {
  const url = buildPancakeSwapLink({
    chainId: 56,
    inputCurrency: 'BNB',
    outputCurrency: KNOWN_TOKENS.CAKE,
    exactAmount: '0.5',
    exactField: 'input',
  })
  assert.ok(url.includes('chain=bsc'), 'missing chain=bsc')
  assert.ok(url.includes('inputCurrency=BNB'), 'missing inputCurrency=BNB')
  assert.ok(url.includes('outputCurrency=0x0E09FaBB'), 'missing outputCurrency CAKE')
  assert.ok(url.includes('exactAmount=0.5'), 'missing exactAmount=0.5')
  assert.ok(url.includes('exactField=input'), 'missing exactField=input')
  assert.ok(url.startsWith('https://pancakeswap.finance/swap?'), 'wrong base URL')
})

test('Ethereum USDT → ETH link uses chain=eth', () => {
  const url = buildPancakeSwapLink({
    chainId: 1,
    inputCurrency: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    outputCurrency: 'ETH',
    exactAmount: '100',
  })
  assert.ok(url.includes('chain=eth'), 'missing chain=eth')
  assert.ok(url.includes('outputCurrency=ETH'), 'missing outputCurrency=ETH')
})

test('Arbitrum uses chain=arb', () => {
  const url = buildPancakeSwapLink({ chainId: 42161, inputCurrency: 'ETH', outputCurrency: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' })
  assert.ok(url.includes('chain=arb'))
})

test('Base uses chain=base', () => {
  const url = buildPancakeSwapLink({ chainId: 8453, inputCurrency: 'ETH', outputCurrency: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' })
  assert.ok(url.includes('chain=base'))
})

test('Polygon uses chain=polygon', () => {
  const url = buildPancakeSwapLink({ chainId: 137, inputCurrency: 'MATIC', outputCurrency: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' })
  assert.ok(url.includes('chain=polygon'))
})

test('zkSync uses chain=zksync', () => {
  const url = buildPancakeSwapLink({ chainId: 324, inputCurrency: 'ETH', outputCurrency: '0x1234567890123456789012345678901234567890' })
  assert.ok(url.includes('chain=zksync'))
})

test('opBNB uses chain=opbnb', () => {
  const url = buildPancakeSwapLink({ chainId: 204, inputCurrency: 'BNB', outputCurrency: '0x1234567890123456789012345678901234567890' })
  assert.ok(url.includes('chain=opbnb'))
})

test('exactField defaults to input when not specified', () => {
  const url = buildPancakeSwapLink({ chainId: 56, inputCurrency: 'BNB', outputCurrency: KNOWN_TOKENS.CAKE })
  // exactField should not appear at all when no exactAmount is given
  assert.ok(!url.includes('exactField') || url.includes('exactField=input'), 'unexpected exactField value')
})

test('exact output swap sets exactField=output', () => {
  const url = buildPancakeSwapLink({
    chainId: 56,
    inputCurrency: KNOWN_TOKENS.CAKE,
    outputCurrency: KNOWN_TOKENS.USDT,
    exactAmount: '50',
    exactField: 'output',
  })
  assert.ok(url.includes('exactField=output'))
  assert.ok(url.includes('exactAmount=50'))
})

test('throws on unsupported chainId', () => {
  assert.throws(
    () => buildPancakeSwapLink({ chainId: 999, inputCurrency: 'ETH', outputCurrency: '0x1234' }),
    /Unsupported chainId: 999/,
  )
})

test('no exactAmount → URL omits exactAmount parameter', () => {
  const url = buildPancakeSwapLink({ chainId: 56, inputCurrency: 'BNB', outputCurrency: KNOWN_TOKENS.CAKE })
  assert.ok(!url.includes('exactAmount='), 'should not have exactAmount when not provided')
})

// ─────────────────────────────────────────────
// SUITE 2: Slippage calculations
// ─────────────────────────────────────────────

console.log('\n📦 Slippage calculations')

test('0.5% slippage on 1000 USDT output → minOut = 995', () => {
  const amountOut = 1000n * 10n ** 18n
  const minOut = applySlippage(amountOut, 50) // 50 bps = 0.5%
  const expected = 995n * 10n ** 18n
  assert.equal(minOut, expected)
})

test('1% slippage on 100 CAKE output → minOut = 99', () => {
  const amountOut = 100n * 10n ** 18n
  const minOut = applySlippage(amountOut, 100) // 100 bps = 1%
  const expected = 99n * 10n ** 18n
  assert.equal(minOut, expected)
})

test('0% slippage returns same amount', () => {
  const amount = 500n * 10n ** 18n
  assert.equal(applySlippage(amount, 0), amount)
})

test('0.5% slippage on exact-output: maxAmountIn 1 BNB → 1.005 BNB', () => {
  const amountIn = 10n ** 18n                          // 1 BNB
  const maxIn = applySlippageIn(amountIn, 50)          // 50 bps = 0.5%
  const expected = 1005n * 10n ** 15n                  // 1.005 BNB
  assert.equal(maxIn, expected)
})

test('10% slippage (meme token) on 1000 output → minOut = 900', () => {
  const amountOut = 1000n * 10n ** 18n
  const minOut = applySlippage(amountOut, 1000)        // 1000 bps = 10%
  const expected = 900n * 10n ** 18n
  assert.equal(minOut, expected)
})

// ─────────────────────────────────────────────
// SUITE 3: Address and currency validation
// ─────────────────────────────────────────────

console.log('\n📦 Address and currency validation')

test('all known BSC token addresses are valid EVM format', () => {
  for (const [symbol, addr] of Object.entries(KNOWN_TOKENS)) {
    assert.ok(isValidEvmAddress(addr), `${symbol} address is invalid: ${addr}`)
  }
})

test('all known addresses are checksummed (mixed case)', () => {
  // Checksummed addresses have mixed case in the hex portion
  for (const [symbol, addr] of Object.entries(KNOWN_TOKENS)) {
    const hex = addr.slice(2)
    const hasUpperAndLower = hex !== hex.toLowerCase() && hex !== hex.toUpperCase()
    assert.ok(hasUpperAndLower, `${symbol} address does not appear checksummed: ${addr}`)
  }
})

test('all known addresses are 42 chars (0x + 40 hex)', () => {
  for (const [symbol, addr] of Object.entries(KNOWN_TOKENS)) {
    assert.equal(addr.length, 42, `${symbol} address has wrong length: ${addr.length}`)
  }
})

test('native symbols are recognised', () => {
  assert.ok(isNativeSymbol('BNB'))
  assert.ok(isNativeSymbol('ETH'))
  assert.ok(isNativeSymbol('MATIC'))
})

test('token addresses are not treated as native', () => {
  assert.ok(!isNativeSymbol(KNOWN_TOKENS.CAKE))
  assert.ok(!isNativeSymbol('CAKE'))
})

test('zero address is valid format but should not be used as a token', () => {
  const zeroAddr = '0x0000000000000000000000000000000000000000'
  assert.ok(isValidEvmAddress(zeroAddr), 'zero address has valid format')
  // Skill should warn if this comes up as a token address
})

test('short address is rejected', () => {
  assert.ok(!isValidEvmAddress('0x1234'))
})

test('address without 0x prefix is rejected', () => {
  assert.ok(!isValidEvmAddress('bb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'))
})

// ─────────────────────────────────────────────
// SUITE 4: Chain key mapping (swap-planner)
// ─────────────────────────────────────────────

console.log('\n📦 Chain key mapping')

const DEXSCREENER_CHAIN_IDS = {
  56:    'bsc',
  1:     'ethereum',
  42161: 'arbitrum',
  8453:  'base',
  137:   'polygon',
  324:   'zksync',
  59144: 'linea',
}

test('BSC maps to dexscreener chainId "bsc"', () => assert.equal(DEXSCREENER_CHAIN_IDS[56], 'bsc'))
test('Ethereum maps to "ethereum"', () => assert.equal(DEXSCREENER_CHAIN_IDS[1], 'ethereum'))
test('Arbitrum maps to "arbitrum"', () => assert.equal(DEXSCREENER_CHAIN_IDS[42161], 'arbitrum'))
test('Base maps to "base"', () => assert.equal(DEXSCREENER_CHAIN_IDS[8453], 'base'))

test('PancakeSwap deep link chain key differs from DexScreener chainId for Ethereum', () => {
  // Important: DexScreener uses "ethereum", PancakeSwap URL uses "eth"
  assert.notEqual(DEXSCREENER_CHAIN_IDS[1], CHAIN_KEYS[1])
  assert.equal(CHAIN_KEYS[1], 'eth')
  assert.equal(DEXSCREENER_CHAIN_IDS[1], 'ethereum')
})

// ─────────────────────────────────────────────
// SUITE 5: V2 router fee math
// ─────────────────────────────────────────────

console.log('\n📦 V2 router fee (0.25% = 9975/10000)')

function v2GetAmountOut(amountIn, reserveIn, reserveOut) {
  // PancakeSwap V2 uses 0.25% fee: FEES_NUMERATOR=9975, FEES_DENOMINATOR=10000
  const amountInWithFee = amountIn * 9975n
  const numerator = amountInWithFee * reserveOut
  const denominator = reserveIn * 10000n + amountInWithFee
  return numerator / denominator
}

test('V2 getAmountOut formula produces correct result', () => {
  // 1 BNB in, reserves: 100 BNB / 30000 USDT → ~298.5 USDT out (after 0.25% fee)
  const amountIn = 10n ** 18n                     // 1 BNB
  const reserveIn = 100n * 10n ** 18n             // 100 BNB
  const reserveOut = 30000n * 10n ** 18n          // 30,000 USDT

  const amountOut = v2GetAmountOut(amountIn, reserveIn, reserveOut)
  const amountOutHuman = Number(amountOut) / 1e18

  // Should be ~297.xx USDT (slightly less than 300 due to price impact + fee)
  assert.ok(amountOutHuman > 290 && amountOutHuman < 300,
    `Expected ~297 USDT, got ${amountOutHuman.toFixed(4)}`)
})

test('V2 fee is 0.25%, not 0.3% (Uniswap V2 uses 0.3%)', () => {
  // PancakeSwap V2 fee = 25 bps. Uniswap V2 = 30 bps.
  // With same reserves, PancakeSwap should give slightly more output.
  const amountIn = 10n ** 18n
  const reserveIn = 100n * 10n ** 18n
  const reserveOut = 100n * 10n ** 18n

  // PancakeSwap (9975/10000)
  const pcsOut = v2GetAmountOut(amountIn, reserveIn, reserveOut)

  // Uniswap (9970/10000)
  const uniOut = (amountIn * 9970n * reserveOut) / (reserveIn * 10000n + amountIn * 9970n)

  assert.ok(pcsOut > uniOut, 'PancakeSwap V2 should give more output than Uniswap V2 (lower fee)')
})

// ─────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)

if (failed > 0) {
  console.log('\n❌ Some tests failed — review skill content above.')
  process.exit(1)
} else {
  console.log('\n✅ All tests passed!')
}
