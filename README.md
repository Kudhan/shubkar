# SHUBAKAR – Your Partner in Every Celebration

## Project Overview
SHUBAKAR is a Full-stack SAAS Event Management Platform designed to connect Customers with Vendors for seamless event planning. It features AI-driven budgeting, real-time communication, and comprehensive vendor management.

## Architecture
The project follows a microservices-inspired architecture within a mono-repo:

- **Frontend**: React.js + Tailwind CSS (Vite)
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python (Flask/FastAPI) for Budget Estimation & NLP

## Tech Stack
- **Frontend**: React, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express, Mongoose, JWT, Socket.IO
- **AI**: Python, Scikit-learn, NLP
- **Database**: MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (Local or Atlas)

### Installation

1. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **AI Service**
   ```bash
   cd ai-budget-assistant
   pip install -r requirements.txt
   python app.py
   ```

## Troubleshooting (Windows)
If you see a "SecurityError" or "file cannot be loaded" in PowerShell:
1. Use **Command Prompt (cmd)** instead of PowerShell.
2. OR run commands using `cmd /c` prefix: 
   - `cmd /c "npm install"`
   - `cmd /c "npm run dev"`
