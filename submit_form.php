<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $message = htmlspecialchars(trim($_POST['message']));

    if (!empty($name) && !empty($email) && !empty($message)) {
        // Envoyer un email ou enregistrer les informations
        $to = "admin@skyisland.com"; // Remplace avec l'adresse email de destination
        $subject = "Nouveau message de contact";
        $body = "Nom: $name\nEmail: $email\nMessage:\n$message";

        if (mail($to, $subject, $body)) {
            echo "Votre message a été envoyé avec succès!";
        } else {
            echo "Erreur lors de l'envoi du message.";
        }
    } else {
        echo "Veuillez remplir tous les champs.";
    }
}
?>
