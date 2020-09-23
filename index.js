// Importando express
const express = require("express");
const app = express();
// Importando bodyParser
const bodyParser = require("body-parser");
// Importando cors
const cors = require("cors");
// Importar JWT
const jwt = require("jsonwebtoken");

// Gerando token, pode ser qualquer coisa
const JWTsecret = "dlçsamfdklsdhfljhalkdjhfglaihfr34334rkfj3"

// Habilitando cors
app.use(cors());

// Criando Middleware, validando token
function auth(req, res, next) {
    const authToken = req.headers["authorization"];

    if (authToken != undefined) {
        // Cria um array separando string com " " como delimitador
        const bearer = authToken.split(" ");
        var token = bearer[1];

        // Validando token usanto a senha para descriptografar
        jwt.verify(token, JWTsecret, (err, data) => {
            if (err) {
                res.status(401);
                res.json({ err: "Token inválido!" })
            } else {
                req.token = token;
                req.loggedUser = { id: data.id, email: data.email };
                next();
            }
        });

    } else {
        res.status(401);
        res.json({ err: "Token inválido!" })
    }
}

// Configurando bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Criando banco de dados falso

var DB = {
    games: [
        {
            id: 23,
            title: "Call of duty",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of Thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users: [
        {
            id: 1,
            name: "João Teixeira",
            email: "jpteixeira1308@gmail.com",
            password: "123456"
        },
        {
            id: 20,
            name: "Gi",
            email: "ppgiovana@gmail.com",
            password: "123456"
        }
    ]
}

// Criando primeira rota listando todos games
app.get("/games", auth, (req, res) => {
    res.statusCode = 200;
    // Acessando variavel que está dentro do middleware
    res.json({ user: req.loggedUser, games: DB.games });
});

// Rota para listar um game
app.get("/game/:id", (req, res) => {
    // Valida se o parametro e valido
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        // Se for valido converte o id para int e consulta no "banco de dados"
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if (game != undefined) {
            // Retorna o game
            res.statusCode = 200;
            res.json(game);
        } else {
            // Retorna o statusCode
            res.sendStatus(404);
        }
    }
});
// Rota para cadastra game
app.post("/game", (req, res) => {
    // Pegando valores usando destructuring
    var { title, price, year } = req.body;
    // Adicionando valor ao array
    DB.games.push({
        id: 22,
        title,
        price,
        year
    });

    res.sendStatus(200);

})

// Rota para deletar um game
app.delete("/game/:id", (req, res) => {
    // Valida se o parametro e um numero
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        // Converte o numero para int e procura no JSON
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);
        // Valida se o numero existe
        if (index == -1) {
            res.sendStatus(404);
        } else {
            // deleta o registro do "banco de dados"
            DB.games.splice(index, 1);
            res.sendStatus(200);
        }
    }
});

// Rota para edição
app.put("/game/:id", (req, res) => {
    // Valida se o parametro e valido
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        // Se for valido converte o id para int e consulta no "banco de dados"
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if (game != undefined) {
            // Edita o game

            var { title, price, year } = req.body;

            if (title != undefined) {
                game.title = title;
            }
            if (price != undefined) {
                game.price = price;
            }
            if (year != undefined) {
                game.year = year;
            }

            res.sendStatus(200);

        } else {
            // Retorna o statusCode
            res.sendStatus(404);
        }
    }
})

// Rota para autenticação
app.post("/auth", (req, res) => {
    var { email, password } = req.body;

    if (email != undefined) {
        var user = DB.users.find(u => u.email == email);

        if (user != undefined) {
            if (user.password == password) {

                // Utilizando o token
                jwt.sign({ id: user.id, email: user.email }, JWTsecret, { expiresIn: "48h" }, (err, token) => {
                    if (err) {
                        res.status(400);
                        res.json({ err: "Falha interna" });
                    } else {
                        res.status(200);
                        res.json({ token: token });
                    }
                });
            } else {
                res.status(401);
                res.json({ err: "Email ou senha invalidos!" });
            }
        } else {
            res.status(404);
            res.json({ err: "Email ou senha invalidos!" });
        }

    } else {
        res.status(400);
        res.json({ err: "Email ou senha invalidos!" });
    }
});

// Abrindo porta servidor
app.listen(3000, () => {
    console.log("API RODANDO!");
});