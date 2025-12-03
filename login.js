const SUPABASE_URL = 'INSERISCI_QUI_IL_TUO_SUPABASE_URL'; // Sostituire con il tuo URL
const SUPABASE_ANON_KEY = 'INSERISCI_QUI_LA_TUA_ANON_KEY'; // Sostituire con la tua KEY

// Variabile dichiarata ma non ancora inizializzata
let supabase;

document.addEventListener('DOMContentLoaded', () => {
    // ===============================================
    // ✅ RISOLUZIONE PROBLEMA 'Supabase is not defined'
    // Inizializziamo il client Supabase qui, dove siamo certi che la libreria sia caricata.
    // ===============================================
    try {
        supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("ERRORE CRITICO: La libreria Supabase non è stata caricata correttamente nell'HTML. Verifica il tag <script src='...'/>.", e);
        // Puoi aggiungere un messaggio visibile all'utente qui se vuoi
        return;
    }
    
    // L'ID del form è 'loginForm' nel file index.html
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message-box');

    // Funzione per mostrare un messaggio di errore o successo
    const showMessage = (message, isError = true) => {
        messageBox.textContent = message;
        // La classe 'error' o 'success' deve essere definita in style.css
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

            // ✅ LEGGE IL CAMPO 'username' che rappresenta l'email/identificativo unico nel backend
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showMessage("Per favore, inserisci Nome Utente/Codice Fiscale e password.");
                return;
            }

            // ===============================================
            // 1. TENTATIVO DI AUTENTICAZIONE CON SUPABASE
            //    Supabase utilizza internamente un campo 'email' per signInWithPassword.
            //    Quindi, l'identificativo unico (Nome Utente/CF) viene passato come 'email'.
            // ===============================================
            const { data, error } = await supabase.auth.signInWithPassword({
                email: username, // Passiamo il 'username' al campo 'email' di Supabase
                password: password,
            });

            if (error) {
                console.error("Errore di login:", error);
                // Il messaggio è generico per ragioni di sicurezza (non riveliamo se è sbagliata solo l'email o solo la password)
                showMessage("Login fallito. Verifica le tue credenziali.");
                return;
            }

            // ===============================================
            // 2. RECUPERO INFORMAZIONI AGGIUNTIVE (RUOLO)
            // ===============================================
            const userId = data.user.id;
            
            // Logica fittizia per assegnare un Ruolo per i test UI:
            let nomeUtente = "Utente Generico";
            let ruoloUtente = "Utente Giudiziario";
            
            if (username.includes('procuratore@')) {
                nomeUtente = "Micheal Ross";
                ruoloUtente = "Procuratore Generale";
            } else if (username.includes('admin@')) {
                nomeUtente = "Amministratore";
                ruoloUtente = "Admin";
            } else if (username.includes('giudice@')) {
                nomeUtente = "Giudice Rossi";
                ruoloUtente = "Giudice";
            }
            // FINE LOGICA FITTIZIA

            // ===============================================
            // 3. SALVATAGGIO DEI DATI UTENTE LOCALI (CRUCIALE per Auth Guard)
            // ===============================================
            const userData = {
                id: userId,
                nome: nomeUtente,
                ruolo: ruoloUtente,
                timestamp: new Date().getTime()
            };

            try {
                // IL SALVATAGGIO È SINCRONO
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log("Dati utente salvati in localStorage:", userData);
            } catch (e) {
                console.error("Impossibile salvare in localStorage:", e);
                showMessage("Errore interno: impossibile salvare i dati di sessione.");
                return;
            }

            // ===============================================
            // 4. REINDIRIZZAMENTO
            // ===============================================
            showMessage(`Accesso riuscito! Reindirizzamento...`, false);
            // Reindirizza alla dashboard, che sarà protetta da authGuard.js
            window.location.href = 'dashboard.html';
        });
    }
});
