import '../../css/item.css';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default class Item {
    constructor(options) {
        this.date = dayjs().format('DD.MM.YYYY, HH:mm');
        this.content = options.content;
        this.type = options.type; 
        this.id = options.id;
    }

    getItem() {
        const itemBoxEl = document.createElement('div');

        itemBoxEl.classList.add('item-box');
        itemBoxEl.setAttribute('id', this.id);
        itemBoxEl.setAttribute('type', this.type);

        if (this.type === 'text') {
            const p = document.createElement('p');
            p.classList.add('item-text');

            p.textContent = this.content;
            itemBoxEl.append(p);
        }

        if (this.type === 'image') {
            const imageEl = document.createElement('img')
            imageEl.src = this.content;

            itemBoxEl.append(imageEl);
        }

        return itemBoxEl;
    }
}