// Lógica MVP para panel profesor
const StateProf = {
    alfa: 0.5,
    capMonthly: 1000,
    totalIssued: 100000
    }
    
    
    // mock ledger shared with main app in real integración
    const LEDGER = [];
    
    
    // tabs
    document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
    document.getElementById(t).classList.add('active');
    })
    })
    
    
    // refs
    const emitProfBtn = document.getElementById('emitProfBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const emitAmountProf = document.getElementById('emitAmountProf');
    const emitReason = document.getElementById('emitReason');
    const circulanteEl = document.getElementById('circulante');
    const inflacionEl = document.getElementById('inflacion');
    const idxEl = document.getElementById('idx');
    const capMonthlyInput = document.getElementById('capMonthly');
    const alphaInput = document.getElementById('alpha');
    const savePolicy = document.getElementById('savePolicy');
    const ledgerTableBody = document.querySelector('#ledgerTable tbody');
    const exportCsv = document.getElementById('exportCsv');
    const alertsContainer = document.getElementById('alertsContainer');
    
    
    function calcValueIndex(totalIssued){
    const S0 = 100000;
    const idx = 1 / (1 + StateProf.alfa * ((totalIssued - S0)/S0));
    return Number.isFinite(idx) ? Math.max(0.05, +idx.toFixed(3)) : 1;
    }
    
    
    function refreshMetrics(){
    const total = LEDGER.reduce((s,tx)=> tx.type==='EMISIÓN' ? s+tx.amount : s, 0) + StateProf.totalIssued;
    circulanteEl.textContent = `${total} EDU`;
    idxEl.textContent = calcValueIndex(total);
    // inflación simple
    const infl = ((total - StateProf.totalIssued)/StateProf.totalIssued) * 100;
    inflacionEl.textContent = `${infl.toFixed(2)} %`;
    }
    
    
    function pushLedger(type, amount, desc){
    const tx = { ts: Date.now(), type, amount, desc };
    LEDGER.push(tx);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(tx.ts).toLocaleString()}</td><td>${tx.type}</td><td>${tx.desc}</td><td>${tx.amount}</td>`;
    ledgerTableBody.prepend(tr);
    refreshMetrics();
    }
    
    
    emitProfBtn.addEventListener('click', ()=>{
    const amt = Number(emitAmountProf.value);
    const reason = emitReason.value || 'Emisión manual';
    if(!amt || amt<=0) return alert('Cantidad inválida');
    // check cap monthly (simple)
    if(amt > StateProf.capMonthly) return alert('Supera el tope mensual');
    pushLedger('EMISIÓN', amt, reason);
    alert('Emisión registrada');
    });
    
    
    simulateBtn.addEventListener('click', ()=>{
    const amt = Number(emitAmountProf.value);
    if(!amt || amt<=0) return alert('Cantidad inválida para simular');
    const simTotal = StateProf.totalIssued + LEDGER.reduce((s,t)=>t.type==='EMISIÓN'?s+t.amount:s,0) + amt;
    const idx = calcValueIndex(simTotal);
    alert(`Simulación: emisión ${amt} -> nuevo índice de valor = ${idx}`);
    });
    
    
    savePolicy.addEventListener('click', ()=>{
    const cap = Number(capMonthlyInput.value);
    const a = Number(alphaInput.value);
    if(!isNaN(cap) && cap>0) StateProf.capMonthly = cap;
if(!isNaN(a) && a>=0) StateProf.alfa = a;
alert('Políticas guardadas');
refreshMetrics();
});


exportCsv.addEventListener('click', ()=>{
if(LEDGER.length===0) return alert('No hay transacciones');
const csvRows = [ ['fecha','tipo','detalle','monto'] ];
LEDGER.forEach(r=> csvRows.push([new Date(r.ts).toISOString(), r.type, r.desc, r.amount]));
const csvContent = csvRows.map(e=>e.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href = url; a.download = 'ledger.csv'; a.click(); URL.revokeObjectURL(url);
});


// init
refreshMetrics();


// sample alerts (demo)
setTimeout(()=>{
alertsContainer.innerHTML = '<div class="alert warn">Inflación simulada alcanzó 5% — revise políticas</div>';
},1200);