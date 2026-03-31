// OIO GOV - APP PRINCIPAL 🏛️
import { supabase } from './supabase.js';

const secretarias = [
    { nome: "Gabinete do Prefeito", icone: '<i class="fas fa-landmark"></i>' },
    { nome: "Administração", icone: '<i class="fas fa-building"></i>' },
    { nome: "Saúde", icone: '<i class="fas fa-heartbeat"></i>' },
    { nome: "Educação", icone: '<i class="fas fa-graduation-cap"></i>' },
    { nome: "Finanças", icone: '<i class="fas fa-chart-line"></i>' },
    { nome: "Obras Públicas", icone: '<i class="fas fa-hard-hat"></i>' },
    { nome: "Saneamento", icone: '<i class="fas fa-tint"></i>' },
    { nome: "Meio Ambiente", icone: '<i class="fas fa-leaf"></i>' },
    { nome: "Assistência Social", icone: '<i class="fas fa-hands-helping"></i>' },
    { nome: "Segurança Pública", icone: '<i class="fas fa-shield-alt"></i>' },
    { nome: "Transporte", icone: '<i class="fas fa-bus"></i>' },
    { nome: "Cultura", icone: '<i class="fas fa-theater-masks"></i>' },
    { nome: "Esporte e Lazer", icone: '<i class="fas fa-running"></i>' },
    { nome: "Agricultura", icone: '<i class="fas fa-seedling"></i>' },
    { nome: "Tecnologia e Inovação", icone: '<i class="fas fa-microchip"></i>' },
    { nome: "Defesa Civil", icone: '<i class="fas fa-exclamation-triangle"></i>' },
    { nome: "Comunicação", icone: '<i class="fas fa-bullhorn"></i>' }
];

let setorAtivo = null;
let govInterval = null;
let usuarioAtual = null;

// ===== LOGIN =====
window.govLogin = async () => {
    const nome = document.getElementById('login-nome').value.trim();
    const senha = document.getElementById('login-senha').value.trim();

    if (!nome || !senha) return alert('Preencha todos os campos!');
    if (!/^\d+$/.test(senha)) return alert('A senha deve ser apenas números!');

    const btn = document.getElementById('btn-entrar');
    btn.innerText = 'Entrando...';
    btn.disabled = true;

    let { data: user } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', nome)
        .maybeSingle();

    if (!user) {
        const { data: newUser } = await supabase
            .from('usuarios')
            .insert([{ username: nome, password: senha }])
            .select().single();
        user = newUser;
    }

    if (user && user.password === senha) {
        usuarioAtual = user.username;
        localStorage.setItem('gov_usuario', usuarioAtual);
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('nome-usuario').innerText = usuarioAtual;
        montarMenu();
    } else {
        alert('Senha incorreta!');
        btn.innerText = 'ACESSAR';
        btn.disabled = false;
    }
};

// Verifica se já está logado
window.onload = () => {
    const saved = localStorage.getItem('gov_usuario');
    if (saved) {
        usuarioAtual = saved;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('nome-usuario').innerText = usuarioAtual;
        montarMenu();
    }

    const loginSenhaInput = document.getElementById('login-senha');
    if (loginSenhaInput) {
        loginSenhaInput.onkeypress = (e) => {
            if (e.key === 'Enter') window.govLogin();
        };
    }
};

// ===== MENU =====
function montarMenu() {
    const lista = document.getElementById('lista-secretarias');
    if (!lista) return;
    lista.innerHTML = secretarias.map((s, i) => `
        <div class="sec-item" id="sec-${i}" onclick="window.govAbrirSetor(${i})">
            <span class="sec-icone">${s.icone}</span>
            <span class="sec-nome">${s.nome}</span>
        </div>
    `).join('');
}

// ===== ABRE SETOR =====
window.govAbrirSetor = async (index) => {
    const s = secretarias[index];
    setorAtivo = s.nome;

    document.querySelectorAll('.sec-item').forEach(el => el.classList.remove('active'));
    const itemAtivo = document.getElementById(`sec-${index}`);
    if (itemAtivo) itemAtivo.classList.add('active');
    
    document.getElementById('sidebar').classList.remove('aberto');

    document.getElementById('tela-inicial').classList.add('hidden');
    document.getElementById('tela-chat').classList.remove('hidden');
    document.getElementById('chat-titulo').innerText = s.nome;
    document.getElementById('chat-icone').innerHTML = s.icone;

    await govCarregarMensagens();

    if (govInterval) clearInterval(govInterval);
    govInterval = setInterval(govCarregarMensagens, 6000);

    setTimeout(() => document.getElementById('gov-input')?.focus(), 300);
};

