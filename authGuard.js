// Verifica che l'utente sia autenticato prima di caricare il contenuto della dashboard.
(function() {
    console.log("1. Esecuzione del controllo di autenticazione (Auth Guard)...");

    // Recupera i dati utente che abbiamo salvato nel login.js
    const userData = localStorage.getItem('userData');
    
    // Se i dati utente non esistono, reindirizza alla pagina di login.
    if (!userData) {
        console.warn("Accesso negato: Dati utente non trovati. Reindirizzamento a index.html.");
        // Utilizziamo history.replaceState per impedire all'utente di tornare indietro
        // alla dashboard con il pulsante "back" del browser.
        window.history.replaceState({}, '', 'index.html');
        window.location.href = 'index.html'; 
        return; // Termina l'esecuzione dello script
    }

    console.log("2. Utente autenticato. Dati trovati. Il caricamento della dashboard può procedere.");

    // Se l'utente è autenticato, possiamo procedere a inizializzare la dashboard
    // nel file dashboard.js (che verrà eseguito subito dopo questo).
})();
