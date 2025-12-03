const SUPABASE_URL = 'INSERISCI_QUI_IL_TUO_SUPABASE_URL'; // Sostituire con il tuo URL
const SUPABASE_ANON_KEY = 'INSERISCI_QUI_LA_TUA_ANON_KEY'; // Sostituire con la tua KEY

// Inizializza Supabase Client
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageBox = document.getElementById('message-box');

    // Funzione per mostrare un messaggio di errore o successo
    const showMessage = (message, isError = true) => {
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
    };

    // Nasconde la message box
    const hideMessage = () => {
        messageBox.style.display = 'none';
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage(); // Nascondi i messaggi precedenti

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                showMessage("Per favore, inserisci email e password.");
                return;
            }

            // ===============================================
            // 1. TENTATIVO DI AUTENTICAZIONE CON SUPABASE
            // ===============================================
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error("Errore di login:", error);
                showMessage("Login fallito. Verifica le tue credenziali.");
                return;
            }

            // ===============================================
            // 2. RECUPERO INFORMAZIONI AGGIUNTIVE (RUOLO)
            // ===============================================
            const userId = data.user.id;
            
            // Simula il recupero del ruolo dal database (questa logica DEVE essere implementata)
            // Per ora usiamo una logica fittizia basata sull'email per i test:
            let nomeUtente = "Utente";
            let ruoloUtente = "Utente Giudiziario";
            
            if (email.includes('procuratore@')) {
                nomeUtente = "Micheal Ross";
                ruoloUtente = "Procuratore Generale";
            } else if (email.includes('admin@')) {
                nomeUtente = "Amministratore";
                ruoloUtente = "Admin";
            } else if (email.includes('giudice@')) {
                nomeUtente = "Giudice Rossi";
                ruoloUtente = "Giudice";
            }
            // FINE LOGICA FITTIZIA

            // ===============================================
            // 3. SALVATAGGIO DEI DATI UTENTE LOCALI (CRUCIALE)
            // ===============================================
            const userData = {
                id: userId,
                nome: nomeUtente,
                ruolo: ruoloUtente,
                timestamp: new Date().getTime() // Aggiungiamo un timestamp per tracking
            };

            try {
                // IL SALVATAGGIO È SINCRONO MA AVVIENE DOPO L'AWAIT SUPABASE
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log("Dati utente salvati in localStorage:", userData);
            } catch (e) {
                console.error("Impossibile salvare in localStorage:", e);
                showMessage("Errore interno: impossibile salvare i dati di sessione.");
                return;
            }


            // ===============================================
            // 4. REINDIRIZZAMENTO (SOLO DOPO IL SALVATAGGIO)
            // ===============================================
            showMessage(`Accesso riuscito! Reindirizzamento...`, false);
            // Non usiamo await qui, ma garantiamo che il codice sia eseguito in ordine
            window.location.href = 'dashboard.html';
        });
    }
});
