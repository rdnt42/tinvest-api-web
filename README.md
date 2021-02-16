# tinkoff-invest-vue

**Что это за проект?**
Клиент для отображения портфеля броккерского аккаунта Тинькофф инвестиции.
Приложение посылает запрос на официальное API Тинькофф Инвестиции с токеном авторизации, подробнее об API [здесь](https://tinkoffcreditsystems.github.io/invest-openapi/)

**Как запустить?**
Для запуска нужен установленный [Node js](https://nodejs.org/en/)
И токен, который можно получить [в личном кабинете](https://tinkoffcreditsystems.github.io/invest-openapi/auth/) и там же отозвать.

В приложении токен используется только для запроса портфолио и больше никуда не отправляется.

В корневой папке проекта нужно добавить файл локальноего окружения .env.local и добавить в него переменную VUE_APP_SECRET_TOKEN=ваш_токен
Этот файл игнорурется гитом.

Далее запуск проекта.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
