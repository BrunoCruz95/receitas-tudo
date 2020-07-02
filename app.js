// CARREGANDO MÓDULOS
const express    = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app        = express();
//const admin      = require('./routes/admin'); // PREFIXO
const path       = require('path');
const mongoose   = require('mongoose');
const session    = require('express-session');
const flash      = require('connect-flash');
const usuarios   = require('./routes/user');
const passport   = require('passport');
require('./config/auth')(passport);
const db         = require('./config/db');

//CONFIGURAÇÕES
// SESSÃO
app.use(session({
    secret: "culinaria",
    resave: true,
    saveUninitialized: true
}))

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// FLASH
app.use(flash());

// MIDDLEWARES
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg   = req.flash("error_msg");
    res.locals.error       = req.flash("error");
    res.locals.user        = req.user || null;
    next();
})

// BODY-PARSER
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// MOMENT
const moment = require('moment');

//HANDLEBARS
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY')
        },
        formatTime: (date) => {
            return moment(date).format('HH:mm:ss')
        }
    }
}));
app.set('view engine', 'handlebars');

//MONGOOSE
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(() => {
    console.log("Conectado ao mongo");
}).catch((erro) => {
    console.log("Erro ao se conectar "+erro);
})

// PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.render('index');
})

// ROTA SOBRE
app.get('/sobre', (req, res) => {
    res.render('sobre');
})

// ROTA ADMIN
//app.use('/admin', admin);

// ROTA USUARIOS
app.use('/user', usuarios);

// OUTROS
const PORTA = process.env.PORT || 8081
app.listen(PORTA, ()=>{
    console.log("Servidor rodando!");
})