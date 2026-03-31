import { iniciarChat } from './chat.js';

window.onload = () => {
    iniciarChat();
    
    // Lista de Secretarias para o Menu
    const secs = ["Obras", "Saúde", "Educação", "Segurança"];
    const list = document.getElementById('secList');
    
    secs.forEach(s => {
        const div = document.createElement('div');
        div.className = 'sec-item';
        div.innerText = s;
        div.onclick = () => window.selecionarSecretaria(s);
        list.appendChild(div);
    });
};
