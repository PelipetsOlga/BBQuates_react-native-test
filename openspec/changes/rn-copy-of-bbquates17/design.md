# Design

## Context

- Отправная точка — заготовка Expo SDK 55: RN 0.83, React 19.2, TypeScript strict, pnpm, Node 22. В ней только `App.tsx`, `index.ts` и пустой `openspec/`. Папки `android/` и `ios/` генерирует `expo prebuild` из `app.config.ts`, в git они не попадают. Мотивация — в proposal.md, раздел Why; поведение описано в `specs/*`.
- Оригинал — SwiftUI-приложение примерно на 750 строк. Эквиваленты частей:

| В оригинале | Что это | Здесь станет |
|---|---|---|
| `FetchService` | 4 метода сетевых запросов | gateway |
| `ViewModel` (`@Observable`) | 5 статусов, один экземпляр на `FetchView` | store |
| `FetchView` | экран сериала | `FetchScreen` |
| `CharacterView` | sheet персонажа | `CharacterSheet` |
| `EpisodeView` | карточка эпизода | `EpisodeCard` |

- Правило выбора технологий: если нет причины поступить иначе, делаем как в `wellforge-platform/apps/mobile` и явно пишем, откуда решение. Приватные пакеты WellForge — `@welltech-ds/*` и `@wellforge/*` из CodeArtifact — здесь недоступны. Нужные части переписываем сами в упрощённом виде.

## Goals / Non-Goals

**Goals:**
- Слои и соглашения как в WellForge: `src/app` (оболочка, DI, навигация), `src/features/<feature>`, `src/libs/*`, aliases `#/…`, named exports, папки в kebab-case.
- Каждый слой тестируется отдельно. Gateway тестируется с замоканным `ApiClient`, store — с замоканным gateway, UI — через Testing Library. Сеть в тестах не используется.
- Визуальное совпадение с оригиналом на iOS. На Android — то же поведение с учётом ограничений платформы (см. Risks).

**Non-Goals:**
- Бэкенд-слой (BFF), WDUI, flavors, Nx, EAS, Datadog, локализация. В WellForge всё это есть, но для копии такого размера не нужно.
- Аналитика (`CuxAnalyticsSDK`), офлайн-кэш ответов API, обработка повторного нажатия во время загрузки. В оригинале ничего этого нет.
- Перенос `libs/*` из WellForge один к одному. Берём только API, которое реально используется.

## Decisions

### Структура и поток данных

```
src/
+-- app/
|   +-- di/diConfigurator.ts            регистрирует все *Assembly
|   +-- navigation/                     RootStack: TabBar + CharacterSheet (modal)
+-- features/quotes/
|   +-- assembly/QuotesAssembly.ts
|   +-- models/                         Quote, Character, Death, Episode, Show, DTO + mappers
|   +-- gateway/BreakingBadGateway(.ts|Imp.ts)
|   +-- store/FetchScreenStore(.ts|Imp.ts)
|   +-- screens/fetch/                  FetchScreen, QuoteCard, CharacterCard, EpisodeCard, ShowButton
|   +-- screens/character/              CharacterSheet, ImagePager, StatusDisclosure
+-- libs/
    +-- di/  networking/  logger/  utils/listener/  ui/theme/  ui/assets/

FetchScreen --useSubjectValue(store.status$)--> render
     |  onPress
     v
FetchScreenStoreImp --> BreakingBadGatewayImp --> ApiClient.fetch --> global fetch
     (status$: CurrentValueSubject<FetchStatus>)      (non-2xx -> HttpFetchError)
```

### 1. Навигация: React Navigation, без Expo Router
- **Как сделано.** Root stack (`native-stack`) с двумя маршрутами:
  - `TabBar` — нативные табы `createNativeBottomTabNavigator` из `@react-navigation/bottom-tabs/unstable`;
  - `CharacterSheet` — `presentation: 'modal'`.
