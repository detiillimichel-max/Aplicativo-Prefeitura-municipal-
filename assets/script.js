const URL = 'https://svqocghixhrpqaxucubn.supabase.co';
const KEY = 'sb_publishable_lE2ZPtlhTh6OWr3S9Fb3rg_rLXHjkHH';
const supabase = window.supabase.createClient(URL, KEY);

const seclist = ["Obras Públicas", "Saúde", "Educação", "Finanças", "Segurança", "Gabinete"];
let setorAtivo = "";

window.onload = () => {
    const menu = document.getElementById('lista-sec');
    seclist.forEach(s => {
        const d = document.createElement('div');
        d.className = 'sec-item';
        d.innerText = s;
        d.onclick = () => abrir(s, d);
        menu.appendChild(d);
    });
};

async function abrir(nome, el) {
    setorAtivo = nome;
    document.querySelectorAll('.sec-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('setor-nome').innerText = nome;
    document.getElementById('bar-chat').style.display = 'flex';
    carregar();
}

async function carregar() {
    const { data } = await supabase.from('mensagens').select('*').eq('secretaria', setorAtivo).order('created_at', {ascending: true});
    const box = document.getElementById('chat-box');
    box.innerHTML = data.map(m => `
        <div class="msg"><b>${m.autor}:</b> ${m.texto}</div>
    `).join('');
}

async function enviar() {
    const texto = document.getElementById('msg').value;
    if(!texto) return;
    await supabase.from('mensagens').insert([{ secretaria: setorAtivo, texto: texto, autor: "Gestor" }]);
    document.getElementById('msg').value = "";
    carregar();
}
