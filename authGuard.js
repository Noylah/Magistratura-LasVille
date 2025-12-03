// Verifica che l'utente sia autenticato prima di caricare il contenuto della dashboard.
(function() {
    console.log("1. Esecuzione del controllo di autenticazione (Auth Guard)...");

    // Recupera i dati utente che abbiamo salvato nel login.js
    const userData = localStorage.getItem('userData');
    
    // Se i dati utente non esistono O sono vuoti, reindirizza alla pagina di login.
    if (!userData || userData === 'undefined' || userData === 'null') {
        console.warn("Accesso negato: Dati utente non trovati o non validi. Reindirizzamento a index.html.");
        
        // Pulizia del token di autenticazione (potrebbe essere rimasto un token Supabase)
        localStorage.removeItem('userData');
        localStorage.removeItem('supabase.auth.token'); 

        // Reindirizzamento
        window.history.replaceState({}, '', 'index.html');
        window.location.href = 'index.html'; 
        return; // Termina l'esecuzione dello script
    }

    console.log("2. Utente autenticato. Dati trovati. Il caricamento della dashboard può procedere.");

    // Se l'utente è autenticato, possiamo procedere a inizializzare la dashboard
    // nel file dashboard.js (che verrà eseguito subito dopo questo).
})();
