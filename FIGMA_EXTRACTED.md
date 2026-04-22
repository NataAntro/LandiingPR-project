# Figma MCP Extracted

Актуализировано: 2026-04-22  
Источник: Figma MCP, channel `6627lg3c`

Это техническая выгрузка для разработки. В отличие от `FIGMA_NOTES.md`, здесь сохранены node ids, размеры и ограничения MCP в более прямом виде.

## 1. Корневые фреймы

| Variant | Node | Type | Size | Fill |
|---|---|---|---|---|
| Desktop | `1:559` | `FRAME` | `1440 x 4013.0981` | `#ffffff` |
| Mobile | `1:471` | `FRAME` | `375 x 5051.4053` | `#ffffff` |

## 2. Подтвержденная структура секций

### Desktop

| Section | Node | Size | Notes |
|---|---|---:|---|
| Hero | `1:560` | `1440 x 900` | fill `#3f559e` |
| Intro | `1:575` | `1440 x 764.8480` | fill `#ffffff` |
| Cards | `1:588` | `1440 x 806` | fill `#f2f3f6` |
| CTA | `1:615` | `1440 x 968` | fill `#ffffff` |
| Final | `1:629` | `1440 x 574.25` | fill `#6678b6` |

### Mobile

| Section | Node | Size | Notes |
|---|---|---:|---|
| Hero | `1:472` | `375 x 720` | fill `#3f559e` |
| Intro | `1:489` | `375 x 615.4050` | fill `#ffffff` |
| Card 1 | `1:502` | `375 x 782` | fill `#f2f3f6` |
| Card 2 | `1:512` | `375 x 753` | fill `#ffffff` |
| Card 3 | `1:520` | `375 x 774` | fill `#f2f3f6` |
| CTA | `1:528` | `375 x 737` | fill `#ffffff` |
| Final | `1:542` | `375 x 670` | fill `#6678b6` |

## 3. Hero

### Desktop hero `1:560`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:565` | content container | `600 x 311`, local `(420, 92)` | wraps title + CTA |
| `1:566` | title container | `515 x 198`, local `(42.5, 0)` | contains title + stickers |
| `1:567` | title | `515 x 198` | `Unbounded Bold 60`, white, center |
| `1:568` | slogan container | local `(62.7773, 169.9141)` | fill `#6476b6`, radius `5.81818` |
| `1:570` | price container | local `(290.4355, -16.5469)` | fill `#6476b6`, radius `5.81818` |
| `I1:573;782:6027` | menu icon export | `60 x 60` | exact SVG: 3 lines, stroke `#6476B6` |
| `1:572` | CTA button | `600 x 53`, local `(0, 258)` | fill `#243888`, radius `56` |
| `1:574` | hero image | `600 x 600` | image hash confirmed |
| `18:231` | left cover | `140 x 60` | fill `#3f559e` |
| `18:232` | right cover | `90 x 60` | fill `#3f559e` |
| `18:233` | nested menu line 1 | `16 x 2` | node exists, but implementation should follow exported SVG instance |
| `18:235` | nested menu line 2 | `16 x 2` | node exists, but implementation should follow exported SVG instance |
| `18:234` | nested menu line 3 | `16 x 2` | node exists, but implementation should follow exported SVG instance |

