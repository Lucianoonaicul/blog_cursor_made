const SCREENS = {
  HOME_PUBLIC: "home-public",
  LOGIN: "login",
  PROFILE: "profile",
  HOME_PRIVATE: "home-private",
  POST_DETAIL: "post-detail",
  CREATE_POST: "create-post",
  EDIT_POST: "edit-post",
};

const API_BASE_URL = "http://127.0.0.1:8000";

const state = {
  isAuthenticated: false,
  user: {
    name: "Visitante",
    email: "",
    bio: "",
  },
  posts: [],
  currentPostId: null,
  token: null,
};

function setAuthUI() {
  const authOnly = document.querySelectorAll(".nav-auth-only");
  const guestOnly = document.querySelectorAll(".nav-guest-only");
  const homeCta = document.querySelector(".home-login-cta");

  authOnly.forEach((el) => {
    el.style.display = state.isAuthenticated ? "inline-flex" : "none";
  });

  guestOnly.forEach((el) => {
    el.style.display = state.isAuthenticated ? "none" : "inline-flex";
  });

  if (homeCta instanceof HTMLButtonElement) {
    if (state.isAuthenticated) {
      homeCta.textContent = "Ver meus posts";
      homeCta.dataset.route = SCREENS.HOME_PRIVATE;
    } else {
      homeCta.textContent = "Fazer login";
      homeCta.dataset.route = SCREENS.LOGIN;
    }
  }
}

function showScreen(screen) {
  const sections = document.querySelectorAll(".screen");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  let screenId;
  switch (screen) {
    case SCREENS.HOME_PUBLIC:
      screenId = "screen-home-public";
      break;
    case SCREENS.LOGIN:
      screenId = "screen-login";
      break;
    case SCREENS.PROFILE:
      screenId = "screen-profile";
      break;
    case SCREENS.HOME_PRIVATE:
      screenId = "screen-home-private";
      break;
    case SCREENS.CREATE_POST:
      screenId = "screen-create-post";
      break;
    case SCREENS.POST_DETAIL:
      screenId = "screen-post-detail";
      break;
    case SCREENS.EDIT_POST:
      screenId = "screen-edit-post";
      break;
    default:
      screenId = "screen-home-public";
  }

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
}

function renderPostsList() {
  const list = document.getElementById("posts-list");
  if (!list) return;

  list.innerHTML = "";

  state.posts.forEach((post) => {
    const li = document.createElement("li");
    li.className = "post-list-item";
    li.dataset.postId = String(post.id);

    const title = document.createElement("div");
    title.className = "post-list-title";
    title.textContent = post.title;

    const meta = document.createElement("div");
    meta.className = "post-list-meta";
    meta.textContent = `${post.author} · ${post.date}`;

    const excerpt = document.createElement("div");
    excerpt.className = "post-list-meta";
    excerpt.textContent = post.excerpt;

    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(excerpt);

    li.addEventListener("click", () => {
      openPostDetail(post.id);
    });

    list.appendChild(li);
  });
}

