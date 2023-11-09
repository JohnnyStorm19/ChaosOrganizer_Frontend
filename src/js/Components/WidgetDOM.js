/**
 * Сущность для работы с первоначально созданным DOM
 *
 * @param container - элемент с классом .container
 */

export default class WidgetDOM {
    constructor(container) {
        this.container = container;
    }

    getElementsFromMarkup() {  
        this.widgetContainer = this.container.querySelector('.widget-container');
        this.searchForm = this.container.querySelector('.search-form');
        this.attachForm = this.container.querySelector('.attach-form');
        this.textForm = this.container.querySelector('.text-form');

        this.searchInput = this.container.querySelector('.search-input');
        this.textInput = this.container.querySelector('.text-input');
        this.attachInput = this.container.querySelector('.attach-input');
        this.submitUploadInput = this.container.querySelector('.submit-form-upload');

        this.attachIcon = this.container.querySelector('.attach-icon');
        this.emojiIcon = this.container.querySelector('.emoji-icon');
        this.sendIcon = this.container.querySelector('.send-icon');
        this.geolocationIcon = this.container.querySelector('.geolocation-icon');
        this.sendSearchIcon = this.container.querySelector('.send-search-icon');

        this.filterButtonsWrapper = this.container.querySelector('.filter-buttons-wrapper');
        this.itemQuantity = this.container.querySelector('.item-quantity');
        this.widgetMain = this.container.querySelector('.main');
        this.dataContainer = this.container.querySelector('.data-container');
        this.footerIconsWrapper = this.container.querySelector('.icons-wrapper');
        this.emojiSelector = this.container.querySelector('.emoji-selector');
        this.widgetFooterEl = this.container.querySelector('.widget-footer');
    }
}