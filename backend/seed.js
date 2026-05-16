require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Project, Task } = require("./models");

async function seed() {
  try {
    await sequelize.sync({ force: true }); // Drops all tables and recreates them
    console.log("PostgreSQL Database Connected & Synced (force: true)");

    // ── 1. Create Admin User ──
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@taskflow.com",
      password: adminPassword,
      role: "admin"
    });
    console.log("✅ Admin created: admin@taskflow.com / admin123");

    // ── 2. Create 4 Member Users ──
    const memberPassword = await bcrypt.hash("member123", 10);
    const members = await User.bulkCreate([
      { name: "Rahul Sharma", email: "rahul@taskflow.com", password: memberPassword, role: "member" },
      { name: "Priya Patel", email: "priya@taskflow.com", password: memberPassword, role: "member" },
      { name: "Amit Kumar", email: "amit@taskflow.com", password: memberPassword, role: "member" },
      { name: "Sneha Reddy", email: "sneha@taskflow.com", password: memberPassword, role: "member" }
    ], { returning: true }); // returning: true is needed in Sequelize/Postgres to get generated IDs
    console.log("✅ 4 Members created (password: member123)");

    // ── 3. Create 2 Projects ──
    const project1 = await Project.create({
      name: "E-Commerce Website",
      description: "Build a full-stack e-commerce platform with payment integration",
      createdBy: admin.id
    });
    await project1.setMembers([admin.id, members[0].id, members[1].id]);

    const project2 = await Project.create({
      name: "Mobile App Redesign",
      description: "Redesign the mobile app UI/UX for better user engagement",
      createdBy: admin.id
    });
    await project2.setMembers([admin.id, members[2].id, members[3].id]);
    console.log("✅ 2 Projects created");

    // ── 4. Create 5 Tasks ──
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3); // 3 days ago (overdue)
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 5);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 10);
    const futureDate3 = new Date(today);
    futureDate3.setDate(today.getDate() + 7);

    await Task.bulkCreate([
      {
        title: "Design product listing page",
        description: "Create responsive product grid with filters and search functionality",
        projectId: project1.id,
        assignedTo: members[0].id,
        createdBy: admin.id,
        status: "completed",
        dueDate: pastDate
      },
      {
        title: "Implement payment gateway",
        description: "Integrate Razorpay/Stripe for secure checkout flow",
        projectId: project1.id,
        assignedTo: members[1].id,
        createdBy: admin.id,
        status: "in-progress",
        dueDate: futureDate1
      },
      {
        title: "Setup user authentication",
        description: "Implement JWT-based auth with signup, login, and password reset",
        projectId: project1.id,
        assignedTo: members[0].id,
        createdBy: admin.id,
        status: "pending",
        dueDate: pastDate // This will be overdue!
      },
      {
        title: "Create app wireframes",
        description: "Design wireframes for all major screens using Figma",
        projectId: project2.id,
        assignedTo: members[2].id,
        createdBy: admin.id,
        status: "completed",
        dueDate: futureDate2
      },
      {
        title: "Build onboarding flow",
        description: "Implement 3-step onboarding with animations and skip option",
        projectId: project2.id,
        assignedTo: members[3].id,
        createdBy: admin.id,
        status: "pending",
        dueDate: futureDate3
      }
    ]);
    console.log("✅ 5 Tasks created (1 completed, 1 in-progress, 2 pending, 1 overdue)");

    // ── Summary ──
    console.log("\n════════════════════════════════════════");
    console.log("  SEED DATA COMPLETE!");
    console.log("════════════════════════════════════════");
    console.log("\n  🔑 Admin Login:");
    console.log("     Email:    admin@taskflow.com");
    console.log("     Password: admin123");
    console.log("\n  👥 Member Logins (password: member123):");
    console.log("     rahul@taskflow.com");
    console.log("     priya@taskflow.com");
    console.log("     amit@taskflow.com");
    console.log("     sneha@taskflow.com");
    console.log("\n  📁 Projects: 2");
    console.log("  ✅ Tasks: 5");
    console.log("════════════════════════════════════════\n");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
