const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Toteutetaan cors
app.use((req, res, next) => {
  //Sallitut sivustot, * = kaikki
  res.setHeader('Access-Control-Allow-Origin', '*');

  //Sallitut HTTP-metodit
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  //Sallitut Headerit
  //* sallii kaikki Headerit
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
  );

  //Jos verkkosivusto käyttää cookieita
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Content-type', 'application/json');

  next();
});

app.get('/api/:search', (req, res) => {
  const search = req.params.search;
  const data = fs
    .readFileSync('./sanakirja.csv', {
      encoding: 'utf8',
      flag: 'r',
    })
    .split('\r\n');
  const separatedData = data.map((line) => {
    const subLine = line.split(',');
    const dictionaryObject = {
      fin: subLine[0],
      en: subLine[1],
    };
    return dictionaryObject;
  });
  const match = separatedData.find(
    (item) => item.fin === search || item.en === search
  );
  if (match) {
    let response;
    if (match.fin === search) {
      response = match.en;
    }
    if (match.en === search) {
      response = match.fin;
    }
    res.json(response);
  } else {
    res.status(404).send('not found');
  }
});

app.post('/api', (req, res) => {
  const data = req.body;
  if ('fin' in data && 'en' in data) {
    const dataString = `${data.fin},${data.en}`;
    fs.appendFileSync('./sanakirja.csv', '\r\n' + dataString);

    res.status(201).send('word added to file');
  } else {
    res.status(400).send('malformatted data');
  }
});

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
