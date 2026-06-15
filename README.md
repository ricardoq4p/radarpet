# RadarPet

MVP de cadastro e localização de pets com upload de imagens no Cloudinary, frontend estático e persistência em MongoDB Atlas via Netlify Functions.

## Variáveis de ambiente

Configurar no Netlify:

- `MONGODB_URI`
- `MONGODB_DB`

## Deploy automático no Netlify

O projeto está configurado para deploy automático por Git no branch `main`.

No painel do Netlify, confirme apenas estes pontos:

1. O site está conectado ao repositório `ricardoq4p/radarpet`.
2. O branch de produção está definido como `main`.
3. As variáveis `MONGODB_URI` e `MONGODB_DB` estão salvas em `Site configuration > Environment variables`.

Com isso, cada novo `git push` no `main` dispara um novo deploy automaticamente.

## Como rodar localmente

1. Instale as dependências:
   - `npm install`
2. Faça login no Netlify CLI, se necessário:
   - `npx netlify login`
3. Inicie o ambiente local com Functions:
   - `npx netlify dev`
4. Abra o endereço exibido pelo Netlify Dev no navegador.
5. Cadastre um pet com foto para validar o fluxo completo.

## Fluxo de persistência

1. O usuário seleciona a foto no formulário.
2. O frontend envia a imagem para o Cloudinary.
3. O Cloudinary devolve a `fotoUrl`.
4. O frontend envia os dados do pet para a Function `create-pet`.
5. A Function grava o documento na collection `pets` do MongoDB Atlas.
6. Ao abrir o app, a Function `list-pets` busca os registros e alimenta a listagem.

O `localStorage` permanece apenas como fallback offline do navegador.

## Funções serverless

- `/.netlify/functions/list-pets`
- `/.netlify/functions/create-pet`
