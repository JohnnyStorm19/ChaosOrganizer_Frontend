import '../../css/widgetApp.css';
import Item from './Item';
import WidgetDOM from './WidgetDOM';
import WidgetModal from './WidgetModal';

export default class WidgetApp {
    constructor(containerEl) {
        this.containerEl = containerEl;
        this.widgetDOM = new WidgetDOM(containerEl);

        this.addContentCallback = []; // коллбек функции добавления контента
        this.deleteContentCallback = []; // коллбек функции удаления контента
        this.updateContentCallback = []; // коллбек функции изменения контента
        this.emojiHandlerCallback = []; // коллбек функции отправки запроса на эмодзи
        this.getMediaContentCallback = []; // коллбек функции на получение медиа-контента
        this.getTextContentCallback = []; // коллбек функции на получение текстового контента
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
                        <input type="text" id="search-input" class="widget-input search-input" placeholder="I'm looking for...">
                    </form>
                    <div class="filter-buttons-wrapper">
                        <button type="button" class="filter-btn all-filter-btn">all</button>
                        <button type="button" class="filter-btn audio-filter-btn">audio</button>
                        <button type="button" class="filter-btn video-filter-btn">video</button>
                        <button type="button" class="filter-btn text-filter-btn">text</button>
                        <button type="button" class="filter-btn links-filter-btn">links</button>
                        <button type="button" class="filter-btn images-filter-btn">images</button>
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
                            <button type="submit" class="input-icon send-icon"></button>
                        </div>
                        <input class="submit-form-upload" type="submit" value="Загрузить файл" hidden>
                    </form>    
                </footer>
            </div>
        `
    }

    // отрисовываем виджет
    render() {
        this.bindToDOM(this.containerEl, this.getWidgetAppMarkup());
        this.widgetDOM.getElementsFromMarkup();

        this.addListeners();
    }

    // добавляем в разметку и находим необходимые элементы
    bindToDOM(container, elementMarkup) {
        container.insertAdjacentHTML('afterbegin', elementMarkup);
    }

    // добавляем слушателей событий
    addListeners() {
        const widgetDOM = this.widgetDOM;

        widgetDOM.widgetContainer.addEventListener('click', this.closeEmojiSelector);
        widgetDOM.dataContainer.addEventListener('click', this.onItemClickHandler);
        widgetDOM.textForm.addEventListener('submit', this.submitHandler);
        widgetDOM.attachIcon.addEventListener('click', this.attachHandler);
        widgetDOM.attachInput.addEventListener('change', this.changeHandler);
        widgetDOM.emojiIcon.addEventListener('click', this.emojiHandler);
        widgetDOM.emojiSelector.addEventListener('click', this.addEmojiToInput);
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
            // отправляем запрос на сервер по id картинки
            this.getMediaContentCallback.forEach(async getMedia => {
                const result = await getMedia.call(null, { id: id });

                if (result.success) {
                    content = result.mediaURL;
                    const widgetModal = new WidgetModal({ content: content, type: type, container: container });
                    widgetModal.renderModal();
                }
            })
        }

        if (type === 'text' || type === 'link') {
            this.getTextContentCallback.forEach(async getTextContent => {
                const result = await getTextContent.call(null, { id: id });

                if (result.success) {
                    content = result.content;
                    // const widgetModal = new WidgetModal({ content: content, type: type, container: container });
                    // widgetModal.renderModal();
                    this.createModal({ content: content, type: type, container: container })
                }
            })
        }
    }

    // метод для работы с текстом
    textHandler = () => {
        const inputValue = this.widgetDOM.textInput.value;
        const dataContainer = this.widgetDOM.dataContainer;

        this.addContentCallback.forEach(async sendText =>  {
            const result = await sendText.call(null, {content: inputValue, type: 'text'});
            if (result.success) {
                const content = result.itemData.content
                const itemInstance = new Item({ content: content, type: 'text', id: result.itemData.id });
                this.addItemToContainer(dataContainer, itemInstance.getItem());
            }
            // обнуляем инпуты
            this.resetInputs();
            this.checkItemQuantity();
        })
    }

    // обрабатываем события прикрепления файла
    changeHandler = () => {
        console.log(this.widgetDOM.attachInput.files[0]);
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
        
        // проверяем есть ли загруженные файлы
        if (!fileToUpload) {
            this.textHandler(); // отправляем текст
            return;
        } 

        const type = fileToUpload.type.replace(/\/.+/, '');
        const dataContainer = this.widgetDOM.dataContainer;

        if (type === 'image') {

            this.handleImage({ file: fileToUpload, type: type, container: dataContainer });

            this.hideOrDisplaySubmitUploadInputEl('hide');
        }
    }

    // метод для работы с картинками
    handleImage = (options) => {
        const type = options.type;
        const file = options.file;

        // 
        this.addContentCallback.forEach(async sendFile =>  {
            const result = await sendFile.call(null, {content: file, type: type});

            if (result.success) {
               const responseImg = result.itemData.imgUrl;
               const responseType = result.itemData.type;
               const responseId = result.itemData.id;

                this.createImageItem({ imageUrl: responseImg, type: responseType, id: responseId, container: options.container })

                this.resetInputs();
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

    addItemToContainer(dataContainer, item) {
        dataContainer.append(item);
    }

    addContentHandlerCallback(callback) {
        this.addContentCallback.push(callback);
    }

    deleteContentHandlerCallback(callback) {
        this.deleteContentCallback.push(callback);
    }

    updateContentHandlerCallback(callback) {
        this.updateContentCallback.push(callback);
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

    // проверяем количество айтемов 
    checkItemQuantity = () => {
        const quantity = [...this.widgetDOM.dataContainer.children].length;
        this.widgetDOM.itemQuantity.textContent = quantity;
    }

}
