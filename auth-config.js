window.RADARPET_AUTH_CONFIG = {
  firebase: {
    apiKey: "AIzaSyDF5T447l3BHmghS1ILMG8Rzpa_UDTyMe4",
    authDomain: "stupendous-tarsier-d89d21.netlify.app",
    projectId: "radarpet-e9dd6",
    appId: "1:512204788210:web:965246c77637b05e3e5b6b",
    messagingSenderId: "512204788210",
  },
  googleClientId: "512204788210-dc5vbmdcoeqmcskrbcaat8n6i7fvj3qr.apps.googleusercontent.com",
  providers: {
    google: true,
    email: true,
    facebook: false,
    github: false,
  },
};

(function setupRadarPetEmailAccess() {
  function showAuthMessage(message, type = "default") {
    const target = document.getElementById("email-auth-message");
    if (target) {
      target.textContent = message;
      target.dataset.type = type;
    }

    const toast = document.getElementById("toast");
    if (toast && message) {
      toast.textContent = message;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 2600);
    }
  }

  function getReadableEmailAuthError(error) {
    const code = String(error?.code || "");

    if (code.includes("email-already-in-use")) {
      return "Este e-mail ja possui cadastro. Use Entrar com e-mail.";
    }
    if (code.includes("invalid-email")) {
      return "Informe um e-mail valido.";
    }
    if (code.includes("weak-password")) {
      return "Use uma senha com pelo menos 6 caracteres.";
    }
    if (code.includes("wrong-password") || code.includes("invalid-credential")) {
      return "E-mail ou senha incorretos.";
    }
    if (code.includes("user-not-found")) {
      return "Nao encontramos uma conta com este e-mail. Crie sua conta primeiro.";
    }
    if (code.includes("operation-not-allowed")) {
      return "Ative o provedor Email/Password no Firebase Authentication.";
    }
    if (code.includes("too-many-requests")) {
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    }

    return "Nao foi possivel concluir o acesso por e-mail agora.";
  }

  function setEmailAuthBusy(isBusy, label) {
    document.querySelectorAll("[data-email-auth-action]").forEach((button) => {
      button.disabled = isBusy;
    });

    const primaryButton = document.querySelector('[data-email-auth-action="signin"]');
    if (primaryButton) {
      primaryButton.textContent = isBusy ? label : "Entrar com e-mail";
    }
  }

  async function authenticateWithEmail(mode) {
    if (!window.firebase?.auth) {
      showAuthMessage("Firebase Auth ainda nao carregou. Atualize a pagina e tente novamente.", "error");
      return;
    }

    const form = document.getElementById("email-auth-form");
    const email = String(document.getElementById("email-auth-email")?.value || "").trim();
    const password = String(document.getElementById("email-auth-password")?.value || "");

    if (!email || !password) {
      showAuthMessage("Informe e-mail e senha para continuar.", "error");
      return;
    }

    if (password.length < 6) {
      showAuthMessage("A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }

    setEmailAuthBusy(true, mode === "signup" ? "Criando conta..." : "Entrando...");

    try {
      const auth = window.firebase.auth();
      if (mode === "signup") {
        await auth.createUserWithEmailAndPassword(email, password);
        showAuthMessage("Conta criada e login realizado.", "success");
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        showAuthMessage("Login realizado com sucesso.", "success");
      }
      form?.reset();
    } catch (error) {
      console.error(error);
      showAuthMessage(getReadableEmailAuthError(error), "error");
    } finally {
      setEmailAuthBusy(false);
    }
  }

  function ensureEmailStyles() {
    if (document.getElementById("radarpet-email-auth-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "radarpet-email-auth-styles";
    style.textContent = `
      .auth-divider {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #b96a37;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .auth-divider::before,
      .auth-divider::after {
        content: "";
        height: 1px;
        flex: 1;
        background: #ffd4b5;
      }
      .email-auth-form {
        display: grid;
        gap: 10px;
      }
      .email-auth-form label {
        display: grid;
        gap: 5px;
        color: #2d2d2d;
        font-size: 11px;
        font-weight: 900;
      }
      .email-auth-form input {
        width: 100%;
        border: 1.5px solid #ffd4b5;
        border-radius: 16px;
        background: white;
        color: #2d2d2d;
        padding: 12px 14px;
        outline: none;
        font: inherit;
        font-size: 14px;
        font-weight: 800;
      }
      .email-auth-form input:focus {
        border-color: #ffbf93;
        box-shadow: 0 0 0 3px rgba(255, 122, 47, 0.12);
      }
      .email-auth-submit {
        justify-content: center;
        background: linear-gradient(135deg, #ff7a2f, #ff9854);
        color: white;
        border-color: transparent;
        box-shadow: 0 10px 24px rgba(255, 122, 47, 0.18);
      }
      .email-auth-create {
        width: 100%;
        border: 1.5px solid #ffd4b5;
        border-radius: 18px;
        padding: 12px 14px;
        background: #fff3ea;
        color: #ff7a2f;
        font-family: "Nunito", sans-serif;
        font-size: 13px;
        font-weight: 900;
        cursor: pointer;
      }
      .email-auth-submit:disabled,
      .email-auth-create:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      .email-auth-message {
        min-height: 18px;
        color: #8a4b22;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.45;
      }
      .email-auth-message[data-type="error"] { color: #dc2626; }
      .email-auth-message[data-type="success"] { color: #16a34a; }
    `;
    document.head.appendChild(style);
  }

  function injectEmailForm() {
    ensureEmailStyles();

    document.querySelectorAll('[data-auth-provider="facebook"], [data-auth-provider="github"]').forEach((button) => {
      button.remove();
    });

    const providerList = document.getElementById("auth-provider-list");
    if (!providerList || document.getElementById("email-auth-form")) {
      return;
    }

    const intro = document.querySelector(".auth-card-copy p");
    if (intro) {
      intro.textContent = "Entre com Google ou crie uma conta com e-mail e senha para acessar o feed, publicar pets e acompanhar a comunidade com seguranca.";
    }

    providerList.insertAdjacentHTML("beforeend", `
      <div class="auth-divider"><span>ou acesse com e-mail</span></div>
      <form class="email-auth-form" id="email-auth-form">
        <label>
          E-mail
          <input id="email-auth-email" type="email" autocomplete="email" placeholder="seuemail@exemplo.com" required>
        </label>
        <label>
          Senha
          <input id="email-auth-password" type="password" autocomplete="current-password" placeholder="Minimo 6 caracteres" minlength="6" required>
        </label>
        <button class="auth-provider email-auth-submit" type="submit" data-email-auth-action="signin">Entrar com e-mail</button>
        <button class="email-auth-create" type="button" data-email-auth-action="signup">Criar conta com e-mail</button>
        <div class="email-auth-message" id="email-auth-message" role="status"></div>
      </form>
    `);

    const form = document.getElementById("email-auth-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      authenticateWithEmail("signin");
    });

    document.querySelectorAll("[data-email-auth-action]").forEach((button) => {
      if (button.type === "submit") {
        return;
      }
      button.addEventListener("click", () => authenticateWithEmail(button.dataset.emailAuthAction));
    });
  }

  document.addEventListener("DOMContentLoaded", injectEmailForm);
})();
