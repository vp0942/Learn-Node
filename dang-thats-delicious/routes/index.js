const express = require('express');
const storeController = require("../controllers/storeController");
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
// catchErrors() will catch any errors thrown by the create Store async function
// and pass them to the errorHandlers.js file
router.post('/add', catchErrors(storeController.createStore));

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
  // res.send(req.params.name);
});

module.exports = router;