- **Откуда.** Так в WellForge: `TabBarNative.tsx`, `app/navigation/navigators/app.tsx`, правило «pushed/presented screens — на root stack, не внутри таба». Имена маршрутов и параметры типизированы (`AppRoute` enum + `AppRouteStackParams`).
- **Отвергнуто: Expo Router.** Это маршрутизация по файлам поверх той же React Navigation. Отказались, потому что WellForge его не использует.
- **Отвергнуто: JS-табы** (`createBottomTabNavigator`). Нативные табы дают настоящий `UITabBar`, и на iOS таб-бар совпадает с SwiftUI `TabView`.
- **Отвергнуто: `@gorhom/bottom-sheet`.** `modal` на iOS — тот же системный page sheet, что SwiftUI `.sheet`.
- **Параметры sheet.** `CharacterSheet` получает `{ show, character }` прямо в route params. `Character` — простой сериализуемый объект. Это проще, чем доставать персонажа из store нужного таба, а поведение то же: открывается последний персонаж этого таба.

### 2. Состояние: Publisher / CurrentValueSubject, без zustand и react-query
- **Как сделано.** Переносим `Publisher`, `CurrentValueSubject` и хуки `usePublisher` / `useSubjectValue` из WellForge (`libs/utils/listener`, правила в скилле `state-management`). Интерфейсы наружу отдают `Publisher<T>`, а конкретный subject остаётся внутри `*Imp`.
- **Отвергнуто: zustand, Redux, MobX, react-query.** В AGENTS.md WellForge zustand и react-query прямо запрещены: состояние живёт в сервисах из DI.
- **Аналогии.** `CurrentValueSubject` ≈ Kotlin `StateFlow` или Combine `CurrentValueSubject`. `useSubjectValue` ≈ `collectAsState()`.

### 3. Машина состояний store: свой union вместо `AsyncScreenState`
- **Как сделано.** Свой union повторяет Swift-enum:
  ```
  FetchStatus = { kind: 'notStarted' } | { kind: 'fetching' }
              | { kind: 'successQuote', quote, character }
              | { kind: 'successEpisode', episode }
              | { kind: 'failed', error }
  ```
- **Почему не `createAsyncStore` / `AsyncScreenState`.** В WellForge они рассчитаны на один успешный результат. AGENTS.md прямо разрешает стору с более богатой машиной состояний держать свои состояния.
- **Данные внутри состояния.** Данные лежат прямо в успешных вариантах union. В оригинале `quote`, `character` и `episode` — отдельные поля, заранее заполненные тестовыми JSON. Это сделано только для превью и на экране не видно, поэтому повторять не нужно.

```
            getQuoteData                 3 requests ok
 notStarted -----------> fetching ----------------------> successQuote
      |                   ^   |  any error / empty list
      |   getEpisode      |   +-------------------------> failed
      +-------------------+   |  episodes ok and not empty
                              +-------------------------> successEpisode
                                 episodes empty: stays fetching (as in the original)
```

### 4. Store на каждый таб
- В оригинале у каждого `FetchView` свой `ViewModel()`.
- **Как сделано.** В DI регистрируется фабрика `FetchScreenStoreFactory` (`(show) => FetchScreenStore`). `FetchScreen` создаёт store один раз через `useMemo` от `show`. Нативные табы держат экран смонтированным, поэтому состояние таба переживает переключение (spec `show-tabs`).
- **Отвергнуто: singleton в DI.** Он был бы один на все табы.

### 5. DI: свой ServiceLocator, как в WellForge
- **Как сделано.**
  - ключи — `createServiceKey<T>()`;
  - регистрация — `container.register(key, (r) => new Imp(r.resolve(...)))` в `*Assembly`;
  - все сборки подключаются в `src/app/di/diConfigurator.ts`;
  - в компонентах — `useService(Key)`;
  - на каждый сервис — интерфейс и реализация `*Imp`.
- **Отвергнуто: React Context, tsyringe, inversify.** Аналоги на Android — модули Hilt, на iOS — сборки Swinject.

