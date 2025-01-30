document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskNameInput = document.getElementById('task-name');
  const taskPrioritySelect = document.getElementById('task-priority');
  const taskDateInput = document.getElementById('task-date');
  const todoList = document.getElementById('todo-list');
  const bulkDeleteButton = document.getElementById('bulk-delete');
  const tabs = document.querySelectorAll('#tabs button');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let editTaskId = null;

  // Save tasks to localStorage
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  // Filter tasks by status
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('tab-active'));
      tab.classList.add('tab-active');
      renderTasks(tab.id);
    });
  });

  // Render tasks based on their status
  function renderTasks(filter = 'all') {
    todoList.innerHTML = '';
    
    const filteredTasks = filter === 'all' ? tasks : tasks.filter((task) => filter === 'done' ? task.isDone : !task.isDone);

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");

      taskItem.classList = "group flex items-center gap-6 pl-4 py-4";
      taskItem.innerHTML = `
        <div>
          <label for="task-check" class="hidden">Task Check</label>
          <input type="checkbox" ${task.isDone ? 'checked' : ''} class="size-4 accent-primary">
        </div>
        <div class="flex-1 flex items-center justify-between">
        <h3 id="todo-name" class="font-lg ${task.isDone ? "line-through" : ""}">${task.name}</h3>
          <div class="flex items-center gap-4">
            <span class="px-2 py-1 text-sm font-medium border">${task.priority}</span>
            <span class="text-muted-foreground text-sm font-medium">${task.date}</span>
          </div>
        </div>
        <div id="actions" class="opacity-0 group-hover:opacity-100">
          <button id="edit" class="px-3 py-1 text-sm font-medium border">Edit</button>
          <button id="delete" class="px-3 py-1 text-sm font-medium border">Delete</button>
        </div>
      `;

      const checkbox = taskItem.querySelector('input[type="checkbox"]');
      const editButton = taskItem.querySelector("#edit");
      const deleteButton = taskItem.querySelector("#delete");
  
      checkbox.addEventListener("change", () => updateTaskStatus(task.id));
      editButton.addEventListener("click", () => setEditTask(task.id));
      deleteButton.addEventListener("click", () => deleteTask(task.id));

      todoList.appendChild(taskItem);
    });
  };

  // Submit task form
  taskForm.addEventListener('submit', handleSumbitTask);
  
  // Handle submit task: add new and edit task
  function handleSumbitTask(event) {
    event.preventDefault();

    if (editTaskId) {
      tasks = tasks.map((task) => {
        if (task.id === editTaskId) {
          task.name = taskNameInput.value.trim();
          task.priority = taskPrioritySelect.value;
          task.date = formatDate(taskDateInput.value);
        }

        return task;
      })

      editTaskId = null;
    } else {
      tasks.push({
        id: String(Date.now()),
        name: taskNameInput.value.trim(),
        priority: taskPrioritySelect.value,
        date: formatDate(taskDateInput.value),
        isDone: false
      });
    }

    saveTasks();
    renderTasks();
    taskForm.reset();
  }

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
  }

  // Set edit task 
  function setEditTask(id) {
    const task = tasks.find((task) => task.id === id);

    if (task) {
      editTaskId = task.id;
      taskNameInput.value = task.name;
      taskPrioritySelect.value = task.priority;
      taskDateInput.value = task.date;  
    }
  }

  // Update task status
  function updateTaskStatus(id) {
    tasks = tasks.map((task) => {
      if(task.id === id) {
        task.isDone = !task.isDone;
      }

      return task;
    })

    saveTasks();

    tabs.forEach((tab) => {
      if (tab.classList.contains("tab-active")) {
        renderTasks(tab.id);
      }
    })
  }

  // Update delete task
  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();
    renderTasks();
  }

  // Bulk delete all tasks
  bulkDeleteButton.addEventListener('click', () => {
    tasks = [];
    saveTasks();
    renderTasks();
  });

  // Initial render
  renderTasks();
});