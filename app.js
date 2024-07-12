const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let users = require('./users.json');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.send('User already exists');
    }
    users[username] = { password, assessments: [] };
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        return res.redirect(`/dashboard?username=${username}`);
    }
    res.send('Invalid login');
});

app.get('/dashboard', (req, res) => {
    const { username } = req.query;
    res.render('dashboard', { username });
});

app.get('/assessment', (req, res) => {
    const { username } = req.query;
    res.render('assessment', { username });
});

app.post('/assessment', (req, res) => {
    const { username, score } = req.body;
    users[username].assessments.push({ date: new Date(), score: parseInt(score) });
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.redirect(`/analysis?username=${username}`);
});

app.get('/analysis', (req, res) => {
    const { username } = req.query;
    const assessments = users[username].assessments;
    const recentAssessment = assessments[assessments.length - 1];
    let message = 'Your mental health is good.';
    if (recentAssessment.score > 5) {
        message = 'You might be experiencing stress or burnout.';
    }
    res.render('analysis', { username, message });
});

app.get('/resources', (req, res) => {
    res.render('resources');
});

app.get('/forum', (req, res) => {
    res.render('forum');
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
