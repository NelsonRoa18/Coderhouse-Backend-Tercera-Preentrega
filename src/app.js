import express from 'express';
import session from 'express-session';

import MongoStore from 'connect-mongo';
import mongoose from 'mongoose'
import path from 'path';
import __dirname from './utils.js'
import handlebars from 'express-handlebars'

import productsRouter from './routes/products.router.js'
import messagesRouter from './routes/message.router.js'
import updateRouter from './routes/update.router.js'
import cartRouter from './routes/carts.router.js'

import sessionsRouter from './routes/api/sessions.js';
import viewsRouter from './routes/views.routes.js';

import dotenv from 'dotenv';

import passport from "passport";
import initializePassport from './config/passport.config.js';
import initializeSocket from './sockets.js';

dotenv.config()
console.log(process.env.MONGO_URL);


const app = express()
const PORT = 8080

//Middleware para poder entender json en las solicitudes 
app.use(express.json())
//Para sacar parametros del enlace (endpoint) se usa esta linea de codigo
app.use(express.urlencoded({ extended: true }))

//Inicializamos el motor
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));

//Indicamos en que parte estaran las vistas
app.set('views',path.join(__dirname, './views') )

//Indicamos que motor de plantillas se usara, 'view engine', 'handlebars'
app.set('view engine', 'handlebars')

//Seteamos de manera estatica nuestra carpeta
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URL)
    .then(() => { console.log("Conectado a la base de datos") })
    .catch(error => (console.error("Error en la conexion", error)))


//----------------------------------------//

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    // cookie: { maxAge: 180 * 60 * 1000 },
}));

app.use('/products', productsRouter)
app.use('/chats', messagesRouter)
app.use('/update', updateRouter)
app.use('/carts', cartRouter)

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);


//-------------------------------------------//

const httpServer = app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

initializeSocket(httpServer);