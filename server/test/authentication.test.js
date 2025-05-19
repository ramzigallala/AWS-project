const axios = require('axios');

describe('Login API', () => {
    const userData = {
        email: 'test@example.com',
        password: 'securepassword'
    };

    it('should return error with incorrect credentials', async () => {
        try {
            await axios.post('http://localhost:3000/api/login', userData);
        } catch (err) {
            expect(err.response.status).not.toBe(200);
            expect(err.response.data.message).toBe('Credenziali errate');
        }
    });
});


describe('Registration API', () => {
    const userData = {
        email: 'newuser@example.com',
        name: 'Mario',
        surname: 'Rossi',
        password: 'password123'
    };

    it('should register a new user with valid data', async () => {


        const res = await axios.post('http://localhost:3000/api/register', userData);

        expect(res.status).toBe(201);
        expect(res.data.message).toBe('Registrazione completata');
    });

    it('should return an error if the email is already in use', async () => {

        try {
            await axios.post('http://localhost:3000/api/register', userData);
        } catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data.message).toBe('Utente già presente');
        }
    });

    it('should return error with incorrect credentials', async () => {
        try {
            await axios.post('http://localhost:3000/api/login', {email:userData.email, password:userData.password});
        } catch (err) {
            expect(err.response.status).toBe(200);
        }
    });
});

