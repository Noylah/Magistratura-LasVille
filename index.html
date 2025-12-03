const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU1M30.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// ✅ Inizializza il client Supabase usando window.supabase, come definito nel CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Funzione per leggere i dati utente dal localStorage e aggiornare l'interfaccia.
 */
const displayUserData = () => {
    console.log("4. Tentativo di caricare i dati utente...");
    
    // 1. Tenta di leggere i dati salvati dal login
    const userDataString = localStorage.getItem('userData');
    
    const welcomeMessageElement = document.getElementById('welcome-user-message');
    const roleDisplayElement = document.getElementById('user-role-display');
    
    // Gestione dell'assenza di dati (dovrebbe essere gestito da authGuard.js)
    if (!userDataString || userDataString === 'undefined' || userDataString === 'null') {
        console.error("Errore: Dati utente non disponibili. Reindirizzamento atteso tramite Auth Guard.");
        // Imposta valori di fallback nell'UI in attesa del reindirizzamento
        if (welcomeMessageElement) {
            welcomeMessageElement.textContent = `Caricamento...`;
        }
        if (roleDisplayElement) {
            roleDisplayElement.textContent = "Ruolo Sconosciuto";
        }
        return; 
    }

    try {
        const userData = JSON.parse(userDataString);
        // I nomi dei campi devono corrispondere ESATTAMENTE a quelli restituiti dalla funzione SQL: nome e ruolo
        const { nome, ruolo } = userData; 

        if (!nome || !ruolo) {
            // Se i dati sono nel localStorage ma incompleti (es. manca il ruolo)
            console.error("Dati utente incompleti nel localStorage. Mancano nome o ruolo.", userData);
            return;
        }

        console.log(`5. Utente loggato rilevato: ${nome}, Ruolo: ${ruolo}`);

        // ===================================
        // FUNZIONALITÀ DI PERSONALIZZAZIONE UI
        // ===================================

        // 1. Visualizzazione del Nome e Ruolo
        if (welcomeMessageElement) {
            welcomeMessageElement.textContent = `Benvenuto, ${nome} (${ruolo})`;
        }
        if (roleDisplayElement) {
            // Aggiorna il ruolo visualizzato
            roleDisplayElement.textContent = ruolo;
        }

        // 2. Controllo Accesso alla Navigazione (Role-Based Access)
        const navItems = document.querySelectorAll('#main-navigation li');
        navItems.forEach(item => {
            const requiredRoles = item.getAttribute('data-role');
            
            if (requiredRoles) {
                // Rimuovi spazi per una corrispondenza pulita
                const allowedRoles = requiredRoles.split(',').map(r => r.trim()); 
                
                // Se il ruolo dell'utente NON è incluso nei ruoli consentiti, nascondi la voce
                if (requiredRoles !== 'all' && !allowedRoles.includes(ruolo)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = ''; // Assicura che sia visibile
                }
            }
        });

        console.log("6. Personalizzazione UI completata. Menu filtrato per ruolo.");
        
    } catch (e) {
        console.error("Errore nel parsing dei dati utente dal localStorage:", e);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("3. DOM della Dashboard pronto. Inizializzazione logica.");

    // Inizializza la visualizzazione dei dati utente
    displayUserData();
    
    // ===================================
    // FUNZIONALITÀ LOGOUT
    // ===================================
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 1. Pulizia Sessione Supabase 
            // Usa la variabile 'supabase' definita all'inizio del file
            const { error } = await supabase.auth.signOut(); 

            if (error) {
                console.error('Errore durante il logout da Supabase:', error.message);
            }
            
            // 2. Pulizia Dati Locali
            localStorage.removeItem('userData');
            localStorage.removeItem('supabase.auth.token'); 
            
            console.log("Logout effettuato. Pulizia localStorage completata.");
            
            // 3. Reindirizzamento alla pagina di login
            window.location.href = 'index.html';
        });
    }
});
