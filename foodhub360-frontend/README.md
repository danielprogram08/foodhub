# FoodHub360 MVP

Aplicacao front-end estatica em HTML, CSS, JavaScript e Bootstrap. O MVP nao depende mais do back-end Java/Spring Boot: os dados e a sessao ficam no `localStorage` do navegador por meio do arquivo `backend.js`.

## O que esta implementado

- Login e logout local para Cliente, Atendente, Entregador e Administrador.
- Cadastro de cliente.
- Cadastro administrativo de Atendente, Entregador e Administrador.
- Cardapio, pedidos, confirmacao do atendente, envio para entrega e confirmacao do entregador.
- Dashboard administrativo com vendas concluidas e sugestao de IA estatica.
- Persistencia local no navegador, suficiente para demonstracao de MVP.

## Logins de teste

- Admin: `admin@foodhub360.com` / `admin123`
- Atendente: `atendente@foodhub360.com` / `123456`
- Entregador: `entregador@foodhub360.com` / `123456`
- Cliente: `ana.cliente@foodhub360.com` / `123456`

## Rodar localmente

Como e um site estatico, voce pode abrir o `index.html` diretamente. Se preferir servir por HTTP:

```bash
node server.js
```

Depois acesse:

```text
http://127.0.0.1:5500
```

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub, por exemplo `foodhub360-mvp`.
2. Copie para o repositorio os arquivos da pasta `foodhub360-frontend`:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `backend.js`
   - `server.js` opcional para teste local
   - pasta `assets/`
3. Faca o commit e envie para o GitHub:

```bash
git init
git add .
git commit -m "Publica MVP FoodHub360 estatico"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/foodhub360-mvp.git
git push -u origin main
```

4. No GitHub, abra o repositorio e va em `Settings > Pages`.
5. Em `Build and deployment`, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Clique em `Save`.
7. Aguarde o GitHub gerar a URL, normalmente:

```text
https://SEU-USUARIO.github.io/foodhub360-mvp/
```

## Observacoes importantes

- GitHub Pages nao executa Java, Spring Boot, Node.js server ou banco de dados. Ele hospeda apenas arquivos estaticos.
- Por isso o MVP usa `localStorage` no navegador como persistencia.
- Os dados ficam no navegador de cada usuario. Em uma versao de producao, sera necessario voltar para uma API real e banco de dados.
- Para restaurar os dados iniciais, entre como Cliente e use a tela `Preferencias`, ou rode no console:

```js
FoodHubBackend.reset()
localStorage.removeItem('foodhub360.session')
```