### Mobile hero `1:472`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:473` | menu container | `375 x 240`, local `(0, 480)` | выдвижная панель навигации; нижние 240px hero; скрыта по умолчанию |
| `1:475` | menu item 1 | `375 x 120`, local `(0, 40)` в 1:473 | fill `#6476b6`; 40px пустая зона выше |
| `1:476` | menu item 2 | `375 x 80`, local `(0, 160)` в 1:473 | fill `#ffffff` |
| `1:477` | content container | `343 x 233`, local `(16, 92)` | wraps title + CTA |
| `1:478` | title container | `343 x 132`, local `(0, 0)` в 1:477 | group export becomes `343 x 178` because stickers overflow; do not use that group export for layout |
| `1:479` | title | `343 x 132`, local `(0, 0)` в 1:478 | Unbounded Bold 40px, lineHeightPx 44, white, CENTER; text: `"Трезвые перевозчики в Макс"` (без слешей) |
| `1:480` | slogan container "Не продолбаем!" | `121.952 x 46.469`, local `(44.496, 113.477)` в 1:478 | fill `#6476b6`, radius `4`, 4px padding; overflow ниже title container; Inter Regular 14px white |
| `1:482` | price container "Недорого!" | `80.617 x 28.802`, local `(227.918, -18)` в 1:478 | fill `#6476b6`, radius `4`, 4px padding; overflow выше title container на 18px; Inter Regular 14px white |
| `1:484` | CTA container | `343 x 53`, local `(0, 180)` в 1:477 | gap от title container = 48px |
| `1:485` | CTA inner | `343 x 53` | wrapper |
| `1:486` | button | `327 x 53`, local `(8, 0)` | fill `#243888`, radius `56` |
| `I1:486;785:4056` | button label | `145 x 21`, local `(91, 16)` в кнопке | "Начать переезд"; Unbounded Bold 14px, lineHeightPx 21, white, CENTER |
| `1:487` | header | `375 x 60`, local `(0, 0)` | instance |
| `I1:487;782:6027` | menu icon | `60 x 60`, local `(165.5, 0)` в header | гамбургер; CSS `left: calc(50% - 22px)` на 375px = 165.5px ✓ |
| `I1:487;1237:32489` | header logo frame | `107 x 32`, local `(16, 14)` | exists in node tree but intentionally hidden on the screen; do not implement and do not count as a mismatch |
| `1:488` | hero image | `480 x 480`, absolute `(-2141, -2249)` | local `(-56, 272)` in the hero frame; top edge aligns with CTA top; same hash as desktop hero |

## 4. Intro

### Desktop intro `1:575`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:577` | intro title | `600 x 29` | `Unbounded Bold 24`, `#243888` |
| `1:578` | image container | `600 x 523.8480` | no radius reported |
| `1:579` | main image | `600 x 523.8480` | hash confirmed |
| `1:580` | tooltip | `24 x 24` trigger | trigger stroke `#243888`, radius `12` |
| `1:581` | tooltip | `24 x 24` trigger | trigger stroke `#243888`, radius `12` |
| `1:582` | tooltip | `24 x 24` trigger | trigger stroke `#243888`, radius `12` |
| `1:584` | description text | `568 x 42`, local x `16` | `Inter 14`, black |
| `1:586` | checkbox radio | `16 x 16` | stroke `#3f559e`, radius `8`, inner dot `#3f559e` |
| `1:587` | checkbox label | `136 x 18` | `Inter 12`, fill `#3f559e` |

### Mobile intro `1:489`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:491` | intro title | `343 x 58`, local x `16` | `Unbounded Bold 24`, `#243888` |
| `1:492` | image container | `375 x 327.4050` | edge-to-edge |
| `1:493` | main image | `375 x 327.4050` | same hash as desktop intro |
| `1:494` | tooltip | `16 x 16` | stroke `#243888`, radius `8` |
| `1:495` | tooltip | `16 x 16` | stroke `#243888`, radius `8` |
| `1:496` | tooltip | `16 x 16` | stroke `#243888`, radius `8` |
| `1:498` | description | `343 x 84`, local x `16` | mixed Inter Regular/Bold |
| `1:499` | checkbox container | contains radio + label | see text segments below |
| `1:501` | checkbox label | `188 x 18` | `Inter 12`, fill `#3f559e` |

## 5. Cards

### Desktop cards

| Card | Container | Title | Image | Button |
|---|---|---|---|---|
| 1 | `1:589` | `1:591` | `1:593` | `1:598` |
| 2 | `1:599` | `1:601` | `1:603` | `1:606` |
| 3 | `1:607` | `1:609` | `1:611` | `1:614` |

Подтверждено:

- column width: `375`
- content width: `343`
- image height: `460`
- button height: `53`
- button fill: `#243888`
- image corner radius: `32`
- card 1 and card 3 titles use width `306`

### Mobile cards

| Card | Container | Fill | Title | Image | Button |
|---|---|---|---|---|---|
| 1 | `1:502` | `#f2f3f6` | `1:504` | `1:506` | `1:511` |
| 2 | `1:512` | `#ffffff` | `1:514` | `1:516` | `1:519` |
| 3 | `1:520` | `#f2f3f6` | `1:522` | `1:524` | `1:527` |

Подтверждено:

- body width: `343`
- image frame: `343 x 460`
- button: `343 x 53`
- button radius: `56`
- tooltip triggers: `16 x 16`
- tooltip trigger radius: `8`

## 6. CTA

