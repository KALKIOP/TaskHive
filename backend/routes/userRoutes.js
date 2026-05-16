const router = require("express").Router();
const { User } = require("../models");
const auth = require("../middleware/authMiddleware");

// All routes require authentication
router.use(auth);

// GET ALL USERS (for assignment dropdowns)
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]]
    });

    // Map id to _id for frontend compatibility
    const formattedUsers = users.map(u => ({
        ...u.get({ plain: true }),
        _id: u.id
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
