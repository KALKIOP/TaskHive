import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });

  const signup = async () => {
    await axios.post(
      "http://localhost:8000/api/auth/signup",
      form
    );

    alert("Signup successful");
  };

  const login = async () => {
    const res = await axios.post(
      "http://localhost:8000/api/auth/login",
      {
        email: form.email,
        password: form.password
      }
    );

    localStorage.setItem(
  "token",
  res.data.token
);

localStorage.setItem(
  "role",
  res.data.user.role
);
  

    navigate("/dashboard");
  };

  return (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        width: "300px",
        gap: "10px"
      }}
    >
      <h1>Team Task Manager</h1>

      <input
        placeholder="Name"
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value
          })
        }
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value
          })
        }
      />

      <select
        onChange={(e) =>
          setForm({
            ...form,
            role: e.target.value
          })
        }
      >
        <option value="member">
          Member
        </option>

        <option value="admin">
          Admin
        </option>
      </select>

      <button onClick={signup}>
        Signup
      </button>

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}