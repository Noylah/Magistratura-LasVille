// CONFIGURAZIONE
const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// Variabile per il client
let supabaseClient;

document.addEventListener('DOMContentLoaded', () => {
    console.log("1. DOM Caricato. Inizializzazione...");

    // ===============================================
    // ✅ INIZIALIZZAZIONE ROBUSTA DEL CLIENT
    // ===============================================
    // Controlliamo se la libreria è disponibile nell'oggetto globale window
    if (!window.supabase) {
        console.error("ERRORE CRITICO: Oggetto 'window.supabase' non trovato. La CDN non è stata caricata.");
        alert("Errore tecnico: Libreria Supabase non trovata. Controlla la connessione internet o il file index.html.");
        return;
    }

    try {
        // Creazione del client usando la funzione esposta globalmente
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("2. Client Supabase inizializzato con successo.");
    } catch (e) {
        console.error("Errore durante la creazione del client:", e);
        return;
    }

    // ===============================================
    // GESTIONE UI E FORM
    // ===============================================
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message-box');

    const showMessage = (message, isError = true) => {
        if (!messageBox) return;
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
    };

    const hideMessage = () => {
        if (messageBox) messageBox.style.display = 'none';
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();

            console.log("3. Tentativo di invio form...");

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!username || !password) {
                showMessage("Inserisci tutti i campi.");
                return;
            }

            // ===============================================
            // LOGIN SUPABASE
            // ===============================================
            try {
                // Usiamo l'input 'username' come email per Supabase
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: username,
                    password: password,
                });

                if (error) {
                    console.warn("Login fallito:", error.message);
                    showMessage("Credenziali non valide.");
                    return;
                }

                if (!data || !data.user) {
                    showMessage("Errore imprevisto: Nessun dato utente ricevuto.");
                    return;
                }

                console.log("4. Login Supabase riuscito:", data.user.id);

                // ===============================================
                // LOGICA RUOLI (SIMULATA PER ORA)
                // ===============================================
                let nomeUtente = "Utente";
                let ruoloUtente = "Cittadino"; // Default

                // Logica semplice basata sulla stringa inserita per testare i ruoli
                if (username.toLowerCase().includes('procuratore')) {
                    nomeUtente = "Micheal Ross";
                    ruoloUtente = "Procuratore Generale";
                } else if (username.toLowerCase().includes('admin')) {
                    nomeUtente = "System Admin";
                    ruoloUtente = "Admin";
                } else if (username.toLowerCase().includes('giudice')) {
                    nomeUtente = "On. Rossi";
                    ruoloUtente = "Giudice";
                }

                // ===============================================
                // SALVATAGGIO DATI LOCALE
                // ===============================================
                const userData = {
                    id: data.user.id,
                    nome: nomeUtente,
                    ruolo: ruoloUtente,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('userData', JSON.stringify(userData));
                console.log("5. Dati salvati in localStorage. Reindirizzamento...");

                showMessage("Accesso riuscito! Reindirizzamento...", false);

                // Ritardo minimo per permettere all'utente di leggere il messaggio (opzionale)
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);

            } catch (err) {
                console.error("Errore imprevisto nel processo di login:", err);
                showMessage("Errore di sistema durante il login.");
            }
        });
    } else {
        console.warn("Elemento 'loginForm' non trovato nel DOM.");
    }
});
