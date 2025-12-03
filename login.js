// CONFIGURAZIONE
const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; // ✅ VERIFICA E CORREGGI QUESTO URL!
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA'; // Da sostituire

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
    console.log("1. DOM Caricato. Inizializzazione....");

    // Otteniamo l'elemento per i messaggi
    messageBox = document.getElementById('message-box');

    // ===============================================
    // ✅ INIZIALIZZAZIONE ROBUSTA DEL CLIENT
    // ===============================================
    if (!window.supabase) {
        console.error("ERRORE CRITICO: Oggetto 'window.supabase' non trovato. Verifica l'ordine degli script in index.html!");
        showMessage("ERRORE CRITICO: Servizio di autenticazione non disponibile. Controlla il file index.html.", true);
        return;
    }

    try {
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

            const identificativo = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!identificativo || !password) {
                showMessage("Inserisci tutti i campi.");
                return;
            }

            // ===============================================
            // FASE 1: AUTENTICAZIONE TRAMITE FUNZIONE CUSTOM (RPC)
            // L'RPC 'custom_login' verifica username e password direttamente nel DB.
            // ===============================================
            console.log(`3a. Tentativo di login RPC con username: ${identificativo}`);

            const NOME_FUNZIONE_RPC = 'custom_login'; 
            let userId = null;

            try {
                // Chiamata alla funzione del database per l'autenticazione
                const { data: userData, error: rpcError } = await supabaseClient.rpc(NOME_FUNZIONE_RPC, {
                    username_input: identificativo,
                    password_input: password,
                });
                
                if (rpcError) { 
                    console.error("ERRORE RPC Login:", rpcError);
                    
                    // L'errore P0001 (raise exception) cattura i messaggi specifici di errore dal DB (Utente non trovato / Password errata)
                    if (rpcError.code === 'P0001') {
                        // Mostra il messaggio esatto ritornato dall'RPC (LOGIN_ERROR: Utente non trovato, ecc.)
                         showMessage(`Credenziali non valide: ${rpcError.message.replace('LOGIN_ERROR: ', '')}`, true);
                    } else {
                        // Errore generico (es. RPC non trovato)
                        showMessage("Errore di sistema. Controlla la console per i dettagli (es. RPC non trovato).", true); 
                    }
                    return;
                }

                // Assumiamo che la funzione restituisca l'ID utente (UUID) in caso di successo
                if (userData) {
                    userId = userData; 
                } else {
                    // Dovrebbe essere catturato dall'errore RPC sopra, ma è un fallback
                    showMessage("Credenziali non valide. Accesso negato dal sistema.", true);
                    return;
                }

                if (!userId) {
                    showMessage("Credenziali non valide. Accesso negato dal sistema.", true);
                    return;
                }

                console.log("4. Login Custom RPC riuscito. ID Utente:", userId);

                // ===============================================
                // LOGICA RUOLI (SIMULATA)
                // Se la RPC restituisse anche il ruolo, potresti usarlo qui.
                // Per ora, lo simuliamo.
                // ===============================================
                let nomeUtente = "Utente";
                let ruoloUtente = "Cittadino"; 

                const lowerId = identificativo.toLowerCase();
                
                // Mantiene il ruolo 'Amministratore' per l'utente di test che abbiamo inserito
                if (lowerId === 'utente_test') {
                    nomeUtente = "Utente Test";
                    ruoloUtente = "Amministratore"; 
                } 
                // Aggiungi qui la logica per gli altri ruoli se necessario...

                // ===============================================
                // 5. SALVATAGGIO DATI LOCALE E REINDIRIZZAMENTO
                // ===============================================
                const dataSessione = {
                    id: userId,
                    nome: nomeUtente,
                    ruolo: ruoloUtente,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('userData', JSON.stringify(dataSessione));
                console.log("6. Dati salvati in localStorage. Reindirizzamento...");

                showMessage("Accesso riuscito! Reindirizzamento...", false);

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
