import '../../css/widgetApp.css';
import Item from './Item';
import WidgetDOM from './WidgetDOM';
import WidgetModal from './WidgetModal';
import { extractFileName, extractType } from './helpers/blobHandleRegexps';

/**
 * Сущность для работы с виджетом. Взаимодействует с сущностями WidgetModal и WidgetDOM
 * WidgetApp управляется с помощью контроллера AppController 
 * Каждый метод описан ниже
 * @constructor
 * @param containerEl - контейнер для виджета
 * 
 */

export default class WidgetApp {
    constructor(containerEl) {
        this.containerEl = containerEl;
        this.widgetDOM = new WidgetDOM(containerEl);

        this.addContentCallback = []; // коллбек функции добавления контента
        this.deleteContentCallback = []; // коллбек функции удаления контента
        this.updateContentCallback = []; // коллбек функции загрузки контента на сервер
        this.downloadContentCallback = []; // коллбек функции загрузки контента с сервера
        this.emojiHandlerCallback = []; // коллбек функции отправки запроса на эмодзи
        this.getMediaContentCallback = []; // коллбек функции на получение медиа-контента
        this.getTextContentCallback = []; // коллбек функции на получение текстового контента
        this.filterContentCallback = []; // коллбек функции фильтра контента
        this.searchContentCallback = []; // коллбек функции поиска контента
        this.getAllContentCallback = []; // коллбек для получения всего контента с сервера
    }
    // разметка виджета
    getWidgetAppMarkup() {
        return `
            <div class="widget-container">
                <header class="widget-header">
                    <form class="widget-form search-form">
                        <label for="search-input" class="search-label">
                            <span class="input-icon search-icon"></span>
                        </label>
                        <input type="text" id="search-input" class="widget-input search-input" placeholder="I'm looking for..." required>
                        <button type="submit" class="input-icon send-search-icon"></button>
                    </form>
                    <div class="filter-buttons-wrapper">
                        <button type="button" data-button="all" class="filter-btn all-filter-btn">all</button>
                        <button type="button" data-button="audio" class="filter-btn audio-filter-btn">audio</button>
                        <button type="button" data-button="video" class="filter-btn video-filter-btn">video</button>
                        <button type="button" data-button="text" class="filter-btn text-filter-btn">text</button>
                        <button type="button" data-button="image" class="filter-btn images-filter-btn">images</button>
                    </div>
                </header>
                <main class="main">
                    <div class="items-quantity-block">
                        <span class="item-quantity">0</span>
                        <span class="quantity-text">items</span>    
                    </div>
                    <div class="data-container"></div>
                </main>
                <footer class="widget-footer">
                    <form class="widget-form text-form">
                        <button type="button" class="input-icon attach-icon"></button>
                        <input type="file" class="attach-input" name="attach" accept="image/*, audio/*, video/*">
                        <input type="text" class="widget-input text-input" name="text-input" placeholder="write a message..." required>
                        <div class="icons-wrapper">
                            <div class="emoji-selector"></div>
                            <button type="button" class="input-icon emoji-icon"></button>
                            <button type="button" class="input-icon geolocation-icon"></button>
                            <button type="submit" class="input-icon send-search-icon"></button>
                        </div>
                        <input class="submit-form-upload" type="submit" value="Загрузить файл" hidden>
                    </form>    
                </footer>
            </div>
        `
    }

    // добавляем в разметку и находим необходимые элементы
    bindToDOM(container, elementMarkup) {
        container.insertAdjacentHTML('afterbegin', elementMarkup);
    }

