// Datos mock y funciones para MVP


function renderCatalog(){
    catalogEl.innerHTML = '';
    MOCK.rewards.forEach(r=>{
    const item = document.createElement('div'); item.className='catalog-item';
    const left = document.createElement('div'); left.textContent = r.title;
    const right = document.createElement('div');
    const price = Math.round(r.price_base * valueIndex());
    right.innerHTML = `<strong>${price} EDU</strong> <button onclick="redeem('${r.id}')">Canjear</button>`;
    item.appendChild(left); item.appendChild(right); catalogEl.appendChild(item);
    })
    }
    
    
    function renderCards(){
    // asumimos usuario actual = primer estudiante
    const user = MOCK.students[0];
    balanceEl.textContent = `${user.balance} EDU`;
    valueIndexEl.textContent = `1 EDU = ${valueIndex()}`;
    rewardsCountEl.textContent = MOCK.rewards.length;
    txCountEl.textContent = MOCK.ledger.length;
    }
    
    
    function renderHistory(){
    historyEl.innerHTML = '';
    MOCK.ledger.slice().reverse().forEach(tx=>{
    const div = document.createElement('div'); div.className='tx';
    div.innerHTML = `<div><strong>${tx.type}</strong> — ${tx.desc}</div><div class="muted">${new Date(tx.ts).toLocaleString()}</div>`;
    historyEl.appendChild(div);
    })
    }
    
    
    // actions
    function emit(amount){
    amount = Number(amount);
    if(!amount || amount<=0) return alert('Cantidad inválida');
    State.totalIssued += amount;
    MOCK.ledger.push({type:'EMISIÓN', amount, desc:`Se emitieron ${amount} EDU`, ts:Date.now()});
    refreshAll();
    }
    
    
    function assignToStudent(studentId, amount){
    amount = Number(amount);
    if(!amount || amount<=0) return alert('Cantidad inválida');
    const student = MOCK.students.find(s=>s.id===studentId);
    if(!student) return alert('Estudiante no encontrado');
    student.balance += amount;
    MOCK.ledger.push({type:'ASIGNACIÓN', amount, desc:`${amount} EDU a ${student.name}`, ts:Date.now()});
    refreshAll();
    }
    
    
    function redeem(rewardId){
    const user = MOCK.students[0];
    const reward = MOCK.rewards.find(r=>r.id===rewardId);
    const price = Math.round(reward.price_base * valueIndex());
    if(user.balance < price) return alert('Saldo insuficiente');
    user.balance -= price;
    MOCK.ledger.push({type:'CANJE', amount:price, desc:`${user.name} canjeó ${reward.title}`, ts:Date.now()});
    refreshAll();
    }
    
    
    function refreshAll(){
    renderStudents(); renderCatalog(); renderCards(); renderHistory();
    }
    
    
    // events
    window.onload = ()=>{
    document.getElementById('emitBtn').onclick = ()=> emit(document.getElementById('emitAmount').value);
    document.getElementById('assignBtn').onclick = ()=> assignToStudent(studentSelect.value, document.getElementById('assignAmount').value);
    refreshAll();
    // expose redeem for inline onclicks
    window.redeem = redeem;
    }