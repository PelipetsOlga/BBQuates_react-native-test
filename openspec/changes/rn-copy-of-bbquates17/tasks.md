# Tasks

## 1. Зависимости и конфигурация

- [x] 1.1 Поставить через `pnpm exec expo install` пакеты: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`, `expo-image`, `expo-blur`, `react-native-pager-view`, `react-native-reanimated`, `react-native-worklets`. Проверка: `pnpm dlx expo-doctor` проходит без ошибок.
- [x] 1.2 Создать `babel.config.js` с `babel-preset-expo` и плагином `react-native-worklets/plugin` (последним). Проверка: `pnpm test` зелёный.
- [x] 1.3 Настроить aliases `#/app/*`, `#/features/*`, `#/libs/*`: в `tsconfig.json` — `paths`, в `package.json` — `imports`, по образцу WellForge. Проверка: тестовый импорт через `#/libs/...` проходит `pnpm typecheck` и резолвится в Jest.
- [x] 1.4 В `app.config.ts` задать:
  - `name: 'BBQuates17'`;
  - `userInterfaceStyle: 'dark'`;
  - `orientation: 'default'`, плюс iPhone без upside-down через `ios.infoPlist.UISupportedInterfaceOrientations`;
  - чёрный фон splash.

  Проверка: `pnpm prebuild:ios` и `pnpm prebuild:android` проходят, в сгенерированном `Info.plist` нужные ориентации.

## 2. Базовые библиотеки `src/libs`

- [x] 2.1 `libs/utils/listener`: `Publisher`, `PassthroughSubject`, `CurrentValueSubject`, хуки `usePublisher` и `useSubjectValue` — по образцу WellForge. Проверка: unit-тесты на `send`, `subscribe` (immediate и без него), отписку и обновление хука.
- [x] 2.2 `libs/di`:
  - `createServiceKey`, `DIContainer`, `ServiceLocator`;
  - интерфейс `Assembly`;
  - `useService`;
  - `src/app/di/diConfigurator.ts`.

  Проверка: unit-тесты на register/resolve, ленивое создание singleton и ошибку на незарегистрированный ключ.
- [x] 2.3 `libs/logger`: интерфейс `Logger`, `LoggerKey`, `ConsoleLoggerImp`, сборка `LoggerAssembly`. Проверка: unit-тест, что каждый уровень пишет в нужный метод `console`.
- [x] 2.4 `libs/networking`: интерфейс `ApiClient`, `HttpFetchError`, `ApiClientImp` поверх `fetch` (базовый URL, query с `+` вместо пробелов, отказ на не-2xx), `ApiClientKey`, `NetworkingAssembly`. Проверка: unit-тесты с замоканным global `fetch` — собранный URL, ответ 200, отказ на 500 и сетевая ошибка.
- [x] 2.5 `libs/ui/theme`: тёмная тема (цвета сериалов из spec `random-quote`, `primary` / `secondary` текст, разделитель, шкала шрифтов iOS), `ThemeProvider`, `useTheme`, `useThemedStyles`. Проверка: unit-тест, что `useThemedStyles` отдаёт стили из темы.
- [x] 2.6 Добавить в `CLAUDE.md` раздел «Architecture» о слоях `src/app`, `src/features`, `src/libs`, DI, Publisher/Subject и правиле «как в WellForge». Проверка: раздел описывает реальные пути из 2.1–2.5.

## 3. Модели и gateway

- [x] 3.1 Скопировать `sample*.json` из iOS-проекта в фикстуры `src/features/quotes/__fixtures__/`. Проверка: файлы на месте и читаются в Jest.
- [x] 3.2 `features/quotes/models`:
  - тип `Show` и список трёх сериалов в порядке табов;
  - `Quote`, `Character`, `Death`, `Episode`;
  - `*Dto` в snake_case и мапперы;
  - `formatSeasonEpisode`.

  Проверка: тесты мапперов на фикстурах; `formatSeasonEpisode(101)` даёт `'Season 1 Episode 1'`, а `formatSeasonEpisode(110)` — `'Season 1 Episode 10'`.
- [x] 3.3 Интерфейс `BreakingBadGateway`, `BreakingBadGatewayImp` и `QuotesAssembly`. Методы:
  - `fetchQuote(show)`;
  - `fetchCharacter(name)` — первый элемент или `CharacterNotFoundError`;
  - `fetchDeath(name)` — совпадение без учёта регистра или `undefined`;
  - `fetchEpisode(show)` — случайный элемент или `undefined`.

  Проверка: тесты с замоканным `ApiClient` на endpoint/query, маппинг, пустой массив персонажей, отсутствие смерти, пустой список эпизодов и проброс `HttpFetchError`.

## 4. Store экрана сериала

- [x] 4.1 `FetchScreenStore`:
  - интерфейс: `status$: CurrentValueSubject<FetchStatus>` (как `AsyncStore.state$` в WellForge: `useSubjectValue` нужно текущее значение), `getQuoteData()`, `getEpisode()`;
  - `FetchScreenStoreImp` с машиной состояний из design;
  - фабрика `FetchScreenStoreFactoryKey`, `(show) => FetchScreenStore`, в `QuotesAssembly`.

  Проверка: тесты с замоканным gateway:
  - переходы `notStarted → fetching → successQuote` и `fetching → successEpisode`;
  - `failed` при ошибке любого из трёх запросов;
  - при пустом списке эпизодов статус остаётся `fetching`;
  - у персонажа из `successQuote` есть смерть, если она найдена.

