const URL = 'https://svqocghixhrpqaxucubn.supabase.co';
const KEY = 'sb_publishable_lE2ZPtlhTh6OWr3S9Fb3rg_rLXHjkHH';
const supabase = window.supabase.createClient(URL, KEY);

const seclist = ["Gabinete", "Saúde", "Educação", "Obras", "Saneamento", "Finanças", "Segurança", "Marketing"];
let currentSetor = "";
const userTag = "Oficial_" + Math.floor(Math.random() * 99);

// Iniciar App
window.onload = () => {
    const listDiv = document.getElementById('sec-list');
    seclist.forEach(s => {
        const d = document.createElement('div');
        d.className = 'sec-item';
        d.innerText = s;
        d.onclick = () => selectSec(s, d);
        listDiv.appendChild(d);
    });
};

function switchTab(viewName, btn) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + viewName).classList.add('active');
    btn.classList.add('active');
    if(viewName === 'feed') getFeed();
}

async function selectSec(name, el) {
    currentSetor = name;
    document.querySelectorAll('.sec-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('current-sec').innerText = "Setor: " + name;
    document.getElementById('input-group').style.display = 'flex';
    loadMsgs();
}

async function loadMsgs() {
    const { data } = await supabase.from('mensagens').select('*').eq('secretaria', currentSetor).order('created_at', {ascending: true});
    const box = document.getElementById('chat-display');
    box.innerHTML = data.map(m => `
        <div style="margin-bottom:15px; background:#1e293b; padding:10px; border-radius:10px; max-width:80%; ${m.autor === userTag ? 'margin-left:auto; border-bottom-right-radius:0;' : 'border-bottom-left-radius:0;'}">
            <small style="color:gray">${m.autor}</small><br>${m.texto}
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

async function sendData() {
    const msg = document.getElementById('userInput').value;
    if(!msg) return;
    await supabase.from('mensagens').insert([{ secretaria: currentSetor, texto: msg, autor: userTag }]);
    document.getElementById('userInput').value = "";
    loadMsgs();
}

async function publishPost() {
    const t = document.getElementById('feedText').value;
    if(!t) return;
    await supabase.from('posts').insert([{ autor: userTag, texto: t }]);
    document.getElementById('feedText').value = "";
    getFeed();
}

async function getFeed() {
    const { data } = await supabase.from('posts').select('*').order('created_at', {ascending: false});
    document.getElementById('mural-list').innerHTML = data.map(p => `
        <div style="background:#020617; padding:20px; border-radius:12px; margin-bottom:15px; border:1px solid #1e293b">
            <b style="color:#2563eb">${p.autor}</b>
            <p style="margin-top:10px">${p.texto}</p>
        </div>
    `).join('');
}
