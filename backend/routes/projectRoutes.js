const router = require("express").Router();
const { Project, User } = require("../models");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(auth);

// CREATE PROJECT (Admin only)
router.post("/", adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id
    });

    // Add creator as member
    await project.addMember(req.user.id);

    const populated = await Project.findByPk(project.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: User, as: "members", attributes: ["id", "name", "email"] }
      ]
    });

    res.status(201).json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Project creation failed" });
  }
});

// GET ALL PROJECTS (user sees projects they belong to; admin sees all)
router.get("/", async (req, res) => {
  try {
    let include = [
      { model: User, as: "creator", attributes: ["id", "name", "email"] },
      { model: User, as: "members", attributes: ["id", "name", "email"] }
    ];

    let projects;
    if (req.user.role !== "admin") {
      projects = await Project.findAll({
        include: [
          ...include,
          {
            model: User,
            as: "members",
            where: { id: req.user.id },
            attributes: [],
            through: { attributes: [] }
          }
        ],
        order: [["createdAt", "DESC"]]
      });
      
      // Need to fetch again to get all members, not just the filtered one
      const projectIds = projects.map(p => p.id);
      projects = await Project.findAll({
         where: { id: projectIds },
         include,
         order: [["createdAt", "DESC"]]
      });
    } else {
      projects = await Project.findAll({
        include,
        order: [["createdAt", "DESC"]]
      });
    }

    // Map _id to id for frontend compatibility
    const formattedProjects = projects.map(p => {
        const plain = p.get({ plain: true });
        plain._id = plain.id;
        if(plain.members) {
            plain.members = plain.members.map(m => ({...m, _id: m.id}));
        }
        if(plain.creator) {
            plain.creator._id = plain.creator.id;
        }
        return plain;
    });

    res.json(formattedProjects);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// GET SINGLE PROJECT
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: User, as: "members", attributes: ["id", "name", "email"] }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// UPDATE PROJECT MEMBERS (Admin only)
router.put("/:id/members", adminOnly, async (req, res) => {
  try {
    const { members } = req.body;

    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Members array is required" });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.setMembers(members);

    const updated = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: User, as: "members", attributes: ["id", "name", "email"] }
      ]
    });

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update members" });
  }
});

// DELETE PROJECT (Admin only)
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const deleted = await Project.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;