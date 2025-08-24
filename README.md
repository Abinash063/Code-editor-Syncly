🎨 Syncly Code Editor

A collaborative real-time online code editor with built-in compiler support.
Supports multiple programming languages, real-time collaboration using Socket.IO, and live execution using the EMKC open-source compiler API.

🌐 Live Demo: https://syncly-code-editor.netlify.app/

✨ Features

✅ Real-time collaborative code editing with Socket.IO
✅ Syntax highlighting for multiple languages
✅ Run code instantly using EMKC Compiler API
✅ Responsive UI with collapsible sidebar
✅ Light & Dark mode support
✅ Simple & clean design

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js, Socket.IO

Compiler API: EMKC Open Source API

Deployment: Render / Vercel

🚀 Getting Started
1. Clone the Repository
https://github.com/Abinash063/Code-editor-Syncly.git
cd syncly-code-editor

2. Install Dependencies
npm install

3. Run Backend
cd Backend
npm install
npm run dev

4. Run Frontend
cd frontend
npm install
npm run dev

⚡ Usage

Open the editor in your browser.

Select a programming language.

Write code in the editor.

Click Run to execute code (handled by EMKC Compiler API).

Share the link with friends to collaborate in real-time.

📸 Screenshots
💻 Desktop View

📱 Mobile View

🔧 API Reference (Compiler)

We use Piston API from EMKC
.

Run Code Example:

POST https://emkc.org/api/v2/piston/execute


Request Body:

{
  "language": "python3",
  "version": "3.10.0",
  "files": [
    {
      "name": "main.py",
      "content": "print('Hello, World!')"
    }
  ]
}


Response:

{
  "run": {
    "stdout": "Hello, World!\n",
    "stderr": "",
    "code": 0,
    "signal": null
  }
}

📦 Deployment

Frontend: Deployed on Netlify

Backend: Deployed on Render

🤝 Contributing

Fork the repo

Create your feature branch (git checkout -b feature-name)

Commit changes (git commit -m "Added new feature")

Push branch (git push origin feature-name)

Create a Pull Request

👨‍💻 Author

Developed by Abinash Kumar Pandab ✨