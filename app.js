(function () {
  let todos = [];
  let users = [];

  const todoList = document.body.querySelector('#todo-list');
  const optionNames = document.body.querySelector('#user-todo');
  const todoFrom = document.body.querySelector('form');

  const baseURL = 'https://jsonplaceholder.typicode.com';


  document.addEventListener('DOMContentLoaded', initApp);
  todoFrom.addEventListener('submit', handlerSubmit);


  async function initApp() {
    try {
      Promise.all([getData('/todos?_limit=10'), getData('/users?_limit=5')])
        .then(data => {
          [todos, users] = data;
          users.forEach(user => appendData(user));
          todos.forEach(todo => appendToDos(todo));
        });
    } catch (error) {
      alertError(error)
    }
  };

  function handlerSubmit(event) {
    event.preventDefault();

    createToDos({
      userId: Number(todoFrom.user.value),
      title: todoFrom.todo.value,
      completed: false,
    })
    todoFrom.reset();
  };

  function handleTodoChenge() {
    toggleComplete(this.parentElement.dataset.id, this.checked);
    this.nextElementSibling.classList.toggle('completed');
  };

  function handleTodoClose() {
    removeTodos(this.parentElement.dataset.id);
  };

  async function getData(url) {
    try {
      const res = await fetch(`${baseURL}${url}`);
      return res.json();
    } catch (error) {
      alertError(error)
    }
  };

  async function createToDos(todo) {
    try {
      const res = await fetch(`${baseURL}/todos`, {
        method: 'POST',
        body: JSON.stringify(todo),
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const newTodo = await res.json();

      appendToDos(newTodo);

    } catch (error) {
      alertError(error)
    }
  };

  async function toggleComplete(todoID, completed) {
    try {
      const res = await fetch(`${baseURL}/todos/${todoID}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error('Ошибка соединения с сервером. Повторите попытку позже.');
      }
    } catch (error) {
      alertError(error);
    }
  };

  async function removeTodos(todoID) {
    try {
      const res = await fetch(`${baseURL}/todos/${todoID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (res.ok) {
        removeTodo(todoID);
      }
      if (!res.ok) {
        throw new Error('Ошибка соединения с сервером. Повторите попытку позже.');
      }
    } catch (error) {
      alertError(error)
    }
  };

  function removeTodo(todoID) {
    todos = todos.filter(todo => todo.id !== todoID);

    const todo = todoList.querySelector(`[data-id="${todoID}"]`);
    todo.querySelector('input').removeEventListener('click', handleTodoChenge);
    todo.querySelector('.close').removeEventListener('click', handleTodoClose);
    todo.remove();
  };

  function appendData(user) {
    const option = document.createElement('option');
    option.innerText = user?.name;
    option.value = user?.id;

    optionNames?.insertAdjacentElement('beforeend', option);
  };

  function getUserName(userID) {
    const user = users.find(user => user.id === userID);
    return user.name;
  };

  function appendToDos({ id, userId, title, completed }) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `<span class=${completed ? 'completed' : ''}>${title} <i>by </i><b>${getUserName(userId)}</b></span> `

    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('click', handleTodoChenge);

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';
    close.addEventListener('click', handleTodoClose);


    li?.prepend(status);
    li?.append(close);

    todoList?.prepend(li);
  };

  function alertError(error) {
    alert(error.message)
  };
})()
