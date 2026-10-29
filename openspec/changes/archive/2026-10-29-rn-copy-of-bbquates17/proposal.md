# Proposal

## Why

Сейчас в репозитории только заготовка Expo. Цель — изучить архитектуру React Native на практике, переписав уже знакомое iOS-приложение BBQuates17 (`/Users/olhapelypets/AppProjects/BBQuates17`, SwiftUI, релиз «Breaking Bad, release 2») так, чтобы на iOS и Android оно делало то же самое и выглядело так же. Архитектура и технологии повторяют мобильное приложение WellForge (`wellforge-platform/apps/mobile`), поэтому отработанные здесь приёмы потом прямо переносятся на рабочий проект.

## What Changes

- Заготовка `App.tsx` заменяется приложением с тремя нативными табами: «Breaking Bad», «Better Call Saul», «El Camino». Тёмная тема включена всегда.
- На каждом табе свой фон и свои цвета кнопок. Две кнопки: «Get Random Quote» и «Get Random Episode».
- Случайная цитата загружается из публичного API `https://breaking-bad-api-six.vercel.app/api`: цитата, затем персонаж, затем его смерть. На экране — карточка цитаты и карточка персонажа.
- Случайный эпизод сериала показывается карточкой эпизода.
- По тапу на карточку персонажа открывается sheet с деталями: пейджер фотографий, информация о персонаже, раскрывающийся блок «Status (spoiler alert!)» со смертью персонажа.
- Добавляется инфраструктура в стиле WellForge, которой пока нет:
  - DI: `ServiceLocator`, `createServiceKey`, `Assembly`, `useService`;
  - реактивное состояние: `Publisher`, `CurrentValueSubject`, `useSubjectValue`;
  - сетевой `ApiClient` поверх `fetch`;
  - `Logger`;
  - тема: `useTheme`, `useThemedStyles`;
  - path aliases `#/…`.
- Новые зависимости ставятся через `expo install`: React Navigation (`native-stack` и нативные табы), `react-native-screens`, `react-native-safe-area-context`, `expo-image`, `expo-blur`, `react-native-pager-view`, `react-native-reanimated` + `react-native-worklets`.
- Изменения в `app.config.ts`:
  - тёмная тема — `userInterfaceStyle: 'dark'`;
  - ориентации как у оригинала: iPhone — портрет и обе альбомные, iPad — все четыре;
  - имя и иконка как у BBQuates17; bundle id остаётся `com.bbq.reacttest`, чтобы приложение ставилось рядом с оригиналом.

**Сознательные отличия от оригинала:**
- Пустой ответ `/characters` в оригинале роняет приложение, здесь он приводит к состоянию ошибки.
- Текст ошибки берётся из JS-ошибки, а не из `localizedDescription`.
- `CuxAnalyticsSDK` не переносится: в оригинале он не закоммичен и не входит в релиз.
- На Android вместо SF Symbols и шрифта SF Pro используются свои аналоги: лицензия Apple запрещает их там. Размытие на Android тоже выглядит иначе.

## Capabilities

### New Capabilities

- `show-tabs`: оболочка приложения. Три таба сериалов с иконками, тёмная тема, отдельное независимое состояние у каждого таба, ориентации экрана, имя и иконка приложения.
- `random-quote`: загрузка случайной цитаты сериала вместе с персонажем и его смертью, состояния загрузки и ошибки, отображение карточек цитаты и персонажа на фоне сериала.
- `random-episode`: загрузка случайного эпизода сериала и отображение карточки эпизода с номером «Season N Episode M».
- `character-details`: sheet с деталями персонажа — фото, биография, раскрывающийся статус со смертью.

### Modified Capabilities

Нет. Спецификаций в проекте пока нет.

## Impact

- **Код:** новые `src/app`, `src/features/quotes`, `src/libs/*`. `App.tsx` и `index.ts` меняются; тест-заготовка `__tests__/App.test.tsx` заменяется новыми тестами.
- **Конфигурация:** `app.config.ts`, `tsconfig.json` (aliases `#/…`), `babel.config.js` (плагин `react-native-worklets/plugin`), `package.json` (`imports`).
- **Ассеты:** три фона копируются из iOS-проекта и сжимаются до ширины около 3200 px. Сейчас они весят 2.6–8 МБ при ширине 4–6 тысяч пикселей. Также копируется `appicon.png`.
- **Внешние системы:** приложение зависит от стороннего API на Vercel. Если оно недоступно, показывается состояние ошибки. Тесты работают на фикстурах и сеть не используют.
- **Нативная часть:** после установки зависимостей нужен новый `prebuild` и пересборка на Android и iOS.
