const router      = require("express").Router();
const ctrl        = require("../controllers/notesController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/",            ctrl.getNotes);
router.get("/:id",         ctrl.getNoteById);
router.post("/",           ctrl.createNote);
router.put("/:id",         ctrl.updateNote);
router.delete("/:id",      ctrl.deleteNote);
router.patch("/:id/links", ctrl.updateLinks);

module.exports = router;