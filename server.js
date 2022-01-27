'use strict';

const express = require('express');
const { parseData } = require('./parser');
// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', async (req, res) => {
  const start = process.hrtime()
  const data = await parseData();
  res.send(`Done in ${process.hrtime(start)} sec; ${5000 - data.length} keywords removed.`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);