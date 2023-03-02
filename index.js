import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';


import { registerValidation } from './validations/auth.js';
import userModel from './models/User.js'

mongoose
    .connect('mongodb+srv://admin:cjh0RTbuioCIBQ3f@cluster0.dbo7krm.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => { console.log('DB ok') })
    .catch((err) => { console.log('DB Error', err) })

const app = express();

app.use(express.json());

app.post('/auth/login', async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                massage: 'Incorrect login or password'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(404).json({
                massage: 'Incorrect login or password'
            })
        }

        const token = jwt.sign({
            _id: user._id
        },
            'secret123',
            { expiresIn: '30d' });

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            massage: 'Failed to login!'
        })
    }
})

app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }

        const password = req.body.password;
        const solt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, solt);

        const doc = new userModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        });

        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id
        },
            'secret123',
            { expiresIn: '30d' })

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            massage: 'Failed to register!'
        })
    }


});



const PORT = 777;

app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log(`Server started on localhost:${PORT}`)
})