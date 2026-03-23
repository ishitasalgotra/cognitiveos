const router = require("express").Router();
const ctrl   = require("../controllers/searchController");

router.get("/",            ctrl.textSearch);
router.post("/semantic",   ctrl.semanticSearch);
router.post("/embed-all",  ctrl.embedAll);

module.exports = router;