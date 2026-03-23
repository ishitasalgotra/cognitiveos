const router      = require("express").Router();
const { getGraph } = require("../controllers/graphController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getGraph);

module.exports = router;