import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
    setMenuPosition(null);
  }

  function handleContextMenu(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setSelectedTodoId(id);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  }

  function handleCloseMenu() {
    setMenuPosition(null);
    setSelectedTodoId(null);
  }

  return (
    <main onClick={handleCloseMenu}>
      <h1>{user?.signInDetails?.loginId ? `${user.signInDetails.loginId}'s todos` : "My todos"}</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li 
            onContextMenu={(e) => handleContextMenu(e, todo.id)}
            title="Right-click to delete this todo"
            key={todo.id}
          >
            {todo.content}
          </li>
        ))}
      </ul>
      {menuPosition && (
        <div
          style={{
            position: 'fixed',
            top: menuPosition.y,
            left: menuPosition.x,
            background: 'white',
            border: '1px solid black',
            padding: '5px',
          }}
        >
          <button onClick={(e) => {
            e.stopPropagation();
            if (selectedTodoId) deleteTodo(selectedTodoId);
          }}>
            Confirm Delete
          </button>
        </div>
      )}
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