### 6. Сеть: ApiClient поверх `fetch`
- **Как сделано.** `ApiClient.fetch(endpoint, { query })` склеивает базовый URL и query через `URLSearchParams`: пробел кодируется как `+`. Оригинальный `URLQueryItem` даёт `%20`, но сервер принимает оба варианта, а `+` совпадает с примерами URL в комментариях оригинала.. Ответ не-2xx отклоняется с `HttpFetchError(status)` — аналог `FetchError.badResponse`.
- **Gateway.** Методы: `fetchQuote`, `fetchCharacter`, `fetchDeath`, `fetchEpisode`. В `fetchCharacter` пустой массив приводит к `CharacterNotFoundError`. Это отличие от оригинала, который в этом месте падает.
- **Откуда.** Правило WellForge «One fetch path»: gateway работает на внедрённом API-клиенте, axios запрещён.
- **Отвергнуто: axios, ky.**

### 7. Модели: DTO + mappers
- **Как сделано.** Типы `*Dto` описывают ответ API в snake_case. Мапперы `toCharacter(dto)` и т. п. собирают доменные модели в camelCase.
- **Почему так.** В TypeScript нет `Decodable` и `convertFromSnakeCase`: типы проверяются только при компиляции.
- **Отличие от WellForge.** Там DTO берутся из общего с бэкендом пакета `@wellforge/types`. У нас его нет, и DTO живут в `features/quotes/models`. Библиотеку проверки схем во время выполнения не добавляем.
- **Доменная логика.** `formatSeasonEpisode(n)` — чистая функция с тестами на `101` и `110`.
- **Show.** Константа `Show` (`'Breaking Bad' | 'Better Call Saul' | 'El Camino'`) — значение для API и для подписи таба.

### 8. Картинки, пейджер, размытие, анимация
Все библиотеки ниже взяты из WellForge.

| Задача | Решение | Отвергнуто |
|---|---|---|
| Картинки по URL | `expo-image` с `ActivityIndicator` до `onLoad`, что заменяет `AsyncImage` + placeholder. `contentFit="cover"` для фото, `contain` для кадров. | `Image` из RN: хуже кэширует. |
| Пейджер фото | `react-native-pager-view` + свой компонент точек. | `FlatList pagingEnabled`, reanimated-carousel. |
| Плашка с именем | `expo-blur` `BlurView` с `tint="systemUltraThinMaterial"`. На Android — `experimentalBlurMethod`. | — |
| Раскрытие статуса | Reanimated 4: анимация высоты и поворот шеврона. После `onLoad` фото смерти — `scrollRef.scrollToEnd({ animated: true })`. | `LayoutAnimation`. |

### 9. Тема и вёрстка
- **Как сделано.** `useTheme()` и `useThemedStyles(createStyles)` поверх `StyleSheet.create`, как в WellForge. Тема одна, тёмная:
  - цвета сериалов: кнопка и тень;
  - текст: `primary` (белый) и `secondary`;
  - разделитель;
  - шкала шрифтов по iOS text styles: `largeTitle` 34, `title2` 22, `title3` 20, `body` 17, `subheadline` 15.
- **Без дизайн-системы.** `@welltech-ds` недоступен.
- **Размеры от окна.** Пропорции из SwiftUI `GeometryReader` считаются через `useWindowDimensions()`, например ширина карточки `width / 1.1`. Фон 2.7×1.2 — абсолютно позиционированный `expo-image` с `contentFit="fill"` и отрицательными отступами для центрирования.
- **Тень кнопки.** Свойство `boxShadow` (`'0 0 5px <color>'`). Это **своё решение, не из WellForge**: на Android `elevation` не умеет цветную тень.
- **Сжатие текста.** `adjustsFontSizeToFit` + `minimumFontScale={0.5}`.
- **Отвергнуто: NativeWind, styled-components.**

### 10. Ассеты
- **Как сделано.** Фоны лежат в `assets/shows/<key>.jpg` и раздаются через карту `ShowAssetKey → require(...)` в `libs/ui/assets`, по образцу asset-resolver в WellForge: фичи сами не вызывают `require()`.
- **Сжатие.** Перед добавлением JPG уменьшаем до ширины 3200 px и пережимаем (у WellForge есть скилл `image-asset-optimization`).
- **Иконки табов.** На iOS `{ type: 'sfSymbol', name }`, как в `appNavigationOptions.ts` WellForge. На Android `{ type: 'image', source }` — PNG-иконки в `assets/tab-icons/`: Material `work` и `directions_car` и своя черепаха.

