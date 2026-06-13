// ── SELECT ELEMENTS ──────────────────────────────────────────
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMsg = document.getElementById("emptyMsg");
const filterBtns = document.querySelectorAll(".filter-btn");
const priorityInput = document.getElementById("priorityInput");

// ── DATA ─────────────────────────────────────────────────────
let tasks = [];
let filter = "all";

// ── SAVE AND LOAD ────────────────────────────────────────────
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
  const data = localStorage.getItem("tasks");
  if (data) {
    tasks = JSON.parse(data);
  }
}

// ── CREATE A TASK OBJECT (now includes due date) ─────────────
function createTask(text, dueDate, priority) {
  return {
    id: Date.now().toString(),
    text: text,
    completed: false,
    dueDate: dueDate, // empty string if no date chosen
    priority: priority, // 'low', 'medium', or 'high'
  };
}

// ── FILTER HELPER ────────────────────────────────────────────
function getFilteredTasks() {
  if (filter === "active") {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  }
  if (filter === "completed") {
    return tasks.filter(function (task) {
      return task.completed;
    });
  }
  return tasks;
}

// ── BUILD ONE TASK ELEMENT ───────────────────────────────────
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");
  li.dataset.id = task.id;

  // Priority dot — colored circle showing task priority
  const dot = document.createElement("span");
  dot.className = "priority-dot " + (task.priority || "low");
  li.appendChild(dot);
  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;

  // If a due date was set, show it next to the task text
  if (task.dueDate) {
    const due = document.createElement("span");
    due.className = "due-date";
    due.textContent = "Due: " + task.dueDate;
    span.appendChild(due);
  }

  span.addEventListener("click", function () {
    toggleComplete(task.id);
  });

  span.addEventListener("dblclick", function () {
    editTask(task.id, span);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id);
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  return li;
}

// ── EDIT TASK ────────────────────────────────────────────────
function editTask(id, span) {
  const task = tasks.find(function (t) {
    return t.id === id;
  });
  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  input.className = "edit-input";

  span.replaceWith(input);
  input.focus();

  function save() {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      saveTasks();
    }
    render();
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      save();
    }
    if (event.key === "Escape") {
      render();
    }
  });

  input.addEventListener("blur", save);
}

// ── RENDER ───────────────────────────────────────────────────
function render() {
  taskList.innerHTML = "";
  const visible = getFilteredTasks();
  visible.forEach(function (task) {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
  emptyMsg.style.display = visible.length === 0 ? "block" : "none";
  const active = tasks.filter(function (t) {
    return !t.completed;
  }).length;
  taskCount.textContent =
    active + " task" + (active !== 1 ? "s" : "") + " left";
}

// ── ADD TASK (includes due date) ─────────────────────────
function addTask(text, dueDate, priority) {
  if (!text) return;
  const newTask = createTask(text, dueDate, priority);
  tasks.unshift(newTask);
  saveTasks();
  render();
}

// ── DELETE TASK ──────────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  render();
}

// ── TOGGLE COMPLETE ──────────────────────────────────────────
function toggleComplete(id) {
  const task = tasks.find(function (task) {
    return task.id === id;
  });
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

// ── FORM SUBMIT (now includes due date and priority) ──────────
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;
  addTask(text, dueDate, priority);
  taskInput.value = "";
  dueDateInput.value = "";
  priorityInput.value = "low";
});

filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    filter = this.dataset.filter;
    filterBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    this.classList.add("active");
    render();
  });
});

// ── DARK MODE ────────────────────────────────────────────────
// Load saved theme preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// Toggle dark mode on button click
themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ── STARTUP ──────────────────────────────────────────────────
loadTasks();
render();