### Desktop CTA `1:615`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:616` | details | `600 x 83` | title + description |
| `1:617` | title | `600 x 29` | `Unbounded Bold 24`, `#243888` |
| `1:618` | description | `600 x 42` | `Inter 14`, black |
| `1:619` | search bar | `600 x 64` | fill `#ffffff`, stroke `#e0e2ea`, radius `40` |
| `1:620` | input container | width `512` text line | text `КОНТЕНТ 2020–2024` |
| `1:622` | search button export | `48 x 48` | exact SVG: background `#6678B6` + white icon |
| `1:626` | divider image | `600 x 600` | fill stack: `#f2f3f6` + image, radius `32` |
| `1:627` | box text | `306 x 52` | `Caveat Bold 22`, fill `#243888`, center |
| `1:628` | button | `600 x 53` | fill `#243888`, radius `56` |

Implementation note for current landing:
- desktop input is intentionally rendered empty with placeholder `Введите надпись`
- desktop box label is intentionally rendered at `Caveat Bold 30px`
- mobile CTA keeps the Figma text behavior and `22px` label size

### Mobile CTA `1:528`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:529` | details | `343 x 133` | title + description |
| `1:530` | title | `306 x 58` | `Unbounded Bold 24`, `#243888` |
| `1:531` | description | `343 x 63` | `Inter 14`, black |
| `1:532` | search bar | `343 x 64` | fill `#ffffff`, stroke `#e0e2ea`, radius `40` |
| `1:533` | input container | `255 x 14`, local `(24, 25)` | placeholder `Введите надпись` |
| `1:535` | search button | `48 x 48`, local `(287, 8)` | exact SVG matches desktop export: background `#6678B6` + white icon |
| `1:539` | divider image | `343 x 343`, radius `32` | image hash confirmed |
| `1:540` | box text | `306 x 52` | `Caveat Bold 22`, fill `#243888`, center |
| `1:541` | button | `343 x 53` | fill `#243888`, radius `56` |

## 7. Final

### Desktop final `1:629`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:631` | welcome details | `600 x 83` | title + subtitle |
| `1:632` | title | `600 x 29` | `Unbounded Bold 24`, white |
| `1:633` | subtitle | `600 x 42` | `Inter 14`, white |
| `1:634` | footer image | `375 x 281.25` | image fill present, hash unavailable via MCP |
| `1:635` | final text container | `600 x 90` | body + logo row |
| `1:636` | final text | `600 x 42` | `Inter 14`, white |

### Mobile final `1:542`

| Node | Name | Size / Position | Properties |
|---|---|---|---|
| `1:544` | welcome details | `343 x 112` | title + subtitle |
| `1:545` | title | `343 x 58` | `Unbounded Bold 24`, white |
| `1:546` | subtitle | `343 x 42` | `Inter 14`, white |
| `1:547` | welcome image | `375 x 360` | image hash confirmed |
| `1:548` | final text container | `343 x 90`, local `(16, 520)` | body + logos |
| `1:549` | final text | `343 x 42` | `Inter 14`, white |
| `1:550` | logo row | `132 x 32`, local `(105.5, 58)` | contains 4 children |

## 8. Text dumps

### Desktop text set

- `1:567` `Трезвые / перевозчики / в Макс`
- `1:569` `Не продолбаем!`
- `1:571` `Недорого!`
- `I1:572;785:4056` `Начать переезд`
- `1:577` `На связи бригада срочного переезда!`
- `1:584` `У нас тут три полезных инструмента для быстрого и аккуратного переезда. Ступайте в квартиру и соберите всё самое необходимое.`
- `1:587` `Сначала самое ценное`
- `1:591` `Упаковать и перенести самое ценное`
- `1:592` `Документы, техника, аптечка и вещи первой необходимости едут в первую очередь.`
- `I1:598;785:4056` `Собрать коробку`
- `1:601` `Кухня. Тут ничего не должно разбиться`
- `1:602` `Хрупкое упакуем отдельно, подпишем и довезём без лишнего грохота.`
- `I1:606;785:4056` `Защитить посуду`
- `1:609` `Балкон. Принимайте!`
- `1:610` `Габаритное, сезонное и забытое добро не потеряется по дороге и приедет в полном составе.`
- `I1:614;785:4056` `Отправить всё сразу`
- `1:617` `Подпиши свою коробку`
- `1:618` `Оставь понятную надпись, чтобы самое важное поехало в правильную комнату без суеты и лишних вопросов.`
- `1:621` `КОНТЕНТ 2020–2024`
- `1:627` `КОНТЕНТ 2020–2024 / (НЕ КАНТОВАТЬ)`
- `I1:628;785:4056` `Подтвердить коробку`
- Current landing override for desktop CTA: input starts empty with placeholder `Введите надпись`; box label font size is `30px`
- `1:632` `Добро пожаловать домой!`
- `1:633` `Финальная разгрузка без хаоса: заносим по комнатам, ставим на место и не теряем темп.`
- `1:636` `Пока все остальные мечутся с коробками, у нас всё подписано, отсортировано и доезжает на своих местах.`