### 11. Логи и ошибки
- **Как сделано.** `Logger` (`debug` / `info` / `warn` / `error`) регистрируется в DI, а реализация пишет в `console`. Store логирует так же, как оригинал через `print`.
- **Почему.** Правило WellForge: в коде не должно оставаться случайных `console.log`.
- **Текст ошибки на экране** — `error.message`.

## Risks / Trade-offs

- **[Риск] `createNativeBottomTabNavigator` помечен unstable**, при обновлении SDK его API может поменяться. → Импорт через одну точку (`#/libs/navigation`), как в WellForge, чтобы правка была в одном месте.
- **[Компромисс] Android выглядит иначе.** Шрифт Roboto вместо SF Pro; иконки табов не SF Symbols; размытие визуально другое; sheet открывается полноэкранным модальным окном. `minimumFontScale` на Android не работает. → Это ограничения платформы и лицензии Apple. Сверяем вид на iOS, а на Android — поведение.
- **[Риск] Чужой API на Vercel** может перестать отвечать или поменять формат. → Gateway и мапперы покрыты тестами на фикстурах из `sample*.json` оригинала. В приложении отказ API показывается как ошибка.
- **[Компромисс] Сохранены странности оригинала.** При пустом списке эпизодов спиннер крутится бесконечно, а повторные нажатия во время загрузки не блокируются. → Это сознательно задано в specs. Если что-то из этого понадобится исправить, это отдельный change.
- **[Риск] Большие фоны раздувают бандл и медленно декодируются.** → Сжимаем до 3200 px (см. Decision 10).
- **[Риск] Reanimated 4 требует плагин `react-native-worklets/plugin`** последним в `babel.config.js` и пересборку нативной части. → Отдельная задача, которая завершается `prebuild` и запуском на обоих устройствах.

## Уточнения по ходу реализации

Сверка со скриншотами оригинала на одном симуляторе показала, где Yoga (flexbox в RN) ведёт себя не так, как стеки SwiftUI. Что решили:

- **Spacer'ы с `minLength`** (`SpacedContent`). SwiftUI делит свободное место поровну и только потом поднимает спейсер до минимума. `flexGrow` в Yoga раздаёт место сверх `minHeight`, поэтому выходит 60+x и 20+x. Высота контента меряется, верхний спейсер = max(60, свободное/2). Контент ограничен `maxHeight`, и при нехватке места сжимаются карточки с `flexShrink`. Пробовали трюк с огромным `flexBasis` и крошечным `flexShrink`: на части высот Yoga ломала всю колонку, и экран оставался пустым.
- **Ширина кнопок.** Перенесённый `Text` в SwiftUI сообщает ширину самой длинной строки, а в RN занимает всю ширину, которую ему дали. Поэтому ширина кнопки считается через `onTextLayout`.
- **`scaledToFit`-картинки** (`RemoteImage` в режиме `fitWidth`). При нехватке места первой уступает картинка: она сохраняет пропорции и прижимается к левому краю. Шрифт текста уменьшается, только если картинка уже не может. Так ведёт себя оригинал на вертикальном постере El Camino.
- **Отступ под кнопками.** На iOS 95pt, как в оригинале. На Android = высота таб-бара + 12. Высота приходит из `TabBarHeightContext`, его вычисляет навигатор по формуле WellForge: 48 / 80 + нижний safe area. Карточка персонажа на низком экране теряет высоту и не заходит на кнопки (spec `random-quote`).
- **Зависимости.** `@react-navigation/*` закреплены на версиях WellForge: `bottom-tabs` 7.21 вместе с `react-native-screens` 4.23 падает на Android с ошибкой `No focused tab present`. Для тёмной темы Android нужен `expo-system-ui`. Размытие на Android требует `BlurTargetView` и `blurMethod`.
- **Иконка приложения на Android.** Полноформатная иконка оригинала вписана в безопасную зону adaptive icon на фоне её цвета `#B3E5FC`.

## Migration Plan

Пользовательских данных нет, поэтому мигрировать нечего. Шаблонный `App.tsx` заменяется сразу. Откат — `git revert` коммитов этого change, затем `pnpm prebuild`.
