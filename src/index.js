const db = require('../db.json')
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
/* const fs = require('fs'); */

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

/* function persistData(data) {
  fs.writeFile('db.json', JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('done writing...')
  })
}
 */

// Middlewares

function checksIfUserIsAlreadyRegistered(req, res, next) {
  const { email, phone } = req.body;

  const checkEmail = db.find((person) => person.email === email);
  const checkPhone = db.find((person) => person.phone === phone);

  if (!checkEmail && !checkPhone) {
    return next();
  }

  return res.status(400).json({error: "E-mail and/or phone already registered!"})
}

function checksIfUserEmailIsRegistered(req, res, next) {
  const { email } = req.body;

  const checkEmail = db.find((person) => person.email === email);

  if (!checkEmail) {
    return res.status(400).json({error: "Invalid E-mail!"})
  }

  return next();
}

/* app.get('/', (req, res) => {
  return res.send('Hello!')
}) */

app.post('/signup', checksIfUserIsAlreadyRegistered, (req, res) => {
  const { name, email, phone } = req.body;

  db.push({
    id: uuidv4(),
    name,
    email,
    phone, 
    points: 1
  })

  return res.status(201).json(db);
})

app.post('/referred', checksIfUserEmailIsRegistered, (req, res) => {
  const { email } = req.body;

  const user = db.find((item) => item.email === email);

  user.points = user.points + 1;

  return res.status(200).json(user);
})

app.get('/new-competition', (_, res) => {

  const dbLength = db.length

  db.splice(0, dbLength);

  return res.status(200).json(db);
})

app.get('/top10', (_, res) => {

  const usersOrderedByScore = db.sort((a, b) => {
    return b.points - a.points;
  })

  const topTen = usersOrderedByScore.filter((_, index) => index < 10);

  return res.status(200).json(topTen);
})

app.listen(port, () => console.log(`Listening on port ${port}`));