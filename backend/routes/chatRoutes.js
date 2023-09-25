const express = require("express");
const {
  access1_1Chat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, access1_1Chat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);

module.exports = router;
