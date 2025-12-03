const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU1M30.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// Usa window.supabase per prevenire l'errore "supabase non definito"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message-box');

    if (!loginForm) {
        console.error("Form di login non trovato. Verifica index.html");
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
        messageBox.style.display = 'none'; // Nasconde i messaggi precedenti

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
                const errorMessage = error.message.includes('LOGIN_ERROR') 
                    ? error.message.split(': ')[1] 
                    : "Errore di accesso generico.";
                
                showMessage(errorMessage, true);
                console.error("Errore RPC:", error);
                return;
            }

            // CONTROLLO CRITICO: Controlla che i dati essenziali siano presenti.
            if (data && data.id && data.ruolo && data.nome) {
                console.log("Login riuscito. Dati utente ricevuti:", data);
                
                // === PUNTO CRITICO: SALVATAGGIO DEI DATI SENZA MODIFICHE ===
                // Salviamo l'oggetto JSON COMPLETO, inclusi nome e ruolo
                localStorage.setItem('userData', JSON.stringify(data));
                
                showMessage(`Accesso riuscito per ${data.nome} (${data.ruolo}). Reindirizzamento...`, false);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);

            } else {
                // Fallback: se i dati non sono completi, salviamo un default ma mostriamo un errore.
                showMessage("Risposta RPC inattesa o incompleta. Controlla la funzione SQL.", true);
                console.error("Dati ricevuti inattesi:", data);
            }

        } catch (e) {
            showMessage("Errore di rete o del server.", true);
            console.error("Eccezione durante il login:", e);
        }
    });

    // Pulizia all'avvio della pagina di login
    localStorage.removeItem('userData');
    localStorage.removeItem('supabase.auth.token');
});
