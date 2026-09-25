const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const submitButton = document.getElementById("submitButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingTaskId = null;


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    taskCount.textContent = tasks.length;

    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";

        if (currentFilter === "pending" && tasks.length > 0) {
            emptyState.querySelector("h2").textContent = "No pending tasks";
            emptyState.querySelector("p").textContent = "All your tasks are completed.";
        } else if (currentFilter === "completed" && tasks.length > 0) {
            emptyState.querySelector("h2").textContent = "No completed tasks";
            emptyState.querySelector("p").textContent = "Complete a task to see it here.";
        } else {
            emptyState.querySelector("h2").textContent = "No tasks yet";
            emptyState.querySelector("p").textContent = "Add your first task to get started.";
        }

    } else {
        emptyState.style.display = "none";
    }

    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = `task-item ${task.completed ? "completed" : ""}`;

        li.innerHTML = `
            <div class="task-main">

                <button
                    class="complete-button"
                    data-action="complete"
                    data-id="${task.id}"
                    aria-label="Complete task">
                </button>

                <div class="task-content">

                    <div class="task-title">
                        ${escapeHTML(task.title)}
                    </div>

                    <div class="task-meta">
                        <span class="priority ${task.priority}">
                            ${task.priority}
                        </span>
                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="action-button"
                    data-action="edit"
                    data-id="${task.id}">
                    Edit
                </button>

                <button
                    class="action-button delete"
                    data-action="delete"
                    data-id="${task.id}">
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(li);
    });
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        return;
    }

    if (editingTaskId !== null) {

        const task = tasks.find(task => task.id === editingTaskId);

        if (task) {
            task.title = title;
            task.priority = priority;
        }

        editingTaskId = null;
        submitButton.textContent = "Add Task";

    } else {

        const newTask = {
            id: generateId(),
            title: title,
            priority: priority,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();

    taskForm.reset();

    priorityInput.value = "medium";

    renderTasks();

    taskInput.focus();
});


taskList.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    if (action === "complete") {

        task.completed = !task.completed;

    }

    if (action === "delete") {

        const confirmed = confirm("Are you sure you want to delete this task?");

        if (!confirmed) {
            return;
        }

        tasks = tasks.filter(task => task.id !== id);

    }

    if (action === "edit") {

        taskInput.value = task.title;
        priorityInput.value = task.priority;

        editingTaskId = task.id;

        submitButton.textContent = "Update Task";

        taskInput.focus();

        return;
    }

    saveTasks();

    renderTasks();
});


filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});


renderTasks();
