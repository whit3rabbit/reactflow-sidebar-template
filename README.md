# React Flow Sidebar Template with Python Backend

This project is a template for creating flow diagrams with a customizable sidebar using React Flow, complemented by a Python FastAPI backend. It provides a dark-themed interface with various node types that can be dragged and dropped onto the canvas, with server-side flow management and validation.

![Project Screenshot](./screenshot.png)

## Features

- Dark-themed interface
- Customizable sidebar with node categories
- Drag and drop functionality for creating nodes
- Multiple node types (Basic, Input, Output, Processing, Decision, Data, IP Address, MAC Address, Password)
- Auto-layout functionality
- Python backend for flow management and validation
- WebSocket support for real-time updates

## Project Structure

```
reactflow-sidebar-template/
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── nodes/
│   │   │   │   ├── BasicNode.jsx
│   │   │   │   ├── DataNode.jsx
│   │   │   │   ├── DecisionNode.jsx
│   │   │   │   ├── InputNode.jsx
│   │   │   │   ├── OutputNode.jsx
│   │   │   │   ├── ProcessingNode.jsx
│   │   │   │   ├── IPAddressNode.jsx
│   │   │   │   ├── MACAddressNode.jsx
│   │   │   │   └── PasswordNode.jsx
│   │   │   ├── FlowCanvas.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.jsx
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   ├── DarkModeProvider.jsx
│   │   └── main.jsx
│   ├── .eslintrc.cjs
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   └── requirements.txt
├── run.py
├── package.json
├── README.md
└── screenshot.png
```

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js (version 14.0 or later recommended)
- You have installed Yarn package manager
- You have installed Python (version 3.7 or later recommended)

## Installing and Running the Project

To install and run this project, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reactflow-sidebar-template.git
   ```

2. Navigate to the project directory:
   ```
   cd reactflow-sidebar-template
   ```

3. Install all dependencies (frontend, backend, and root):
   ```
   yarn install:all
   ```

4. Start both frontend and backend servers:
   ```
   yarn start
   ```

5. Open your browser and visit `http://localhost:3000` to view the application.

## API Endpoints and Validators

The backend provides the following API endpoints:

1. **Save Flow**
   - Endpoint: `POST /api/flow`
   - Description: Saves the current flow state
   - Request body: JSON object containing `nodes` and `edges` arrays

2. **Load Flow**
   - Endpoint: `GET /api/flow/{flow_id}`
   - Description: Loads a saved flow state
   - Response: JSON object containing `nodes` and `edges` arrays

3. **Validate Flow**
   - Endpoint: `POST /api/validate`
   - Description: Validates the current flow state
   - Request body: JSON object containing `nodes` and `edges` arrays
   - Response: JSON object with an `errors` array

4. **WebSocket Connection**
   - Endpoint: `WebSocket /ws`
   - Description: Establishes a WebSocket connection for real-time updates

### Validators

The backend includes basic validators for the following node types:

- **IP Address Node**: Validates that the input is a valid IP address
- **MAC Address Node**: Validates that the input is a valid MAC address
- **Password Node**: Validates that the password meets certain criteria (e.g., minimum length, contains uppercase, lowercase, and numbers)

These validators are implemented on both the frontend (for immediate feedback) and the backend (for security and consistency).

## Using React Flow Sidebar Template

- Use the sidebar to select node types
- Drag and drop nodes onto the canvas
- Connect nodes by dragging from one handle to another
- Use the "Auto Layout" button to automatically arrange your nodes
- Use the "Validate Flow" button to check for any validation errors in your flow