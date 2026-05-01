import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const user = getUser();

  useEffect(() => {
    if (!token) window.location.href = "/";
  }, []);

  useEffect(() => {
    const headers = { Authorization: token };

    const taskAPI =
      user?.role === "Admin"
        ? "http://localhost:5000/api/tasks/all"
        : "http://localhost:5000/api/tasks";

    axios.get(taskAPI, { headers }).then(res => setTasks(res.data));
    axios.get("http://localhost:5000/api/projects", { headers })
      .then(res => setProjects(res.data));

    // 🔥 LEADERBOARD
    axios.get("http://localhost:5000/api/tasks/leaderboard", { headers })
      .then(res => setLeaderboard(res.data));

  }, []);

  return (
    <div className="container">

      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Dashboard</h2>

      <p><strong>Role:</strong> {user?.role}</p>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => navigate("/projects")}>
          Create Project
        </button>

        <button onClick={() => navigate("/create-task")} style={{ marginLeft: "10px" }}>
          Create Task
        </button>

        <button
          style={{ marginLeft: "10px" }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* PROJECTS */}
      <h3>Projects</h3>
      {projects.map(p => (
        <div key={p._id} className="card">{p.name}</div>
      ))}

      {/* TASKS */}
      <h3>Tasks</h3>
      {tasks.map(t => (
        <div key={t._id} className="card">

          <h4>{t.title}</h4>

          <p><strong>Project:</strong> {t.project?.name}</p>
          <p><strong>Assigned To:</strong> {t.assignedTo?.name}</p>

          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(t.dueDate).toLocaleDateString()}
          </p>

          <p><strong>Progress:</strong> {t.progress}%</p>

          <div style={{ height: "10px", background: "#ddd" }}>
            <div style={{
              width: `${t.progress}%`,
              height: "100%",
              background: t.progress === 100 ? "green" : "orange"
            }} />
          </div>

          <br />

          {t.assignedTo?._id === user?.id && (
            <Link to={`/progress/${t._id}`}>
              <button>Update</button>
            </Link>
          )}
        </div>
      ))}

      {/* 🏆 LEADERBOARD */}
      <h3>🏆 Member Performance</h3>

      <table style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Completed</th>
            <th>Pending</th>
            <th>Overdue</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.map((m, i) => (
            <tr key={i}>
              <td>
                {i === 0 ? "🥇" :
                 i === 1 ? "🥈" :
                 i === 2 ? "🥉" : i + 1}
              </td>
              <td>{m.name}</td>
              <td>{m.completed}</td>
              <td>{m.pending}</td>
              <td>{m.overdue}</td>
              <td><strong>{m.score}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}