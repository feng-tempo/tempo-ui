# Expo Web demo

From the tempo-ui repository root, with its pinned dependencies installed:

```text
npm start
```

Equivalent: `node tools/start-expo.mjs`. It builds only the library, then starts Expo Web on **http://localhost:8085/**; no sibling mobileapp source is required for this startup. Set TEMPO_EXPO_PORT for another port. Metro updates this demo during editing; restart the demo after rebuilding the library if required. This command controls only the UI demo, not mobileapp or Functions servers.

On this machine the bundled Node is also available:

```powershell
& 'C:/Users/feng.wang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' tools/start-expo.mjs
```

Home and 27 individual component pages (21 editable fields and six actions/comments) live at `/controls/<slug>`; the registry defines grouped navigation and browser-history routes. These web pages use actual @tempo/ui package exports. The consumer owns mock values, async callbacks, permissions, local audit and highlight colours. They do not call business services. Native support is outside this batch.

The previous esbuild catalogue remains at http://127.0.0.1:4173/. In another terminal, `npm run serve` serves its built files if it is not already running. It has all 21 fields, using the same 21 public packaged web fields, plus comment comparison examples. Source-comparison tooling retains its sibling mobileapp dependency. Do not start a second server on an occupied port.

Setup uses Expo 52.0.48, metro-runtime 4.0.1, asset 11.0.5, font 13.0.4, constants 17.0.8 and Babel runtime 7.28.6, matching current mobileapp packages. React 18.3.1, RN 0.76.9 and RN Web 0.19.13 remain pinned. pnpm uses the existing local .pnpm-home/store and lifecycle scripts are disabled. @tempo/ui is a local package link; package browser exports take precedence over its unverified native entries.

Production web export: `npm run build:expo` (writes ignored expo-dist). This is a local build, not publication/deployment. Startup/export disable Expo's automatic TypeScript setup to preserve the library compiler configuration. Type-check with `npm run typecheck:expo`; interaction checks use `node tests/expo-browser.mjs` with the running demo. Existing package, fields and comment suites remain in tests/. Packed Expo consumer verification is under tests/consumer/expo-web; its separate artifact preserves previous tarballs.

Use FieldAdaptersProvider above DropdownPanelProvider with typed consumer callbacks. Demo mocks/failure injection stay local. Additional checks: tests/field-batches-browser.mjs, tests/expo-extended-fields-browser.mjs, tests/field-states-browser.mjs, tests/extended-package.test.mjs.
