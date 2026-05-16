import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const role =
    localStorage.getItem("role");

  // TASKS
  const [tasks, setTasks] =
    useState([]);

  const [taskForm, setTaskForm] =
    useState({
      title: "",
      description: "",
      dueDate: ""
    });

  // PROJECTS
  const [projects, setProjects] =
    useState([]);

  const [
    projectForm,
    setProjectForm
  ] = useState({
    name: "",
    description: ""
  });

  // FETCH TASKS
  const getTasks =
    async () => {
      try {
        const res =
          await axios.get(
            "http://localhost:8000/api/tasks"
          );

        setTasks(res.data);

      } catch (err) {
        console.log(err);
      }
    };

  // FETCH PROJECTS
  const getProjects =
    async () => {
      try {
        const res =
          await axios.get(
            "http://localhost:8000/api/projects"
          );

        setProjects(
          res.data
        );

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    getTasks();
    getProjects();
  }, []);

  // CREATE TASK
  const createTask =
    async () => {
      try {
        await axios.post(
          "http://localhost:8000/api/tasks",
          taskForm
        );

        alert(
          "Task created"
        );

        setTaskForm({
          title: "",
          description:
            "",
          dueDate: ""
        });

        getTasks();

      } catch (err) {
        console.log(err);
      }
    };

  // CREATE PROJECT
  const createProject =
    async () => {
      try {
        await axios.post(
          "http://localhost:8000/api/projects",
          projectForm
        );

        alert(
          "Project created"
        );

        setProjectForm({
          name: "",
          description:
            ""
        });

        getProjects();

      } catch (err) {
        console.log(err);
      }
    };

  // UPDATE TASK STATUS
  const updateStatus =
    async (
      id,
      currentStatus
    ) => {
      try {
        await axios.put(
          `http://localhost:8000/api/tasks/${id}`,
          {
            status:
              currentStatus ===
              "pending"
                ? "completed"
                : "pending"
          }
        );

        getTasks();

      } catch (err) {
        console.log(err);
      }
    };

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    );

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "pending"
    );

  return (
    <div
      style={{
        padding: "40px",
        background:
          "#0d1117",
        color: "white",
        minHeight:
          "100vh"
      }}
    >
      <h1>Dashboard</h1>

      <h2>
        Total Tasks:
        {tasks.length}
      </h2>

      <h2>
        Completed:
        {
          completedTasks.length
        }
      </h2>

      <h2>
        Pending:
        {
          pendingTasks.length
        }
      </h2>

      <h3>
        Logged in as:
        {role}
      </h3>

      <hr />

      {/* ADMIN ONLY */}
      {role ===
        "admin" && (
        <>
          <h2>
            Create Project
          </h2>

          <input
            placeholder="Project Name"
            value={
              projectForm.name
            }
            onChange={(
              e
            ) =>
              setProjectForm({
                ...projectForm,
                name:
                  e.target
                    .value
              })
            }
          />

          <br />
          <br />

          <input
            placeholder="Project Description"
            value={
              projectForm.description
            }
            onChange={(
              e
            ) =>
              setProjectForm({
                ...projectForm,
                description:
                  e.target
                    .value
              })
            }
          />

          <br />
          <br />

          <button
            onClick={
              createProject
            }
          >
            Create Project
          </button>

          <hr />

          <h2>
            Create Task
          </h2>

          <input
            placeholder="Title"
            value={
              taskForm.title
            }
            onChange={(
              e
            ) =>
              setTaskForm({
                ...taskForm,
                title:
                  e.target
                    .value
              })
            }
          />

          <br />
          <br />

          <input
            placeholder="Description"
            value={
              taskForm.description
            }
            onChange={(
              e
            ) =>
              setTaskForm({
                ...taskForm,
                description:
                  e.target
                    .value
              })
            }
          />

          <br />
          <br />

          <input
            type="date"
            value={
              taskForm.dueDate
            }
            onChange={(
              e
            ) =>
              setTaskForm({
                ...taskForm,
                dueDate:
                  e.target
                    .value
              })
            }
          />

          <br />
          <br />

          <button
            onClick={
              createTask
            }
          >
            Create Task
          </button>

          <hr />
        </>
      )}

      <h2>Projects</h2>

      {projects.map(
        (project) => (
          <div
            key={
              project._id
            }
            style={{
              border:
                "1px solid gray",
              padding:
                "10px",
              marginBottom:
                "10px"
            }}
          >
            <h3>
              {
                project.name
              }
            </h3>

            <p>
              {
                project.description
              }
            </p>
          </div>
        )
      )}

      <hr />

      <h2>All Tasks</h2>

      {tasks.map(
        (task) => (
          <div
            key={task._id}
            style={{
              border:
                "1px solid gray",
              padding:
                "10px",
              marginBottom:
                "10px"
            }}
          >
            <h3>
              {
                task.title
              }
            </h3>

            <p>
              {
                task.description
              }
            </p>

            <p>
              Status:
              {
                task.status
              }
            </p>

            <p>
              Due:
              {task.dueDate
                ? new Date(
                    task.dueDate
                  ).toLocaleDateString()
                : "No Date"}
            </p>

            <button
              onClick={() =>
                updateStatus(
                  task._id,
                  task.status
                )
              }
            >
              Mark as{" "}
              {task.status ===
              "pending"
                ? "Completed"
                : "Pending"}
            </button>
          </div>
        )
      )}
    </div>
  );
}