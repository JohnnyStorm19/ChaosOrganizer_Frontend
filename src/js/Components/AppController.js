import WidgetApi from "./WidgetAPI";
import WidgetApp from "./WidgetApp";
import { URL, emojiUrl } from './globals.js';

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
        this.widgetApp.getMediaContentHandlerCallback(this.getMediaHandler);
        this.widgetApp.getTextContentHandlerCallback(this.getTextHandler);
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

    addEmojiHandler = async() => {
        return await this.widgetApi.getEmoji();
    }
}