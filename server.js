/**
 * Making a simple server using express
 * Connection should be on port: 5000
 * All routes are loaded from: routes/index.js
 */
// import { express } from 'express';
const express = require('express');

const appControllers = require('./routes/index');

const app = express();
const port = process.env.PORT || '5000';

app.use('/', appControllers);

app.listen((port), () => {
  console.log('Connected to the server at port:', port);
});
