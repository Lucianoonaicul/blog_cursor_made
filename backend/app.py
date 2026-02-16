from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr


class Post(BaseModel):
    id: int
    title: str
    author: str
    date: str
    excerpt: str
    body: str


class PostCreate(BaseModel):
    title: str
    body: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    name: str
    email: EmailStr
    bio: Optional[str] = ""
    token: str


class Profile(BaseModel):
    name: str
    email: EmailStr
    bio: Optional[str] = ""


app = FastAPI(title="Meu Blog API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


posts_db: List[Post] = [
    Post(
        id=1,
        title="Começando meu blog com HTML, CSS e JS",
        author="Visitante",
        date="12/02/2026",
        excerpt="Um pequeno passo com um 'hello world' estático...",
        body=(
            "Este é um exemplo de post. No futuro, o conteúdo pode vir de uma API em Python. "
            "Por enquanto, mantemos tudo simples no frontend para focar em aprender a estrutura "
            "básica do projeto."
        ),
    ),
    Post(
        id=2,
        title="Próximos passos: integrando com Python",
        author="Visitante",
        date="13/02/2026",
        excerpt="Planejando o backend em Python para o blog...",
        body=(
            "Aqui poderíamos descrever como será a API de posts, autenticação, e como o frontend "
            "vai conversar com esse backend usando fetch. Tudo isso pode ser evoluído aos poucos."
        ),
    ),
]

current_profile: Profile | None = None


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/posts", response_model=List[Post])
def list_posts() -> List[Post]:
    return posts_db


@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int) -> Post:
    for post in posts_db:
        if post.id == post_id:
            return post
    raise HTTPException(status_code=404, detail="Post não encontrado")


@app.post("/posts", response_model=Post, status_code=201)
def create_post(payload: PostCreate) -> Post:
    new_id = max((post.id for post in posts_db), default=0) + 1
    author = current_profile.name if current_profile is not None else "Visitante"
    new_post = Post(
        id=new_id,
        title=payload.title,
        author=author,
        date="hoje",
        excerpt=(payload.body[:100] + "...") if len(payload.body) > 100 else payload.body,
        body=payload.body,
    )
    posts_db.append(new_post)
    return new_post


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    if not payload.password:
        raise HTTPException(status_code=400, detail="Senha obrigatória")

    name = payload.email.split("@")[0] or "Usuário"
    token = f"fake-token-for-{name}"

    global current_profile
    if current_profile is None:
        current_profile = Profile(name=name, email=payload.email, bio="")

    return LoginResponse(name=name, email=payload.email, bio=current_profile.bio, token=token)


@app.get("/profile", response_model=Profile)
def get_profile() -> Profile:
    if current_profile is None:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return current_profile


@app.put("/profile", response_model=Profile)
def update_profile(profile: Profile) -> Profile:
    global current_profile
    current_profile = profile
    for i, post in enumerate(posts_db):
        posts_db[i] = Post(**{**post.model_dump(), "author": profile.name})
    return current_profile


if __name__ == "__main__":
    import uvicorn

    # Executando a partir da pasta "backend", o módulo é simplesmente "app"
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

