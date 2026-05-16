const router =
  require("express").Router();

const Project =
  require("../models/Project");

// CREATE PROJECT
router.post(
  "/",
  async (req, res) => {
    try {
      const project =
        await Project.create(
          req.body
        );

      res.status(201).json(
        project
      );

    } catch (err) {
      console.log(err);

      res
        .status(500)
        .json({
          message:
            "Project creation failed"
        });
    }
  }
);

// GET PROJECTS
router.get(
  "/",
  async (req, res) => {
    try {
      const projects =
        await Project.find();

      res.json(
        projects
      );

    } catch (err) {
      console.log(err);

      res
        .status(500)
        .json({
          message:
            "Failed to fetch projects"
        });
    }
  }
);

module.exports =
  router;