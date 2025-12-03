const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; 
// Assicurati che qui ci sia la chiave anonima corretta, che hai inserito in login.js
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU1M30.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA'; 

// Inizializza il client Supabase usando window.supabase, come definito nel CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variabile globale per memorizzare la gerarchia dei ruoli
let ROLE_RANKS = {}; // { "Ruolo": rank_numerico, ... }

/**
 * Recupera la gerarchia dei ruoli dalla tabella 'ruoli' di Supabase.
 * @returns {Promise<boolean>} True se il recupero ha avuto successo, altrimenti False.
 */
async function fetchRoleHierarchy() {
    console.log("3a. Recupero gerarchia ruoli dal database...");
    
    // Non è necessario usare l'autenticazione perché il permesso SELECT è stato concesso a 'anon'
    const { data: ruoli, error } = await supabase
        .from('ruoli')
        .select('nome, rank')
        .order('rank', { ascending: true }); // Ordina per rank per debug

    if (error) {
        console.error("ERRORE nel recupero della gerarchia ruoli:", error.message);
        return false;
    }

    // Trasforma l'array in un oggetto { "nome": rank } per un accesso rapido
    ROLE_RANKS = ruoli.reduce((acc, curr) => {
        acc[curr.nome] = curr.rank;
        return acc;
    }, {});
    
    // Aggiungi un rank fittizio per l'accesso universale
    ROLE_RANKS["all"] = 0; 

    console.log("3b. Gerarchia Ruoli caricata:", ROLE_RANKS);
    return true;
}

/**
 * Restituisce il rank numerico di un ruolo.
 * @param {string} roleName - Il nome del ruolo.
 * @returns {number} Il livello di privilegio, o 0 se non trovato.
 */
const getRoleRank = (roleName) => {
    return ROLE_RANKS[roleName] || 0;
};


/**
 * Funzione per gestire la navigazione interna tra le sezioni della Dashboard.
 * @param {string} pageId - L'ID della sezione da mostrare (es. 'home', 'documenti').
 * @param {HTMLElement} currentActiveNav - L'elemento di navigazione attualmente attivo.
 */
const handleNavigation = (pageId, currentActiveNav) => {
    // 1. Nascondi tutte le sezioni
    document.querySelectorAll('.page-content').forEach(section => {
        section.style.display = 'none';
    });

    // 2. Mostra la sezione richiesta
    const targetSection = document.getElementById(`page-${pageId}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    } else {
        console.error(`Sezione non trovata per l'ID: page-${pageId}`);
    }

    // 3. Aggiorna lo stato "active" nella sidebar
    document.querySelectorAll('.nav-list a').forEach(a => {
        a.classList.remove('active');
    });

    if (currentActiveNav) {
        currentActiveNav.classList.add('active');
    }
};

/**
 * Funzione per leggere i dati utente dal localStorage e aggiornare l'interfaccia.
 */
