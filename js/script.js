// Lógica MVP para panel profesor
const StateProf = {
    alfa: 0.5,
    capMonthly: 1000,
    totalIssued: 100000
  }
  
  // mock ledger shared with main app in real integración
  const LEDGER = [];
  
  // Variables globales (se inicializarán en DOMContentLoaded)
  let circulanteEl, inflacionEl, idxEl, ledgerTableBody;
  
  // ============================
  // FUNCIONES DE UTILIDAD
  // ============================
  function calcValueIndex(totalIssued){
    const S0 = 100000;
    const idx = 1 / (1 + StateProf.alfa * ((totalIssued - S0)/S0));
    return Number.isFinite(idx) ? Math.max(0.05, +idx.toFixed(3)) : 1;
  }
  
  function refreshMetrics(){
    const total = LEDGER.reduce((s,tx) => {
      return tx.type === 'EMISIÓN' ? s + tx.amount : s;
    }, 0) + StateProf.totalIssued;
    
    if (circulanteEl) circulanteEl.textContent = `${total} EDU`;
    if (idxEl) idxEl.textContent = calcValueIndex(total);
    
    // inflación simple
    const infl = ((total - StateProf.totalIssued) / StateProf.totalIssued) * 100;
    if (inflacionEl) inflacionEl.textContent = `${infl.toFixed(2)} %`;
  }
  
  function pushLedger(type, amount, desc){
    const tx = { 
      ts: Date.now(), 
      type, 
      amount, 
      desc 
    };
    LEDGER.push(tx);
    
    // Actualizar tabla si existe
    if (ledgerTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(tx.ts).toLocaleString()}</td>
        <td>${tx.type}</td>
        <td>${tx.desc}</td>
        <td>${tx.amount}</td>
      `;
      ledgerTableBody.appendChild(tr);
    }
    
    refreshMetrics();
  }
  
  // ============================
  // NAVEGACIÓN ENTRE PESTAÑAS
  // ============================
  function setupTabNavigation() {
    // Configurar navegación para desktop (sidebar)
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        if (!targetTab) return;
        
        // Remover clase activa de todas las pestañas
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('tab--active');
        });
        
        // Agregar clase activa a la pestaña clickeada
        this.classList.add('tab--active');
        
        // Ocultar todo el contenido
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('tab-content--active');
        });
        
        // Mostrar contenido correspondiente
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('tab-content--active');
        }
      });
    });
    
    // Configurar navegación para mobile (topnav)
    document.querySelectorAll('.nav-icon').forEach(tab => {
      tab.addEventListener('click', function(e) {
        // Prevenir comportamiento si es un enlace de logout
        if (this.querySelector('a')) {
          return;
        }
        
        const targetTab = this.getAttribute('data-tab');
        if (!targetTab) return;
        
        // Remover clase activa de todas las pestañas (desktop)
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('tab--active');
        });
        
        // Activar la pestaña correspondiente en sidebar (si existe)
        const desktopTab = document.querySelector(`.tab[data-tab="${targetTab}"]`);
        if (desktopTab) {
          desktopTab.classList.add('tab--active');
        }
        
        // Ocultar todo el contenido
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('tab-content--active');
        });
        
        // Mostrar contenido correspondiente
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('tab-content--active');
        }
      });
    });
  }
  
  // ============================
  // INICIALIZACIÓN
  // ============================
  document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación por pestañas
    setupTabNavigation();
    
    // Inicializar referencias a elementos
    const emitProfBtn = document.getElementById('emitProfBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const emitAmountProf = document.getElementById('emitAmountProf');
    const emitReason = document.getElementById('emitReason');
    circulanteEl = document.getElementById('circulante');
    inflacionEl = document.getElementById('inflacion');
    idxEl = document.getElementById('idx');
    const capMonthlyInput = document.getElementById('capMonthly');
    const alphaInput = document.getElementById('alpha');
    const savePolicy = document.getElementById('savePolicy');
    ledgerTableBody = document.getElementById('ledgerBody'); // CORREGIDO
    const exportCsv = document.getElementById('exportCsv');
    const alertsContainer = document.getElementById('alertsContainer');
    
    // Configurar valores iniciales en inputs de políticas
    if (capMonthlyInput) {
      capMonthlyInput.value = StateProf.capMonthly;
    }
    if (alphaInput) {
      alphaInput.value = StateProf.alfa;
    }
    
    // ============================
    // EVENT LISTENERS
    // ============================
    
    // Emitir Educoins
    if (emitProfBtn && emitAmountProf && emitReason) {
      emitProfBtn.addEventListener('click', () => {
        const amt = Number(emitAmountProf.value);
        const reason = emitReason.value.trim() || 'Emisión manual';
        
        if (!amt || amt <= 0) {
          return alert('Cantidad inválida');
        }
        
        // Verificar tope mensual
        if (amt > StateProf.capMonthly) {
          return alert(`Supera el tope mensual de ${StateProf.capMonthly} EDU`);
        }
        
        pushLedger('EMISIÓN', amt, reason);
        alert('Emisión registrada exitosamente');
        
        // Limpiar campos
        emitAmountProf.value = '';
        emitReason.value = '';
      });
    }
    
    // Simular impacto
    if (simulateBtn && emitAmountProf) {
      simulateBtn.addEventListener('click', () => {
        const amt = Number(emitAmountProf.value);
        
        if (!amt || amt <= 0) {
          return alert('Cantidad inválida para simular');
        }
        
        const currentTotal = StateProf.totalIssued + 
          LEDGER.reduce((sum, tx) => tx.type === 'EMISIÓN' ? sum + tx.amount : sum, 0);
        
        const simTotal = currentTotal + amt;
        const idx = calcValueIndex(simTotal);
        
        alert(`Simulación: Emisión de ${amt} EDU\n` +
              `Total circulante simulado: ${simTotal} EDU\n` +
              `Nuevo índice de valor: ${idx}`);
      });
    }
    
    // Guardar políticas
    if (savePolicy && capMonthlyInput && alphaInput) {
      savePolicy.addEventListener('click', () => {
        const cap = Number(capMonthlyInput.value);
        const a = Number(alphaInput.value);
        
        let updated = false;
        
        if (!isNaN(cap) && cap > 0) {
          StateProf.capMonthly = cap;
          updated = true;
        }
        
        if (!isNaN(a) && a >= 0) {
          StateProf.alfa = a;
          updated = true;
        }
        
        if (updated) {
          alert('Políticas guardadas correctamente');
          refreshMetrics();
        } else {
          alert('Por favor ingrese valores válidos');
        }
      });
    }
    
    // Exportar CSV
    if (exportCsv) {
      exportCsv.addEventListener('click', () => {
        if (LEDGER.length === 0) {
          return alert('No hay transacciones para exportar');
        }
        
        const csvRows = [['Fecha', 'Tipo', 'Detalle', 'Monto (EDU)']];
        
        LEDGER.forEach(tx => {
          csvRows.push([
            new Date(tx.ts).toISOString(),
            tx.type,
            tx.desc,
            tx.amount
          ]);
        });
        
        const csvContent = csvRows
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
    
    // Inicializar métricas
    refreshMetrics();
    
    // Demo: Alertas (simuladas)
    setTimeout(() => {
      if (alertsContainer) {
        alertsContainer.innerHTML = `
          <div class="alert alert--warn">
            ⚠️ Inflación simulada alcanzó 5% — revise políticas de emisión
          </div>
          <div class="alert alert--warn mt-1">
            ⚠️ Se ha alcanzado el 80% del tope mensual
          </div>
        `;
      }
    }, 1500);
  });