import '../../css/modal.css';
import { checkLink, createStringWithLinkEl } from './helpers/checkLink';
import { extractFormat } from './helpers/extractAudioFormat';
/**
 * Создает модальное окно, в котором мы видим весь item
 *
 * @param options - объект
 *  options.container: родительский элемент для модального окна
 *  options.type: тип контента: text, link, audio, video, image
 *  options.content: непосредственно контент: либо текстовый файл, либо ссылка
 *  options.id: id элемента
 *  options.originalName: наименование элемента (только у аудио или видео)
 *  options.onClose: коллбек, срабатывает при закрытии модального окна
 *  options.onDelete: коллбек, срабатывает при согласии удаления файла
 *  options.onDownload: коллбек, срабатывает при загрузке файла
 */

export default class WidgetModal {
    constructor(options) {
        this.container = options.container;
        this.type = options.type;
        this.content = options.content;
        this.id = options.id;
        this.originalName = options.originalName || null;

        this.onClose = options.onClose;
        this.onDelete = options.onDelete;
        this.onDownload = options.onDownload;
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
            modal = this.createImageModal();
        }
        this.container.append(modal);

        this.showModal();
        this.addListeners();
    }

    addListeners = () => {
        const closeBtn = this.container.querySelector('.modal-close');
        const deleteBtn = this.container.querySelector('.modal-delete');
        const changeBtn = this.container.querySelector('.modal-change') || null;
        const downloadBtn = this.container.querySelector('.modal-download') || null;

        if (changeBtn) {
            changeBtn.addEventListener('click', this.onChangeModal);
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', this.onDownloadModal);
        }

        closeBtn.addEventListener('click', this.onCloseModal);
        deleteBtn.addEventListener('click', this.onDeleteIconClick);
    }

    createTextModal() {
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

        if (checkLink(this.content)) {
            const p = createStringWithLinkEl(this.content);

            p.classList.add('modal-content-text');
            modalContentBlock.append(p);
            this.contentTextEl = p;
        } else {
            const p = document.createElement('p');
            p.textContent = this.content;

            p.classList.add('modal-content-text');
            modalContentBlock.append(p);

            this.contentTextEl = p;
        }

        this.modalContentBlockEl = modalContentBlock;

        modalIconsBlock.append(modalChangeEl, modalDeleteEl, modalCloseEl);
        dialog.append(modalIconsBlock);
        dialog.append(modalContentBlock);

        return dialog;
    }

    createAudioModal() {
        const fileExtension = extractFormat(this.content);

        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalDeleteEl = document.createElement('span');
        const modalIconsBlock = document.createElement('div');
        const modalContentBlock = document.createElement('div');
        const modalContenTitle = document.createElement('h3');
        const audio = document.createElement('audio');
        const source = document.createElement('source');

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalDeleteEl.classList.add('modal-delete');
        modalContentBlock.classList.add('modal-content');
        modalContenTitle.classList.add('item-modal-title');
        modalIconsBlock.classList.add('modal-icons-block');
        
        audio.classList.add('modal-audio');

        source.setAttribute('src', this.content);
        source.setAttribute('type', `${this.type}/${fileExtension}`);
        audio.setAttribute('controls', 'controls');

        audio.append(source);
        audio.volume = 0.5;

        modalContenTitle.textContent = this.originalName;
        modalContentBlock.append(audio, modalContenTitle);
        modalIconsBlock.append(modalDeleteEl, modalCloseEl);
        dialog.append(modalIconsBlock, modalContentBlock);

        return dialog
    }

    createVideoModal() {
        const fileExtension = extractFormat(this.content);

        const dialog = document.createElement('dialog');
        const modalCloseEl = document.createElement('span');
        const modalDeleteEl = document.createElement('span');
        const modalIconsBlock = document.createElement('div');
        const modalContentBlock = document.createElement('div');
        const modalContenTitle = document.createElement('h3');
        const video = document.createElement('video');
        const source = document.createElement('source');

        dialog.classList.add('modal-container'); 
        modalCloseEl.classList.add('modal-close');
        modalDeleteEl.classList.add('modal-delete');
        modalContentBlock.classList.add('modal-content');
        modalContenTitle.classList.add('item-modal-title');
        modalIconsBlock.classList.add('modal-icons-block');
        
        video.classList.add('modal-video');

        source.setAttribute('src', this.content);
        source.setAttribute('type', `${this.type}/${fileExtension}`);
        video.setAttribute('controls', 'controls');
        video.setAttribute('width', '500');
        video.setAttribute('height', '300');

        video.append(source);
        modalContenTitle.textContent = this.originalName;

        modalContentBlock.append(video, modalContenTitle);
        modalIconsBlock.append(modalDeleteEl, modalCloseEl);
        dialog.append(modalIconsBlock, modalContentBlock);

        return dialog
    }

    createImageModal() {
        const dialog = document.createElement('dialog');
        const modalIconsBlock = document.createElement('div');
        const modalCloseEl = document.createElement('span');
        const modalDeleteEl = document.createElement('span');
        const modalDownloadEl = document.createElement('span');
        const modalContentBlock = document.createElement('div');
        const image = document.createElement('img'); 

        image.setAttribute('src', this.content);

        dialog.classList.add('modal-container'); 
        modalIconsBlock.classList.add('modal-icons-block');
        modalCloseEl.classList.add('modal-close');
        modalDeleteEl.classList.add('modal-delete');
        modalDownloadEl.classList.add('modal-download');
        modalContentBlock.classList.add('modal-content');
        image.classList.add('modal-image');

        modalContentBlock.append(image);
        modalIconsBlock.append(modalDownloadEl, modalDeleteEl, modalCloseEl);

        dialog.append(modalIconsBlock);
        dialog.append(modalContentBlock);

        return dialog;
    }

    onCloseModal = () => {
        const modalContainer = this.container.querySelector('.modal-container');
        if (this.type === 'text') {
            let textContent = this.contentTextEl.textContent.trim();
            this.onClose({ content: textContent, id: this.id, type: this.type });
        }
        modalContainer.close();
        modalContainer.remove();
    }

    onDeleteModal = () => {
        const modalContainer = this.container.querySelector('.modal-container');
        const deleteModal = this.container.querySelector('.delete-confirmation-block');
        this.onDelete({ id: this.id });

        modalContainer.close();
        deleteModal.close();
        deleteModal.remove();
        modalContainer.remove();
    }

    onDeleteIconClick = () => {
        this.createDeleteConfirmationBlock()
    }

    onChangeModal = () => {
        if (this.changeBlockEl) {
            this.changeBlockEl.remove();
        }
        this.contentTextEl.classList.add('inactive');
        this.createChangeBlock();

    }

    onDownloadModal = () => {
        this.onDownload({ id: this.id });
    }

    showModal = () => {
        const modalContainer = this.container.querySelector('.modal-container');
        modalContainer.showModal();
    }

    createChangeBlock = () => {
        const changeBlock = document.createElement('div');
        const textArea = document.createElement('textarea');
        const btnContainer = document.createElement('div');
        const closeBtn = document.createElement('button');
        const acceptBtn = document.createElement('button');

        changeBlock.classList.add('modal-change-block');
        textArea.classList.add('modal-text-change');
        btnContainer.classList.add('modal-btns-container');
        closeBtn.classList.add('modal-change-closeBtn');
        acceptBtn.classList.add('modal-change-acceptBtn');

        textArea.value = this.contentTextEl.textContent;
        textArea.setAttribute('rows', 5);
        textArea.setAttribute('cols', 40);
        textArea.setAttribute('autofocus', '');

        this.changeContentTextAreaEl = textArea;
        closeBtn.textContent = 'Cancel';
        acceptBtn.textContent = 'Accept';


        btnContainer.append(closeBtn, acceptBtn);
        changeBlock.append(textArea, btnContainer);

        this.modalContentBlockEl.append(changeBlock);

        this.changeBlockEl = changeBlock;

        this.addChangeBlockListeners();
    }

    createDeleteConfirmationBlock = () => {
        const deleteConfirmationContainer = document.createElement('dialog');
        const deleteConfirmationTitleEl = document.createElement('h3');
        const deleteConfirmationBtnsBlock = document.createElement('div');
        const deleteConfirmationCancelBtn = document.createElement('button');
        const deleteConfirmationAcceptBtn = document.createElement('button');

        deleteConfirmationContainer.classList.add('delete-confirmation-block');
        deleteConfirmationTitleEl.classList.add('delete-confirmation-title');
        deleteConfirmationBtnsBlock.classList.add('delete-confirmation-btns-block');
        deleteConfirmationCancelBtn.classList.add('delete-confirmation-cancel');
        deleteConfirmationAcceptBtn.classList.add('delete-confirmation-accept');

        deleteConfirmationTitleEl.textContent = 'Are you sure you want to delete an item?';
        deleteConfirmationCancelBtn.textContent = 'No';
        deleteConfirmationAcceptBtn.textContent = 'Yes';

        deleteConfirmationBtnsBlock.append(deleteConfirmationCancelBtn, deleteConfirmationAcceptBtn);
        deleteConfirmationContainer.append(deleteConfirmationTitleEl, deleteConfirmationBtnsBlock);

        this.container.append(deleteConfirmationContainer);

        this.addDeleteBlockListeners(deleteConfirmationContainer);

        deleteConfirmationContainer.showModal();
    }

    addChangeBlockListeners = () => {
        const closeBtn = this.container.querySelector('.modal-change-closeBtn');
        const acceptBtn = this.container.querySelector('.modal-change-acceptBtn');

        closeBtn.addEventListener('click', () => {
            this.changeBlockEl.remove();
            this.contentTextEl.classList.remove('inactive');
        })

        acceptBtn.addEventListener('click', () => {
            this.contentTextEl.textContent = this.changeContentTextAreaEl.value;

            if (!this.contentTextEl.textContent.trim().length) {
                console.log('Пустая строка!!!')
                return; // ! стилизовать ошибку
            }

            this.contentTextEl.classList.remove('inactive');
            this.changeBlockEl.remove();
        })
    }

    addDeleteBlockListeners = (modalEl) => {

        const cancelBtn = modalEl.querySelector('.delete-confirmation-cancel');
        const acceptBtn = modalEl.querySelector('.delete-confirmation-accept');

        cancelBtn.addEventListener('click', () => {
            modalEl.remove();
        })

        acceptBtn.addEventListener('click', () => {
            this.onDeleteModal();
        })
    }
}