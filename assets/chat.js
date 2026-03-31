import { supabase } from './supabase.js';

let secretariaAtual = "";

export function iniciarChat() {
    const view = document.getElementById('chatView');
    view.innerHTML = `
        <div class="chat-header"><h2 id="chatTitle">Selecione um Setor</h2></div>
        <div class="chat-box" id="chatBox"></div>
        <div class="chat-input">
            <input id="msgInput" placeholder="Descreva a situação...">
            <label class="btn-midia">📷<input type="file" id="fileInput" hidden accept="image/*,video/*,audio/*"></label>
            <button onclick="enviar()">Enviar</button>
        </div>
    `;
}

window.selecionarSecretaria = (sec) => {
    secretariaAtual = sec;
    document.getElementById('chatTitle').innerText = "Setor: " + sec;
    carregarMensagens();
};

async function carregarMensagens() {
    const { data } = await supabase.from('mensagens').select('*').eq('secretaria', secretariaAtual).order('created_at');
    const box = document.getElementById('chatBox');
    box.innerHTML = data.map(m => `
        <div class="msg">
            <small>${m.autor}</small>
            <p>${m.texto || ''}</p>
            ${m.midia ? renderMidia(m.midia) : ''}
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

function renderMidia(url) {
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return `<img src="${url}" class="media-render">`;
    if (['mp4', 'mov', 'webm'].includes(ext)) return `<video controls class="media-render"><source src="${url}"></video>`;
    if (['mp3', 'wav', 'm4a'].includes(ext)) return `<audio controls src="${url}" style="width:100%"></audio>`;
    return `<a href="${url}" target="_blank">📄 Ver Arquivo</a>`;
}

window.enviar = async () => {
    const input = document.getElementById('msgInput');
    const file = document.getElementById('fileInput').files[0];
    let url = null;

    if (file) {
        const name = `${Date.now()}_${file.name}`;
        await supabase.storage.from('midias').upload(name, file);
        const { data } = supabase.storage.from('midias').getPublicUrl(name);
        url = data.publicUrl;
    }

    await supabase.from('mensagens').insert([{
        secretaria: secretariaAtual,
        texto: input.value,
        midia: url,
        autor: "Fiscal_Obras"
    }]);

    input.value = "";
    document.getElementById('fileInput').value = "";
    carregarMensagens();
};
