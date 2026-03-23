const router = require("express").Router();
const ctrl   = require("../controllers/simulateController");
router.get("/solutions", ctrl.getSolutions);
router.post("/score",    ctrl.computeSimScore);
module.exports = router;