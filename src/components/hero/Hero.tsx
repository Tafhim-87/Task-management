"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Michroma } from 'next/font/google';
import { Task } from '@/types/types';
import AiLogo from '@/assets/AiLogo';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const michroma = Michroma({
  subsets: ['latin'],
  weight: '400',
});

export default function TaskInputForm() {
  const [task, setTask] = useState<Omit<Task, 'id' | 'createdAt'> & { id?: string }>({
    title: '',
    description: '',
    status: 'pending',
    dueDate: new Date(),
    subtasks: [],
  });
  const [useAutoDate, setUseAutoDate] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks: unknown = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
          const tasksWithDates: Task[] = parsedTasks
            .filter(
              (task): task is Omit<Task, 'dueDate' | 'createdAt'> & { dueDate: string; createdAt: string } =>
                typeof task === 'object' &&
                task !== null &&
                'dueDate' in task &&
                'createdAt' in task &&
                Array.isArray(task.subtasks)
            )
            .map(task => ({
              ...task,
              dueDate: new Date(task.dueDate),
              createdAt: new Date(task.createdAt),
              subtasks: task.subtasks.map(subtask => ({
                ...subtask,
                completed: subtask.completed ?? false,
              })),
            }));

          setTasks(tasksWithDates);
        }
      } catch (err) {
        console.error("Failed to parse saved tasks", err);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: name === 'dueDate' ? new Date(value) : value
    }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setTask(prev => ({
      ...prev,
      subtasks: [...prev.subtasks.slice(0, 4), { id: crypto.randomUUID(), text: newSubtask, completed: false }],
    }));
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== id)
    }));
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
            ),
          }
        : task
    ));
  };

  const generateSubtasks = async () => {
    if (!task.title.trim()) {
      setError('Please enter a task title first');
      return;
    }

    setIsGeneratingSubtasks(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const prompt = `Based on the task "${task.title}"${
        task.description ? ` and description "${task.description}"` : ''
      }, suggest 5 specific subtasks as a bullet point list. Return only the main text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('This feature is currently unavailable. Please try again later.');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const suggestedSubtasks = text.split('\n')
        .filter((line: string) => line.trim().match(/^[-*]/))
        .map((line: string) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);

      if (suggestedSubtasks.length > 0) {
        setTask(prev => ({
          ...prev,
          subtasks: [
            ...prev.subtasks.slice(0, 5 - suggestedSubtasks.length),
            ...suggestedSubtasks.map((text: string) => ({ 
              id: crypto.randomUUID(), 
              text,
              completed: false
            }))
          ].slice(0, 5)
        }));
      } else {
        setError('No subtasks were generated. Please try again.');
      }
    } catch (err) {
      console.error("Error generating subtasks:", err);
      setError(err instanceof Error ? err.message : 'Failed to generate subtasks');
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && task.id) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? {
          ...task,
          id: task.id,
          createdAt: t.createdAt,
          dueDate: useAutoDate ? new Date() : task.dueDate
        } as Task : t
      ));
    } else {
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        dueDate: useAutoDate ? new Date() : task.dueDate
      };
      setTasks(prev => [newTask, ...prev]);
    }
    
    setTask({
      title: '',
      description: '',
      status: 'pending',
      dueDate: new Date(),
      subtasks: [],
    });
    setIsEditing(false);
  };

  const editTask = (taskToEdit: Task) => {
    setTask({
      ...taskToEdit,
      dueDate: new Date(taskToEdit.dueDate)
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTask = (id: string) => {
    toast(
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to delete this task?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTasks(prev => prev.filter(task => task.id !== id));
              if (isEditing && task.id === id) {
                setTask({
                  title: '',
                  description: '',
                  status: 'pending',
                  dueDate: new Date(),
                  subtasks: [],
                });
                setIsEditing(false);
              }
              toast.dismiss();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const cancelEdit = () => {
    setTask({
      title: '',
      description: '',
      status: 'pending',
      dueDate: new Date(),
      subtasks: [],
    });
    setIsEditing(false);
  };
  
  const recentTasks = tasks;

  return (
    <section className={`p-4 max-w-4xl mx-auto ${michroma.className}`} style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
      <h1 className="text-2xl font-bold mb-6 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
        Task Manager
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-2 lg:p-6 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2 container mr-auto">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block mb-2 text-sm font-medium">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={task.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Due Date
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="autoDate"
                checked={useAutoDate}
                onChange={() => setUseAutoDate(!useAutoDate)}
                className="h-4 w-4"
              />
              <label htmlFor="autoDate">Use today&apos;s date</label>
            </div>
            
            {!useAutoDate && (
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={format(task.dueDate, 'yyyy-MM-dd')}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            )}
          </div>

          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Subtasks (Max 5)
              </label>
              <button
                type="button"
                onClick={generateSubtasks}
                disabled={!task.title || isGeneratingSubtasks || task.subtasks.length >= 5}
                className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
              >
                {isGeneratingSubtasks ? (
                  <>
                    <span className="inline-block animate-spin">↻</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span><AiLogo className='w-4 h-4'/></span>
                    Suggest Subtasks
                  </>
                )}
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-2 mb-3">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask manually"
                className="flex-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                disabled={task.subtasks.length >= 5}
              />
              <button
                type="button"
                onClick={addSubtask}
                disabled={!newSubtask.trim() || task.subtasks.length >= 5}
                className="bg-blue-100 text-blue-800 px-3 py-3 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-10">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>{subtask.text}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    aria-label={`Remove subtask: ${subtask.text}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-linear-to-tr from-sky-500 to-indigo-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {recentTasks.length > 0 && (
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
              Recent Tasks ({tasks.length} total)
            </h2>
          </div>
          <div className="grid gap-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold break-words" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                    {task.title}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => editTask(task)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button> 
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 my-2 break-words">
                    {task.description}
                  </p>
                )}
                
                {task.subtasks.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Subtasks:</h4>
                    <ul className="list-none pl-5 space-y-1">
                      {task.subtasks.map(subtask => (
                        <li key={subtask.id} className="flex items-center gap-2 break-words">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                            {subtask.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Duedate: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                  <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <ToastContainer />
    </section>
  );
}