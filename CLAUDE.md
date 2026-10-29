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

## Architecture

- `index.ts` calls `registerRootComponent(App)`. It's the JS entry point (`main` in `package.json`), and `App.tsx` is the root component.
- **Continuous Native Generation:** `android/` and `ios/` are gitignored build output. `expo prebuild` generates them from `app.config.ts`, which holds the app name, `android.package`, `ios.bundleIdentifier`, icons and splash, plus the native module config of installed Expo packages. Never edit the native folders by hand. Express native changes in `app.config.ts` or as a config plugin. In WellForge, plugins live in `apps/mobile/plugins/withXxx.ts` and native code in local Expo modules under `apps/mobile/modules/`.
- No Expo Go workflow: the app runs as a local debug build (`expo run:*`). That build is required as soon as a library with native code is added.
- Tests live in `__tests__/` and use `@testing-library/react-native`.
- WellForge pins its lint/test tooling to the same majors (Jest 29, ESLint 9, `@testing-library/react-native` 13). Use `expo install` rather than `pnpm add` for Expo-related packages, or you'll get versions for a newer SDK.

The `.claude/settings.json` from the Expo template enables the official `expo` Claude Code plugin.
