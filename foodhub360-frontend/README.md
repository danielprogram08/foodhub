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