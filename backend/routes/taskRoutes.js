const router = require("express").Router();
const { Task, User, Project } = require("../models");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(auth);

// CREATE TASK (Admin only)
router.post("/", adminOnly, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!project) {
      return res.status(400).json({ message: "Task must belong to a project" });
    }

    const task = await Task.create({
      title,
      description,
      projectId: project,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      dueDate: dueDate || null
    });

    const populated = await Task.findByPk(task.id, {
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ]
    });

    res.status(201).json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Task creation failed" });
  }
});

// GET ALL TASKS (with optional project filter)
router.get("/", async (req, res) => {
  try {
    let where = {};

    // Filter by project if specified
    if (req.query.project) {
      where.projectId = req.query.project;
    }

    // Members only see tasks assigned to them
    if (req.user.role !== "admin") {
      where.assignedTo = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Map properties for frontend compatibility
    const formattedTasks = tasks.map(t => {
        const plain = t.get({ plain: true });
        plain._id = plain.id;
        if (plain.assignee) plain.assignedTo = { ...plain.assignee, _id: plain.assignee.id };
        if (plain.creator) plain.createdBy = { ...plain.creator, _id: plain.creator.id };
        return plain;
    });

    res.json(formattedTasks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// UPDATE TASK (status, assignedTo, etc.)
router.put("/:id", async (req, res) => {
  try {
    const { status, assignedTo, title, description, dueDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;

    const [updatedCount] = await Task.update(updateData, {
      where: { id: req.params.id }
    });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] }
      ]
    });

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Task update failed" });
  }
});

// DELETE TASK (Admin only)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;