'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { parseData, compareLists } = require('./parser');
const { createArtistsTable, saveToArtistsDB } = require('./db');
const AWS = require('aws-sdk');

AWS.config.update({
    region: 'eu-north-1',
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    endpoint: `http://localstack:${process.env.EDGE_PORT}`,
  });

const dynamoDB = new AWS.DynamoDB();
const dynamoDBClient = new AWS.DynamoDB.DocumentClient();

createArtistsTable(dynamoDB);

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
  saveToArtistsDB(dynamoDBClient, data);
  res.send(`${tag}: Done in ${process.hrtime(start)} sec; ${5000 - data.length} keywords removed.`);
});

app.get('/comparator', (req, res) => {
  const start = process.hrtime()
  const result = compareLists();
  res.send(`Comparator with KMP: Done in ${process.hrtime(start)} sec; result: ${result.length} blacklisted: ${result}`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);