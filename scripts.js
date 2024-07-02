// scripts.js

// Fonction pour basculer le menu mobile
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Validation du formulaire de contact
function validateForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name === "" || email === "" || message === "") {
        alert("Tous les champs doivent être remplis.");
        return false;
    }

    if (!validateEmail(email)) {
        alert("Veuillez entrer une adresse email valide.");
        return false;
    }

    alert("Formulaire envoyé avec succès !");
    document.getElementById('contact-form').reset();
    return true;
}

// Fonction de validation d'email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Fonction d'animation au défilement
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        } else {
            reveals[i].classList.remove('active');
        }
    }
}

// Fonction pour le bouton de retour en haut
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Affichage du bouton de retour en haut
function toggleScrollToTopButton() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du clic sur le bouton de menu mobile
    document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);

    // Validation du formulaire de contact
    document.getElementById('contact-form').addEventListener('submit', validateForm);

    // Ajout de la fonction reveal pour l'animation au défilement
    window.addEventListener('scroll', reveal);

    // Gestion du bouton de retour en haut
    window.addEventListener('scroll', toggleScrollToTopButton);
    document.getElementById('scrollToTop').addEventListener('click', scrollToTop);

    // Affichage initial des éléments à révéler
    reveal();
});
