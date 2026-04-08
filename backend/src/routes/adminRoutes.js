const express = require("express");
const { getStats, getAllUsers, updateUser } = require("../controllers/adminController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Tất cả các route admin yêu cầu xác thực và quyền admin
router.use(authenticate, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);

module.exports = router;
