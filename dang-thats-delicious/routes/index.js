const express = require('express');
const storeController = require("../controllers/storeController");
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');

// catchErrors() middleware will catch any errors thrown by the handlers
// and pass them to the errorHandlers.js file  storeController.upload,
  catchErrors(storeController.resize),
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

module.exports = router;
