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
            // ===============================================
            console.log(`3a. Tentativo di login diretto (username/password) con identificativo: ${identificativo}`);

            // === CONFIGURAZIONE FUNZIONE RPC ===
            // 🚨 DEVI CREARE LA FUNZIONE 'custom_login' IN SUPABASE. 
            // Questa funzione deve ricevere username e password, verificarli sulla tabella 'utenti' 
            // e, se validi, restituire l'ID UTENTE (UUID).
            const NOME_FUNZIONE_RPC = 'custom_login'; 
            // ===================================
            
            let userId = null;

            try {
                // Chiamata alla funzione del database per l'autenticazione
                const { data: userData, error: rpcError } = await supabaseClient.rpc(NOME_FUNZIONE_RPC, {
                    username_input: identificativo,
                    password_input: password,
                });
                
                if (rpcError) { 
                    // Questo errore può provenire da credenziali non valide (se gestito nella funzione) 
                    // o da problemi RLS sulla funzione stessa.
                    console.error("ERRORE RPC Login:", rpcError);
                    showMessage("Credenziali non valide o errore di sistema. Assicurati che la funzione RPC esista e abbia RLS configurate (anon).", true); 
                    return;
                }

                // Assumiamo che la funzione restituisca l'ID utente (UUID) in caso di successo
                if (userData) {
                    // La variabile 'userData' dovrebbe essere l'ID utente se la funzione è riuscita
                    userId = userData; 
                } else {
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
                // Se la RPC restituisse anche il ruolo, potresti usarlo qui
                // Per ora, manteniamo la simulazione basata sull'input
                // ===============================================
                let nomeUtente = "Utente";
                let ruoloUtente = "Cittadino"; 

                const lowerId = identificativo.toLowerCase();
                if (lowerId.includes('procuratore') || lowerId.includes('ross')) {
                    nomeUtente = "Micheal Ross";
                    ruoloUtente = "Procuratore Generale";
                } else if (lowerId.includes('admin')) {
                    nomeUtente = "System Admin";
                    ruoloUtente = "Admin";
                } else if (lowerId.includes('giudice') || lowerId.includes('rossi')) {
                    nomeUtente = "On. Rossi";
                    ruoloUtente = "Giudice";
                }

                // ===============================================
                // 5. SALVATAGGIO DATI LOCALE
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
