/**
 * Handler for all the app routes
 * for testing at the moment
 */

import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';

const express = require('express');

const router = express.Router();
router.use(express.json());

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UserController.postNew);

module.exports = router;
