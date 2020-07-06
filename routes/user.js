const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require("multer");
const path = require('path');

const puppeteer = require('puppeteer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, "IMG" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// HELPERS
// VOCÊ É UM USUÁRIO?
const { yes_user } = require('../helpers/yes_user');
// VOCÊ É UM ADMINISTRADOR?
const { yes_admin } = require('../helpers/yes_admin');

// MODELS
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
require("../models/Receita");
const Receita = mongoose.model("receitas");

//--------------------------USUARIOS--------------------------

//ROTA P/ CARREGAR O FORMULARIO REGISTRO
router.get('/registro/add', (req, res) => {
    res.render('usuario/registro');
})
//ROTA P/ SALVAR UM USUARIO
router.post('/registro/novo', (req, res) => {
    // VALIDAÇÕES
    var erros = []
    var cont = 0;
    if (!req.body.nome ||
        typeof req.body.nome == undefined ||
        req.body.nome == null) {
        cont++;
    }
    if (req.body.nome.length < 2) {
        cont++;
    }
    if (!req.body.senha ||
        typeof req.body.senha == undefined ||
        req.body.senha == null) {
        cont++;
    }
    if (req.body.senha.length < 4) {
        cont++;
    }
    if (req.body.senha != req.body.senha2) {
        cont++;
    }
    if (cont > 0) {
        erros.push({ texto: "Dados inválidos" });
        res.render('usuario/registro', { erros: erros });
    } else {
        Usuario.findOne({ nome: req.body.nome }).then((usuarios) => {
            const novo_usuario = new Usuario({
                nome: req.body.nome,
                senha: req.body.senha
            })
            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(novo_usuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                    }
                    novo_usuario.senha = hash;
                    novo_usuario.save().then(() => {
                        req.flash("success_msg", "Usuário criado com sucesso");
                        res.redirect('/');
                    }).catch((erro) => {
                        req.flash("error_msg", "Houve um erro ao registrar o usuário");
                        res.redirect('/user/registro/add');
                    })
                });
            })
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro");
            res.redirect("/");
        })
    }
})
//ROTA P/ CARREGAR O FORMULARIO LOGIN
router.get('/login', (req, res) => {
    res.render('usuario/login');
})
// ROTA PARA VERIFICAR OS DADOS DO LOGIN
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/inicio',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next)
    req.flash("success_msg", "Bem-Vindo ", req.body.nome);
})
//ROTA DE ERRO
router.get('/404', (req, res) => {
    res.send("Erro 404!");
})
//LOGOUT
router.get('/logout', yes_user, (req, res) => {
    req.logout();
    req.flash("success_msg", "Deslogado com sucesso!");
    res.redirect('/');
})

//--------------------------RECEITAS--------------------------

//ROTA HOMEPAGE
router.get('/inicio', yes_user, (req, res) => {
    Receita.find().sort({ date: 'desc' }).lean().then((receitas) => {
        res.render("usuario/inicio", { receitas: receitas });
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro");
        res.redirect('/404');
    })
})
//ROTA DE LISTAR RECEITAS
router.get('/receitas/lista', yes_user, yes_admin, (req, res) => {
    Receita.find().sort({ date: 'desc' }).lean().then((receitas) => {
        res.render("usuario/lista_receitas", { receitas: receitas });
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as receitas");
        console.log("Houve um erro: " + erro);
        res.redirect("/user");
    })
})
//ROTA DE LISTAR USUÁRIOS
router.get('/usuarios/lista', yes_user, yes_admin, (req, res) => {
    Usuario.find().sort({ date: 'desc' }).lean().then((usuarios) => {
        res.render("usuario/lista_usuarios", { usuarios: usuarios });
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as usuario");
        console.log("Houve um erro: " + erro);
        res.redirect("/user");
    })
})
//ROTA DE LISTAR TODAS AS RECEITAS
router.get('/receitas/outras', yes_user, (req, res) => {
    Receita.find().sort({ date: 'desc' }).lean().then((receitas) => {
        res.render("usuario/outras_receitas", { receitas: receitas });
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as receitas");
        console.log("Houve um erro: " + erro);
        res.redirect("/user");
    })
})
//ROTA PARA CARREGAR O FORMULARIO RECEITA
router.get('/receitas/add', yes_user, yes_admin, (req, res) => {
    res.render('usuario/adiciona_receitas');
})
//ROTA DE ADICIONAR RECEITA
router.post('/receitas/nova', upload.single("file"), yes_user, yes_admin, (req, res) => {
    // VALIDAÇÕES
    var erros = [];
    var variavel = 0;
    if (!req.body.tituloReceita ||
        typeof req.body.tituloReceita == undefined ||
        req.body.tituloReceita == null) {
        variavel++;
    }
    if (!req.body.assuntoReceita ||
        req.body.assuntoReceita == undefined ||
        req.body.assuntoReceita == null) {
        variavel++;
    }
    if (!req.body.autorReceita ||
        req.body.autorReceita == undefined ||
        req.body.autorReceita == null) {
        variavel++;
    }
    if (!req.body.material1Receita ||
        req.body.material1Receita == undefined ||
        req.body.material1Receita == null) {
        variavel++;
    }
    if (!req.body.passo1Receita ||
        req.body.passo1Receita == undefined ||
        req.body.passo1Receita == null) {
        variavel++;
    }
    if (variavel > 0) {
        erros.push({ texto: "Dados inválidos" });
        res.render('usuario/adiciona_receitas', { erros: erros });
    } else {
        const nova_receita = {
            titulo: req.body.tituloReceita,
            autor: req.body.autorReceita,
            assunto: req.body.assuntoReceita,
            material1: req.body.material1Receita,
            material2: req.body.material2Receita,
            material3: req.body.material3Receita,
            material4: req.body.material4Receita,
            material5: req.body.material5Receita,
            passo1: req.body.passo1Receita,
            passo2: req.body.passo2Receita,
            passo3: req.body.passo3Receita,
            passo4: req.body.passo4Receita,
            passo5: req.body.passo5Receita
        }
        new Receita(nova_receita).save().then(() => {
            req.flash("success_msg", "Receita adicionado com sucesso");
            res.redirect('/user/receitas/lista');
        }).catch((erro) => {
            console.log("Erro ao salvar receita " + erro);
        })
    }
})
//ROTA P/ CARREGAR O FORMULARIO DE EDIÇÃO DE RECEITA
router.get("/receitas/editar/:id", yes_user, yes_admin, (req, res) => {
    Receita.findOne({ _id: req.params.id }).lean().then((receita) => {
        res.render("usuario/editar_receitas", { receita: receita })
    }).catch((erro) => {
        req.flash("error_msg", "Esta receita não existe")
        res.redirect("/user/receitas/lista")
    })
})

