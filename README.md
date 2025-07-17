# 🏡 Sistema de Gestão de Aluguéis e Boletos

Este projeto é uma API desenvolvida com **NestJS**, utilizando **MongoDB** como banco de dados e **RabbitMQ** para gerenciar filas de eventos. Seu objetivo é facilitar a **gestão de imóveis para aluguel**, além de automatizar o **envio de boletos** para os inquilinos.

⚠️ **Projeto em construção!** Algumas funcionalidades ainda estão em desenvolvimento.

---

## 🚀 Tecnologias

- **[NestJS](https://nestjs.com/)** — Framework Node.js para construir aplicações escaláveis
- **[MongoDB](https://www.mongodb.com/)** — Banco de dados NoSQL orientado a documentos
- **[RabbitMQ](https://www.rabbitmq.com/)** — Message broker para comunicação assíncrona
- **[Docker](https://www.docker.com/)** — Para orquestração de containers

---

## 🧰 Funcionalidades

- Cadastro, edição, listagem e remoção de usuários (inquilinos ou proprietários)
- Integração com filas (RabbitMQ) para eventos futuros, como geração/envio de boletos
- Arquitetura modular e escalável com boas práticas de desenvolvimento

---

## ⚙️ Como rodar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```

2. Inicie a aplicação com Docker:
   ```bash
   docker-compose up --build
   ```

3. A API estará disponível em:
   ```
   http://localhost:3000
   ```
---

## 📌 TODOs

- [x] CRUD de usuários
- [ ] CRUD de imóveis
- [ ] Integração completa com boletos (geração/envio)
- [ ] Autenticação e autorização
- [ ] Documentação com Swagger

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 💬 Contato

Fique à vontade para contribuir ou tirar dúvidas!

> Desenvolvido com 💻 por Otávio Valadão.
