const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if(req.method === 'OPTIONS'){
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).send({});
  };

  next();
});

//Utilizando morgan para identificar logs
app.use(morgan('dev'));

//Para fazer upload de arquivos
app.use('/uploads', express.static('uploads'));

//Para captar dados simples (chave-valor) da url
app.use(bodyParser.urlencoded({extended: false}))

//Para captar dados do corpo de um json
app.use(bodyParser.json());

//-------------------------------------------
//Constantes das rotas
const rotaEvents = require('./routes/events');


//-------------------------------------------
//Chamada às rotas
app.use('/events', rotaEvents);



//Passa pelas outras rotas e não encontra, entra nessa
app.use((req, res, next) => {
  const erro = new Error('Não encontrado!');
  erro.status = 404;
  next(erro);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro:{
      mensagem: error.message
    }
  })
})

module.exports = app;

