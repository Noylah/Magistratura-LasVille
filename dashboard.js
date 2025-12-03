// ...
    const userData = localStorage.getItem('userData');
    
    // Se i dati utente non esistono O sono vuoti, reindirizza alla pagina di login.
    if (!userData || userData === 'undefined' || userData === 'null') {
        // ... reindirizzamento
        window.location.href = 'index.html'; 
        return; 
    }
    // ...
