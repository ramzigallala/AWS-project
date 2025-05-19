const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

// @route   POST /api/register
router.post('/register', async (req, res) => {

    try {

        const resultOfAdding = await userController.addUser(req.body);
        if(resultOfAdding.success){
            res.status(201).json({ message: 'Registrazione completata' });
        }else{
            return res.status(400).json({ message: resultOfAdding.status });
        }

    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const authenticateResult = await userController.authenticateUser(email, password);
        if(!authenticateResult) return res.status(400).json({ message: 'Credenziali errate' });
        else res.status(200).json({name:authenticateResult.name, surname:authenticateResult.surname});


    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;