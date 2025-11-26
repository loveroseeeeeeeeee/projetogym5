// JavaScript para funcionalidades do frontend NEXON FITNESS

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidades do menu de perfil
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (!isExpanded) {
                profileMenu.classList.add('show');
                this.setAttribute('aria-expanded', 'true');
            } else {
                profileMenu.classList.remove('show');
                this.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
                profileMenu.classList.remove('show');
                profileBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar menu com tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && profileMenu.classList.contains('show')) {
                profileMenu.classList.remove('show');
                profileBtn.setAttribute('aria-expanded', 'false');
                profileBtn.focus();
            }
        });
    }

    // Funcionalidades da navbar
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Handle scroll event to shrink/expand navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Check initial scroll position (in case page is loaded scrolled down)
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navbar.contains(event.target);

        if (!isClickInsideNav && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
});
