if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://receitas-tudo:<brunobenson>@cluster0.odaru.mongodb.net/<dbname>?retryWrites=true&w=majority"}
}else{
module.exports = {mongoURI: "mongodb://localhost/receita-culinaria"}
}