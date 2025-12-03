const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funzione per inizializzare il client Supabase
function createClient(url, key) {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        return supabase.createClient(url, key);
    }
    // Assumiamo che la libreria sia caricata tramite CDN in index.html
    return window.supabase.createClient(url, key);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Blocca l'invio del form standard
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. Esegui la query per cercare l'utente nel tuo database (Tabella 'utenti')
        const { data: user, error } = await supabase
            .from('utenti') // Sostituisci 'utenti' con il nome della tua tabella se diverso
            .select('ruolo') // Richiediamo solo il ruolo dopo l'autenticazione
            .eq('username', username) 
            .eq('password', password) // ATTENZIONE: per un sito reale non si fa mai
            .single();

        if (error || !user) {
            console.error('Login fallito:', error);
            errorMessage.textContent = 'Credenziali non valide.';
            errorMessage.style.display = 'block';
        } else {
            // Login Riuscito!
            errorMessage.style.display = 'none';

            // 2. Salva il ruolo dell'utente (ad esempio, in localStorage)
            localStorage.setItem('userRole', user.ruolo);
            console.log(`Login riuscito. Ruolo: ${user.ruolo}`);

            // 3. Reindirizza alla Dashboard
            // Nota: devi creare il file 'dashboard.html' nel prossimo step.
            window.location.href = 'dashboard.html'; 
        }
    });
});
