import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", project: "", assignedTo: "", dueDate: "" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberSelect, setMemberSelect] = useState({});
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [t, p, u] = await Promise.all([
        API.get("/api/tasks"),
        API.get("/api/projects"),
        API.get("/api/users")
      ]);
      setTasks(t.data);
      setProjects(p.data);
      setUsers(u.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name) { setError("Project name is required"); return; }
    try {
      await API.post("/api/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      setError("");
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.project) { setError("Title and project are required"); return; }
    try {
      await API.post("/api/tasks", taskForm);
      setTaskForm({ title: "", description: "", project: "", assignedTo: "", dueDate: "" });
      setError("");
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const updateStatus = async (id, newStatus) => {
    try { await API.put(`/api/tasks/${id}`, { status: newStatus }); fetchAll(); }
    catch (err) { console.log(err); }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try { await API.delete(`/api/tasks/${id}`); fetchAll(); }
    catch (err) { console.log(err); }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    try { await API.delete(`/api/projects/${id}`); fetchAll(); }
    catch (err) { console.log(err); }
  };

  const addMember = async (projectId) => {
    const userId = memberSelect[projectId];
    if (!userId) return;
    const project = projects.find(p => p._id === projectId);
    const currentIds = project.members.map(m => m._id || m);
    if (currentIds.includes(userId)) { setError("User already a member"); return; }
    try {
      await API.put(`/api/projects/${projectId}/members`, { members: [...currentIds, userId] });
      setMemberSelect({ ...memberSelect, [projectId]: "" });
      setError("");
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const removeMember = async (projectId, userId) => {
    const project = projects.find(p => p._id === projectId);
    const newMembers = project.members.filter(m => (m._id || m) !== userId).map(m => m._id || m);
    try { await API.put(`/api/projects/${projectId}/members`, { members: newMembers }); fetchAll(); }
    catch (err) { console.log(err); }
  };

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed");
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const statusOptions = ["pending", "in-progress", "completed"];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="url(#gs)"/><path d="M12 14h16M12 20h12M12 26h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><defs><linearGradient id="gs" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs></svg>
          <span>TaskHIVE</span>
        </div>
        <nav className="sidebar-nav">
          {["dashboard", "projects", "tasks"].concat(isAdmin ? ["create"] : []).map(tab => (
            <button key={tab} className={`nav-item ${activeTab === tab ? "active" : ""}`} onClick={() => { setActiveTab(tab); setError(""); }}>
              {tab === "dashboard" && "📊"}{tab === "projects" && "📁"}{tab === "tasks" && "✅"}{tab === "create" && "➕"}
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`user-role role-${user.role}`}>{user.role}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {error && <div className="toast-error">{error}<button onClick={() => setError("")}>✕</button></div>}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div className="page-header"><h1>Dashboard</h1><p>Welcome back, {user.name}</p></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon blue">📋</div><div><span className="stat-value">{tasks.length}</span><span className="stat-label">Total Tasks</span></div></div>
              <div className="stat-card"><div className="stat-icon yellow">⏳</div><div><span className="stat-value">{pendingTasks.length}</span><span className="stat-label">Pending</span></div></div>
              <div className="stat-card"><div className="stat-icon purple">🔄</div><div><span className="stat-value">{inProgressTasks.length}</span><span className="stat-label">In Progress</span></div></div>
              <div className="stat-card"><div className="stat-icon green">✅</div><div><span className="stat-value">{completedTasks.length}</span><span className="stat-label">Completed</span></div></div>
              <div className="stat-card"><div className="stat-icon red">🔥</div><div><span className="stat-value">{overdueTasks.length}</span><span className="stat-label">Overdue</span></div></div>
              <div className="stat-card"><div className="stat-icon indigo">📁</div><div><span className="stat-value">{projects.length}</span><span className="stat-label">Projects</span></div></div>
            </div>

            {overdueTasks.length > 0 && (
              <div className="section">
                <h2 className="section-title overdue-title">🔥 Overdue Tasks</h2>
                <div className="task-list">
                  {overdueTasks.map(task => (
                    <div key={task._id} className="task-card overdue">
                      <div className="task-header"><h3>{task.title}</h3><span className={`status-badge status-${task.status}`}>{task.status}</span></div>
                      <p className="task-desc">{task.description}</p>
                      <div className="task-meta">
                        <span>📁 {task.project?.name || "N/A"}</span>
                        <span>👤 {task.assignedTo?.name || "Unassigned"}</span>
                        <span className="overdue-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section">
              <h2 className="section-title">Recent Tasks</h2>
              <div className="task-list">
                {tasks.slice(0, 5).map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "completed";
                  return (
                    <div key={task._id} className={`task-card ${isOverdue ? "overdue" : ""}`}>
                      <div className="task-header"><h3>{task.title}</h3><span className={`status-badge status-${task.status}`}>{task.status}</span></div>
                      <div className="task-meta">
                        <span>📁 {task.project?.name || "N/A"}</span>
                        <span>👤 {task.assignedTo?.name || "Unassigned"}</span>
                        {task.dueDate && <span className={isOverdue ? "overdue-date" : ""}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && <p className="empty-state">No tasks yet. {isAdmin ? "Create one!" : "Waiting for assignments."}</p>}
              </div>
            </div>
          </>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <>
            <div className="page-header"><h1>Projects</h1><p>{projects.length} project{projects.length !== 1 ? "s" : ""}</p></div>
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    {isAdmin && <button className="icon-btn danger" onClick={() => deleteProject(project._id)} title="Delete">🗑</button>}
                  </div>
                  <p className="project-desc">{project.description || "No description"}</p>
                  <div className="project-meta"><span>Created by {project.createdBy?.name || "Unknown"}</span></div>
                  <div className="members-section">
                    <h4>Members ({project.members?.length || 0})</h4>
                    <div className="member-chips">
                      {project.members?.map(m => (
                        <span key={m._id} className="member-chip">
                          {m.name}
                          {isAdmin && m._id !== user._id && <button onClick={() => removeMember(project._id, m._id)}>✕</button>}
                        </span>
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="add-member-row">
                        <select value={memberSelect[project._id] || ""} onChange={e => setMemberSelect({...memberSelect, [project._id]: e.target.value})}>
                          <option value="">Add member...</option>
                          {users.filter(u => !project.members?.some(m => m._id === u._id)).map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                        <button className="btn-small" onClick={() => addMember(project._id)}>Add</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="empty-state">No projects yet.</p>}
            </div>
          </>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <>
            <div className="page-header"><h1>All Tasks</h1><p>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p></div>
            <div className="task-list">
              {tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "completed";
                return (
                  <div key={task._id} className={`task-card ${isOverdue ? "overdue" : ""}`}>
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        <select className="status-select" value={task.status} onChange={e => updateStatus(task._id, e.target.value)}>
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {isAdmin && <button className="icon-btn danger" onClick={() => deleteTask(task._id)} title="Delete">🗑</button>}
                      </div>
                    </div>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    <div className="task-meta">
                      <span>📁 {task.project?.name || "N/A"}</span>
                      <span>👤 {task.assignedTo?.name || "Unassigned"}</span>
                      {task.dueDate && <span className={isOverdue ? "overdue-date" : ""}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                      {isOverdue && <span className="overdue-badge">OVERDUE</span>}
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && <p className="empty-state">No tasks found.</p>}
            </div>
          </>
        )}

        {/* CREATE TAB (Admin) */}
        {activeTab === "create" && isAdmin && (
          <>
            <div className="page-header"><h1>Create</h1><p>Add new projects and tasks</p></div>
            <div className="create-grid">
              <div className="create-card">
                <h2>📁 New Project</h2>
                <form onSubmit={createProject}>
                  <div className="form-group"><label htmlFor="proj-name">Project Name</label><input id="proj-name" placeholder="My Project" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} /></div>
                  <div className="form-group"><label htmlFor="proj-desc">Description</label><textarea id="proj-desc" placeholder="What's this project about?" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows="3" /></div>
                  <button type="submit" className="auth-btn">Create Project</button>
                </form>
              </div>
              <div className="create-card">
                <h2>✅ New Task</h2>
                <form onSubmit={createTask}>
                  <div className="form-group"><label htmlFor="task-title">Title</label><input id="task-title" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} /></div>
                  <div className="form-group"><label htmlFor="task-desc">Description</label><textarea id="task-desc" placeholder="Details..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows="3" /></div>
                  <div className="form-group"><label htmlFor="task-project">Project</label>
                    <select id="task-project" value={taskForm.project} onChange={e => setTaskForm({...taskForm, project: e.target.value})}>
                      <option value="">Select project...</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label htmlFor="task-assign">Assign To</label>
                    <select id="task-assign" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label htmlFor="task-due">Due Date</label><input id="task-due" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} /></div>
                  <button type="submit" className="auth-btn">Create Task</button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}