#!/usr/bin/env node
/**
 * Making a simple server using express
 * Connection should be on port: 5000
 * All routes are loaded from: routes/index.js
 */

const express = require('express');
const appControllers = require('./routes/index');

const app = express();
const port = process.env.PORT || '5000';

app.use('/', appControllers);

app.listen((port), () => {
  console.log('Server running on port', port);
});