//ROTA DE SALVAR A EDIÇÃO
router.post("/receitas/editar", yes_user, yes_admin, (req, res) => {
    Receita.findOne({ _id: req.body.id }).then((receita) => {
        receita.titulo = req.body.tituloReceita,
            receita.autor = req.body.autorReceita,
            receita.assunto = req.body.assuntoReceita,
            receita.material1 = req.body.material1Receita,
            receita.material2 = req.body.material2Receita,
            receita.material3 = req.body.material3Receita,
            receita.material4 = req.body.material4Receita,
            receita.material5 = req.body.material5Receita,
            receita.passo1 = req.body.passo1Receita,
            receita.passo2 = req.body.passo2Receita,
            receita.passo3 = req.body.passo3Receita,
            receita.passo4 = req.body.passo4Receita,
            receita.passo5 = req.body.passo5Receita
        receita.save().then(() => {
            req.flash("success_msg", "Receita editada com sucesso!")
            res.redirect("/user/receitas/lista")
        }).catch((erro) => {
            req.flash("error_msg", "Erro ao editar ao editar a receita")
            res.redirect("/user/receitas/lista")
        })
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao editar a receita")
        res.redirect("/user/receitas/lista")
    })
})
//ROTA DE DELETAR UMA RECEITA
router.post("/receitas/deletar", yes_user, yes_admin, (req, res) => {
    Receita.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Receita deletada com sucesso!")
        res.redirect("/user/receitas/lista")
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar receita")
        res.redirect("/user/receitas/lista")
    })
})
//ROTA DE BAIXAR UMA RECEITA
router.post("/receitas/deletar", yes_user, yes_admin, (req, res) => {
    Receita.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Receita deletada com sucesso!")
        res.redirect("/user/receitas/lista")
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao deletar receita")
        res.redirect("/user/receitas/lista")
    })
})
//ROTA DE BAIXAR ARQUIVO
router.post("/baixar", yes_user, (req, res) => {
    
    (async function () {
        try {
            const browser = await puppeteer.launch();
            const page    = await browser.newPage();

            await page.setContent(`
            <center>
            <br><br><br><br><br>
            <h1>Todas as receitas você encontra aqui</h1>
            <p> Este é um simples site de receitas onde
            você pode aprender e ajudar outras pessoas
            a fazerem aquele famoso prato especial.</p>
            <h2>Por Bruno Cruz</h2>
            </center>
            `);
            await page.emulateMediaType('screen');
            await page.pdf({
                path: 'download'+Date.now()+".pdf",
                format: 'A4',
                printBackground: true
            });
            req.flash("success_msg", "Download realizado com sucesso!")
            console.log('PDF realizado com sucesso');
            res.redirect("/user/inicio");
        } catch (err) {
            console.log("Error: " + err);
            req.flash("error_msg", "Erro ao realizado o download!")
            res.redirect("/user/inicio");
        }
    })();
})
//ROTA DE CONFIGURAÇÃO
router.get('/usuarios/configura', yes_user, (req, res) => {
    res.render("usuario/configura");
})


module.exports = router;