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
    console.log("1. DOM Caricato. Inizializzazione...");

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
            // FASE 1: CERCA L'EMAIL ASSOCIATA ALL'IDENTIFICATIVO
            // ===============================================
            let emailPerLogin = identificativo;

            // Se l'identificativo NON assomiglia a un'email, cerca nel database
            if (!identificativo.includes('@')) {
                console.log(`3a. Identificativo non è una mail, cerco nel database: ${identificativo}`);
                
                // === AGGIORNAMENTO FATTO QUI: TABELLA 'utenti', COLONNA 'codice_fiscale' ===
                const NOME_TABELLA_PROFILI = 'utenti'; // 🚨 AGGIORNA CON IL NOME ESATTO DELLA TUA TABELLA 🚨
                const NOME_COLONNA_CF = 'codice_fiscale'; // 🚨 AGGIORNA CON IL NOME ESATTO DELLA TUA COLONNA CF 🚨
                // ==============================================================================
                
                // Query per trovare l'email usando l'identificativo (Codice Fiscale)
                const { data: userData, error: dbError } = await supabaseClient
                    .from(NOME_TABELLA_PROFILI)
                    .select('email')
                    .eq(NOME_COLONNA_CF, identificativo)
                    .single(); 

                // PGRST116 = nessun risultato trovato. Qualsiasi altro codice è un errore di sistema.
                if (dbError && dbError.code !== 'PGRST116') { 
                    console.error("ERRORE DB LOOKUP (Tabella o RLS):", dbError);
                    showMessage(`Errore: Impossibile cercare l'identificativo. Controlla il nome della tabella ('${NOME_TABELLA_PROFILI}') e le Policy RLS.`, true); 
                    return;
                }

                if (userData && userData.email) {
                    emailPerLogin = userData.email;
                    console.log(`3b. Trovata email associata: ${emailPerLogin}`);
                } else {
                    showMessage("Credenziali non valide. Identificativo non trovato.", true);
                    return;
                }
            }


            // ===============================================
            // FASE 2: LOGIN SUPABASE CON L'EMAIL TROVATA
            // ===============================================
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: emailPerLogin, 
                    password: password,
                });

                if (error) {
                    console.warn("Login fallito:", error.message);
                    
                    if (error.message && error.message.includes('Email not confirmed')) {
                        showMessage("Accesso negato: La tua email non è stata confermata. Controlla la posta elettronica.", true);
                    } else {
                        showMessage("Credenziali non valide. Riprova o verifica che l'account sia attivo.", true);
                    }
                    return;
                }

                if (!data || !data.user) {
                    showMessage("Errore imprevisto: Nessun dato utente ricevuto.");
                    return;
                }

                console.log("4. Login Supabase riuscito:", data.user.id);

                // ===============================================
                // LOGICA RUOLI (SIMULATA)
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
                const userData = {
                    id: data.user.id,
                    nome: nomeUtente,
                    ruolo: ruoloUtente,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('userData', JSON.stringify(userData));
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
