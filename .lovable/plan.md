
## 1. The EVM swap price bug — what it is and what it caused

**Bug:** In `src/components/SwapInterface.tsx`, `fetchFromDexScreener` originally returned `pool.priceUsd` directly. DexScreener always reports `priceUsd` as the **base token's** USD price in a pair. On BSC, USDC (and most stablecoins) shows up as the **quote token**, so `priceUsd` was actually the price of BNB/WBNB (the base), not USDC.

**What it caused:** Selling 1 BNB (~$578) tried to buy USDC and filled ~**9,248 USDC** instead of ~578. USDC was being priced at ~$0.0625 (BNB price divided into itself basically), so the buy amount got inflated ~16×. Same class of error hit any stable-as-quote pair on Ethereum, Polygon, and Base.

The current code in `SwapInterface.tsx` (lines 285–308) already contains a base/quote-aware version, but it has no cross-provider fallback — if DexScreener returns no matching pool, we silently price the token at 0. I'll finish the job by wiring Alchemy + Covalent as real price fallbacks so the swap never breaks.

## 2. Price / token-info fallback chain

Update `fetchTokenPrice` in `SwapInterface.tsx` so EVM pricing tries providers in order and short-circuits on the first non-zero result:

```text
Solana:  Jupiter → DexScreener → Alchemy Prices → Covalent
EVM:     DexScreener (base/quote fixed) → Alchemy Prices → Covalent → CoinGecko (native only)
```

Add two small helpers in `SwapInterface.tsx`:

- `fetchFromAlchemy(address, chainId)` — calls Alchemy Prices API `POST https://api.g.alchemy.com/prices/v1/{ALCHEMY_KEY}/tokens/by-address` with `{ addresses:[{network, address}] }`, using the chain→network map (`eth-mainnet`, `bnb-mainnet`, `polygon-mainnet`, `base-mainnet`, `solana-mainnet`). Returns `data[0].prices[0].value` as a number.
- Keep existing `fetchFromCovalent` but move it into the fallback chain for every EVM token (not just when DexScreener fails silently).

Also extend token metadata / holder / contract lookups in `src/services/tokenMetadata.ts` and `src/services/tokenHolders.ts` to fall back to Alchemy (`getTokenMetadata`, `getTokenBalances`) and Covalent (`token_holders_v2`, `tokens_v2`) using the same ordered pattern already applied to RPCs in `src/config/rpcEndpoints.ts`.

All keys already live in `src/config/rpcEndpoints.ts` (`ALCHEMY_KEY`, `COVALENT_API_KEY`) — no new secrets needed.

## 3. Netlify: zero manual setup from GitHub

Problem: today `.env` holds `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. `.env` is gitignored, so a fresh Netlify build from GitHub has no Supabase URL and the app crashes with `supabaseUrl is required`.

Fix without asking you to type anything into Netlify: bake the **publishable** values into `netlify.toml` under `[build.environment]`. These are safe to commit (the URL is public and the publishable key is the anon key — RLS protects data; the service-role key is never touched).

Update `netlify.toml`:

```toml
[build.environment]
  CI = "false"
  NODE_VERSION = "20"
  NODE_OPTIONS = "--max-old-space-size=4096"
  PUPPETEER_SKIP_DOWNLOAD = "true"
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
  VITE_SUPABASE_URL = "https://yvpigugdmfjqyhainevb.supabase.co"
  VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xcasmN9dOKhvuA52hTFC7Q_VoP_0h0q"
  VITE_SUPABASE_PROJECT_ID = "yvpigugdmfjqyhainevb"
```

Keep the existing `[[redirects]]` SPA fallback and asset cache header. `public/_redirects` already exists as a belt-and-suspenders SPA fallback.

## 4. Verification

- Run `CI=false npm run build` in the sandbox; expect a clean `dist/`.
- Manual sanity: on BSC, 1 BNB → USDC should fill ~578 USDC (matches USD display). Repeat WETH→USDC on ETH and ETH→USDC on Base.
- Simulate DexScreener outage by pointing the fetch at a bogus address in devtools and confirm Alchemy/Covalent still return a price.

## 5. Files touched

- `src/components/SwapInterface.tsx` — add `fetchFromAlchemy`, extend `fetchTokenPrice` fallback chain.
- `src/services/tokenMetadata.ts` — Alchemy + Covalent fallbacks in metadata lookup.
- `src/services/tokenHolders.ts` — Alchemy + Covalent fallbacks in holders/contract lookup.
- `netlify.toml` — commit public Supabase env vars so GitHub → Netlify deploys with zero manual setup.

No schema, auth, or RLS changes. No new secrets.
