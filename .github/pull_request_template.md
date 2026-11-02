## What

<!-- What changed and which FR/NFR IDs it covers. -->

## How to test

<!-- Commands or steps a reviewer can follow. -->

## Checklist

- [ ] Works in the latest Chrome with no console warnings or errors
- [ ] Inputs validated on both frontend (zod) and backend (DRF serializers)
- [ ] Backend logic has tests (pricing and invoices always)
- [ ] README or module notes updated

### Frontend pages: accessibility and languages

See `frontend/README.md` → "Accessibility and internationalization".

- [ ] `npm run lint`, `npm test` and `npm run test:e2e` pass
- [ ] New pages added to `frontend/src/paths.ts`
- [ ] Text translated in English, Arabic and French; page checked in RTL
- [ ] Keyboard-only and screen-reader pass done by hand
