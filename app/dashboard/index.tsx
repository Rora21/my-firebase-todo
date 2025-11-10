"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import ProtectedRoute from "../ProtectedRoute";
import { Task } from "../taskType";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [editId, setEditId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // Get current user and listen to tasks
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email || "");

    // Firestore query: only tasks of this user
    const q = query(
      collection(db, "tasks"),
      where("userEmail", "==", user?.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(data);
    });

    return () => unsubscribe();
  }, []);

  // Add or update task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (editId) {
      // Update existing task
      await updateDoc(doc(db, "tasks", editId), {
        title,
        description,
        priority,
      });
      setEditId(null);
    } else {
      // Create new task
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        priority,
        completed: false,
        userEmail,
        createdAt: new Date().toISOString(),
      });
    }

    setTitle("");
    setDescription("");
    setPriority("Low");
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEditId(task.id || null);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const toggleCompleted = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id!), {
      completed: !task.completed,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hello, {userEmail}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Task Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 mb-6 border p-4 rounded shadow-sm bg-white"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "Low" | "Medium" | "High")
            }
            className="border p-2 rounded"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {editId ? "Update Task" : "Add Task"}
          </button>
        </form>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-3 border rounded bg-white"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleCompleted(task)}
                  className="w-4 h-4"
                />
                <div>
                  <p
                    className={`font-semibold ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.title} ({task.priority})
                  </p>
                  <p className={task.completed ? "line-through text-gray-400" : ""}>
                    {task.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id!)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
