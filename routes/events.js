const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;


//Cria um evento
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) { return res.status(500).send({ error: error }) }
        //Insere dados na tabela events
        conn.query(
            //Versão simplificada de INSERT INTO (Necessário colocar as colunas na ordem correta)
            'INSERT INTO events SET ?',
            {
                name: req.body.name,
                description: req.body.description,
                start_date: req.body.start_date,
                end_date: req.body.end_date
            },
            (error, result) => {
                conn.release();
                //Se der erro ao inserir os dados
                if (error) { return res.status(500).send({ error: error, response: null }) }

                //Constante de resposta
                const response = {
                    mensagem: "evento criado com sucesso!",
                    event: {
                        id: result.id,
                        name: req.body.name,
                        description: req.body.description,
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        request: {
                            method: 'POST',
                            description: "Listagem dos eventos",
                            url: 'http://localhost:3000/events'
                        }
                    }
                }

                //Retorna a constante response com o status de 201 OK
                return res.status(201).send(response);
            }
        )

    })
})

//Retorna uma lista com todos os eventos
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM events',
            (error, result) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }

                //Verifica se existe registros a mostrar
                if (result.length < 1) { return res.status(404).send({ message: "Nenhum evento foi encontrado!" }) }

                const response = {
                    quantidade: result.length,
                    events: result.map(event => {
                        return {
                            id: event.id,
                            name: event.name,
                            description: event.description,
                            start_date: event.start_date,
                            end_date: event.end_date,
                            request: {
                                method: 'GET',
                                descricao: 'Detalhes do evento',
                                URL: 'http://localhost:3000/events/' + event.id
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    })
})

//Retorna detalhes de um evento específico
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM events WHERE id = ?',
            [req.params.id],
            (error, result, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }

                //Verifica se existe um evento com esse id
                if (result.length < 1) { return res.status(404).send({ message: "Esse evento não existe!" }) }

                const response = {
                    event: {
                        details: result[0],
                        /*id: result[0].id,
                        name: result[0].name,
                        description: result[0].description,
                        start_date: result[0].start_date,
                        end_date: result[0].end_date,*/
                        request: {
                            method: 'GET',
                            description: 'Lista todos os eventos',
                            URL: 'http://localhost:3000/events'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    })

})

//Deleta um evento
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        //Primeira consulta para trazer os detalhes do evento a ser deletado
        conn.query(
            'SELECT name FROM events WHERE id = ?',
            [req.params.id],
            (error, result) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }

                //Verifica se existe um evento com esse id
                if (result.length < 1) { return res.status(404).send({ message: 'Evento não encontrado!' }) }

                //Nome do evento que será deletado
                const eventName = result[0].name;

                //Segunda consulta para deletar o evento
                conn.query(
                    'DELETE FROM events WHERE id = ?',
                    [req.params.id],
                    (error, result) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }

                        //Verifica se o evento existe
                        //Já verifiquei na query anterior, desnecessário essa
                        //if(result.length < 1){return res.status(404).send({message: "Esse evento não existe!"})}

                        const response = {
                            message: `O evento ${eventName} foi deletado com sucesso!`,
                            request: {
                                method: 'DELETE',
                                descricao: 'Lista de eventos',
                                URL: 'http://localhost:3000/events'
                            }
                        }
                        return res.status(200).send(response);
                    }
                )
            }
        )
    })
})

//Edita informações
router.patch('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        //Primeira chamada atualiza os dados 
        conn.query(
            'UPDATE events SET name = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?',
            [req.body.name, req.body.description, req.body.start_date, req.body.end_date, req.params.id],
            (error, result) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }

                //Verifica se o ID existe
                if (result.affectedRows < 1) { return res.status(404).send({ message: "Evento não encontrado!" }) }

                //Segunda chamada mostra o evento com os dados atualizados
                conn.query(
                    'SELECT * FROM events WHERE id = ?',
                    [req.params.id],
                    (error, result) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }

                        const response = {
                            message: "Evento editado com sucesso",
                            event: {
                                details: result[0],
                                request:{
                                    method: 'PATCH',
                                    descricao: 'Listagem dos eventos',
                                    URL: 'http://localhost:3000/events'
                                }
                            }
                        }
                        return res.status(200).send(response);
                    }
                )
            }
        )
    })
})

module.exports = router;