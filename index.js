import express from 'express';
import mongoose from 'mongoose';


import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import checkAuth from "./utils/checkAuth.js";

import * as UserController from './controllers/UserController.js'
import * as PostController from './controllers/PostController.js'


mongoose
    .connect('mongodb+srv://admin:cjh0RTbuioCIBQ3f@cluster0.dbo7krm.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => { console.log('DB ok') })
    .catch((err) => { console.log('DB Error', err) })

const app = express();

app.use(express.json());

app.post('/auth/login', loginValidation, UserController.login)
app.post('/auth/register', registerValidation, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', PostController.update);






const PORT = 777;

app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log(`Server started on localhost:${PORT}`)
})