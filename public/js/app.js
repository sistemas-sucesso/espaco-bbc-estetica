function toggleForm() {
    const form = document.getElementById('transaction-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function editTransaction(id, nome_do_item, tipo, valor, data, forma_pagamento, barbeiro_id) {
    alert("barbeiro_id:", barbeiro_id);
    console.log("barbeiro_id:", barbeiro_id);
    const form = document.getElementById('edit-transaction-form');
    form.style.display = 'block';

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome_do_item').value = nome_do_item;
    document.getElementById('edit-tipo').value = tipo;
    document.getElementById('edit-valor').value = valor;
    document.getElementById('edit-data').value = data;
    document.getElementById('edit-forma_pagamento').value = forma_pagamento;
    const selectBarbeiro = document.getElementById('edit-barbeiro_id');
    if (selectBarbeiro) {
        selectBarbeiro.value = barbeiro_id;
        console.log("Valor do selectBarbeiro:", selectBarbeiro.value); // Verifique se o valor é correto
    }
}

function cancelEdit() {
    const form = document.getElementById('edit-transaction-form');
    form.style.display = 'none';
}
