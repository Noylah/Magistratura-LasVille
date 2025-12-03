// CONFIGURAZIONE
const SUPABASE_URL = 'INSERISCI_QUI_IL_TUO_SUPABASE_URL'; // Da sostituire
const SUPABASE_ANON_KEY = 'INSERISCI_QUI_LA_TUA_ANON_KEY'; // Da sostituire

// Variabili globali per il client e il box messaggi
let supabaseClient;
let messageBox; 

// Funzione helper per mostrare messaggi
const showMessage = (message, isError = true) => {
    if (!messageBox) {
        console.error(`Tentativo di mostrare messaggio: ${message}`);
        return;
    }
    messageBox.textContent = message;
    messageBox.className = isError ? 'message-box error' : 'message-box success';
    messageBox.style.display = 'block';
};

const hideMessage = () => {
    if (messageBox) messageBox.style.display = 'none';
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("1. DOM Caricato. Inizializzazione...");

    // Otteniamo l'elemento per i messaggi
    messageBox = document.getElementById('message-box');

    // ===============================================
    // ✅ INIZIALIZZAZIONE ROBUSTA DEL CLIENT
    // ===============================================
    // Controllo esplicito se la libreria Supabase è stata caricata
    if (!window.supabase) {
        console.error("ERRORE CRITICO: Oggetto 'window.supabase' non trovato. Verifica l'ordine degli script in index.html!");
        showMessage("ERRORE CRITICO: Servizio di autenticazione non disponibile. Controlla il file index.html.", true);
        return;
    }

    try {
        // Inizializzazione del client Supabase
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("2. Client Supabase inizializzato con successo.");
    } catch (e) {
        console.error("Errore durante la creazione del client:", e);
        showMessage("ERRORE: Impossibile avviare il servizio di autenticazione.", true);
        return;
    }

    // ===============================================
    // GESTIONE FORM
    // ===============================================
    const loginForm = document.getElementById('loginForm');

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
                // Supabase richiede un campo 'email', qui usiamo l'input 'username'
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
                let ruoloUtente = "Cittadino"; 

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
                // 5. SALVATAGGIO DATI LOCALE (CRUCIALE PER LA GUARDIA DI AUTENTICAZIONE)
                // ===============================================
                const userData = {
                    id: data.user.id,
                    nome: nomeUtente,
                    ruolo: ruoloUtente,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('userData', JSON.stringify(userData));
                console.log("6. Dati salvati in localStorage. Reindirizzamento...");

                showMessage("Accesso riuscito! Reindirizzamento...", false);

                // Reindirizzamento con piccolo ritardo per evitare race condition
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
