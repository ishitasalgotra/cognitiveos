const router = require("express").Router();
const ctrl   = require("../controllers/debuggerController");
router.post("/",       ctrl.debugProblem);
router.get("/history", ctrl.getHistory);
module.exports = router;