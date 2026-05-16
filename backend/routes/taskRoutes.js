const router =
  require("express").Router();

const Task =
  require("../models/Task");

// CREATE TASK
router.post("/", async (req, res) => {
  try {
    const task =
      await Task.create(req.body);

    res.status(201).json(task);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
        "Task creation failed"
    });
  }
});

// GET ALL TASKS
router.get("/", async (req, res) => {
  try {
    const tasks =
      await Task.find()
      .populate(
        "assignedTo",
        "name email"
      );

    res.json(tasks);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
        "Failed to fetch tasks"
    });
  }
});

// UPDATE TASK STATUS
router.put("/:id", async (req, res) => {
  try {

    const task =
      await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(task);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
        "Task update failed"
    });
  }
});

module.exports = router;