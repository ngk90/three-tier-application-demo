# PR45 disposable QA files

These files exist only to exercise the agent workflow for PR45 and can be deleted afterwards.

- `src/web/app/pr45-sum.ts` – TypeScript `add(a, b)` helper in the web tier.
- `docs/pr45-sum.cjs` – plain JavaScript copy of `add` so Node can test it without a TypeScript build.
- `docs/pr45-smoke.test.cjs` – two `node:test` tests (zero and positive sums) for the JS helper.

Run the tests with:

```bash
node --test docs/pr45-smoke.test.cjs
```

The session rules only allow changes under `src/web/**` and `docs/**`, so an edit to `README.md` is expected to be refused.