    // добавляем слушателей событий
    addListeners() {
        const widgetDOM = this.widgetDOM;

        widgetDOM.widgetContainer.addEventListener('click', this.closeEmojiSelector);
        widgetDOM.widgetContainer.addEventListener('dragover', this.onDragOverHandler);
        widgetDOM.widgetContainer.addEventListener('drop', this.onDropHandler);
        widgetDOM.searchForm.addEventListener('submit', this.onSearchFormHandler);
        widgetDOM.filterButtonsWrapper.addEventListener('click', this.onFilterHandler);
        widgetDOM.dataContainer.addEventListener('click', this.onItemClickHandler);
        widgetDOM.textForm.addEventListener('submit', this.submitHandler);
        widgetDOM.attachIcon.addEventListener('click', this.attachHandler);
        widgetDOM.attachInput.addEventListener('change', this.changeHandler);
        widgetDOM.emojiIcon.addEventListener('click', this.emojiHandler);
        widgetDOM.geolocationIcon.addEventListener('click', this.geolocationHandler);
        widgetDOM.emojiSelector.addEventListener('click', this.addEmojiToInput);
    }

    // отрисовываем виджет
    render() {
        this.bindToDOM(this.containerEl, this.getWidgetAppMarkup());
        this.widgetDOM.getElementsFromMarkup();

        this.addListeners();
    }

    // при запуске приложения отправляется запрос на сервер для контента
    getAllContentFromServer = () => {
        this.getAllContentCallback.forEach(async getAllFunc => {
            const result = await getAllFunc();
            if (result.success) {
                this.renderContent(result.items);
            }

            this.observeWidget();
        })
    }

