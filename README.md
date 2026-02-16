# Meu Blog (HTML + JS + FastAPI)

Projeto de blog simples com:

- Frontend estático em HTML, CSS e JavaScript.
- Backend em Python 3.12 com FastAPI (sem persistência por enquanto).

## Estrutura

- `index.html`, `style.css`, `script.js`: SPA simples com telas de Home, Login, Perfil, Meus posts, Detalhe de post e Novo post.
- `backend/app.py`: API FastAPI com endpoints para health, posts, login e perfil.
- `backend/requirements.txt`: dependências do backend.

## Como rodar o backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python app.py
```

API disponível em `http://127.0.0.1:8000` (Swagger em `/docs`).

## Como rodar o frontend

Na raiz do projeto:

```bash
python -m http.server 5500
```

Depois abra `http://127.0.0.1:5500/index.html` no navegador.

