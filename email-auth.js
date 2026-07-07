"use strict";

(function setupRadarPetEmailAuth() {
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
    const emailInput = document.getElementById("email-auth-email");
    const passwordInput = document.getElementById("email-auth-password");
    const email = String(emailInput?.value || "").trim();
    const password = String(passwordInput?.value || "");

    if (!email || !password) {
      showAuthMessage("Informe e-mail e senha para continuar.", "error");
      return;
    }

    if (password.length < 6) {
      showAuthMessage("A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }

    const auth = window.firebase.auth();
    setEmailAuthBusy(true, mode === "signup" ? "Criando conta..." : "Entrando...");

    try {
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

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("email-auth-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      authenticateWithEmail("signin");
    });

    document.querySelectorAll("[data-email-auth-action]").forEach((button) => {
      button.addEventListener("click", () => authenticateWithEmail(button.dataset.emailAuthAction));
    });
  });
})();
