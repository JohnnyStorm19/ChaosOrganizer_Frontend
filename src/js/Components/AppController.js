import WidgetApi from "./WidgetApi";
import WidgetApp from "./WidgetApp";
import { URL, emojiUrl } from './globals.js';

/**
 * Сущность для управления виджетом. Взаимодействует с сущностями WidgetApi и WidgetApp
 * Прокидывает коллбеки из WidgetApi в WidgetApp
 * @constructor
 * @param container - контейнер
 * 
 */

export default class AppController {
    constructor(container) {
        this.container = container;
        this.widgetApp = new WidgetApp(container);
        this.widgetApi = new WidgetApi(URL, emojiUrl);
    }

    start() {
        this.widgetApp.render();

        this.widgetApp.addContentHandlerCallback(this.addContentHandler);
        this.widgetApp.addEmojiHandlerCallback(this.addEmojiHandler);
        this.widgetApp.updateContentHandlerCallback(this.updateTextHandler);
        this.widgetApp.deleteContentHandlerCallback(this.deleteContentHandler);
        this.widgetApp.downloadContentHandlerCallback(this.downloadContentHandler);
        this.widgetApp.getMediaContentHandlerCallback(this.getMediaHandler);
        this.widgetApp.getTextContentHandlerCallback(this.getTextHandler);
        this.widgetApp.getFilterContentHandlerCallback(this.filterContentHandler);
        this.widgetApp.searchContentHandlerCallback(this.searchContentHandler);
        this.widgetApp.getAllContentHandlerCallback(this.getAllContentHandler);

        this.widgetApp.getAllContentFromServer();
    }

    addContentHandler = async(options) => {
        const content = options.content;
        const type = options.type;
        
        const result = await this.widgetApi.addContent({
            content: content,
            type: type
        })
        return result;
    }

    getMediaHandler = async(options) => {
        const id = options.id;

        const result = await this.widgetApi.getMediaFile(id);
        return result;
    }

    getTextHandler = async(options) => {
        const id = options.id;

        const result = await this.widgetApi.getTextFile(id);
        return result;
    }

    updateTextHandler = async(options) => {
        const result = await this.widgetApi.updateFile(options);
        return result;
    }

    deleteContentHandler = async(options) => {
        const result = await this.widgetApi.deleteFile(options);
        return result;
    }

    downloadContentHandler = async(options) => {
        const result = await this.widgetApi.downloadFile(options);
        return result;
    }

    filterContentHandler = async(options) => {
        const result = await this.widgetApi.filterFiles(options);
        return result;
    }

    searchContentHandler = async(options) => {
        const result = await this.widgetApi.searchFiles(options);
        return result;
    }

    getAllContentHandler = async() => {
        const result = await this.widgetApi.getAllFiles();
        return result;
    }

    addEmojiHandler = async() => {
        return await this.widgetApi.getEmoji();
    }
}