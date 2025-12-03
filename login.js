const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// 1. DICHIARA IL CLIENT COME 'NULL' INIZIALMENTE
let supabase = null; 

document.addEventListener('DOMContentLoaded', () => {
    // 2. INIZIALIZZA IL CLIENT UNA VOLTA CHE LA PAGINA È CARICATA
    //    (E window.supabase è disponibile dalla CDN)
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        // Logga un errore se la libreria non è stata caricata correttamente
        console.error("ERRORE CRITICO: La libreria Supabase non è stata caricata. Controlla l'index.html.");
        return; // Blocca l'esecuzione
    }

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!supabase) {
             console.error("Supabase client non inizializzato.");
             return;
        }

        // 3. Esegui la query (rimane invariata)
        const { data: user, error } = await supabase
            .from('utenti') 
            .select('ruolo, nome_completo') 
            .eq('username', username) 
            .eq('password', password) 
            .single();

        if (error || !user) {
            // Qui devi controllare se error contiene dati. Se l'errore è "PostgREST error: P0001", significa che RLS è ancora attiva o la query non ha trovato risultati.
            console.error('Login fallito:', error);
            errorMessage.textContent = 'Credenziali non valide.';
            errorMessage.style.display = 'block';
        } else {
            // Login Riuscito!
            errorMessage.style.display = 'none';
            localStorage.setItem('userRole', user.ruolo);
            localStorage.setItem('userName', user.nome_completo); 

            console.log(`Login riuscito. Ruolo: ${user.ruolo}, Nome: ${user.nome_completo}`);

            window.location.href = 'dashboard.html'; 
        }
    });
});
