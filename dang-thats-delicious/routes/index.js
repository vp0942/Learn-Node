const express = require('express');
const storeController = require("../controllers/storeController");
const router = express.Router();

// Do work here
router.get('/', storeController.myMiddleware, storeController.homePage);

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
  // res.send(req.params.name);
});

module.exports = router;