### Mobile text set

- `1:479` `Трезвые перевозчики в Макс` (без слешей; в HTML — `<br>` между строками)
- `1:481` `Не продолбаем!`
- `1:483` `Недорого!`
- `I1:486;785:4056` `Начать переезд` — Unbounded Bold 14px, lineHeightPx 21, white, CENTER; 145×21 в кнопке 327px
- `1:491` `На связи бригада / срочного переезда!`
- `1:498` `У нас тут три полезных инструмента, чтобы вашу маму и тут и там показывали. Ступайте в квартиру, и соберите все самое необходимое.`
- `1:501` `Нажмите, чтобы узнать больше`
- `1:504` `Упаковать и перенести самое ценное`
- `1:505` `Наташа из Телеграммы переносит ваш контент из ТГ в Макс — аккуратно, как бабушкин сервиз.`
- `I1:511;785:4056` `Посмотреть, как работает`
- `1:514` `Кухня. Тут ничего не должно разбиться`
- `1:515` `Витя из LiveDune следит, чтобы при переезде вы ничего не потеряли — ни охватов, ни нервов.`
- `I1:519;785:4056` `Попробовать LiveDune`
- `1:522` `Балкон. Принимайте!`
- `1:523` `Саша из TargetHunter следит, чтобы аудитория узнала о переезде — и доехала до нового адреса.`
- `I1:527;785:4056` `Попробовать TargetHunter`
- `1:530` `Подпиши свою коробку`
- `1:531` `Каждый переезд начинается с надписи маркером на картоне. Выбери готовую или напиши свою.`
- `1:534` `Введите надпись`
- `1:540` `КОНТЕНТ 2020–2024 / (НЕ КАНТОВАТЬ)`
- `I1:541;785:4056` `Поделиться коробкой`
- `1:545` `Добро пожаловать домой!`
- `1:546` `Переезд — это не страшно. Особенно когда помогают трое в растянутых футболках.`
- `1:549` `Начните сегодня — и через неделю вы уже будете думать: «И чего я так долго тянул?»`

## 9. Mixed-style text segments

### `1:498` mobile intro description

- `[0..10]` `У нас тут ` -> `Inter Regular`, weight `400`
- `[10..34]` `три полезных инструмента` -> `Inter Bold`, weight `700`
- `[34..130]` remaining text -> `Inter Regular`, weight `400`

### `1:505` mobile card 1 description

- `[0..10]` `Наташа из ` -> `Inter Regular`
- `[10..20]` `Телеграммы` -> `Inter Bold`
- `[20..89]` remainder -> `Inter Regular`

### `1:515` mobile card 2 description

- `[0..8]` `Витя из ` -> `Inter Regular`
- `[8..16]` `LiveDune` -> `Inter Bold`
- `[16..90]` remainder -> `Inter Regular`

### `1:523` mobile card 3 description

- `[0..8]` `Саша из ` -> `Inter Regular`
- `[8..20]` `TargetHunter` -> `Inter Bold`
- `[20..92]` remainder -> `Inter Regular`

## 10. Ошибки и ограничения MCP

### `get_image_from_node` не смог вернуть image dimensions для:

- `1:603`
- `1:516`
- `1:524`
- `1:626`
- `1:634`

Следствие:

- нельзя утверждать, что там используются отличающиеся desktop/mobile ассеты, пока MCP не вернет hash
- нельзя писать в документации, что mobile-версии “точно другие”, если это не подтверждено hash или node metadata

## 11. Что больше не считается достоверным

Эти утверждения удалены как некорректные:

- `Desktop и Mobile используют разные hero image`
- `Desktop и Mobile используют разные intro image`
- `Desktop и Mobile используют разные mobile card assets` без hash-подтверждения
- любой вывод, сделанный по PNG-экспорту вместо node metadata
