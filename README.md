# AI-Powered Task Manager

This is a task management application built with Next.js, Tailwind CSS, and TypeScript. It allows users to create, update, and delete tasks, add subtasks, and use AI (Gemini API) to suggest subtasks automatically based on the task title and description.

## Features

- Add, edit, delete tasks
- Mark tasks and subtasks as completed
- Add up to 5 subtasks per task
- Use Gemini AI to auto-generate relevant subtasks
- Use current date or custom due dates
- LocalStorage-based task persistence
- Styled with Tailwind CSS and uses `date-fns` for date formatting

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Tafhim-87/Task-management.git

cd your-repo-name
```
### 2. Install Dependencies

```
npm install
```

### 3. Set Up Environment Variables

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Open your browser and go to `http://localhost:3000` or which localhost it's open 

### Tech Stack

Next.js (App Router)

React with Hooks

TypeScript

Tailwind CSS

Google Gemini API (for subtask generation)
<<<<<<< HEAD

date-fns (for formatting dates)

LocalStorage (for task persistence)

### Notes

Subtasks are limited to a maximum of 5 per task.

The title field is required before you can use AI-generated subtasks.

This project uses client-side storage (localStorage), so tasks are not persisted across devices.

=======

date-fns (for formatting dates)

LocalStorage (for task persistence)

### Notes

Subtasks are limited to a maximum of 5 per task.

The title field is required before you can use AI-generated subtasks.

This project uses client-side storage (localStorage), so tasks are not persisted across devices.
>>>>>>> f286b0a (error resolve)
