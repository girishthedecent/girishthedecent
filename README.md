# Hi 👋, I'm Sai Girish

### Backend-Focused Developer | Distributed Systems | Real-Time & AI Applications | DSA

---

## 🚀 About Me

- 💻 Backend-focused developer building reliable, scalable real-world systems
- 🧠 Interested in system design, concurrency, distributed systems, and API architecture
- ⚙️ Experience building microservices, transactional backends, real-time applications, and async workflows
- 🤖 Building AI-powered applications with function calling, voice workflows, webhooks, and external API integrations
- 🧪 Strong focus on testing, failure handling, idempotency, and production-ready engineering
- 🌱 Continuously improving in Data Structures, Algorithms, and system design

---

## 💼 Experience

### Software Engineering Intern — Appweave
**May 2026 – Present**

- Refactored Certifico's monolithic route handlers into a 7-module service layer, reducing route-layer code by **80%** and improving separation of business logic, testability, and maintainability.
- Expanded the automated test suite from **81 to 211 tests** across unit and integration layers, covering all 7 core modules with transactional DB rollback, external-service mocks, and PostgreSQL-backed CI validation.
- Built Collected's gamified achievements system from scratch with **11 APIs, 2 database tables**, and a rule engine supporting **5 metrics, 5 operators, and nested conditions**, increasing user engagement by **20%**.
- Developed a visual admin rule builder with **10 components**, configurable 4-tier progression, and hourly evaluation in 100-user batches, enabling non-technical admins to manage achievement criteria.
- Improved a multi-platform scraping pipeline by restoring **10 of 30 previously failing websites**, strengthening validation, filtering, deduplication, retries, and error recovery across 4 platforms.

---

## 🛠️ Tech Stack

### 👨‍💻 Languages
![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

### ⚙️ Backend & Distributed Systems
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-E63946?style=for-the-badge&logo=bullmq&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

### 🤖 AI & Real-Time
- AI Agents, Agentic Development, AI Function Calling
- Voice AI and LLM Applications
- Webhooks and External API Integration
- WebRTC and real-time communication
- Event-driven architectures and API gateways

### 🗄️ Databases
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### 🌐 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### 🔧 Engineering & Tools
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

## 📌 Featured Projects

### 🔹 HotelBooking — Distributed Hotel Reservation System
**TypeScript · Node.js · MySQL · Redis · BullMQ**

- Built a distributed hotel reservation backend with **4 independently deployable microservices** for authentication, hotel management, booking, and notifications.
- Load-tested **100 simultaneous booking requests** against a single inventory unit, preventing double-booking with Redis distributed locks and duplicate reservations with idempotency keys.
- Decoupled booking notifications through BullMQ workers and validated asynchronous workflows with **100+ automated API requests**.

🔗 [GitHub](https://github.com/girishthedecent/HotelBooking)

---

### 🔹 AI Voice Sales — Real-Time AI Sales Agent
**TypeScript · Node.js · Express.js · Tabbly · Evolution API**

- Built a real-time AI voice sales agent that classifies leads into **3 intent levels** and triggers contextual WhatsApp follow-ups and callback scheduling during live calls.
- Verified **50+ conversation scenarios** covering AI function calling, intent classification, natural-language callback scheduling, WhatsApp workflows, and fallback handling.
- Implemented webhook fallback and deduplication to ensure single-action execution across repeated function calls and failure-recovery scenarios.

🔗 [GitHub](https://github.com/girishthedecent/AI-Voice-Sales)

---

### 🔹 Algo Backend — Distributed Online Judge
**TypeScript · Node.js · MongoDB · Redis · Docker · BullMQ**

- Built a distributed online judge with **3 microservices** for problem management, submission handling, and asynchronous code evaluation.
- Stress-tested **50 concurrent submissions** using isolated Docker containers with resource limits, timeouts, and network isolation for untrusted C++ and Python programs.
- Decoupled submission processing from execution using Redis and BullMQ workers, enabling independent horizontal scaling of evaluation capacity.

🔗 [GitHub](https://github.com/girishthedecent/Algo-Backend)

---

### 🔹 Meetly — Real-Time Video Conferencing Platform
**React · Node.js · Socket.IO · WebRTC · MongoDB**

- Built a WebRTC conferencing platform supporting multi-user video, audio, chat, screen sharing, and meeting rooms, benchmarked with **10 concurrent participants**.
- Implemented Socket.IO signaling for SDP/ICE exchange and direct peer-to-peer media streaming, keeping media traffic off the application server.

🔗 [Live](https://meetly-mgtt.onrender.com) · [GitHub](https://github.com/girishthedecent/Meetly)

---

## 🧠 DSA & Competitive Programming

- 🏆 **Knight on LeetCode** with a peak contest rating of **1900+**
- 🌎 Ranked in the **Top 4% globally**
- 💡 Solved **600+** algorithmic and data structure problems across LeetCode and other competitive programming platforms

🔗 [LeetCode](https://leetcode.com/girishthedecent)

---

## 🎓 Education

**IIIT Nuzvid — B.Tech in Computer Science and Engineering**  
2024 – 2028

**Coursework:** Data Structures & Algorithms, Software Engineering, Operating Systems, Computer Networks, DBMS, OOPS

---

## 📫 Connect With Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abhinava-sri-surya-sai-girish-pasupuleti-86999631b/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:girishpavan985@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/girishthedecent)

---

## 🧠 What I Believe In

> **"Systems should be reliable under pressure, not just work in ideal conditions."**

---

## 📊 GitHub Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=girishthedecent&show_icons=true&theme=github_dark&hide_border=true)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=girishthedecent&layout=compact&theme=github_dark&hide_border=true)
