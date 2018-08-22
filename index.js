var express = require('express');
var bodyParser = require('body-parser');
var db = require('./connection');
var routes = require('./routes/routes');

var app = express();
const port = 8080;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    if(req.methods == "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/', routes)

app.listen(port, ()=>console.log('Corriendo en el puerto '+ port));