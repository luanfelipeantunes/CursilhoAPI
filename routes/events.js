const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;


//Cria um evento
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if(error){return res.status(500).send({error: error})}
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
                if(error) {return res.status(500).send({error:error, response:null})}

                //Constante de resposta
                const response = {
                    mensagem: "evento criado com sucesso!",
                    event: {
                        id: result.id,
                        name: result.name,
                        description: result.description,
                        start_date: result.start_date,
                        end_date: result.start_date,
                        request:{
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

module.exports = router;