const displayUserData = () => {
    console.log("4. Tentativo di caricare i dati utente e applicare filtri di accesso...");
    
    const userDataString = localStorage.getItem('userData');
    const welcomeMessageElement = document.getElementById('welcome-user-message');
    const roleDisplayElement = document.getElementById('user-role-display');
    
    if (!userDataString || userDataString === 'undefined' || userDataString === 'null') {
        console.error("Errore: Dati utente non disponibili. Reindirizzamento atteso tramite Auth Guard.");
        if (welcomeMessageElement) welcomeMessageElement.textContent = `Caricamento...`;
        if (roleDisplayElement) roleDisplayElement.textContent = "Ruolo Sconosciuto";
        return; 
    }

    try {
        const userData = JSON.parse(userDataString);
        const { nome, ruolo } = userData; 

        if (!nome || !ruolo) {
            console.error("Dati utente incompleti nel localStorage. Mancano nome o ruolo.", userData);
            return;
        }

        console.log(`5. Utente loggato rilevato: ${nome}, Ruolo: ${ruolo}, Rank utente: ${getRoleRank(ruolo)}`);

        // 1. Visualizzazione del Nome e Ruolo
        if (welcomeMessageElement) {
            welcomeMessageElement.textContent = `Benvenuto, ${nome} (${ruolo})`;
        }
        if (roleDisplayElement) {
            roleDisplayElement.textContent = ruolo;
        }

        // 2. Controllo Accesso alla Navigazione (Role-Based Access con Gerarchia Dinamica)
        const userRank = getRoleRank(ruolo);
        
        // Definisce il rank minimo richiesto per i Documenti (Magistrato Ordinario = 50)
        // Usiamo un lookup per il nome del ruolo o 50 come fallback.
        const MIN_RANK_DOCUMENTI = ROLE_RANKS["Magistrato Ordinario"] || 50; 
        
        // Definisce il rank minimo richiesto per le Analisi Riservate (Procuratore Generale = 75)
        const MIN_RANK_ANALISI = ROLE_RANKS["Procuratore Generale"] || 75; 

        const navItems = document.querySelectorAll('#main-navigation li');
        navItems.forEach(item => {
            const requiredRolesString = item.getAttribute('data-role');
            
            if (requiredRolesString) {
                let minRequiredRank = 0; // Default per 'all'
                
                if (requiredRolesString === 'all') {
                    minRequiredRank = 0;
                } 
                // Se l'elemento richiede 'Magistrato Ordinario' o ruoli superiori
                else if (requiredRolesString.includes('Magistrato Ordinario') || requiredRolesString.includes('Procuratore Aggiunto')) {
                    // Questa è la sezione Documenti Ufficiali o Gestione Pratiche
                    minRequiredRank = MIN_RANK_DOCUMENTI;
                }
                // Se l'elemento richiede 'Procuratore Generale' (Analisi Riservate)
                else if (requiredRolesString.includes('Procuratore Generale')) {
                    minRequiredRank = MIN_RANK_ANALISI;
                }
                // Se l'elemento richiede 'Cittadino'
                else if (requiredRolesString.includes('Cittadino')) {
                    minRequiredRank = ROLE_RANKS["Cittadino"] || 10;
                }
                
                // LOGICA CHIAVE: Se il rank dell'utente è MAGGIORE o UGUALE al rank minimo richiesto, mostra la voce.
                if (userRank >= minRequiredRank) {
                    item.style.display = ''; // Mostra
                } else {
                    item.style.display = 'none'; // Nascondi
                }
            }
        });

        console.log("6. Personalizzazione UI completata. Menu filtrato per rank gerarchico (>= 50 per Documenti).");
        
    } catch (e) {
        console.error("Errore nel parsing dei dati utente dal localStorage:", e);
    }
};


document.addEventListener('DOMContentLoaded', async () => {
    console.log("3. DOM della Dashboard pronto. Inizializzazione logica.");

    // 1. PRIMA di tutto, recupera la gerarchia dei ruoli
    const hierarchyLoaded = await fetchRoleHierarchy();

    if (hierarchyLoaded) {
        // 2. Filtra il menu e visualizza i dati utente
        displayUserData();
    } else {
        // Fallback se il DB fallisce
        console.error("Impossibile caricare la gerarchia dei ruoli. I filtri potrebbero non essere corretti.");
    }
    
    // ===================================
    // 3. FUNZIONALITÀ DI NAVIGAZIONE INTERNA (Routing Client-Side)
    // ===================================
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.currentTarget.getAttribute('data-page');
            
            if (pageId) {
                handleNavigation(pageId, e.currentTarget);
                console.log(`Navigazione a: ${pageId}`);
            }
        });
    });

    // Imposta la pagina iniziale
    const defaultActiveLink = document.querySelector('.nav-list a.active');
    if (defaultActiveLink) {
         const defaultPage = defaultActiveLink.getAttribute('data-page') || 'home';
         handleNavigation(defaultPage, defaultActiveLink);
    }


    // ===================================
    // 4. FUNZIONALITÀ LOGOUT
    // ===================================
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 1. Pulizia Sessione Supabase 
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
