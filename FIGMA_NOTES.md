# Figma Notes

Актуализировано: 2026-04-22  
Источник: Figma MCP, channel `6627lg3c`  
Файл: `Landing`

Этот файл содержит только подтвержденные данные из Figma MCP. Скриншотные сравнения, визуальные догадки и старые предположения намеренно убраны.

## Источник макетов

- Desktop frame: `1:559`
  - URL: `https://www.figma.com/design/jWzFayxWV7TCagIe7Ompcd/Landing?node-id=1-559&t=xX96u6adqBbhVOnx-4`
- Mobile frame: `1:471`
  - URL: `https://www.figma.com/design/jWzFayxWV7TCagIe7Ompcd/Landing?node-id=1-471&t=xX96u6adqBbhVOnx-4`

## Инструменты MCP, использованные для извлечения

- `get_node_info`
- `get_nodes_info`
- `scan_text_nodes`
- `get_styled_text_segments`
- `get_grid`
- `get_image_from_node`

## Главное правило для дальнейшей работы

Если `scan_text_nodes` и верхнеуровневый `style` у mixed-text узла противоречат `get_styled_text_segments`, считать источником истины `get_styled_text_segments`.

Причина: для mobile-описаний карточек `get_nodes_info` возвращает агрегированный `fontFamily: Iansui`, но `get_styled_text_segments(fontName)` показывает реальные сегменты `Inter Regular/Bold`.

## Подтвержденные фреймы

### Desktop

- Node: `1:559`
- Name: `Desktop`
- Type: `FRAME`
- Size: `1440 x 4013.0981`
- Fill: `#ffffff`

### Mobile

- Node: `1:471`
- Name: `Mobile`
- Type: `FRAME`
- Size: `375 x 5051.4053`
- Fill: `#ffffff`

## Grid

- Desktop `1:559`: `grids: []`
- Mobile `1:471`: `grids: []`

Подтверждено: в макете нет layout grids.

## Подтвержденные image hashes

### Одинаковые desktop/mobile

- Hero image
  - Desktop `1:574`: hash `34f810a412652daa62c42dcf38d1f004c6878408`
  - Mobile `1:488`: hash `34f810a412652daa62c42dcf38d1f004c6878408`
  - Size: `3760 x 3760`
- Intro image
  - Desktop `1:579`: hash `b1176b930f2e8aa0ce2d4053a9b3e959e146e7e5`
  - Mobile `1:493`: hash `b1176b930f2e8aa0ce2d4053a9b3e959e146e7e5`
  - Size: `1024 x 970`
- Card 1 image
  - Desktop `1:593`: hash `3cfad0b7983e1c0cd23800808d9620f002609912`
  - Mobile `1:506`: hash `3cfad0b7983e1c0cd23800808d9620f002609912`
  - Size: `1792 x 2400`

### Подтверждено только для одного варианта

- Mobile CTA box `1:539`
  - hash `39f716afc0a1dd6aae5ec2ad944bb698481e5281`
  - Size `1372 x 1372`
- Mobile final image `1:547`
  - hash `e6c6b34323c8b60676d738cbd15faf2461a09577`
  - Size `1146 x 848`

### Что MCP не подтвердил

Для этих узлов `get_image_from_node` вернул ошибку `Image dimensions not available`, поэтому утверждения о distinct/mobile-specific ассетах для них запрещены:

- Desktop final image `1:634`
- Desktop CTA box `1:626`
- Desktop card 2 `1:603`
- Mobile card 2 `1:516`
- Mobile card 3 layered image `1:524`

## Подтвержденные тексты

### Desktop

