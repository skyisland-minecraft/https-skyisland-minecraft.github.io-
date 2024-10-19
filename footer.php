<section id="contact" class="contact reveal">
    <div class="container">
        <h2>Contact</h2>
        <form id="contact-form" action="submit_form.php" method="post">
            <div class="form-group">
                <label for="name">Nom</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" required></textarea>
            </div>
            <button type="submit">Envoyer</button>
        </form>
    </div>
</section>

<footer>
    <div class="container">
        <p>&copy; 2024 Gove & MrWellsDev. Tous droits réservés.</p>
        <button id="scrollToTop">Retour en haut</button>
    </div>
</footer>

<script src="scripts.js"></script>
</body>
</html>
