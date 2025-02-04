document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoNameInput = document.getElementById('todo-name');
  const todoPrioritySelect = document.getElementById('todo-priority');
  const todoDateInput = document.getElementById('todo-date');
  const todoList = document.getElementById('todo-list');
  const bulkDeleteButton = document.getElementById('bulk-delete');
  const tabs = document.querySelectorAll('#tabs button');

  // Save to localstorage
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  // state edit todo id
  let editTodoId = null;

  // Save todos to localStorage
  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };

  // Render todos based on status
  const renderTodos = (filter = "all") => {
    // Clear the todoList
    todoList.replaceChildren();

    // Filter todos based on the selected filter
    const filteredTodos = filter === "all"
      ? todos
      : todos.filter((todo) => filter === "done" ? todo.isDone : !todo.isDone);

    // Render each todo
    filteredTodos.forEach((todo) => {
      const todoItem = createTodoItem(todo);
      todoList.appendChild(todoItem);
    });
  };

  // Function to create a todo item
  function createTodoItem(todo) {
    const todoItem = document.createElement("li");
    todoItem.className = "flex items-center gap-6 py-4";

    // Checkbox
    const checkboxContainer = document.createElement("div");
    const checkboxLabel = document.createElement("label");
    checkboxLabel.setAttribute("for", `todo-check-${todo.id}`);
    checkboxLabel.classList.add("hidden");
    checkboxLabel.textContent = "Todo check"

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `todo-check-${todo.id}`;
    checkbox.className = "size-4 accent-primary";
    checkbox.checked = todo.isDone;

    checkboxContainer.append(checkboxLabel, checkbox);

    // Todo details
    const todoDetails = document.createElement("div");
    todoDetails.className = "flex items-center gap-4 w-full text-sm md:text-base";
    
    const todoName = document.createElement("h3");
    todoName.classList.add("flex-1");
    todoName.classList.toggle("line-through", todo.isDone);
    todoName.textContent = todo.name

    const priority = document.createElement("div");
    priority.className = "px-2 py-1 font-medium border text-xs md:text-sm"; 
    priority.textContent = todo.priority
    
    const date = document.createElement("time");
    date.setAttribute("datetime", todo.date);
    date.className = "hidden text-muted-foreground font-medium text-xs md:text-sm md:block"; 
    date.textContent = todo.date;

    todoDetails.append(todoName, priority, date);

    // Todo actions with dropdowm menu
    const dropdownMenuContainer = document.createElement("div");
    const dropdownMenuTrigger = document.createElement("button");
    dropdownMenuTrigger.setAttribute("popovertarget", `actions-${todo.id}`);
    dropdownMenuTrigger.className = "size-8 text-xs font-medium border";
    dropdownMenuTrigger.style.anchorName = `--dropdown-menu-trigger-${todo.id}`;
    dropdownMenuTrigger.textContent = "•••";

    const dropdownMenuContent = document.createElement("div");
    dropdownMenuContent.setAttribute("popover", "auto");
    dropdownMenuContent.id = `actions-${todo.id}`;
    dropdownMenuContent.className = "border bg-white p-2 w-[140px]";
    // Set position dropdown menu content
    dropdownMenuContent.style.positionAnchor = `--dropdown-menu-trigger-${todo.id}`;
    dropdownMenuContent.style.top = "anchor(bottom)";
    dropdownMenuContent.style.left = "anchor(right)";
    dropdownMenuContent.style.translate = "-100% 2px";

    const editButton = document.createElement("button");
    editButton.id = "edit";
    editButton.className = "w-full px-4 py-2 text-sm font-medium text-left text-muted-foreground hover:text-primary";
    editButton.textContent = "Edit";
    
    const deleteButton = document.createElement("button");
    deleteButton.id = "delete";
    deleteButton.className = "w-full px-4 py-2 text-sm font-medium text-left text-muted-foreground hover:text-primary";
    deleteButton.textContent = "Delete";

    dropdownMenuContent.append(editButton, deleteButton);
    dropdownMenuContainer.append(dropdownMenuTrigger, dropdownMenuContent);

    // Append all elements to todo item
    todoItem.append(checkboxContainer, todoDetails, dropdownMenuContainer);

    return todoItem;
  }

  // Function to handle todo state
  const handleCheckboxChange = (event) => {
    const target = event.target;

    if (target.matches("input[type='checkbox']")) {
      const todoId = target.id.replace("todo-check-", "");
      updateTodoStatus(todoId);
    }
  }

  // Function to handle todo actions
  const handleTodoActionsClick = (event) => {
    const target = event.target;
    const todoItem = target.closest("li")

    if (todoItem) {
      const todoId = todoItem.querySelector("input[type='checkbox']").id.replace("todo-check-", "");
      
      if (target.matches("#edit")) {
        setEditTodo(todoId);
      } else if (target.matches("#delete")) {
        deleteTodo(todoId);
      }
    }
  }
  
  // Handle submit todo: add new and edit todo
  const handleSumbitTodo = (event) => {
    event.preventDefault();

    const todoData = {
      id: editTodoId || String(Date.now()),
      name: todoNameInput.value.trim(),
      priority: todoPrioritySelect.value,
      date: formatDate(todoDateInput.value),
      isDone: false
    }
    
    if (editTodoId) {
      todos = todos.map((todo) => todo.id === editTodoId ? {...todo, ...todoData} : todo)
      editTodoId = null;
    } else {
      todos.push(todoData)
    }

    saveTodos();
    renderTodos();
    todoForm.reset();
  }

  // Format date as YYYY-MM-DD
  const formatDate= (date) => {
    return new Date(date).toISOString().split("T")[0];
  }

  // Set edit todo 
  const setEditTodo= (id) => {
    const todo = todos.find((todo) => todo.id === id);
    
    if (todo) {
      todoNameInput.focus()
      editTodoId = todo.id;
      todoNameInput.value = todo.name;
      todoPrioritySelect.value = todo.priority;
      todoDateInput.value = todo.date;  
    }
  }

  // Update todo status
  const updateTodoStatus = (id) => {
    todos = todos.map((todo) => todo.id === id ? {...todo, isDone: !todo.isDone} : todo);
    saveTodos();

    tabs.forEach((tab) => {
      if (tab.hasAttribute("data-active")) {
        renderTodos(tab.id);
        console.log("State: ", tab.id)
      }
    }) 
  };

  // Update delete todo
  const deleteTodo = (id) => {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    renderTodos();
  };

  // Bulk delete all todos
  const handleBulkDeleteTodo = () => {
    todos = [];
    saveTodos();
    renderTodos();
  };

  // Filter todos by status
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.removeAttribute("data-active"));
      tab.setAttribute("data-active", "");
      
      renderTodos(tab.id);
    });
  });

  if (todos.length < 1) {
    bulkDeleteButton.disabled = true
  } else{
    bulkDeleteButton.disabled = false
  }
  
  // Submit todo form
  todoForm.addEventListener('submit', handleSumbitTodo);
  // Handle todo state
  todoList.addEventListener("change", handleCheckboxChange);
  // Handle todo actions
  todoList.addEventListener("click", handleTodoActionsClick);
  // Handle bulk delete todos
  bulkDeleteButton.addEventListener("", handleBulkDeleteTodo);

  // Initial render
  renderTodos();
});