# RadarPet

MVP de divulgacao e localizacao de pets com upload de imagens no Cloudinary, frontend estatico e persistencia em MongoDB Atlas via Netlify Functions.

## Variaveis de ambiente

Configurar no Netlify:

- `MONGODB_URI`
- `MONGODB_DB`

## Login social

O projeto agora possui uma tela de login pronta para Firebase Authentication com:

- Google
- Facebook
- GitHub
- modo visitante para exploracao rapida

### Como ativar

1. Crie um projeto no Firebase.
2. Ative `Authentication`.
3. Habilite os provedores `Google`, `Facebook` e `GitHub`.
4. Em `Authentication > Settings > Authorized domains`, adicione o dominio do Netlify e o dominio local usado no desenvolvimento.
5. Preencha o arquivo `auth-config.js` com as credenciais do app web do Firebase.
6. Se usar Facebook ou GitHub, cadastre no console de cada provedor a URL de callback mostrada pelo Firebase.

### Arquivo de configuracao

Edite `auth-config.js` e substitua os placeholders por valores reais:

```js
window.RADARPET_AUTH_CONFIG = {
  firebase: {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    appId: "SEU_APP_ID",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  },
  providers: {
    google: true,
    facebook: true,
    github: true,
  },
};
```

## Deploy automatico no Netlify

O projeto esta configurado para deploy automatico por Git no branch `main`.

No painel do Netlify, confirme estes pontos:

1. O site esta conectado ao repositorio `ricardoq4p/radarpet`.
2. O branch de producao esta definido como `main`.
3. As variaveis `MONGODB_URI` e `MONGODB_DB` estao salvas em `Site configuration > Environment variables`.

Com isso, cada novo `git push` no `main` dispara um novo deploy automaticamente.

## Como rodar localmente

1. Instale as dependencias:
   - `npm install`
2. Faca login no Netlify CLI, se necessario:
   - `npx netlify login`
3. Preencha o `auth-config.js`.
4. Inicie o ambiente local com Functions:
   - `npx netlify dev`
5. Abra o endereco exibido pelo Netlify Dev no navegador.
6. Valide login, listagem de pets e cadastro com upload de foto.

## Fluxo de persistencia

1. O usuario entra com uma conta social ou no modo visitante.
2. O frontend envia a imagem para o Cloudinary.
3. O Cloudinary devolve a `fotoUrl`.
4. O frontend envia os dados do pet para a Function `create-pet`.
5. A Function grava o documento na collection `pets` do MongoDB Atlas.
6. Ao abrir o app, a Function `list-pets` busca os registros e alimenta a listagem.

O `localStorage` permanece apenas como fallback offline do navegador.

## Funcoes serverless

- `/.netlify/functions/list-pets`
- `/.netlify/functions/create-pet`
- `/.netlify/functions/get-pet-contact`