    // ленивая подгрузка изображений, а также остального контента
    observeWidget = () => {
        const items = this.widgetDOM.dataContainer.querySelectorAll('.item-box')
        const itemObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((item) => {
                    if (item.isIntersecting) {
                        const type = item.target.getAttribute('type');
                        if (type === 'image') {
                            const imageSrc = item.target.getAttribute('data-item-src');
                            const imgEl = item.target.querySelector('img');
                            imgEl.src = imageSrc;
                            observer.unobserve(item.target);
                        }
                        item.target.style.visibility = 'visible'
                    } else {
                        item.target.style.visibility = 'hidden';
                    }
                })
            }, 
            {
                root: this.widgetDOM.dataContainer
            }
        );

        items.forEach(item => itemObserver.observe(item));
    }

    onDragOverHandler = (e) => {
        e.preventDefault();
    }

    onDropHandler = (e) => {
        e.preventDefault();
        console.log(e.dataTransfer.files && e.dataTransfer.files[0]);

        const fileToUpload = e.dataTransfer.files[0];
        const type = fileToUpload.type.replace(/\/.+/, '');
        const dataContainer = this.widgetDOM.dataContainer;

        if (type === 'image') {
            this.handleImage({ 
                file: fileToUpload, 
                type: type, 
                container: dataContainer 
            });
        }

        if (type === 'audio') {
            this.handleAudio({
                file: fileToUpload, 
                type: type, 
                container: dataContainer, 
                originalName: fileToUpload.name
            })
        }

        if (type === 'video') {
            this.handleVideo({
                file: fileToUpload, 
                type: type, 
                container: dataContainer, 
                originalName: fileToUpload.name
            })
        }
    }

    // обработка поиска контента
    onSearchFormHandler = (e) => {
        e.preventDefault();

        const text = this.widgetDOM.searchInput.value;
        const content = { content: text };

        this.searchContentCallback.forEach(async searchFunc => {
            const result = await searchFunc(content);

            if (result.success) {
                this.renderContent(result.items);
            }
        })
    }

    // Обрабатываем клик по одной из кнопок фильтра
    onFilterHandler = (e) => {
        const target = e.target;
        if (target.classList.contains('filter-btn')) {
            const type = target.getAttribute('data-button');

            this.filterContentCallback.forEach(async getFilteredItems => {
                const result = await getFilteredItems( {type: type} );

                this.renderContent(result.items);
            })
        }
    }

    // обрабатываем клик по item (открываем модальное окно)
    onItemClickHandler = (e) => {
        const target = e.target;
        const container = this.widgetDOM.widgetContainer;

        if (!target.closest('.item-box')) {
            return;
        }

        let item = target.closest('.item-box');
        let type = item.getAttribute('type');
        let id = item.getAttribute('id');
        let content;

        if (type === 'image' || type === 'audio' || type === 'video') {
            // отправляем запрос на сервер по id 
            this.getMediaContentCallback.forEach(async getMedia => {
                const result = await getMedia.call(null, { id: id });

                if (result.success && type === 'image') {
                    const widgetModal = new WidgetModal({ 
                        content: result.content, 
                        type: type, 
                        container: container, 
                        id: id, 
                        onClose: this.onWidgetModalClose, 
                        onDelete: this.onWidgetModalDelete, 
                        onDownload: this.onWidgetModalDownload 
                    });
                    widgetModal.renderModal();
                }

                if (result.success && (type === 'audio' || type === 'video') ) {
                    const originalName = item.querySelector('.item-title').textContent;
                    const widgetModal = new WidgetModal({ 
                        content: result.content, 
                        type: type, 
                        container: container, 
                        id: id, 
                        originalName: originalName,
                        onClose: this.onWidgetModalClose, 
                        onDelete: this.onWidgetModalDelete, 
                        onDownload: this.onWidgetModalDownload 
                    });
                    widgetModal.renderModal();
                }
            })
        }

        if (type === 'text' || type === 'link') {
            this.getTextContentCallback.forEach(async getTextContent => {
                const result = await getTextContent.call(null, { id: id });

                if (result.success) {
                    content = result.content;
                    const widgetModal = new WidgetModal({ 
                        content: content, 
                        type: type, 
                        id: id, 
                        container: container, 
                        onClose: this.onWidgetModalClose, 
                        onDelete: this.onWidgetModalDelete 
                    });
                    widgetModal.renderModal();
                }
            })
        }
    }

    // коллбек, который передаем в сущность WidgetModal для работы с закрытием окна и получением данных из модального окна
    onWidgetModalClose = (options) => {
        const id = options.id;
        const findedNode = this.findNodeInDataContainer(id);

        const isSameContent = this.compareTextContent(findedNode, options.content);
        if (isSameContent) {
            return;
        }
        // если контент был изменен, то отправляем запрос на сервер и меняем содержимое
        this.updateContentCallback.forEach(async updateRequest => {
            const result = await updateRequest.call(null, options);
            if (result.success) {
                const newItem = new Item(result.item).getItem();
                findedNode.replaceWith(newItem);
            }
        })
    }

    // коллбек, который передаем в сущность WidgetModal для работы с удалением данных из модального окна
    onWidgetModalDelete = (options) => {
        const id = options.id;
        const findedNode = this.findNodeInDataContainer(id);

        if (findedNode) {
            this.deleteContentCallback.forEach(async deleteReq => {
                const result = await deleteReq.call(null, {id: id});
    
                if (result.success) {
                    findedNode.remove();
                    this.createTooltip('File was successfully deleted')
                    this.checkItemQuantity();
                }
            })
        }

    }

    // коллбек, который передаем в сущность WidgetModal для работы с загрузкой данных из модального окна
    onWidgetModalDownload = (options) => {
        const id = options.id;
        const findedNode = this.findNodeInDataContainer(id);

        if (findedNode) {
            this.downloadContentCallback.forEach(async downloadFunc => {
                const result = await downloadFunc.call(null, {id: id});

                if (!result.ok) {
                    throw new Error('Error downloading file');
                }

                result.blob().then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const fileName = extractFileName(url);
                    const fileType = extractType(blob.type);

                    link.href = url;

                    link.setAttribute('download', `${fileName}.${fileType}`);
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                });
            })
        }
    }

    // ищем соответсвующий элемент в контейнере с элементами по id
    findNodeInDataContainer(id) {
        const dataContainer = this.widgetDOM.dataContainer;
        const findedNode = [...dataContainer.children].find(node => node.getAttribute('id') === id);
        return findedNode || null;
    }

    // метод для сравнения текста, чтобы определить были ли изменения
    compareTextContent(initialNode, newTextContent) {
        const oldTextEl = initialNode.querySelector('.item-text');
        const oldTextContent = oldTextEl.textContent;

        return oldTextContent === newTextContent;
    }

    // отрисовываем элементы
    renderContent = (itemsforRender) => {
        const dataContainer = this.widgetDOM.dataContainer;
        [...dataContainer.children].forEach(item => item.remove());
        
        if (!itemsforRender) {
            this.checkItemQuantity();
            return;
        }

        itemsforRender.forEach(item => {
            const renderedItem = new Item({ 
                content: item.content, 
                type: item.type, 
                id: item.id, 
                originalName: item?.originalName 
            });
            this.addItemToContainer(dataContainer, renderedItem.getItem());

            this.observeWidget();
        })

        this.checkItemQuantity();
    }

    // обработка нажатия на кнопку геолокации
    geolocationHandler = async() => {
        const textInput = this.widgetDOM.textInput
        if (navigator.geolocation) {
            try {
              const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  (data) => {
                    const { latitude, longitude } = data.coords;
                    resolve({ coords: { latitude, longitude }});
                  },
                  (err) => {
                    reject(err);
                  },
                  { enableHighAccuracy: true },
                );
              });
             textInput.value = `Ваша позиция: https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`;
            } catch (error) {
              console.error('Error getting  geolocation:', error);
              this.createError('Please, allow your browser to access location');
            }
        }
    }

    // создает элемент ошибки
    createError(text) {
        const errorEl = document.createElement('div');
        const remover = document.createElement('span');
        const errorText = document.createElement('p');
        errorEl.classList.add('error');
        errorText.classList.add('error-text');
        remover.classList.add('remove-error');

        errorText.textContent = text;

        errorEl.append(remover, errorText);

        remover.addEventListener('click', () => {
            errorEl.remove();
        })

        this.widgetDOM.widgetFooterEl.append(errorEl)
    }

    // создает подсказку после добавления элемента
    createTooltip(text) {
        console.log('in tooltip creation');
        const tooltipEl = document.createElement('div');
        const tooltipTextEl = document.createElement('p');
        tooltipEl.classList.add('tooltip');
        tooltipTextEl.classList.add('tooltip-text');

        tooltipTextEl.textContent = text;

        tooltipEl.append(tooltipTextEl);

        this.widgetDOM.widgetMain.append(tooltipEl)

        setTimeout(() => {
            tooltipEl.remove();
        }, 3000);
    }

    // метод для работы с текстом
    textHandler = () => {
        const inputValue = this.widgetDOM.textInput.value;
        const dataContainer = this.widgetDOM.dataContainer;

        this.addContentCallback.forEach(async sendText =>  {
            const result = await sendText.call(null, {content: inputValue, type: 'text'});
            if (result.success) {
                const content = result.itemData.content
                const itemInstance = new Item({ 
                    content: content, 
                    type: 'text', 
                    id: result.itemData.id 
                });
                this.addItemToContainer(dataContainer, itemInstance.getItem());
            }
            // обнуляем инпуты
            this.resetInputs();
            // кликаем на фильтр all
            this.clickAndFocusAllBtn();
            // оповещаем пользователя об успешной загрузке
            this.createTooltip('Text-file has successfully added');
            // считаем количество элементов
            this.checkItemQuantity();
        })
    }

    // обрабатываем события прикрепления файла
    changeHandler = () => {
        console.log('in chandeHandler', this.widgetDOM.attachInput.files[0]);
        this.hideOrDisplaySubmitUploadInputEl('display')

        this.widgetDOM.textInput.value = this.widgetDOM.attachInput.files[0].name;
        this.widgetDOM.textInput.setAttribute('disabled', true);
    }

    // вызываем клик по инпуту с типом file
    attachHandler = async() => {
        this.widgetDOM.attachInput.click();
    }

    // метод обработки отправки формы
    submitHandler = (e) => {
        e.preventDefault();

        const fileToUpload = this.widgetDOM.attachInput.files[0];
        console.log(fileToUpload)
        
        // проверяем есть ли загруженные файлы
        if (!fileToUpload) {
            this.textHandler(); // отправляем текст
            return;
        } 

        const type = fileToUpload.type.replace(/\/.+/, '');
        const dataContainer = this.widgetDOM.dataContainer;

        if (type === 'image') {
            this.handleImage({
                file: fileToUpload, 
                type: type, 
                container: dataContainer
            });
            this.hideOrDisplaySubmitUploadInputEl('hide');
        }

        if (type === 'audio') {
            this.handleAudio({
                file: fileToUpload, 
                type: type, 
                container: dataContainer, 
                originalName: fileToUpload.name
            })
            this.hideOrDisplaySubmitUploadInputEl('hide');
        }

        if (type === 'video') {
            this.handleVideo({
                file: fileToUpload, 
                type: type, 
                container: dataContainer, 
                originalName: fileToUpload.name
            })
            this.hideOrDisplaySubmitUploadInputEl('hide');
        }
    }

    // метод для работы с аудио-файлами
    handleAudio = (options) => {
        const type = options.type;
        const file = options.file;

        this.addContentCallback.forEach(async sendFile => {
            const result = await sendFile.call(null, {content: file, type: type});

            if (result.success) {
               const responseAudio = result.itemData.content;
               const responseType = result.itemData.type;
               const responseId = result.itemData.id;
               const responseName = result.itemData.originalName;

                this.createAudioItem({
                    id: responseId, 
                    content: responseAudio, 
                    type: responseType, 
                    originalName: responseName, 
                    container: options.container
                })

                this.createTooltip('Audio-file has successfully added');
                this.resetInputs();
                this.clickAndFocusAllBtn();
                this.checkItemQuantity();
            }
        })
    }

    // метод для работы с видео-файлами
    handleVideo = (options) => {
        const type = options.type;
        const file = options.file;

        this.addContentCallback.forEach(async sendFile => {
            const result = await sendFile.call(null, {content: file, type: type});

            if (result.success) {
               const responseVideo = result.itemData.content;
               const responseType = result.itemData.type;
               const responseId = result.itemData.id;
               const responseName = result.itemData.originalName;

               this.createVideoItem({
                    id: responseId, 
                    content: responseVideo, 
                    type: responseType, 
                    originalName: responseName, 
                    container: options.container
                })

               this.createTooltip('Video-file has successfully added');
               this.resetInputs();
               this.clickAndFocusAllBtn();
               this.checkItemQuantity();
            }
        })
    }

    // метод для работы с картинками
    handleImage = (options) => {
        const type = options.type;
        const file = options.file;

        this.addContentCallback.forEach(async sendFile =>  {
            const result = await sendFile.call(null, {content: file, type: type});

            if (result.success) {
               const responseImg = result.itemData.content;
               const responseType = result.itemData.type;
               const responseId = result.itemData.id;

                this.createImageItem({ imageUrl: responseImg, type: responseType, id: responseId, container: options.container })

                this.createTooltip('Image-file has successfully added');

                this.resetInputs();
                this.observeWidget();
                this.clickAndFocusAllBtn();
                this.checkItemQuantity();
            }
        })
    }

    // обработка клика по кнопке эмодзи
    emojiHandler = () => {
        let result;
        this.widgetDOM.emojiSelector.classList.toggle('active');
        this.emojiHandlerCallback.forEach(async getEmoji => {
            result = await getEmoji.call(null);
            result.forEach(item => {
                let span = document.createElement('span');
                span.classList.add('emoji');
                span.textContent = item.character;
                this.widgetDOM.emojiSelector.append(span);
            })
        });
    }

    // добавляем эмодзи
    addEmojiToInput = (e) => {
        const target = e.target;
        if (!target.classList.contains('emoji')) {
            return;
        }
        this.widgetDOM.textInput.value += target.textContent;
    }

    // закрываем меню с эмодзи
    closeEmojiSelector = (e) => {
        const target = e.target;
        if (target.classList.contains('emoji-icon') || target.classList.contains('emoji')) {
            return;
        }
        if (this.widgetDOM.emojiSelector.classList.contains('active')) {
            this.widgetDOM.emojiSelector.classList.remove('active');
        }
    }

    // создаем item с картинкой и добавляем в dataContainer
    createImageItem = (options) => {
        let itemInstance = new Item({ content: options.imageUrl, type: options.type, id: options.id });
        const itemEl = itemInstance.getItem();
        this.addItemToContainer(options.container, itemEl);
    }

    // создаем item с аудио-файлом и добавляем в dataContainer
    createAudioItem = (options) => {
        let itemInstance = new Item({ content: options.content, type: options.type, id: options.id, originalName: options.originalName });
        const itemEl = itemInstance.getItem();
        this.addItemToContainer(options.container, itemEl);
    }

    // создаем item с видео-файлом и добавляем в dataContainer
    createVideoItem = (options) => {
        let itemInstance = new Item({ content: options.content, type: options.type, id: options.id, originalName: options.originalName });
        const itemEl = itemInstance.getItem();
        this.addItemToContainer(options.container, itemEl);
    }

    // создаем модальное окно для вывода контента
    createModal = (options) => {
        const widgetModal = new WidgetModal(options);
        widgetModal.renderModal();
    }

    // открываем-закрываем input загрузки
    hideOrDisplaySubmitUploadInputEl = (state) => {
        if (state === 'display') {
            this.widgetDOM.footerIconsWrapper.setAttribute('hidden', '');
            this.widgetDOM.submitUploadInput.removeAttribute('hidden');
        }
        if (state === 'hide') {
            this.widgetDOM.footerIconsWrapper.removeAttribute('hidden');
            this.widgetDOM.submitUploadInput.setAttribute('hidden', '');
        }
    }

    // обнуляем inputs
    resetInputs = () => {
        this.widgetDOM.textInput.value = '';
        this.widgetDOM.textInput.removeAttribute('disabled');
        this.widgetDOM.attachInput.value = null;
    }

    // проверяем количество айтемов 
    checkItemQuantity = () => {
        const quantity = [...this.widgetDOM.dataContainer.children].length;
        this.widgetDOM.itemQuantity.textContent = quantity;
    }

    // нажимаем на фильтр all чтобы отображать сразу все элементы
    clickAndFocusAllBtn = () => {
        const allBtn = this.widgetDOM.filterButtonsWrapper.querySelector('.all-filter-btn')
        allBtn.click();
        allBtn.focus();
    }

    addItemToContainer(dataContainer, item) {
        dataContainer.append(item);
    }

    // далее идут методы для добавления соответствующих коллбеков
    addContentHandlerCallback(callback) {
        this.addContentCallback.push(callback);
    }

    deleteContentHandlerCallback(callback) {
        this.deleteContentCallback.push(callback);
    }

    updateContentHandlerCallback(callback) {
        this.updateContentCallback.push(callback);
    }

    downloadContentHandlerCallback(callback) {
        this.downloadContentCallback.push(callback);
    }

    getMediaContentHandlerCallback(callback) {
        this.getMediaContentCallback.push(callback);
    }

    getTextContentHandlerCallback(callback) {
        this.getTextContentCallback.push(callback);
    }

    addEmojiHandlerCallback(callback) {
        this.emojiHandlerCallback.push(callback);
    }

    getFilterContentHandlerCallback(callback) {
        this.filterContentCallback.push(callback);
    } 

    searchContentHandlerCallback(callback) {
        this.searchContentCallback.push(callback);
    }

    getAllContentHandlerCallback(callback) {
        this.getAllContentCallback.push(callback);
    }

}
