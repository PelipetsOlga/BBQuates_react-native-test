# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A React Native app for iOS and Android built with **Expo SDK 55** (React Native 0.83, React 19.2, TypeScript strict). It follows the same setup as the `wellforge-platform` mobile app (`apps/mobile`): Expo with Continuous Native Generation, local native builds via `expo run:*`, and pnpm.

Expo changes APIs between SDK releases, so don't write Expo/RN code from memory. Check the versioned docs at `https://docs.expo.dev/versions/v55.0.0/`; `https://docs.expo.dev/llms.txt` is the index.

## Toolchain

- Node 22 (pinned through Volta in `package.json`; the shell's default nvm Node 20.18 is too old for RN 0.83, which needs >= 20.19.4). If Volta isn't active in the shell, prefix commands with `volta run --node 22.20.0`.
- pnpm 11. Lifecycle scripts of dependencies are blocked unless listed under `allowBuilds` in `pnpm-workspace.yaml`. An unlisted one fails the install with `ERR_PNPM_IGNORED_BUILDS`.
- `.npmrc` pins the public npm registry, because the user-level `~/.npmrc` points at a Welltech CodeArtifact registry whose token expires.
- JDK 17 and the Android SDK (`ANDROID_HOME`) for Android; Xcode and CocoaPods for iOS.

## Commands

```bash
pnpm install
pnpm start                      # Metro dev server (JS bundler)
pnpm android                    # expo run:android: prebuild if needed, Gradle build, install, launch
pnpm android -- --device SM_G990B2  # pick a device by the `model:` field of `adb devices -l` (not the serial)
pnpm ios                        # expo run:ios: prebuild if needed, pod install, Xcode build, launch on simulator
pnpm prebuild:android           # regenerate android/ from app.config.ts (also prebuild:ios)
pnpm prebuild                   # regenerate both from scratch (--clean deletes android/ and ios/)
pnpm typecheck                  # tsc --noEmit
pnpm lint                       # expo lint (ESLint flat config, eslint-config-expo)
pnpm test                       # Jest with the jest-expo preset
pnpm test -- __tests__/App.test.tsx        # single test file
pnpm test -- -t "renders the welcome text" # single test by name
pnpm exec expo install <pkg>    # add a dependency at the version matching the Expo SDK
pnpm dlx expo-doctor            # check dependency versions and config against the SDK
```

Run `typecheck`, `lint` and `test` before calling a task done.

## OpenSpec

Work is planned spec-first with OpenSpec (`@fission-ai/openspec`, pinned as a devDependency). Specs live in `openspec/specs/`, and in-flight changes in `openspec/changes/<id>/` (proposal, design, tasks, delta specs). Project context for the artifacts is in `openspec/config.yaml`.

- Flow: `/opsx:explore` → `/opsx:propose "<idea>"` → `/opsx:apply` → `/opsx:archive`. The skills behind these commands are `.claude/skills/openspec-*`.
- Run the CLI as `pnpm exec openspec …`, e.g. `pnpm exec openspec list`, `pnpm exec openspec validate --all`. The skills call bare `openspec`, which on this machine resolves to an older global 1.13.1 under nvm Node 20. Use `pnpm exec` so the CLI matches the version that generated the skills.
- After bumping the package, run `pnpm exec openspec update` to regenerate the skills and commands.

## Architecture

- `index.ts` calls `registerRootComponent(App)`. It's the JS entry point (`main` in `package.json`), and `App.tsx` is the root component.
- **Continuous Native Generation:** `android/` and `ios/` are gitignored build output. `expo prebuild` generates them from `app.config.ts`, which holds the app name, `android.package`, `ios.bundleIdentifier`, icons and splash, plus the native module config of installed Expo packages. Never edit the native folders by hand. Express native changes in `app.config.ts` or as a config plugin. In WellForge, plugins live in `apps/mobile/plugins/withXxx.ts` and native code in local Expo modules under `apps/mobile/modules/`.
- No Expo Go workflow: the app runs as a local debug build (`expo run:*`). That build is required as soon as a library with native code is added.
- The app is a React Native copy of the SwiftUI app BBQuates17 (`/Users/olhapelypets/AppProjects/BBQuates17`). The OpenSpec change `rn-copy-of-bbquates17` defines its behavior and design.

### Layers

The layout follows WellForge `apps/mobile`. **When a technology or pattern choice isn't settled here, do what WellForge does**, and say so when reporting the change.

- `src/app/`: the app shell. `di/diConfigurator.ts` lists every `*Assembly` and sets the `ServiceLocator`; root navigation lives next to it.
- `src/features/<feature>/`: vertical feature modules. Each has an `assembly/`, `gateway/` (network access), `store/` (screen state, the ViewModel equivalent), `models/`, and `screens/`.
- `src/libs/`: shared code with no feature knowledge.
  - `di`: `createServiceKey<T>()`, `DIContainer` (container-scoped singletons by default, or transient), `Assembly`, `useService(Key)`.
  - `utils/listener`: `Publisher`, `CurrentValueSubject` (≈ StateFlow), `PassthroughSubject`, and the hooks `usePublisher` / `useSubjectValue`.
  - `networking`: `ApiClient` is the only caller of `fetch`; a non-2xx status becomes `HttpFetchError`.
  - `logger`: `Logger` via `LoggerKey`. Don't leave `console.log` in code.
  - `ui/theme`: `useTheme()` / `useThemedStyles(createStyles)` with `StyleSheet.create`, a single dark theme.
- Every service is declared as an interface plus a `*Imp` class, with its key next to the interface. Components resolve services with `useService`, and services take their dependencies through the constructor.
- State lives in Publisher/Subject stores, not in zustand, Redux or react-query (all three are forbidden in WellForge). The network goes only through `ApiClient`, never axios.
- Imports use `#/app/*`, `#/features/*` and `#/libs/*`, which are defined in both `tsconfig.json` `paths` and `package.json` `imports`. Don't import across features with deep relative paths. Use named exports, and kebab-case folder names.
- Tests live in a `__tests__/` folder next to the code and use `@testing-library/react-native`. Gateways are tested against a mocked `ApiClient`, stores against a mocked gateway. No test touches the network.

### Dependencies

- Use `pnpm exec expo install <pkg>` for anything Expo or React Native.
- `expo install` pins only the packages in the SDK's native-module list. `babel-preset-expo`, `jest-expo` and `eslint-config-expo` are not on it, so it installs their latest major, a newer SDK's. Match them to SDK 55 by hand: `babel-preset-expo` uses the range `expo`'s own `package.json` declares, and `pnpm dlx expo-doctor` flags a mismatch.
- `expo install` doesn't pin React Navigation either. Keep `@react-navigation/*` at WellForge's exact versions (`bottom-tabs` 7.15.9, `native` 7.2.2, `native-stack` 7.14.10). `bottom-tabs` 7.21 with `react-native-screens` 4.23 crashes the native tabs on Android with `[RNScreens] No focused tab present`.
- After changing anything in `node_modules`, restart Metro with `pnpm exec expo start --clear`. A running Metro can keep serving the old bundle.
- Don't start Metro with `CI=1`. In CI mode it doesn't watch files, so edits never reach the app.

### Comparing with the original

Visual changes are checked against the SwiftUI original on the same simulator. Its working tree has an uncommitted, uninstallable `CuxAnalyticsSDK` pod, so build its committed `HEAD` from an export:

```bash
git -C /Users/olhapelypets/AppProjects/BBQuates17 archive HEAD | tar -x -C <tmp>/src
xcodebuild -project <tmp>/src/BBQuates17.xcodeproj -scheme BBQuates17 -destination 'id=<simulator-udid>' -derivedDataPath <tmp>/dd CODE_SIGNING_ALLOWED=NO build
xcrun simctl install <simulator-udid> <tmp>/dd/Build/Products/Debug-iphonesimulator/BBQuates17.app
```

The original's bundle id is `com.opelypets.BBQuates17` and the copy's is `com.bbq.reacttest`, so both install side by side. Layout code that emulates SwiftUI stacks (Spacer splitting, wrapped-text button widths) explains itself in comments in `src/features/quotes/screens/fetch/`.
- WellForge pins its lint/test tooling to the same majors (Jest 29, ESLint 9, `@testing-library/react-native` 13).

The `.claude/settings.json` from the Expo template enables the official `expo` Claude Code plugin.
