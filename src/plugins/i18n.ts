import Vue from 'vue'
import VueI18n, { LocaleMessages } from 'vue-i18n'

Vue.use(VueI18n)

let loaded = false;

function loadLocaleMessages(): LocaleMessages {
  const locales = require.context('./../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages: LocaleMessages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

function loadFile(url: string) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.ontimeout = xhr.onerror = reject;
    xhr.onloadend = function (e) {
      const data = JSON.parse(this.response);
      resolve(data);
    };
    xhr.send();
  });
}

function loadLocale(resolve: Function, reject: Function) {
  loadFile('/locales/index.json').then((data: any) => {
    let list: Array<any> = [];
    data.forEach((item: any) => {
      const rex = item.locale.match(/([A-Za-z0-9-_]+)\./i);
      if (rex && rex.length > 1) {
        item.key = rex[1];
      }
      list.push(loadFile("/locales/" + item.locale));
    });

    Promise.all(list).then(_list => {
      let res: any = {};
      _list.forEach((item: any, index: number) => {
        res[data[index]['key']] = item;
        resolve(res);
      });
    }).catch(err => reject);
  });
}

function localeMessages(): LocaleMessages {
  const messages: LocaleMessages = {};
  if (loaded) {
    loadLocale((data: any) => {
      for (let key in data) {
        messages[key] = data[key];
      }
      return messages;
    }, (error: any) => {
      console.warn('加载失败, 使用系统默认语言');
      return loadLocaleMessages();
    });
  } else {
    return loadLocaleMessages();
  }
  return messages;
}


export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: localeMessages()
})
