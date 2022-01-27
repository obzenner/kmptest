'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { parseData } = require('./parser');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
  const useKMP = Boolean(req.body.kmp);
  const tag = useKMP ? 'Using KMP' : 'Using REGEX';
  const start = process.hrtime()
  const data = await parseData(useKMP);
  res.send(`${tag}: Done in ${process.hrtime(start)} sec; ${5000 - data.length} keywords removed.`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);