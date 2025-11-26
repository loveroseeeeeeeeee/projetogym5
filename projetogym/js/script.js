// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Redireciona para a página principal ao recarregar, exceto login/cadastro
    const currentPath = window.location.pathname;
    if (
        !currentPath.endsWith('index.html') &&
        currentPath !== '/' &&
        !currentPath.endsWith('login.html') &&
        !currentPath.endsWith('cadastro.html')
    ) {
        window.location.href = 'index.html';
    }

    // Exemplo: logout (pode ser adaptado para seu sistema)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Exemplo: checagem de autenticação (pode ser expandido)
    // if (!localStorage.getItem('token') && currentPath !== '/login.html' && currentPath !== '/cadastro.html') {
    //     window.location.href = 'login.html';
    // }
});

// Adicione ao final do login.html ou em um arquivo JS incluído na página de login
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const errorDiv = document.getElementById('login-error');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulação: sempre mostra o erro
            errorDiv.textContent = "este usuário não está cadastrado";
            errorDiv.style.display = "block";
        });
    }
});

// Cadastro: redireciona para index.html após cadastro bem-sucedido
document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.querySelector('form.cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Aqui você pode adicionar a lógica real de cadastro
            window.location.href = '../index.html';
        });
    }
});