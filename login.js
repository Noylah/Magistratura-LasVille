const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU1M30.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// ✅ Correzione: assicurati che window.supabase sia accessibile prima di usarlo
if (typeof window.supabase === 'undefined') {
    console.error("ERRORE CRITICO: La libreria Supabase non è stata caricata. Controlla il tag <script> in index.html.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message-box');

    if (!loginForm) {
        console.error("Form di login non trovato. Verifica index.html");
        // Non interrompere, ma impedisci l'esecuzione del codice dipendente dal form
        return; 
    }

    // Inizializza o pulisci il messaggio di errore
    const showMessage = (text, isError = false) => {
        messageBox.textContent = text;
        messageBox.style.display = 'block';
        messageBox.style.backgroundColor = isError ? '#f44336' : '#8BC34A';
        messageBox.style.color = 'white';
        messageBox.style.padding = '10px';
        messageBox.style.borderRadius = '5px';
        messageBox.style.marginBottom = '15px';
        messageBox.style.textAlign = 'center';
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage("Accesso in corso...", false); // Messaggio di caricamento
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showMessage("Inserisci nome utente e password.", true);
            return;
        }

        try {
            // Chiamata RPC alla funzione custom_login nel database
            const { data, error } = await supabase.rpc('custom_login', {
                username_input: username,
                password_input: password
            });

            if (error) {
                // Gestione specifica degli errori SQL (es. LOGIN_ERROR)
                const errorMessage = error.message.includes('LOGIN_ERROR') 
                    ? error.message.split(': ')[1] 
                    : "Errore di accesso generico o di rete.";
                
                showMessage(errorMessage, true);
                console.error("Errore RPC:", error);
                return;
            }

            // CONTROLLO CRITICO: Controlla che i dati essenziali siano presenti.
            if (data && data.id && data.ruolo && data.nome) {
                console.log("1. Login riuscito. Dati utente ricevuti:", data);
                
                // === PUNTO CRITICO: SALVATAGGIO DEI DATI SENZA MODIFICHE ===
                localStorage.setItem('userData', JSON.stringify(data));
                
                showMessage(`Accesso riuscito per ${data.nome} (${data.ruolo}). Reindirizzamento...`, false);
                
                // Mettiamo un log di cosa è stato salvato, per una verifica finale
                console.log("2. Dati salvati in localStorage:", localStorage.getItem('userData'));
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 300); // Reindirizzamento più veloce

            } else {
                // Fallback: se la funzione SQL torna risultati incompleti
                showMessage("Risposta RPC inattesa o incompleta. Controlla la funzione SQL.", true);
                console.error("Dati ricevuti inattesi:", data);
            }

        } catch (e) {
            showMessage("Errore di rete o del server (Catch Block).", true);
            console.error("Eccezione durante il login:", e);
        }
    });

    // Pulizia all'avvio della pagina di login
    // Questo è il tuo salvavita per eliminare i dati 'cittadino' vecchi
    localStorage.removeItem('userData');
    localStorage.removeItem('supabase.auth.token');
    console.log("0. Pulizia localStorage eseguita all'apertura di index.html");
});
