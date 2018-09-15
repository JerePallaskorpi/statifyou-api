const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

const redirectUri = process.env.REDIRECT_URI || 'http://localhost:8888/api/callback';

app.get('/api/login', (req, res) => {
    res.redirect(`https://accounts.spotify.com/authorize?${
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email user-top-read user-read-recently-played',
            redirect_uri: redirectUri,
        })}`);
});

app.get('/api/callback', (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        },
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        json: true,
    };
    request.post(authOptions, (error, response, body) => {
        const accessToken = body.access_token;
        const uri = process.env.FRONTEND_URI || 'http://localhost:3000';
        res.redirect(`${uri}?access_token=${accessToken}`);
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

const port = process.env.PORT || 8888;
app.listen(port);
