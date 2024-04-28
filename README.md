# Task Manager CRUD App

A simple Task Manager application built using Node.js and Express.js, allowing users to manage their tasks effectively.

## Features

- **CRUD Operations**: Perform Create, Read, Update, and Delete operations on tasks.
- **In-Memory Storage**: Utilizes in-memory storage (arrays) instead of a traditional database for storing task data.
- **Error Handling**: Proper error handling for CRUD operations to ensure smooth functioning of the application.

## Task Model

Each task consists of the following attributes:
- **ID**: Unique identifier for the task.
- **Title**: Name of the task.
- **Description**: Optional details about the task.
- **Status**: Current status of the task (e.g., "To Do", "In Progress", "Completed").

## Routes

- **GET /tasks**: Retrieve all tasks.
- **POST /tasks**: Create a new task.
- **GET /tasks/:id**: Retrieve a specific task by ID.
- **PUT /tasks/:id**: Update a task by ID.
- **DELETE /tasks/:id**: Delete a task by ID.

## Additional Features (Optional)

- **Filtering and Sorting**: Organize tasks based on status or other criteria.
- **Validation**: Ensure required fields are provided when creating or updating tasks.
- **Status Change**: Allow users to mark tasks as completed or change their status.
- **Search Functionality**: Find tasks by title or description.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Farzine/TASK-MANAGER-CRUD-APP.git
2. Install dependencies:
   ```bash
    npm install
3. Start the server:
   ```bash
    npm run start
3. Usage
 - Use a tool like Postman or cURL to send HTTP requests to the defined routes.
 - Follow the API documentation provided above to perform various operations on tasks.