## 5. Оболочка приложения

- [x] 5.1 `#/libs/navigation` — единая точка реэкспорта `createNativeStackNavigator` и `createNativeBottomTabNavigator`. В `src/app/navigation`: `AppRoute` enum, `AppRouteStackParams`, root stack с маршрутами `TabBar` и `CharacterSheet` (`presentation: 'modal'`). Проверка: `pnpm typecheck`.
- [x] 5.2 Иконки табов для Android: `assets/tab-icons/` — PNG Material `work`, `directions_car` и своя черепаха. Проверка: файлы на месте, сборка Android их подхватывает.
- [x] 5.3 `TabBar` на нативных табах: три сериала по порядку; иконки `sfSymbol` (`tortoise`, `briefcase`, `car`) на iOS и PNG из 5.2 на Android; непрозрачный фон таб-бара. Проверка: тест рендера — три таба с правильными подписями, первый выбран.
- [x] 5.4 `App.tsx` / `index.ts`: вызов `diConfigurator`, `SafeAreaProvider`, `ThemeProvider`, `NavigationContainer` с тёмной темой; удалить шаблонный `__tests__/App.test.tsx`. Проверка: smoke-тест рендера `App`.
- [x] 5.5 Иконка приложения: `assets/icon.png` из `appicon.png` оригинала, Android adaptive icon (foreground и background). Проверка: после prebuild иконка видна в `android/app/src/main/res` и в `ios/.../AppIcon.appiconset`.

## 6. Экран сериала

- [x] 6.1 Фоны: сжать `breakingbad.jpg`, `bettercallsaul.jpg`, `elcamino.jpg` до ширины 3200 px, положить в `assets/shows/`, добавить карту `ShowAssetKey → require` в `libs/ui/assets`. Проверка: каждый файл меньше 1.5 МБ; тест на наличие ключа у каждого `Show`.
- [x] 6.2 Экран `FetchScreen`:
  - фон на весь экран, 2.7 × 1.2 от окна, `contentFit="fill"`, по центру;
  - store создаётся через фабрику и `useMemo(show)`;
  - кнопка `ShowButton` в цветах сериала с `boxShadow`;
  - отступы как у оригинала;
  - контент по статусу: пусто / спиннер / цитата / эпизод / текст ошибки.

  Проверка: тесты рендера на каждый статус с замоканным store.
- [x] 6.3 `QuoteCard` и `CharacterCard`:
  - текст в кавычках, сжатие до 0.5, фон с прозрачностью 0.5, радиус 25;
  - карточка `W/1.1 × H/1.8`, радиус 50, `expo-image` cover со спиннером;
  - плашка с именем на `BlurView`;
  - по тапу — переход в `CharacterSheet` с `{ show, character }`.

  Проверка: тест — цитата отображается в кавычках, нажатие вызывает `navigate` с нужными параметрами.
- [x] 6.4 `EpisodeCard`: название (`largeTitle`), «Season N Episode M» (`title2`), кадр со скруглением 15, описание со сжатием, строки «Written By» / «Directed By» / «Aired», фон с прозрачностью 0.6, радиус 25. Проверка: тест рендера на фикстуре `sampleepisode.json`.

## 7. Детали персонажа

- [x] 7.1 `CharacterSheet`: фон сериала, вписанный по ширине и прижатый к верху; `ScrollView` без индикатора; блок информации шириной `W/1.25` с отступом снизу 70. Внутри: имя, «Portrayed By», разделители, «Character Info», «Born», «Occupations», «Nicknames» или «None». Проверка: тесты на фикстуре и на персонаже без прозвищ («None»).
- [x] 7.2 `ImagePager` на `react-native-pager-view`: размер `W/1.2 × H/1.7`, радиус 25, отступ сверху 60, `expo-image` cover со спиннером, точки-индикатор текущей страницы. Проверка: тест — число точек равно числу фото, а `onPageSelected` переключает активную точку.
- [x] 7.3 `StatusDisclosure` на Reanimated: свёрнут по умолчанию, анимированно раскрывается и поворачивает шеврон. Внутри: статус (`title2`); если есть смерть — фото, «How: …», «Last words: …». После `onLoad` фото смерти вызывается `scrollToEnd({ animated: true })`. Проверка: тесты — свёрнут при старте; после нажатия видны статус и «Last words»; без смерти виден только статус; `onLoad` вызывает колбэк прокрутки.

## 8. Интеграционная проверка

- [x] 8.1 Прогнать `pnpm typecheck && pnpm lint && pnpm test && pnpm dlx expo-doctor` — всё проходит.
- [x] 8.2 Пересобрать нативную часть: `pnpm prebuild`, затем запустить на подключённом Android (`pnpm android -- --device SM_G990B2`) и на iOS-симуляторе (`pnpm ios`). Проверка: на обоих устройствах на каждом табе загружается цитата и эпизод, а sheet персонажа открывается и раскрывает статус.
- [x] 8.3 Сравнить внешний вид с оригиналом: собрать BBQuates17 на том же iOS-симуляторе и снять скриншоты пар экранов (таб с цитатой, таб с эпизодом, sheet с раскрытым статусом) у оригинала и копии. Проверка: расхождения на iOS устранены; на Android отличаются только пункты из design.md, раздел Risks.

## Workflow follow-up

- После ревью и проверки на обоих устройствах заархивировать change через `/opsx:archive`. Specs `show-tabs`, `random-quote`, `random-episode` и `character-details` перейдут в `openspec/specs/`.
