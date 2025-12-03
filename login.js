console.log("1. Il file login.js è stato caricato correttamente.");

// --- CONFIGURAZIONE ---
const SUPABASE_URL = 'https://goupmhzwdqcicaztkrzc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXBtaHp3ZHFjaWNhenRrcnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTE1NzgsImV4cCI6MjA4MDE2NzU3OH0.Aua4gfzqU0iKLSO2BQEEZdt-oXWhrbNRCx_TFNkVmAA';

// --- INIZIALIZZAZIONE ---
let supabase;

try {
    if (!window.supabase) {
        throw new Error("Libreria Supabase non trovata. Controlla index.html");
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("2. Client Supabase inizializzato.");
} catch (err) {
    console.error("ERRORE GRAVE INIZIALIZZAZIONE:", err);
    alert("Errore tecnico: Libreria Supabase non caricata.");
}

// --- GESTIONE LOGICA ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("3. DOM pronto. Cerco il form...");

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!loginForm) {
        console.error("ERRORE: Impossibile trovare l'elemento con id 'loginForm' nell'HTML.");
        return;
    }

    // Ascoltatore dell'evento SUBMIT
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Blocca il ricaricamento della pagina
        console.log("4. Pulsante premuto. Inizio tentativo di login...");

        // Nascondi vecchi errori
        if (errorMessage) errorMessage.style.display = 'none';

        // Preleva i valori
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        console.log(`   > Tentativo per utente: "${username}"`);

        try {
            // ESECUZIONE QUERY
            const { data, error } = await supabase
                .from('utenti')
                .select('ruolo, nome_completo')
                .eq('username', username)
                .eq('password', password)
                .single(); // Si aspetta un solo risultato

            // CONTROLLO ERRORI
            if (error) {
                console.error("5. Errore restituito da Supabase:", error);
                
                // Gestione specifica se non trova righe (PGRST116 è l'errore standard per .single() vuoto)
                if (error.code === 'PGRST116') {
                    console.warn("   > Utente non trovato o password errata.");
                    mostraErrore("Credenziali errate.");
                } else {
                    mostraErrore("Errore di connessione al database: " + error.message);
                }
                return;
            }

            // CONTROLLO DATI
            if (!data) {
                console.error("5. Nessun errore, ma nessun dato ricevuto.");
                mostraErrore("Utente non trovato.");
                return;
            }

            // SUCCESSO
            console.log("6. LOGIN RIUSCITO!", data);
            
            // Salva in memoria
            localStorage.setItem('userRole', data.ruolo);
            localStorage.setItem('userName', data.nome_completo || data.username); // Fallback se nome vuoto

            console.log("7. Reindirizzamento alla dashboard...");
            window.location.href = 'dashboard.html';

        } catch (err) {
            console.error("ERRORE IMPREVISTO NEL CODICE JS:", err);
            mostraErrore("Errore imprevisto del sistema.");
        }
    });

    // Funzione helper per mostrare errori a video
    function mostraErrore(testo) {
        if (errorMessage) {
            errorMessage.textContent = testo;
            errorMessage.style.display = 'block';
        } else {
            alert(testo);
        }
    }
});