- Hero title `1:567`: `Трезвые / переносчики / в Макс`
- Badge `1:569`: `Не продолбаем!`
- Badge `1:571`: `Недорого!`
- Hero CTA `I1:572;785:4056`: `Начать переезд`
- Intro title `1:577`: `На связи бригада срочного переезда!`
- Intro description `1:584`: `У нас тут три полезных инструмента для быстрого и аккуратного переезда. Ступайте в квартиру и соберите всё самое необходимое.`
- Intro checkbox label `1:587`: `Сначала самое ценное`
- Card 1 title `1:591`: `Упаковать и перенести самое ценное`
- Card 1 description `1:592`: `Документы, техника, аптечка и вещи первой необходимости едут в первую очередь.`
- Card 1 CTA `I1:598;785:4056`: `Собрать коробку`
- Card 2 title `1:601`: `Кухня. Тут ничего не должно разбиться`
- Card 2 description `1:602`: `Хрупкое упакуем отдельно, подпишем и довезём без лишнего грохота.`
- Card 2 CTA `I1:606;785:4056`: `Защитить посуду`
- Card 3 title `1:609`: `Балкон. Принимайте!`
- Card 3 description `1:610`: `Габаритное, сезонное и забытое добро не потеряется по дороге и приедет в полном составе.`
- Card 3 CTA `I1:614;785:4056`: `Отправить всё сразу`
- CTA title `1:617`: `Подпиши свою коробку`
- CTA description `1:618`: `Оставь понятную надпись, чтобы самое важное поехало в правильную комнату без суеты и лишних вопросов.`
- CTA input text `1:621`: `КОНТЕНТ 2020–2024`
- CTA box text `1:627`: `КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)` (единая строка без слеша; перенос на вторую строку происходит автоматически в рамке 306px при Caveat 22px)
- CTA bottom button `I1:628;785:4056`: `Подтвердить коробку`
- Final title `1:632`: `Добро пожаловать домой!`
- Final subtitle `1:633`: `Финальная разгрузка без хаоса: заносим по комнатам, ставим на место и не теряем темп.`
- Final body `1:636`: `Пока все остальные мечутся с коробками, у нас всё подписано, отсортировано и доезжает на своих местах.`

### Mobile

- Hero title `1:479`: `Трезвые переносчики в Макс` (без слешей; в HTML строки разделяются через `<br>`, не символами `/`)
- Badge `1:481`: `Не продолбаем!`
- Badge `1:483`: `Недорого!`
- Hero CTA `I1:486;785:4056`: `Начать переезд`
- Intro title `1:491`: `На связи бригада срочного переезда!` (единая строка без слеша; перенос происходит автоматически в рамке 343px при Unbounded 24px)
- Intro description `1:498`: `У нас тут три полезных инструмента, чтобы вашу маму и тут и там показывали. Ступайте в квартиру, и соберите все самое необходимое.`
- Intro checkbox label `1:501`: `Нажмите, чтобы узнать больше`
- Card 1 title `1:504`: `Упаковать и перенести самое ценное`
- Card 1 description `1:505`: `Наташа из Телеграммы переносит ваш контент из ТГ в Макс — аккуратно, как бабушкин сервиз.`
- Card 1 CTA `I1:511;785:4056`: `Посмотреть, как работает`
- Card 2 title `1:514`: `Кухня. Тут ничего не должно разбиться`
- Card 2 description `1:515`: `Витя из LiveDune следит, чтобы при переезде вы ничего не потеряли — ни охватов, ни нервов.`
- Card 2 CTA `I1:519;785:4056`: `Попробовать LiveDune`
- Card 3 title `1:522`: `Балкон. Принимайте!`
- Card 3 description `1:523`: `Саша из TargetHunter следит, чтобы аудитория узнала о переезде — и доехала до нового адреса.`
- Card 3 CTA `I1:527;785:4056`: `Попробовать TargetHunter`
- CTA title `1:530`: `Подпиши свою коробку`
- CTA description `1:531`: `Каждый переезд начинается с надписи маркером на картоне. Выбери готовую или напиши свою.`
- CTA input placeholder `1:534`: `Введите надпись`
- CTA box text `1:540`: `КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)` (единая строка без слеша; перенос на вторую строку происходит автоматически)
- CTA bottom button `I1:541;785:4056`: `Поделиться коробкой`
- Final title `1:545`: `Добро пожаловать домой!`
- Final subtitle `1:546`: `Переезд — это не страшно. Особенно когда помогают трое в растянутых футболках.`
- Final body `1:549`: `Начните сегодня — и через неделю вы уже будете думать: «И чего я так долго тянул?»`

## Mixed-text сегменты, подтвержденные через `get_styled_text_segments`

### Mobile intro `1:498`

- `У нас тут ` — `Inter Regular`, `400`
- `три полезных инструмента` — `Inter Bold`, `700`
- остальной текст — `Inter Regular`, `400`

### Mobile card 1 description `1:505`

- `Наташа из ` — `Inter Regular`, `400`
- `Телеграммы` — `Inter Bold`, `700`
- остальной текст — `Inter Regular`, `400`

