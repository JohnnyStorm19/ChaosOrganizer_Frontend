/**
 * Отправляет запросы на сервер и возвращает ответы сервера
 * @constructor
 * @param apiUrl - адрес сервера, куда отправляем запрос. Лежит в файле globals.js
 * @param emojiUrl - адрес сервера, куда отправляем запрос для эмоджи.Лежит в файле globals.js
 * 
 */

export default class WidgetApi {
    constructor(apiUrl, emojiUrl) {
        this.apiUrl = apiUrl;
        this.emojiUrl = emojiUrl;
    }

/**
  * Отправляет POST-запрос на сервер с данными
  * Принимает options { type: тип контента('text' || 'link || 'audio' || 'video' || 'image'), content: сам контент }
  * @return {json} ответ сервера.
  */
    async addContent(options) {
      let request;
      
      if (options.type === 'text' || options.type === 'link') {
        request = fetch(this.apiUrl + '/item/add/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify( { content: options.content, type: options.type } )
          })
      }

      if (options.type === 'image') {
        let formSent = new FormData()
        formSent.append('content', options.content);

        request = fetch(this.apiUrl + '/item/add/image', {
          method: 'POST',
          keepalive: true,
          body: formSent
        })
      }

      const result = await request;
      if (!result.ok) {
        console.error('Error');
        return;
      }
      const json = await result.json();
      console.log(json, 'in widgetAPI')
      return json;
    }

    async getEmoji() {
      const result = await fetch(this.emojiUrl);
      if (!result.ok) {
        console.error('Error');
        return;
      }
      return result.json();
    }

    async getMediaFile(id) {
      const result = await fetch(this.apiUrl + `/item/getmedia?id=${id}`);
      if (!result.ok) {
        console.error('Error');
        return;
      }
      return result.json();
    }

    async getTextFile(id) {
      const result = await fetch(this.apiUrl + `/item/gettext?id=${id}`);
      if (!result.ok) {
        console.error('Error');
        return;
      }
      return result.json();
    }
}