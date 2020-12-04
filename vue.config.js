module.exports = {
    lintOnSave: false,
    productionSourceMap: process.env.NODE_ENV === "production",
    pluginOptions: {
        i18n: {
            locale: 'cn',
            fallbackLocale: 'cn',
            localeDir: 'locales',
            enableInSFC: true
        }
    }
};