import '../../css/item.css';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { checkLink, createStringWithLinkEl } from './helpers/checkLink';

/**
 * Сущность для создания элементов (плитки) 
 *
 * @param options - объект
 * options.date: дата создания элемента
 * options.content: либо ссылка на элемент, либо текстовый контент
 * options.type: тип элемента
 * options.id: id элемента
 * options.originalName: наименование элемента (только для аудио/видео)
 */

export default class Item {
    constructor(options) {
        this.date = dayjs().format('DD.MM.YYYY, HH:mm');
        this.content = options.content;
        this.type = options.type; 
        this.id = options.id;

        this.originalName = options.originalName;
    }

    getItem() {
        const itemBoxEl = document.createElement('div');

        itemBoxEl.classList.add('item-box');
        itemBoxEl.setAttribute('id', this.id);
        itemBoxEl.setAttribute('type', this.type);

        if (this.type === 'text') {
            let p = document.createElement('p');

            if (checkLink(this.content)) {
                p = createStringWithLinkEl(this.content);
                p.classList.add('item-text');
                itemBoxEl.append(p);
            } else {
                p.classList.add('item-text');
                p.textContent = this.content;
                itemBoxEl.append(p);
            }
        }

        if (this.type === 'image') {
            const imageEl = document.createElement('img')
            imageEl.src = '';
            itemBoxEl.setAttribute('data-item-src', this.content);

            itemBoxEl.append(imageEl);
        }

        if (this.type === 'audio') {
            const audioEl = document.createElement('div');
            const audioTitle = document.createElement('h3');
            const modalLogoBlock = document.createElement('span');

            audioEl.classList.add('item-block-audio');
            audioTitle.classList.add('item-title');
            modalLogoBlock.classList.add('modal-logo-block');
            modalLogoBlock.classList.add('audio-logo');

            audioTitle.textContent = this.originalName;

            audioEl.append(audioTitle);
            itemBoxEl.append(modalLogoBlock, audioEl);
        }
        
        if (this.type === 'video') {
            const videoEl = document.createElement('div');
            const videoTitle = document.createElement('h3');
            const modalLogoBlock = document.createElement('span');

            videoEl.classList.add('item-block-video');
            videoTitle.classList.add('item-title');
            modalLogoBlock.classList.add('modal-logo-block');
            modalLogoBlock.classList.add('video-logo');

            videoTitle.textContent = this.originalName;

            videoEl.append(videoTitle);
            itemBoxEl.append(modalLogoBlock, videoEl);
        }

        return itemBoxEl;
    }
}