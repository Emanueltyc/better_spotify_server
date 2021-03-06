
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricFinder = require('lyrics-finder');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    });

    spotifyApi.refreshAccessToken()
        .then(data => {
            res.json({
                accessToken: data.body.access_token,
                expiresIn: data.body.expires_in
            });
        }).catch(() => {
            res.sendStatus(400);
        });
});

app.post('/login', (req, res) => {
    const code = req.body.code;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    });

    spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in
            });
        }).catch(() => {
            res.sendStatus(400);
        })
});

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricFinder(req.query.artist, req.query.track) || 'No Lyrics found! :('
    res.json({ lyrics });
});

app.listen(3001, () => console.log('running!'));