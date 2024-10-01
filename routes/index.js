/**
 * Handler for all the app routes
 * for testing at the moment
 */

import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
// import FilesController from '../controllers/FilesController';

const express = require('express');

const router = express.Router();
router.use(express.json());   // Acts a middleware for all the request routes

router.get('/status', AppController.getStatus);   // helps in checking connection health to redis, and mongodb databases
router.get('/stats', AppController.getStats);     // Retrive some data from mongodb database { files and users } currently availble
router.post('/users', UsersController.postNew);   // handles adding new users to the database
router.get('/connect', AuthController.getConnect);   // you will need to provide Basic token
router.get('/disconnect', AuthController.getDisconnect);  // disconnects the users from the session created
router.get('/users/me', UsersController.getMe);  // checks if user is connected to the session
// router.post('/files', FilesController.postUpload);   // ??
// router.get('/files/:id', FilesController.getShow);
// router.get('/files', FilesController.getIndex);

module.exports = router;
