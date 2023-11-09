# Chaos Orginizer Widget
С помощью виджета можно прикреплять и перетаскивать медиафайлы (аудио-, видеофайлы, изображения). Размещать и редактировать текстовые файлы, ссылки, текущую геолокацию. Все файлы можно найти с помощью виджета поиска, удалять, фильтровать. 
### Реализованы функции:
<details>
<summary>Обязательные (по заданию)</summary>

- Ссылки и текстовые сообщения сохраняются на сервере
Ссылки и текстовые сообщения хранятся на сервере. Подробнее про серверную часть ТУТ ССЫЛКА 
- Ссылки (http:// или https://) кликабельны и отображаются, как ссылки в "плитках" и в модальном окне
- Изображения, видео- и аудиофайлы сохраняются на сервере — через Drag & Drop и через иконку загрузки
- Медиа-файлы (изображения, видео-, аудиофайлы) скачиваются на компьютер пользователя|
- Осуществлена ленивая подгрузка изображений. Все элементы контейнера с данными отображаются при скролл
Подрузка реализована с помощью баузерного API - Intersection Observer. 
Если элемент находится в "зоне видимости" - он видим, если нет - скрыт.
</details>
<details>
<summary>Дополнительные (на выбор)</summary>

- Виджет поиска
Виджет не чувствителен к регистру. Отображаются все валидные совпадения.
- Отправка геолокации 
Функция реализована с помощью браузерного API. Если пользователь запрещает доступ - выводится соответствующая ошибка в интерфейсе
- Воспроизведение видео/аудио
Функция реализована с помощью API браузера
- Просмотр вложений по категориям (all, audio, video, text, images)
По клику на соответствующую кнопку выводится количество и сами элементы соответствующего типа
- Поддержка emoji
Функция реализована с помощью [Open Emoji API](https://emoji-api.com/)
</details>