async function fetchPostDetail(postId) {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!res.ok) {
      throw new Error("Erro ao buscar post");
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function openPostDetail(postId) {
  let post = state.posts.find((p) => p.id === postId);
  if (!post) {
    post = await fetchPostDetail(postId);
    if (!post) return;
  }

  state.currentPostId = postId;

  const titleEl = document.getElementById("post-detail-title");
  const metaEl = document.getElementById("post-detail-meta");
  const bodyEl = document.getElementById("post-detail-body");

  if (titleEl) titleEl.textContent = post.title;
  if (metaEl) metaEl.textContent = `${post.author} · ${post.date}`;
  if (bodyEl) bodyEl.textContent = post.body;

   // Botão de edição: apenas para o autor autenticado
  const editBtn = document.getElementById("edit-post-btn");
  const canEdit =
    state.isAuthenticated && state.user.name && state.user.name === post.author;

  if (editBtn instanceof HTMLButtonElement) {
    editBtn.style.display = canEdit ? "inline-flex" : "none";
    editBtn.onclick = () => openEditPost(post.id);
  }

  showScreen(SCREENS.POST_DETAIL);
}

function openEditPost(postId) {
  const post = state.posts.find((p) => p.id === postId);
  if (!post) return;

  state.currentPostId = postId;

  const titleInput = document.getElementById("edit-post-title");
  const bodyInput = document.getElementById("edit-post-body");
  const messageEl = document.getElementById("edit-post-message");

  if (messageEl) {
    messageEl.textContent = "";
  }

  if (titleInput instanceof HTMLInputElement) {
    titleInput.value = post.title;
  }
  if (bodyInput instanceof HTMLTextAreaElement) {
    bodyInput.value = post.body;
  }

  showScreen(SCREENS.EDIT_POST);
}

async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`);
    if (!res.ok) {
      throw new Error("Erro ao carregar posts");
    }
    const data = await res.json();
    state.posts = data;
    renderPostsList();
  } catch (error) {
    console.error(error);
  }
}

function initCreatePost() {
  const form = document.getElementById("create-post-form");
  const titleInput = document.getElementById("create-post-title");
  const bodyInput = document.getElementById("create-post-body");
  const messageEl = document.getElementById("create-post-message");

  if (!(form instanceof HTMLFormElement)) return;
  if (!(titleInput instanceof HTMLInputElement)) return;
  if (!(bodyInput instanceof HTMLTextAreaElement)) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) return;

    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao criar post");
        }
        return res.json();
      })
      .then((newPost) => {
        // Atualiza a lista em memória e UI
        state.posts.push(newPost);
        renderPostsList();

        titleInput.value = "";
        bodyInput.value = "";

        if (messageEl) {
          messageEl.textContent = "Post criado com sucesso (em memória).";
        }

        // Vai para a lista de posts
        showScreen(SCREENS.HOME_PRIVATE);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function initEditPost() {
  const form = document.getElementById("edit-post-form");
  const titleInput = document.getElementById("edit-post-title");
  const bodyInput = document.getElementById("edit-post-body");
  const messageEl = document.getElementById("edit-post-message");

  if (!(form instanceof HTMLFormElement)) return;
  if (!(titleInput instanceof HTMLInputElement)) return;
  if (!(bodyInput instanceof HTMLTextAreaElement)) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.currentPostId == null) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) return;

    fetch(`${API_BASE_URL}/posts/${state.currentPostId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao atualizar post");
        }
        return res.json();
      })
      .then((updatedPost) => {
        const index = state.posts.findIndex((p) => p.id === updatedPost.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        renderPostsList();

        if (messageEl) {
          messageEl.textContent = "Post atualizado com sucesso (em memória).";
        }

        openPostDetail(updatedPost.id);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function initNav() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const route = target.dataset.route;
    if (!route) return;

    if (route === SCREENS.HOME_PRIVATE && !state.isAuthenticated) {
      showScreen(SCREENS.LOGIN);
      return;
    }

    switch (route) {
      case SCREENS.HOME_PUBLIC:
        showScreen(SCREENS.HOME_PUBLIC);
        break;
      case SCREENS.LOGIN:
        showScreen(SCREENS.LOGIN);
        break;
      case SCREENS.PROFILE:
        if (state.isAuthenticated) {
          showScreen(SCREENS.PROFILE);
        } else {
          showScreen(SCREENS.LOGIN);
        }
        break;
      case SCREENS.CREATE_POST:
        if (state.isAuthenticated) {
          showScreen(SCREENS.CREATE_POST);
        } else {
          showScreen(SCREENS.LOGIN);
        }
        break;
      case SCREENS.HOME_PRIVATE:
        if (state.isAuthenticated) {
          showScreen(SCREENS.HOME_PRIVATE);
        } else {
          showScreen(SCREENS.LOGIN);
        }
        break;
      default:
        break;
    }
  });
}

function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    if (!(emailInput instanceof HTMLInputElement)) return;
    if (!(passwordInput instanceof HTMLInputElement)) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      return;
    }

    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Falha no login");
        }
        return res.json();
      })
      .then((data) => {
        state.isAuthenticated = true;
        state.user.email = data.email;
        state.user.name = data.name;
        state.user.bio = data.bio ?? "";
        state.token = data.token;

        setAuthUI();
        fetchPosts();
        showScreen(SCREENS.HOME_PRIVATE);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function initProfile() {
  const form = document.getElementById("profile-form");
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const bioInput = document.getElementById("profile-bio");
  const messageEl = document.getElementById("profile-message");

  if (!(form instanceof HTMLFormElement)) return;
  if (!(nameInput instanceof HTMLInputElement)) return;
  if (!(emailInput instanceof HTMLInputElement)) return;
  if (!(bioInput instanceof HTMLTextAreaElement)) return;

  function loadProfileFromState() {
    nameInput.value = state.user.name || "";
    emailInput.value = state.user.email || "";
    bioInput.value = state.user.bio || "";
  }

  function fetchProfile() {
    if (!state.isAuthenticated) return;

    fetch(`${API_BASE_URL}/profile`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Perfil não encontrado");
        }
        return res.json();
      })
      .then((data) => {
        state.user.name = data.name;
        state.user.email = data.email;
        state.user.bio = data.bio ?? "";
        loadProfileFromState();
      })
      .catch(() => {
        loadProfileFromState();
      });
  }

  form.addEventListener("focusin", () => {
    if (!state.isAuthenticated) return;
    fetchProfile();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      name: nameInput.value.trim() || state.user.name,
      email: emailInput.value.trim() || state.user.email,
      bio: bioInput.value.trim(),
    };

    fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao salvar perfil");
        }
        return res.json();
      })
      .then((data) => {
        state.user.name = data.name;
        state.user.email = data.email;
        state.user.bio = data.bio ?? "";

        fetchPosts();

        if (messageEl) {
          messageEl.textContent = "Perfil salvo (via backend Python, sem persistência ainda).";
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function initLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    state.isAuthenticated = false;
    state.user = {
      name: "Visitante",
      email: "",
      bio: "",
    };
    state.token = null;

    setAuthUI();
    showScreen(SCREENS.HOME_PUBLIC);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("App do blog inicializado.");

  setAuthUI();
  initNav();
  initLogin();
  initProfile();
  initLogout();
  initCreatePost();
  initEditPost();
  fetchPosts();

  // Tela inicial: home pública
  showScreen(SCREENS.HOME_PUBLIC);
});

