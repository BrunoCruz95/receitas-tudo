if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://receitas-tudo:<brunobenson>@grupo.odaru.mongodb.net/<receitastudo>?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/receita-culinaria"}
}