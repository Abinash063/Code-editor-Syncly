import React, { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import { Editor } from "@monaco-editor/react";

const socket = io(import.meta.env.VITE_API_URL);

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  // NEW: compiler states
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  // sidebar collapse
  const [collapsed, setCollapsed] = useState(false);

  // collapse automatically on mobile, expand on desktop
  useEffect(() => {
    const applyByWidth = () => setCollapsed(window.innerWidth <= 768);
    applyByWidth();
    window.addEventListener("resize", applyByWidth);
    return () => window.removeEventListener("resize", applyByWidth);
  }, []);

  useEffect(() => {
    socket.on("userJoined", (usersList) => setUsers(usersList));
    socket.on("codeUpdate", (newCode) => setCode(newCode ?? ""));
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}.. is typing`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
    setOutput("");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    const safe = newCode ?? "";
    setCode(safe);
    socket.emit("codeChange", { roomId, code: safe });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  // NEW: run code via Piston API
  const runCode = async () => {
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version: "*",
          files: [{ content: code }],
        }),
      });
      const data = await res.json();
      if (data.run) {
        setOutput(data.run.output || "No output");
      } else {
        setOutput("Unexpected response from API");
      }
    } catch (err) {
      setOutput("Error: " + err.message);
    }
    setRunning(false);
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* mobile toggle */}
        <button
          className="collapse-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "☰" : "✕"}
        </button>

        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button className="copy-button" onClick={copyRoomId}>
            📋 Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>

        {/* Users */}
        <span className="users-chip">👥 {users.length}</span>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.slice(0, 8)}...</li>
          ))}
        </ul>

        <p className="typing-indicator">{typing}</p>

        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <button className="run-button" onClick={runCode} disabled={running}>
          {running ? "Running..." : "Run Code"}
        </button>

        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height="70%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />

        {/* Output Panel */}
        <div className="output-panel">
          <h3>Output</h3>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default App;
