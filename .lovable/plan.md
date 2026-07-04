## Problem

On the EVM swap, sell = 1 BNB shows the right ~$578 USD value, but buy = USDC fills 9248 instead of ~578. Ratio (578 ÷ 9248 ≈ 0.0625) shows USDC is being priced at ~$0.06 instead of ~$1.

## Root cause

`fetchFromDexScreener` in `src/components/SwapInterface.tsx` reads `pool.priceUsd` directly. DexScreener's `priceUsd` is always the **base token's** USD price in that pool. USDC (and other stables/quote tokens) usually appears as the **quote** token in BSC pools, so `priceUsd` is the price of the *other* token in the pair, not USDC. That mis-priced USDC inflates the buy amount.

## Fix (single file: `src/components/SwapInterface.tsx`)

Rewrite `fetchFromDexScreener` so it returns the USD price of the *queried* token regardless of base/quote position:

1. Filter pairs to the requested `chainSlug`.
2. Sort by `liquidity.usd` desc.
3. For the top pool:
   - If `baseToken.address.toLowerCase() === address.toLowerCase()` → return `Number(priceUsd)`.
   - Else if `quoteToken.address.toLowerCase() === address.toLowerCase()` and `priceNative > 0` → return `Number(priceUsd) / Number(priceNative)` (this yields USD per quote token).
   - Else skip and try the next pool.
4. Return `0` if no pool resolves.

No other behavior changes. Solana path (Jupiter primary, DexScreener fallback) still works because Jupiter resolves stablecoins directly, and the corrected DexScreener helper is a strict improvement.

## Verification

After the change, in the EVM swap with BSC connected: sell 1 BNB / buy USDC should fill ~578 USDC (matches the $578 USD display). Same check with WETH/USDC on Ethereum and ETH/USDC on Base.
