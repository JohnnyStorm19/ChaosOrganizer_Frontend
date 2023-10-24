import '../../css/modal.css';

/**
 * Создает модальное окно, в котором мы видим весь item
 *
 * @param options - объект, {
 *  container: container, (родительский элемент для модального окна)
 *  type: type, (тип контента: text, link, audio, video, image)
 *  content: content, (непосредственно контент: либо текстовый файл, либо ссылка)
 * }
 */

export default class WidgetModal {
    constructor(options) {
        this.container = options.container;
        this.type = options.type;
        this.content = options.content;
        this.isClosed = false;
    }

    renderModal() {
        let modal;

        if (this.type === 'text') {
            modal = this.createTextModal(this.type);
        }
        if (this.type === 'audio') {
            modal = this.createAudioModal();
        }
        if (this.type === 'video') {
            modal = this.createVideoModal();
        }
        if (this.type === 'image') {
            console.log('CREATE MODAL IMAGE');
            modal = this.createImageModal();
        }
        this.container.append(modal);

        this.showModal();
        this.addListeners();
    }

    addListeners = () => {
        const closeBtn = this.container.querySelector('.modal-close');

        closeBtn.addEventListener('click', this.onCloseModal);
    }

    createTextModal(type) {
        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalDeleteEl = document.createElement('span');
        const modalChangeEl = document.createElement('span');

        const modalContentBlock = document.createElement('div');
        const modalIconsBlock = document.createElement('div');

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalContentBlock.classList.add('modal-content-block');
        modalIconsBlock.classList.add('modal-icons-block');
        modalDeleteEl.classList.add('modal-delete');
        modalChangeEl.classList.add('modal-change');

        if (type === 'text') {
            const p = document.createElement('p');
            p.textContent = this.content;

            p.classList.add('modal-content-text');
            modalContentBlock.append(p);
        }
        if (type === 'link') {
            const a = document.createElement('a');
            a.setAttribute('href', this.content);

            a.classList.add('modal-content-link');
            modalContentBlock.append(a);
        }

        modalIconsBlock.append(modalChangeEl, modalDeleteEl, modalCloseEl);
        dialog.append(modalIconsBlock);
        dialog.append(modalContentBlock);

        return dialog;
    }

    createAudioModal() {
        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalContentBlock = document.createElement('div');
        const audio = document.createElement('audio');

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalContentBlock.classList.add('modal-content');
        audio.classList.add('modal-audio'); // ! добавить атрибуты!

        modalContentBlock.append(audio);
        dialog.append(modalCloseEl);
        dialog.append(modalContentBlock);

        return dialog
    }

    createVideoModal() {
        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalContentBlock = document.createElement('div');
        const video = document.createElement('video'); // ! добавить атрибуты!

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalContentBlock.classList.add('modal-content');
        video.classList.add('modal-video');

        modalContentBlock.append(video);
        dialog.append(modalCloseEl);
        dialog.append(modalContentBlock);

        return dialog;
    }

    createImageModal() {
        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalContentBlock = document.createElement('div');
        const image = document.createElement('img'); 

        image.setAttribute('src', this.content);

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalContentBlock.classList.add('modal-content');
        image.classList.add('modal-image');

        modalContentBlock.append(image);
        dialog.append(modalCloseEl);
        dialog.append(modalContentBlock);

        return dialog;
    }

    onCloseModal = () => {
        const modalContainer = this.container.querySelector('.modal-container');
        modalContainer.close();
        modalContainer.remove();
        this.isClosed = true;

        // ? и вот здесь я немного запутался
        // Получается мы можем после закрытия поменять свойство isClosed
        // В идеале передать измененные данные в WidgetApp (как?) или, например, добавить свойство isDeleted, соответственно если true 
        // из WidgetApp вызываем коллбек запроса на удаление
        // с изменением данных, возможно, похожая стратегия 
        // но как пробросить в WidgetApp всю информацию?
    }

    showModal = () => {
        const modalContainer = this.container.querySelector('.modal-container');
        modalContainer.showModal();
    }
}