// ===== FECHA CHAT (MOBILE) =====
window.govFecharChat = () => {
    if (govInterval) clearInterval(govInterval);
    document.getElementById('tela-chat').classList.add('hidden');
    document.getElementById('tela-inicial').classList.remove('hidden');
    document.getElementById('sidebar').classList.add('aberto');
    setorAtivo = null;
};

// ===== CARREGA MENSAGENS =====
async function govCarregarMensagens() {
    if (!setorAtivo) return;
    const box = document.getElementById('chat-mensagens');
    if (!box) return;

    const { data: msgs } = await supabase
        .from('mensagens')
        .select('*')
        .eq('secretaria', setorAtivo)
        .order('created_at', { ascending: true });

    if (!msgs || msgs.length === 0) {
        box.innerHTML = `
            <div style="text-align:center; color:#334155; font-size:13px; margin-top:60px; padding:20px;">
                <i class="fas fa-comments" style="font-size:40px; margin-bottom:10px; display:block;"></i>
                Nenhuma mensagem ainda.<br>Seja o primeiro a enviar!
            </div>`;
        return;
    }

    const eraNoFundo = box.scrollTop + box.clientHeight >= box.scrollHeight - 10;

    box.innerHTML = msgs.map(m => {
        const isMeu = m.autor === usuarioAtual;
        const tempo = new Date(m.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

        let conteudo = m.texto ? `<div>${m.texto}</div>` : '';

        if (m.midia) {
            const url = m.midia;
            const ext = url.split('.').pop().split('?')[0].toLowerCase();
            if (['jpg','jpeg','png','webp','gif'].includes(ext)) {
                conteudo += `<img src="${url}" alt="imagem">`;
            } else if (['mp4','mov','webm'].includes(ext)) {
                conteudo += `<video controls><source src="${url}"></video>`;
            } else if (['mp3','wav','m4a','ogg'].includes(ext)) {
                conteudo += `<audio controls src="${url}"></audio>`;
            } else {
                const nomeArq = url.split('/').pop().split('?')[0];
                conteudo += `
                    <a href="${url}" target="_blank" class="bolha-doc">
                        <i class="fas fa-file-alt"></i> ${nomeArq}
                    </a>`;
            }
        }

        return `
            <div class="bolha-wrapper ${isMeu ? 'minha' : 'deles'}">
                <div class="bolha">
                    ${!isMeu ? `<div class="bolha-autor"><i class="fas fa-user-circle"></i> ${m.autor}</div>` : ''}
                    ${conteudo}
                    <div class="bolha-tempo">${tempo}</div>
                </div>
            </div>
        `;
    }).join('');

    if (eraNoFundo) box.scrollTop = box.scrollHeight;
}

// ===== PREVIEW ARQUIVO =====
window.govPreviewArquivo = (input) => {
    const file = input.files[0];
    if (!file) return;
    document.getElementById('arquivo-preview').classList.remove('hidden');
    document.getElementById('arquivo-nome').innerText = file.name;
};

window.govCancelarArquivo = () => {
    document.getElementById('gov-arquivo').value = '';
    document.getElementById('arquivo-preview').classList.add('hidden');
};

// ===== ENVIA MENSAGEM =====
window.govEnviar = async () => {
    if (!setorAtivo) return;
    const input = document.getElementById('gov-input');
    const fileInput = document.getElementById('gov-arquivo');
    const texto = input.value.trim();
    const file = fileInput.files[0];

    if (!texto && !file) return;

    const btn = document.querySelector('.btn-enviar');
    btn.disabled = true;
    btn.style.opacity = '0.5';

    let midiaUrl = null;

    if (file) {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { error } = await supabase.storage
            .from('midias')
            .upload(fileName, file);

        if (!error) {
            const { data: { publicUrl } } = supabase.storage
                .from('midias')
                .getPublicUrl(fileName);
            midiaUrl = publicUrl;
        }
    }

    await supabase.from('mensagens').insert([{
        secretaria: setorAtivo,
        texto: texto || null,
        midia: midiaUrl,
        autor: usuarioAtual
    }]);

    input.value = '';
    fileInput.value = '';
    document.getElementById('arquivo-preview').classList.add('hidden');

    btn.disabled = false;
    btn.style.opacity = '1';

    await govCarregarMensagens();
};

// Enter para enviar
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('gov-input');
    if (input) {
        input.onkeypress = (e) => {
            if (e.key === 'Enter') window.govEnviar();
        };
    }
});
