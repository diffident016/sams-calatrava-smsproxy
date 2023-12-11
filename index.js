require('dotenv').config();
const express = require('express');
const request = require('request');
const cors = require('cors')

const app = express();
const API_URL = 'https://api.semaphore.co/api/v4'
const apikey = process.env.SEMAPHORE_API_KEY
var CREDITS = 0

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.post('/api/send', (req, res) => {

    console.log(req.body)
    request(
        {
            url: `${API_URL}/messages`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                apikey: apikey,
                number: req.body.number,
                message: req.body.message,
            }
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json({ type: 'error', message: 'Error' });
            }

            CREDITS = CREDITS - 1;
            res.json(JSON.parse(body));
        }
    );
});


app.get('/api/messages', (req, res) => {
    request(
        { url: `${API_URL}/messages?apikey=${apikey}` },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json({ type: 'error', message: 'Error' });
            }

            res.json(JSON.parse(body));
        }
    );
});

app.get('/api/account', (req, res) => {
    try {
        return res.json({ credit_balance: CREDITS })
    } catch {
        console.log('ERROR')
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`The proxy server is running on ${PORT}`)

    try {
        request(
            { url: `${API_URL}/account?apikey=${apikey}` },
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    return res.json({ type: 'error', message: 'Error' });
                }

                CREDITS = JSON.parse(body)['credit_balance']
            }
        );
    } catch {
        console.log('ERROR')
    }

});