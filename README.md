# Chaos Organizer widget - Frontend

С помощью виджета можно прикреплять и перетаскивать медиафайлы (аудио-, видеофайлы, изображения). Размещать и редактировать текстовые файлы, ссылки, текущую геолокацию. Все файлы можно найти с помощью виджета поиска, удалять, фильтровать. 
## Реализованы функции:
<details>
<summary>Обязательные (по заданию)</summary>

1. Ссылки и текстовые сообщения сохраняются на сервере.
      - Ссылки и текстовые сообщения хранятся на сервере. Подробнее про [серверную часть](https://github.com/JohnnyStorm19/ahj-Diploma_Backend)
2. Ссылки (http:// или https://) кликабельны и отображаются, как ссылки в "плитках" и в модальном окне.
    ![Ссылки](/github-img/links.png)
3. Изображения, видео- и аудиофайлы сохраняются на сервере — через Drag & Drop и через иконку загрузки.
    ![Загрузка](/github-img/attach.png)
4. Медиа-файлы (изображения, видео-, аудиофайлы) скачиваются на компьютер пользователя.
    ![Скачивание файлов](/github-img/download_1.png)
    ![Скачивание файлов](/github-img/download_2.png)
    ![Скачивание файлов](/github-img/download_3.png)
5. Осуществлена ленивая подгрузка изображений. Все элементы контейнера с данными отображаются при скролл.
     - Подрузка реализована с помощью баузерного API - Intersection Observer. Если элемент находится в "зоне видимости" - он видим, если нет - скрыт.
</details>
<details>
<summary>Дополнительные (на выбор)</summary>

1. Виджет поиска.
   ![Виджет поиска](/github-img/search-widget.png)
     - Виджет не чувствителен к регистру. Отображаются все валидные совпадения.
2. Отправка геолокации.
    ![Кнопка геолокации](/github-img/geo-btn.png)
     - Функция реализована с помощью браузерного API. Если пользователь запрещает доступ - выводится соответствующая ошибка в интерфейсе
3. Воспроизведение видео/аудио.
    ![Воспроизведение аудио/видео](/github-img/audio_video.png)
     - Функция реализована с помощью API браузера
4. Просмотр вложений по категориям (all, audio, video, text, images).
    ![Фильтр](/github-img/filter.png)
     - По клику на соответствующую кнопку выводится количество и сами элементы соответствующего типа
5. Поддержка emoji.
    ![Эмодзи](/github-img/emoji.png)
     - Функция реализована с помощью [Open Emoji API](https://emoji-api.com/)
</details>


[![Chaos-Organizer-widget-app](https://github.com/JohnnyStorm19/ahj-Diploma_Frontend/actions/workflows/web.yml/badge.svg)](https://github.com/JohnnyStorm19/ahj-Diploma_Frontend/actions/workflows/web.yml)