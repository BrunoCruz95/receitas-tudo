const localStrategy = require('passport-local').Strategy
const mongoose      = require('mongoose');
const bcrypt        = require('bcryptjs');

// MODEL DE USUÁRIO
require('../models/Usuario')
const Usuario = mongoose.model('usuarios');

module.exports = function (passport) {
    passport.use(new localStrategy({usernameField: 'nome', passwordField: 'senha'}, (nome, senha, done) => {
        Usuario.findOne({ nome: nome }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" });
            }
            bcrypt.compare(senha, usuario.senha, (error, batem) => {   
                if (batem) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: "Senha incorreta" });
                }
            })
        })
    }))
    // SALVAR OS DADOS EM UMA SESSÃO
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    })
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (error, usuario) => {
            done(error, usuario);
        })
    })
}
