## Plan

1. **Find the real failing step**
   - Inspect the project’s Netlify-facing files: `netlify.toml`, `package.json`, lockfile, `.npmrc`, `.nvmrc`, and Vite config.
   - Run the same install/build path Netlify uses after approval and compare it with the deploy log behavior.

2. **Make Netlify use one predictable toolchain**
   - Keep Netlify on Node 20 + npm only.
   - Ensure the install command cannot be bypassed by Bun/pnpm/yarn detection.
   - Remove any conflicting lockfile/tooling assumptions if still present.

3. **Fix the likely dependency/install failure**
   - Re-sync `package-lock.json` with `package.json` so Netlify does not fail before `dist` is created.
   - Keep `legacy-peer-deps` enabled because this app has wallet/Privy peer dependency conflicts that can break clean Netlify installs.

4. **Fix deployment env/runtime configuration**
   - Remove stale/wrong hardcoded backend credentials from `netlify.toml` if they belong to an older remix/source project.
   - Add a safe deploy setup that uses committed public Vite config where appropriate, without requiring manual Netlify input.

5. **Verify deploy readiness**
   - Run a Netlify-equivalent clean build command locally.
   - Confirm `dist/index.html` and assets are produced.
   - If the build fails, fix the exact error and re-run until the build output exists.

## Expected result

GitHub → Netlify deploy should run install, build the Vite app, create `dist`, and publish it without manual Netlify environment setup.