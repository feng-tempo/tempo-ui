# Tempo UI library and form-field catalogue

Five packaged controls, a UI-only dropdown host/theme provider, typed exports and a full 21-editable-field local catalogue. **Future authoritative library under development.** Production mobileapp is unchanged; no migration/ownership transfer has occurred. Temporary implementation overlap is intentional staging.

The project is at `outputs/TempoMobileApp/tempo-ui`, separate from T-2026-0023. Root tempoagent/tempoagenttasks are canonical. The three approved redundant repository copies were moved recoverably to Windows Recycle Bin; unique histories remain in canonical numbered task logs. Implementation milestones are in the canonical root [tempoagenttasks task T-2026-0042](../tempoagenttasks/tasks/t-2026-0042/task.md), logs 004–008. Earlier planning is preserved in canonical numbered task logs.

## Open

GitHub repository: [feng-tempo/tempo-ui](https://github.com/feng-tempo/tempo-ui), initial development branch `beta`. Feng authorized committing and pushing this project to `beta` on 12 October 2026. Canonical task history remains in sibling tempoagenttasks (T-2026-0042, log 013); earlier no-push statements below describe prior gates. The catalogue currently requires sibling tempomobileapp sources and browser tests use local runtime paths.

Money with currency disables the currency selector's clear action in the catalogue build (allowClear=false). This consumer preference is a local source adaptation; the original mobileapp checkout is unchanged. See task log 011.

Single cascading connectors use an explicit catalogue-only web adapter to align endpoints to the next label centre; the source's fixed endpoint was visibly high. Actual source still supplies rows/controls/behavior, but connector geometry is locally adapted. Verification: task log 010 and cascading-layout-result.json.

Case panels use two roomy desktop columns and one at/below 1100px. Cascading fields use the original standard rows, indented labels and connector lines, with conditional third-level display; at/below 600px they use the existing source stacked layout. Input heights remain natural. Latest verification is in task log 009 and evidence/cascading-layout-result.json.

The running loopback-only catalogue is [http://127.0.0.1:4173](http://127.0.0.1:4173/). Built files are under dist/catalogue. [Desktop screenshot](../T-2026-0042-pilot/evidence/catalogue-desktop.png), [narrow screenshot](../T-2026-0042-pilot/evidence/catalogue-narrow.png).

This browser pilot uses **React Native Web + esbuild**, without installing or starting Expo. Source controls retain native platform ports for gesture-handler and Expo icons; those entrypoints/peers/device behavior are **unverified**. Real Expo/mobileapp and RHF integration are deferred, not passed.

## Public API

| Export | Import | Contract |

|---|---|---|

| GButton / GButtonProps | @tempo/ui/actions/button | secondary default; primary/disabled/local onPress; legacy styles |

| TextInputField / TextInputFieldProps | @tempo/ui/fields/text | string value/onChange; placeHolder spelling; focus/blur/caret behavior |

| NumberInputField / NumberInputFieldProps | @tempo/ui/fields/number | executable outputAs=number; string option; null empty/intermediate; commitOnBlur |

| CheckBox / CheckBoxProps | @tempo/ui/fields/checkbox | boolean/mixed/disabled; label; web Space and built-in Enter activation |

| RichDropDown / RichDropdownProps / RichDropdownItem | @tempo/ui/fields/dropdown | {label,value} option; null clearing; searchable local options; keyboard |

| DropdownPanelProvider | @tempo/ui/overlays | UI-only browser host; viewport placement; outside/Escape close and cleanup |

| TempoThemeProvider / TempoTokens | @tempo/ui/theme | optional typed override; control border/primary and overlay layer used by pilot |

Root exports are a convenience for the five-control pilot; subpaths are available for narrower consumers. React/React DOM/RN Web are consumer peers for browser use. Native peers are declared optional so the web fixture can run; native support is not certified. React DOM is required when using the web overlay.

```tsx

import { TextInputField } from '@tempo/ui/fields/text';

import { RichDropDown } from '@tempo/ui/fields/dropdown';

import { DropdownPanelProvider } from '@tempo/ui/overlays';

// Supply controlled local values and callbacks inside a DropdownPanelProvider.

```

Actual Props declarations are generated in packages/ui/dist/types. Numeric comments inherited from source described a string default; executable number default is preserved/documented. Styles retain legacy `any` extension points; public value/callback/option/theme contracts are typed. No shared form registry, app service or business controller is imported.

## Setup and commands

Package installations and the content store are inside this pilot. Package-install lifecycle scripts were disabled. Initial pnpm setup used its default user-level registry metadata cache; subsequent setup explicitly sets pilot cache/state/config paths. No global package installation was performed. Root lockfile pins React 18.3.1, RN Web 0.19.13 and baseline RN 0.76.9 development types/tooling. Bundled Node v24.19.0/pnpm 11.25.0 were used. Initial TypeScript checks borrowed existing read-only tooling; the final build uses this pilot's own pinned TypeScript 5.9.3.

Run from this project root, using an available Node executable:

```text

node tools/build.mjs

node --test --test-isolation=none tests/package.test.mjs

node tools/serve.mjs

node tests/browser.mjs

```

Browser verification uses the bundled Playwright module and installed headless Chrome; remote requests are denied. Windows sandbox may require approval for compiler/browser subprocesses and loopback serving. Source project outside the pilot is not modified by these commands. Build verifies its generated web target is inside this project and preserves existing generated files while deletion approval is pending.

Build runs the local TypeScript compiler for declarations and catalogue before bundling. Individual checks use `node node_modules/typescript/bin/tsc -p tsconfig.json --pretty false` and `-p tsconfig.catalogue.json --pretty false`. This checks web-selected modules/public declarations, not native tooling.

Local pack uses pnpm `--dir packages/ui pack --pack-destination ../../artifacts --config.ignore-scripts=true`. Package has no lifecycle scripts and is private. tests/consumer installs the tarball offline with scripts disabled; verify with `node verify.mjs` and its TypeScript config. The mock consumer uses baseline native type declarations available in the enclosing pilot; no native runtime is exercised.

## Validation and limits

See [evidence summary](../T-2026-0042-pilot/evidence/RESULT.txt) and [scope verification](../T-2026-0042-pilot/evidence/verification.json). Checks distinguish type/declaration, package, packed mock consumer, browser interactions/screenshots and source preservation.

- Web icons use the exact locked SimpleLineIcons font (MIT notices in src/platform/assets); the overlay is a purpose-built UI-only host. Those are recorded pilot differences, not a pixel-perfect migration claim.

- Added web semantic roles/ARIA states, stable checkbox label and Space/Arrow activation where RN Web's native-state handling was insufficient. Existing mobile components were not changed.

- Dropdown search retains source Tab prevention while open; Escape exits. Keyboard smoke checks are not full accessibility conformance. The consumer passes focus/error decoration via style; source form geometry is a 1px border and 3px shadow, with no offset ring. Highlight colour comes from the consumer.

- Original default style/value/callback behavior was retained where feasible, but no real mobileapp visual or functional regression proof exists.

- Native/Expo, RHF, production integration, full accessibility, publishing and performance are unrun/deferred. No auth/API/navigation/data port calls or cloud/business traffic.

Do not maintain a separate production fork. Future migration requires explicit approval, app compatibility adapters/consumer proof and an ownership ledger transfer. Until then mobileapp stays untouched. No Git init, commit/push, registry publication, remote repo or deployment was performed.

## Current correction

The five controls are staged source extractions, with explicit platform ports. The former catalogue outline was incorrect: it added a thick offset ring instead of passing the form-owned style. The consumer now supplies focus/blur/error decoration to the actual field surface, using original geometry and an externally chosen colour. Checkbox decoration reaches the box, not the label row. RichDropDown accepts optional `searchStyle` for consumer-owned search highlight colour; its trigger still uses `style`.

The original six mobileapp files are compiled read-only in the [source comparison](http://127.0.0.1:4173/reference.html), within this project's tests. No repository copy or running production application is used. Reference ports are RNWeb TextInput, the exact icon font and isolated overlay; this comparison does not prove production-shell, gesture-handler or native parity. Build with `node tools/build-reference.mjs`, verify with `node tests/visual-parity.mjs`. See [canonical correction log](../tempoagenttasks/tasks/t-2026-0042/logs/005-canonical-consolidation-and-field-parity.md).


## Full form-field catalogue

All 21 editable types in canonical FieldComponentMapping are shown: text, date, dropdown, asyncDropdown, lookup, referenceData, multiCheckbox, multiDropdown, cascadingMultiDropdown, cascadingDropdown, bubbleSwitch, radio, longText, checkbox, json, money, moneyWithCurrency, percentage, number, duration and fileUpload.

The first four editable controls plus GButton use the built library. Other 17 previews compile the actual adjacent canonical mobileapp source read-only with explicit local service/overlay/icon ports. They are not yet public library exports. No app component/import/dependency/lockfile migration is performed. Lookup and upload operations use local sample data only; source production API modules cannot enter the preview build. Source read-only/review/presentational/list mappings are separate from this editable-field catalogue.

Single-line host has no fixed height: source padding/font/border metrics produce 27px text/number/dropdown surfaces in the current Chrome demo, with centered dropdown text. Multiline/JSON/upload controls retain their appropriate source sizing; JSON has an explicit bounded editor viewport. See [latest task log](../tempoagenttasks/tasks/t-2026-0042/logs/008-full-form-field-catalogue.md). Run `node tests/full-catalogue.mjs` for full coverage/interactions and responsive checks. Original date/JSON dependency versions are pinned locally for the showcase; lifecycle scripts were disabled during setup.

Current verification: 20 full-catalogue checks, 14 legacy browser regressions, build/three type checks, six package tests and four packed-consumer checks passed. Native/production services/application shell/full accessibility are not certified. Historical fixed-height comparisons did not establish natural sizing; current live geometry evidence supersedes that host geometry. [Full catalogue verification](../T-2026-0042-pilot/evidence/full-catalogue-verification.json).

## Approved comment/action batch (13 October 2026)

@tempo/ui@0.1.0-dev.2 adds **five packaged components**: TempoCommentDisplay, TempoCommentPreviewList, NavBtn, ConfirmPopup and TempoCommentThreadCard. Import comments from @tempo/ui/comments, NavBtn/TooltipProvider from @tempo/ui/actions/nav and ConfirmPopup/openConfirmPopup from @tempo/ui/overlays/confirm; root exports are equivalent. Theme/DropdownPanelProvider remain shared UI hosts. Textarea and compact error presentation are internal thread support, not newly exported fields. The 21-field catalogue still has four packaged field rows and 17 read-only source preview rows.

The live local catalogue contains collapsed preview/full thread, permissions, local add/edit/delete, failure/conflict/retry, card and anchored/centered confirmation examples. More expansion is consumer-owned. Display/preview preserve source plain-text selectable content, friendly date formatter and earliest-first preview slice. Full thread uses consumer order.

Supply TempoCommentView[] with id/content/createdAt/createdBy.displayName, canEdit/canDelete and optional updatedAt/_etag. onCreate(content), onUpdate(id,content,etag) and onDelete(id,etag) are async consumer adapters; resolve on success and refresh the supplied list, reject on errors/conflicts. **onDelete must authorize soft deletion and retain original content/target/audit history** in the application. The library performs no auth, target resolution, fetching, persistence, navigation or live subscriptions. Flags are presentation capabilities, not a security check. renderError optionally replaces internal compact error UI; sanitize exposed error details at the adapter.

TempoThemeProvider tokens.focus controls the thread's source-shaped focus border/3px halo; primary controls actions. NavBtn also accepts focusStyle/cusStyle and accessibilityLabel. Thread accepts card/panel, placementStyle and optional interactionProps for consumer canvas metadata/events. DropdownPanelProvider is required for web imperative confirmation; TooltipProvider supplies NavBtn tooltip support. ConfirmPopup catches rejected callbacks, keeps the action open for retry, disables mutation actions while working, traps focus and restores it on close; cancel is emitted once and never on successful confirmation. Centered confirmation supplies a non-dismissible mask; Escape/Cancel still close when idle. Native host support remains unverified (the current native overlay is a placeholder); no native compatibility claim.

Current mobile source explicitly sets textarea input height 68px and allocates 22px separately for its count footer. The older T-0021 92px note is preserved as history; current caller and live read-only reference determine this batch's geometry. Default thread/preview reference screenshots are byte-identical under declared UI/font ports; focused edit geometry is also checked. This is web harness parity, not real mobileapp migration or full accessibility certification.

Evidence and reproducible checks: evidence/comment-batch/ (browser-result.json, textarea-geometry.json, visual-comparison.json, source-provenance.json, packed-consumer-result.json and screenshots); node tests/comments-browser.mjs; node --test --test-isolation=none tests/package.test.mjs tests/comments-package.test.mjs. Source reference: node tools/build-comment-reference.mjs, then /comment-reference.html on the existing catalogue host. The private dev.2 tarball and a test-only packed consumer under tests/consumer/comment-batch preserve the earlier dev.1 artifact/consumer. No package publication or mobile migration.
