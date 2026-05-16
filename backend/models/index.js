const sequelize = require("../db");
const User = require("./User");
const Project = require("./Project");
const Task = require("./Task");

// User - Project (Creator)
User.hasMany(Project, { foreignKey: "createdBy", as: "createdProjects" });
Project.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// Project - User (Members) Many-to-Many
Project.belongsToMany(User, { through: "ProjectMembers", as: "members", foreignKey: "projectId" });
User.belongsToMany(Project, { through: "ProjectMembers", as: "projects", foreignKey: "userId" });

// Project - Task
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks", onDelete: "CASCADE" });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// User - Task (Assignee)
User.hasMany(Task, { foreignKey: "assignedTo", as: "assignedTasks" });
Task.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });

// User - Task (Creator)
User.hasMany(Task, { foreignKey: "createdBy", as: "createdTasks" });
Task.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

module.exports = {
  sequelize,
  User,
  Project,
  Task
};
