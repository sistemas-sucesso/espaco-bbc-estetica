const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//app.get('/edit-transacao/:id', (req, res) => {
  //  res.sendFile(path.join(__dirname, 'public', 'views', 'edit.html'));
//});
let transacoes = [];

//app.use(express.json());
const db = mysql.createConnection({
    host: 'b9lsqlxrc1wrcggnqosi-mysql.services.clever-cloud.com',
    user: 'ugcnyroeqou4hr6n',
    password: 'fmIducXVC9LOVxi6KgPB',
    database: 'b9lsqlxrc1wrcggnqosi'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco de dados com sucesso.');
});



app.get('/api/dados', (req, res) => {
    const query = `
        SELECT
            id,
            tipo,
            forma_pagamento,
            valor,
            NOME_DO_ITEM,
            DATE_FORMAT(data, '%Y-%m-%d') AS data,
            SUM(CASE WHEN tipo = 'entrada' AND fechado = FALSE THEN valor ELSE 0 END) AS total_entrada,
            SUM(CASE WHEN tipo = 'saida' AND fechado = FALSE THEN valor ELSE 0 END) AS total_saida,
            (SUM(CASE WHEN tipo = 'entrada' AND fechado = FALSE THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'saida' AND fechado = FALSE THEN valor ELSE 0 END)) AS saldo,
            SUM(CASE WHEN tipo = 'entrada' AND DATE(data) = CURDATE() AND fechado = FALSE THEN valor ELSE 0 END) AS total_entrada_dia,
            SUM(CASE WHEN tipo = 'saida' AND DATE(data) = CURDATE() AND fechado = FALSE THEN valor ELSE 0 END) AS total_saida_dia,
            SUM(CASE WHEN tipo = 'entrada' AND WEEK(data) = WEEK(CURDATE()) AND fechado = FALSE THEN valor ELSE 0 END) AS total_entrada_semana,
            SUM(CASE WHEN tipo = 'saida' AND WEEK(data) = WEEK(CURDATE()) AND fechado = FALSE THEN valor ELSE 0 END) AS total_saida_semana,
            SUM(CASE WHEN tipo = 'entrada' AND MONTH(data) = MONTH(CURDATE()) AND fechado = FALSE THEN valor ELSE 0 END) AS total_entrada_mes,
            SUM(CASE WHEN tipo = 'saida' AND MONTH(data) = MONTH(CURDATE()) AND fechado = FALSE THEN valor ELSE 0 END) AS total_saida_mes
        FROM transacoes;
    `;

    db.query(query, (err, result) => {
        if (err) throw err;

        const saldo = parseFloat(result[0].saldo) || 0;
        const total_entrada = parseFloat(result[0].total_entrada) || 0;
        const total_saida = parseFloat(result[0].total_saida) || 0;
        const total_entrada_dia = parseFloat(result[0].total_entrada_dia) || 0;
        const total_saida_dia = parseFloat(result[0].total_saida_dia) || 0;
        const total_entrada_semana = parseFloat(result[0].total_entrada_semana) || 0;
        const total_saida_semana = parseFloat(result[0].total_saida_semana) || 0;
        const total_entrada_mes = parseFloat(result[0].total_entrada_mes) || 0;
        const total_saida_mes = parseFloat(result[0].total_saida_mes) || 0;

        const queryTransacoes = `
            SELECT
                id, tipo, forma_pagamento, valor, NOME_DO_ITEM,
                DATE_FORMAT(data, '%Y-%m-%d') AS data
            FROM transacoes;
        `;

        db.query(queryTransacoes, (err, transacoes) => {
            if (err) throw err;
            res.json({
                saldo,
                total_entrada,
                total_saida,
                total_entrada_dia,
                total_saida_dia,
                total_entrada_semana,
                total_saida_semana,
                total_entrada_mes,
                total_saida_mes,
                transacoes
            });
        });
    });
});

app.post('/add-transacao', (req, res) => {
    const { tipo, valor, data, forma_pagamento, nome_do_item } = req.body;
    const query = 'INSERT INTO transacoes (tipo, valor, data, forma_pagamento, NOME_DO_ITEM, fechado) VALUES (?, ?, ?, ?, ?, FALSE)';
    db.query(query, [tipo, valor, data, forma_pagamento, nome_do_item], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao adicionar transação' });
        } else {
            res.status(201).json({
                id: result.insertId,
                tipo,
                valor,
                data,
                forma_pagamento,
                nome_do_item
            });
        }
    });
});
// Rota para buscar uma transação por ID
app.get('/api/transacoes/:id', (req, res) => {
    const { id } = req.params;
    console.log('ID recebido para busca:', id); // Verificar se o ID está sendo passado corretamente

    const query = 'SELECT id, tipo, valor, data, forma_pagamento, NOME_DO_ITEM FROM transacoes WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar transação:', err); // Logar o erro se ocorrer
            return res.status(500).json({ error: 'Erro ao buscar transação' });
        }

        console.log('Resultado da busca:', result); // Verificar o resultado da busca

        if (result.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json(result[0]);
    });
});

// Rota para atualizar uma transação
app.post('/update-transacao', (req, res) => {
    const { id, nome_do_item, tipo, valor, data, forma_pagamento } = req.body;
    console.log('Dados recebidos para atualização:', req.body); // Verificar os dados recebidos

    if (!id || !nome_do_item || !tipo || !valor || !data || !forma_pagamento) {
        console.warn('Dados incompletos:', req.body); // Logar se houver dados faltando
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const query = 'UPDATE transacoes SET tipo = ?, valor = ?, data = ?, forma_pagamento = ?, NOME_DO_ITEM = ? WHERE id = ?';
    db.query(query, [tipo, valor, data, forma_pagamento, nome_do_item, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar transação:', err); // Logar o erro se ocorrer
            return res.status(500).json({ error: 'Erro ao atualizar transação' });
        }

        console.log('Resultado da atualização:', result); // Verificar o resultado da atualização

        if (result.affectedRows === 0) {
            console.warn('Transação não encontrada para atualizar. ID:', id); // Logar se não encontrar a transação
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.status(200).json({ success: 'Transação atualizada com sucesso' });
    });
});


app.post('/delete-transacao', (req, res) => {
    const { id } = req.body;
    const query = 'DELETE FROM transacoes WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