### Mobile card 2 description `1:515`

- `Витя из ` — `Inter Regular`, `400`
- `LiveDune` — `Inter Bold`, `700`
- остальной текст — `Inter Regular`, `400`

### Mobile card 3 description `1:523`

- `Саша из ` — `Inter Regular`, `400`
- `TargetHunter` — `Inter Bold`, `700`
- остальной текст — `Inter Regular`, `400`

## Ключевые подтвержденные layout-значения

### Desktop hero `1:560`

- Size: `1440 x 900`
- Background: `#3f559e`
- Content frame `1:565`: `600 x 311`, local `(420, 92)`
- Title container `1:566`: `515 x 198`, local `(42.5, 0)`
- Header menu icon export `I1:573;782:6027`: exact `60 x 60` SVG, three horizontal lines, stroke `#6476B6`
- CTA button `1:572`: `600 x 53`, local `(0, 258)`
- Hero image `1:574`: `600 x 600`
- Left cover `18:231`: `140 x 60`
- Right cover `18:232`: `90 x 60`
- Internal line nodes exist (`18:233`, `18:235`, `18:234`), but for implementation the exported SVG above is the reliable reference

### Mobile hero `1:472`

- Size: `375 x 720`
- Background: `#3f559e`
- Content frame `1:477`: `343 x 233`, local `(16, 92)`
- Title container `1:478`: frame `343 x 132`; do not use the group export for layout because its exported bounds become `343 x 178` due to overflow from both stickers
- Production mobile hero should use split assets instead:
- `1:479` title node metrics directly: `343 x 132`, `Unbounded Bold 40`, `44px` line-height, centered; raw text `"Трезвые переносчики в Макс"` — без слешей; в HTML строки через `<br>`
- `1:482` price sticker "Недорого!": `80.617 x 28.802`, localPosition `(227.918, -18)` в `1:478` — overflows ВЫШЕ title container на 18px; fill `#6476b6`, radius `4`, 4px padding; Inter Regular 14px, white
- `1:480` slogan sticker "Не продолбаем!": `121.952 x 46.469`, localPosition `(44.496, 113.477)` в `1:478` — extends НИЖЕ container; fill `#6476b6`, radius `4`, 4px padding; Inter Regular 14px, white
- CTA container `1:484`: `343 x 53`, local `(0, 180)` в `1:477`; gap от title container = 48px
- CTA button `1:486`: `327 x 53`, local `(8, 0)`, fill `#243888`, radius `56`
- CTA label `I1:486;785:4056`: "Начать переезд", Unbounded Bold 14px, lineHeightPx 21, white, centered (145×21 внутри кнопки)
- Hero image `1:488`: `480 x 480`, absolute `x=-2141`, `y=-2249`, which means local `(-56, 272)` inside the `375 x 720` frame; its top edge aligns with CTA container `1:484`
- Header `1:487`: `375 x 60`, local `(0, 0)`
- Header menu icon `I1:487;782:6027`: `60 x 60`, localPosition `(165.5, 0)` в header; CSS `left: calc(50% - 22px)` на 375px = 165.5px ✓
- Header logo frame `I1:487;1237:32489`: `107 x 32`, local `(16, 14)`, present in node tree but intentionally hidden in the design; do not implement it in the mobile header and do not treat its absence as a mismatch
- Menu Container `1:473`: `375 x 240`, local `(0, 480)` в hero frame — это выдвижная панель навигации; занимает нижние 240px hero; скрыта по умолчанию
  - Menu Item 1 `1:475`: `375 x 120`, local `(0, 40)` внутри `1:473`, fill `#6476b6`
  - Menu Item 2 `1:476`: `375 x 80`, local `(0, 160)` внутри `1:473`, fill `#ffffff`
  - 40px пустая зона в начале контейнера (y=0..40 в `1:473`)
  - SVG-ассеты `menu-band-mobile.svg` / `menu-band-desktop.svg` представляют этот блок

### Desktop intro `1:575`

- Size: `1440 x 764.848`
- Image container `1:578`: `600 x 523.848`
- Checkbox control `1:586`: `16 x 16`, stroke `#3f559e`, radius `8`
- Checkbox text `1:587`: fill `#3f559e`

### Mobile intro `1:489`

- Size: `375 x 615.405`
- Image container `1:492`: `375 x 327.405`
- Tooltip radio nodes use `16 x 16`, radius `8`

