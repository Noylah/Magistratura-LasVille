const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; // <-- CONTROLLA QUI!
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA'; // <-- E ANCHE QUI!

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("3. DOM della Dashboard pronto. Inizializzazione logica.");

    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
        // Teoricamente questo non dovrebbe succedere grazie ad authGuard.js, 
        // ma è un buon fallback.
        console.error("Errore: Dati utente non disponibili. Reindirizzamento forzato.");
        window.location.href = 'index.html'; 
        return;
    }

    const userData = JSON.parse(userDataString);
    const { nome, ruolo } = userData;
    console.log(`4. Utente loggato: ${nome}, Ruolo: ${ruolo}`);

    // ===================================
    // FUNZIONALITÀ DI PERSONALIZZAZIONE UI
    // ===================================

    // 1. Visualizzazione del Nome e Ruolo
    const welcomeMessageElement = document.getElementById('welcome-user-message');
    const roleDisplayElement = document.getElementById('user-role-display');

    // Questi elementi DOM VENGONO ORA TROVATI IN dashboard.html!
    if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Benvenuto, ${nome} (${ruolo})`;
    }
    if (roleDisplayElement) {
        roleDisplayElement.textContent = ruolo;
    }

    // 2. Controllo Accesso alla Navigazione (Role-Based Access)
    const navItems = document.querySelectorAll('#main-navigation li');
    navItems.forEach(item => {
        const requiredRoles = item.getAttribute('data-role');
        
        if (requiredRoles && requiredRoles !== 'all') {
            const allowedRoles = requiredRoles.split(',');
            // Se il ruolo dell'utente NON è incluso nei ruoli consentiti, nascondi la voce
            if (!allowedRoles.includes(ruolo)) {
                item.style.display = 'none';
                console.log(`- Nascosto: ${item.querySelector('a').textContent.trim()} (Ruolo '${ruolo}' non autorizzato)`);
            } else {
                item.style.display = ''; // Assicura che sia visibile
            }
        }
    });

    console.log("5. Personalizzazione UI completata. Pronta per l'uso.");
    
    // ===================================
    // FUNZIONALITÀ LOGOUT
    // ===================================
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 1. Pulizia Sessione Supabase (opzionale, ma raccomandato)
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Errore durante il logout da Supabase:', error.message);
                // Continuiamo comunque con la pulizia locale
            }
            
            // 2. Pulizia Dati Locali
            localStorage.removeItem('userData');
            localStorage.removeItem('supabase.auth.token'); // Pulisce il token Supabase
            
            console.log("Logout effettuato. Pulizia localStorage completata.");
            
            // 3. Reindirizzamento alla pagina di login
            window.location.href = 'index.html';
        });
    }
});
