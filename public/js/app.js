document.addEventListener('DOMContentLoaded', () => {
    const saldoElement = document.getElementById('saldo');
    const totalEntradaElement = document.getElementById('total_entrada');
    const totalSaidaElement = document.getElementById('total_saida');
    const totalEntradaDiaElement = document.getElementById('total_entrada_dia');
    const totalSaidaDiaElement = document.getElementById('total_saida_dia');
    const totalEntradaSemanaElement = document.getElementById('total_entrada_semana');
    const totalSaidaSemanaElement = document.getElementById('total_saida_semana');
    const totalEntradaMesElement = document.getElementById('total_entrada_mes');
    const totalSaidaMesElement = document.getElementById('total_saida_mes');
    const transacoesBody = document.getElementById('transacoes-body');

    function formatDateForInput(dateString) {
        // Converte a data para o formato yyyy-MM-dd
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa do 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function fetchDados() {
        fetch('/api/dados')
            .then(response => response.json())
            .then(data => {
                saldoElement.textContent = data.saldo.toFixed(2);
                totalEntradaElement.textContent = data.total_entrada.toFixed(2);
                totalSaidaElement.textContent = data.total_saida.toFixed(2);
                totalEntradaDiaElement.textContent = data.total_entrada_dia.toFixed(2);
                totalSaidaDiaElement.textContent = data.total_saida_dia.toFixed(2);
                totalEntradaSemanaElement.textContent = data.total_entrada_semana.toFixed(2);
                totalSaidaSemanaElement.textContent = data.total_saida_semana.toFixed(2);
                totalEntradaMesElement.textContent = data.total_entrada_mes.toFixed(2);
                totalSaidaMesElement.textContent = data.total_saida_mes.toFixed(2);

                transacoesBody.innerHTML = '';
                data.transacoes.forEach(t => {
                    transacoesBody.innerHTML += `
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.tipo}</td>
                            <td>${t.forma_pagamento}</td>
                            <td>${t.valor}</td>
                            <td>${t.NOME_DO_ITEM}</td>
                            <td>${t.data}</td>
                            <td>
                                <a href="#" class="edit-btn" data-id="${t.id}">Editar</a>
                                <button class="delete-btn" data-id="${t.id}">Excluir</button>
                            </td>
                        </tr>
                    `;
                });
                attachDeleteHandlers();
                attachEditHandlers();
            });
    }

    function attachDeleteHandlers() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                fetch('/delete-transacao', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                }).then(response => {
                    if (response.ok) {
                        fetchDados();
                    }
                });
            });
        });
    }

    function attachEditHandlers() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Impede o link de navegar
                const id = button.getAttribute('data-id');
                openEditModal(id);
            });
        });
    }

    document.getElementById('add-transacao-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
      
        fetch('/add-transacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
          .then(newTransacao => {
              const transacoesBody = document.getElementById('transacoes-body');
              transacoesBody.innerHTML += `
                  <tr>
                      <td>${newTransacao.id}</td>
                      <td>${newTransacao.tipo}</td>
                      <td>${newTransacao.forma_pagamento}</td>
                      <td>${newTransacao.valor}</td>
                      <td>${newTransacao.NOME_DO_ITEM}</td>
                      <td>${newTransacao.data}</td>
                      <td>
                          <a href="#" class="edit-btn" data-id="${newTransacao.id}">Editar</a>
                          <button class="delete-btn" data-id="${newTransacao.id}">Excluir</button>
                      </td>
                  </tr>
              `;
              attachDeleteHandlers();
              attachEditHandlers();
              event.target.reset();
          })
          .catch(error => console.error('Erro ao adicionar transação:', error));
    });

    document.getElementById('fechar-caixa-btn').addEventListener('click', () => {
        fetch('/fechar-caixa', {
            method: 'POST'
        }).then(response => {
            if (response.ok) {
                fetchDados();
            }
        });
    });

    const modal = document.getElementById('edit-modal');
    const closeModalButton = document.querySelector('.modal .close');
    const editForm = document.getElementById('edit-transacao-form');
    const transacaoIdInput = document.getElementById('transacao-id');

    function openEditModal(id) {
        fetch(`/api/transacoes/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    transacaoIdInput.value = data.id;
                    document.getElementById('edit-tipo').value = data.tipo;
                    document.getElementById('edit-valor').value = data.valor;
                    document.getElementById('edit-data').value = formatDateForInput(data.data);
                    document.getElementById('edit-forma_pagamento').value = data.forma_pagamento;
                    document.getElementById('edit-nome_do_item').value = data.NOME_DO_ITEM;
                    modal.style.display = 'block';
                }
            })
            .catch(error => console.error('Erro ao carregar os detalhes da transação:', error));
    }

    function closeEditModal() {
        modal.style.display = 'none';
    }

    closeModalButton.addEventListener('click', closeEditModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeEditModal();
        }
    });

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());
        data.id = transacaoIdInput.value;
        console.log('dados a serem enviados', data);
        fetch('/update-transacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            console.log("Response", response);
            if (response.ok) {
                console.log("response.ok", response.ok)
                closeEditModal();
                fetchDados();
            }
        });
    });

    // Inicializa os dados
    fetchDados();
});