### Desktop cards `1:588`

- Section fill: `#f2f3f6`
- Each column width: `375`
- Card body width: `343`
- Card image frame height: `460`
- Button height: `53`
- Button fill: `#243888`
- Image radius: `32`

### Mobile cards `1:502`, `1:512`, `1:520`

- Alternating section fills:
  - `1:502` -> `#f2f3f6`
  - `1:512` -> `#ffffff`
  - `1:520` -> `#f2f3f6`
- Body width: `343`
- Image size: `343 x 460`
- Button size: `343 x 53`
- Tooltip trigger size: `16 x 16`

### Desktop CTA `1:615`

- Size: `1440 x 968`
- Search bar `1:619`: `600 x 64`, stroke `#e0e2ea`, radius `40`
- Search button export `1:622`: exact `48 x 48` SVG, background `#6678B6`, white icon
- Divider image `1:626`: `600 x 600`, radius `32`
- Bottom button `1:628`: `600 x 53`, fill `#243888`, radius `56`

### Mobile CTA `1:528`

- Size: `375 x 737`
- Search bar `1:532`: `343 x 64`, stroke `#e0e2ea`, radius `40`
- Search button `1:535`: `48 x 48`, fill `#6678b6`
- Divider image `1:539`: `343 x 343`, radius `32`
- Bottom button `1:541`: `343 x 53`, fill `#243888`, radius `56`

### Desktop final `1:629`

- Size: `1440 x 574.25`
- Background: `#6678b6`
- Image `1:634`: `375 x 281.25`

### Mobile final `1:542`

- Size: `375 x 670`
- Background: `#6678b6`
- Image `1:547`: `375 x 360`
- Logo row `1:550`: `132 x 32`

## Зафиксированные баги CSS (исправлены)

### Баг 1: `--hero-mobile-scale` производил `<length>`, а не число

- `--hero-mobile-content-width` определён как `min(343px, calc(100vw - 32px))` → тип `<length>`
- `--hero-mobile-scale: calc(var(--hero-mobile-content-width) / 343)` = `<length> / number = <length>` (например `0.9737px`), а не безразмерное число
- Результат: `calc(81px * var(--hero-mobile-scale))` = `<length> * <length>` = **недопустимый CSS**
- Браузер откатывался к `auto` для всех свойств, использующих эту переменную
- `top: auto; left: auto` на `position: absolute` → элементы занимали статическую позицию (у обеих плашек y≈132px)
- **Исправление**: переменная `--hero-mobile-scale` удалена; все вхождения заменены на `calc(var(--hero-mobile-content-width) * N / 343)` — это валидно, т.к. `<length> * number / number = <length>`

### Баг 2: `padding-top: 40px` из таблетного брейкпоинта протекал на мобильный

- `@media (max-width: 1439px)` устанавливал `.hero__headline-wrap { padding-top: 40px }`
- Мобильный вьюпорт (например 366px) удовлетворяет обоим условиям: `max-width: 1439px` И `max-width: 767px`
- Мобильный брейкпоинт не переопределял `padding-top` обратно в 0
- Следствие 1: `h1` с `height: 100%` использовал высоту содержимого = 132px − 40px = 92px вместо 132px
- Следствие 2: заголовок и плашки смещались вниз на 40px (y=132 вместо y=92)
- **Исправление**: добавлено `padding-top: 0` к `.hero__headline-wrap` в `@media (max-width: 767px)`

## Что было исправлено в этой версии заметок

Ниже список утверждений, которые больше нельзя использовать как источник истины:

- Утверждение, что `hero` и `intro` используют разные desktop/mobile ассеты
  - неверно, у них одинаковые image hashes
- Утверждение, что mobile card/CTA/final ассеты обязательно отличаются от desktop
  - не подтверждено MCP
- Любые значения, выведенные только по PNG-экспорту или визуальному сравнению
  - удалены как неподтвержденные

## Практический вывод

Для кодовых правок опираться только на:

- `node ids`
- `absoluteBoundingBox` и `localPosition`
- `fills`, `strokes`, `cornerRadius`
- `scan_text_nodes`
- `get_styled_text_segments`
- `get_image_from_node`, когда он возвращает hash без ошибки

Если MCP не может вернуть hash или image dimensions, в документации это должно помечаться как `не подтверждено`, а не заменяться предположением.
