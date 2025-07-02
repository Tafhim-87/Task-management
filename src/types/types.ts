// types.ts

export type TaskStatus = 'pending' | 'completed';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  subtasks: Subtask[];
}

// This is useful for your form state where you might not have id and createdAt initially
export type TaskFormData = Omit<Task, 'id' | 'createdAt'> & { id?: string };