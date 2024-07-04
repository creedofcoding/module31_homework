import { appState } from "../app";
import { Task } from "../models/Task";
import { getFromStorage } from "../utils";

// ввод первой задачи
export const addFirstTask = function (document) {
  const inputTask = document.querySelector(".input");
  const submitBtn = document.querySelector(".btn-submit");
  const addBtn = document.querySelector(".btn-add");

  addBtn.addEventListener("click", function (e) {
    inputTask.style.display = "block";
    addBtn.style.display = "none";
    submitBtn.style.display = "block";
  });

  submitBtn.addEventListener("click", function (e) {
    const bodyBacklog = document.querySelector(".kanban-backlog");

    if (inputTask.value != "") {
      const task = new Task(inputTask.value, "backlog");

      // Сохраняем задачу в локальное хранилище
      const tasks = getFromStorage("tasks") || [];
      tasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));

      const newTask = document.createElement("div");
      newTask.classList.add("kanban-element");
      newTask.setAttribute("draggable", "true");
      newTask.id = `task_${task.id}`;
      newTask.innerHTML = task.description;

      newTask.addEventListener("dragstart", () => {
        newTask.classList.add("is-dragging");
      });

      newTask.addEventListener("dragend", () => {
        newTask.classList.remove("is-dragging");
      });

      bodyBacklog.append(newTask);

      inputTask.value = "";
      inputTask.style.display = "none";
      addBtn.style.display = "block";
      submitBtn.style.display = "none";

      Show();
    }
  });
};

// Логика показа задач пользователя
export const showUserTasks = function () {
  const allTasks = getFromStorage("tasks") || [];
  const currentUser = appState._currentUser.login;

  document.querySelector(".kanban-backlog").innerHTML = "";
  document.querySelector(".kanban-ready").innerHTML = "";
  document.querySelector(".kanban-progress").innerHTML = "";
  document.querySelector(".kanban-finished").innerHTML = "";

  for (const task of allTasks) {
    if (task.login === currentUser) {
      const taskElement = document.createElement("div");
      taskElement.setAttribute("style", "white-space: pre;");
      taskElement.classList.add("kanban-element");
      taskElement.textContent = task.description;
      taskElement.setAttribute("draggable", "true");
      taskElement.state = task.state;
      taskElement.id = `task_${task.id}`;

      taskElement.addEventListener("dragstart", () => {
        taskElement.classList.add("is-dragging");
      });

      taskElement.addEventListener("dragend", () => {
        taskElement.classList.remove("is-dragging");
      });

      // Определяем, в какую колонку добавить задачу на основе её состояния
      let targetColumnClass;
      switch (task.state) {
        case "backlog":
          targetColumnClass = ".kanban-backlog";
          break;
        case "ready":
          targetColumnClass = ".kanban-ready";
          break;
        case "progress":
          targetColumnClass = ".kanban-progress";
          break;
        case "finished":
          targetColumnClass = ".kanban-finished";
          break;
        default:
          // По умолчанию добавляем в колонку "Backlog"
          targetColumnClass = ".kanban-backlog";
      }
      // Добавляем задачу в соответствующую колонку
      const targetColumn = document.querySelector(targetColumnClass);
      targetColumn.appendChild(taskElement);
    }
  }

  addDragAndDrop();
  countTasks(); // Вызов функции подсчета задач
};

export const showAdminTasks = function () {
  // Получаем все задачи из хранилища
  const allTasks = getFromStorage("tasks");

  // Отображаем все задачи всех пользователей в колонках
  for (const task of allTasks) {
    // Создаем элемент для задачи
    const taskElement = document.createElement("div");
    taskElement.setAttribute("style", "white-space: pre;");
    taskElement.classList.add("kanban-element");
    taskElement.textContent = `Пользователь ${task.login}:\r\n${task.description}`;
    taskElement.setAttribute("draggable", "true");
    taskElement.state = task.state;
    console.log(taskElement.state);
    taskElement.id = `task_${task.id}`;

    // Добавляем обработчики событий для перетаскивания
    taskElement.addEventListener("dragstart", () => {
      taskElement.classList.add("is-dragging");
    });

    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("is-dragging");
    });

    // Определяем, в какую колонку добавить задачу на основе её состояния
    let targetColumnClass;
    switch (task.state) {
      case "backlog":
        targetColumnClass = ".kanban-backlog";
        break;
      case "ready":
        targetColumnClass = ".kanban-ready";
        break;
      case "progress":
        targetColumnClass = ".kanban-progress";
        break;
      case "finished":
        targetColumnClass = ".kanban-finished";
        break;
      default:
        // По умолчанию добавляем в колонку "Backlog"
        targetColumnClass = ".kanban-backlog";
    }
    // Добавляем задачу в соответствующую колонку
    const targetColumn = document.querySelector(targetColumnClass);
    targetColumn.appendChild(taskElement);
  }

  // Включаем функциональность Drag and Drop для всех задач в колонке
  addDragAndDrop();
  countTasks(); // Вызов функции подсчета задач
};

//добавление задач в выпадающий список
export const dropDownList = function (bodyClass, addBtnClass, taskForClass) {
  const bodies = document.querySelectorAll(".kanban-body");
  const taskForReady = document.querySelector(taskForClass);
  const addBtn = document.querySelector(addBtnClass);
  addBtn.setAttribute("disabled", true);

  for (let body of bodies) {
    if (body == document.querySelector(bodyClass)) {
      let children = body.children;
      for (let node of children) {
        if (node.id != "") {
          addBtn.removeAttribute("disabled");
          // Создаем уникальный id для элемента задачи
          const taskId = `task_${node.id}`;

          // Проверяем, существует ли уже элемент с таким id в taskForReady
          const existingTask = document.getElementById(taskId);
          if (!existingTask) {
            // Если элемента с таким id еще нет в списке, то добавляем его
            const taskFrom = document.createElement("div");
            taskFrom.classList.add("kanban-element");
            taskFrom.id = taskId;
            taskFrom.innerHTML = node.textContent;
            taskFrom.setAttribute("draggable", "true");
            taskForReady.append(taskFrom);
            Show();
          }
        }
      }
    }
  }
};

//открыть/закрыть выпадающий список
export const downList = function (addBtn, listClass) {
  const add = document.querySelector(addBtn);
  const task = document.querySelector(listClass);

  let tasks = getFromStorage("tasks");
  if (tasks.length != 0) {
    add.style.display = "block";
    let isTask = true;
    add.addEventListener("click", function (e) {
      if (isTask) {
        task.style.display = "block";
        isTask = false;
      } else {
        task.style.display = "none";
        isTask = true;
      }
    });
  }
};

//выбор задачи из выпадающего списка и удаление из выпадающего списка и из backlog
export const dropListBody = function (fromClass, bodyClass, newState) {
  const dropDownListTask = document.querySelectorAll(".kanban-from");
  const body = document.querySelector(bodyClass);
  for (let listTask of dropDownListTask) {
    if (listTask == document.querySelector(fromClass)) {
      listTask.addEventListener("click", function (e) {
        e.preventDefault();
        const task = e.target.closest(".kanban-element");
        if (task && !task.classList.contains("processed")) {
          task.classList.add("processed");
          // Создаем копию задачи
          const clonedTask = task.cloneNode(true);
          clonedTask.id = task.id.slice(5);

          // Удаляем задачу из state и обновляем локальное хранилище
          const taskId = task.id.replace("task_task_", "");

          const tasks = getFromStorage("tasks");
          const updatedTasks = tasks.map((t) => {
            if (t.id === taskId) {
              t.state = newState; // Изменяем состояние задачи в зависимости от нового состояния
              Task.save(t);
            }
            console.log(`${t.id} - ${taskId}`);
            return t;
          });

          localStorage.setItem("tasks", JSON.stringify(updatedTasks));

          body.append(clonedTask);
          
          // Удаление из выпадающего списка
          task.remove();
          
          // Удаление из Backlog
          const removeTask = document.getElementById(`task_${taskId}`);
          if (removeTask) {
            removeTask.remove();
          }
          Show();
        }
      });
    }
  }
};

export const countTasks = function () {
  const backlogColumn = document.querySelector(".kanban-backlog");
  const readyColumn = document.querySelector(".kanban-ready");
  const progressColumn = document.querySelector(".kanban-progress");
  const finishedColumn = document.querySelector(".kanban-finished");

  const backlogTaskCount = backlogColumn.children.length;
  const readyTaskCount = readyColumn.children.length;
  const progressTaskCount = progressColumn.children.length;
  const finishedTaskCount = finishedColumn.children.length;

  const activeTaskCount = backlogTaskCount + readyTaskCount + progressTaskCount;

  document.querySelector(".backlog-lenght").innerHTML = activeTaskCount;
  document.querySelector(".finished-lenght").innerHTML = finishedTaskCount;
  document.querySelector(".name-footer").innerHTML =
    appState._currentUser.login;
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  document.querySelector(".year-footer").innerHTML = [year, month, day].join(
    "-"
  );
};

export const showReady = function () {
  dropDownList(".kanban-backlog", ".btn-ready", ".backlog");
  downList(".btn-ready", ".backlog");
  dropListBody(".backlog", ".kanban-ready", "ready");
};

export const showProgress = function () {
  dropDownList(".kanban-ready", ".btn-progress", ".ready");
  downList(".btn-progress", ".ready");
  dropListBody(".ready", ".kanban-progress", "progress");
};

export const showFinished = function () {
  dropDownList(".kanban-progress", ".btn-finished", ".inprogress");
  downList(".btn-finished", ".inprogress");
  dropListBody(".inprogress", ".kanban-finished", "finished");
};

export const addDragAndDrop = function () {
  const kanbanBodies = document.querySelectorAll(".kanban-body");

  kanbanBodies.forEach((body) => {
    body.addEventListener("dragstart", handleDragStart);
    body.addEventListener("dragover", handleDragOver);
    body.addEventListener("drop", handleDrop);
  });
};

const handleDragStart = function (e) {
  e.dataTransfer.setData("text/plain", e.target.id);
};

const handleDragOver = function (e) {
  e.preventDefault();
};

// Функция для обновления выпадающего списка задач
const updateDropDownLists = () => {
  const backlogTasks = document.querySelector(".kanban-backlog").children;
  const readyTasks = document.querySelector(".kanban-ready").children;
  const progressTasks = document.querySelector(".kanban-progress").children;

  const backlogDropDown = document.querySelector(".backlog");
  const readyDropDown = document.querySelector(".ready");
  const progressDropDown = document.querySelector(".inprogress");

  // Очистка текущих элементов списка
  backlogDropDown.innerHTML = "";
  readyDropDown.innerHTML = "";
  progressDropDown.innerHTML = "";

  // Добавление задач в выпадающий список
  Array.from(backlogTasks).forEach(task => {
    if (task.id) {
      const taskFrom = document.createElement("div");
      taskFrom.classList.add("kanban-element");
      taskFrom.id = `task_${task.id}`;
      taskFrom.innerHTML = task.textContent;
      taskFrom.setAttribute("draggable", "true");
      backlogDropDown.append(taskFrom);
    }
  });

  Array.from(readyTasks).forEach(task => {
    if (task.id) {
      const taskFrom = document.createElement("div");
      taskFrom.classList.add("kanban-element");
      taskFrom.id = `task_${task.id}`;
      taskFrom.innerHTML = task.textContent;
      taskFrom.setAttribute("draggable", "true");
      readyDropDown.append(taskFrom);
    }
  });

  Array.from(progressTasks).forEach(task => {
    if (task.id) {
      const taskFrom = document.createElement("div");
      taskFrom.classList.add("kanban-element");
      taskFrom.id = `task_${task.id}`;
      taskFrom.innerHTML = task.textContent;
      taskFrom.setAttribute("draggable", "true");
      progressDropDown.append(taskFrom);
    }
  });

  Show(); // Обновление всех необходимых данных и событий
};

const handleDrop = function (e) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const droppedTask = document.getElementById(taskId);
  const targetColumn = e.currentTarget;
  if (targetColumn) {
    targetColumn.appendChild(droppedTask);
  }

  // После переноса задачи необходимо обновить ее состояние
  const newState = targetColumn.classList.contains("kanban-backlog")
    ? "backlog"
    : targetColumn.classList.contains("kanban-ready")
    ? "ready"
    : targetColumn.classList.contains("kanban-progress")
    ? "progress"
    : targetColumn.classList.contains("kanban-finished")
    ? "finished"
    : "";

  if (newState !== "") {
    const taskIdWithoutPrefix = taskId.replace("task_", "");
    const tasks = getFromStorage("tasks");
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskIdWithoutPrefix) {
        t.state = newState;
        Task.save(t);
      }
      return t;
    });
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // После обновления состояния, обновим счетчики задач
    countTasks();

    // Обновляем выпадающие списки задач
    updateDropDownLists();
  }
};

export const Show = function () {
  showReady();
  showProgress();
  showFinished();

  countTasks();
  addDragAndDrop();
};

// Функция для удаления пользователя и его задач
export const deleteUserAndTasks = function (userId) {
  // Получаем все задачи из локального хранилища
  let tasks = getFromStorage("tasks") || [];
  // Получаем всех пользователей из локального хранилища
  let users = getFromStorage("users") || [];

  // Фильтруем задачи, исключая те, которые принадлежат удаляемому пользователю
  tasks = tasks.filter(task => task.login !== userId);

  // Удаляем пользователя из списка пользователей
  users = users.filter(user => user.login !== userId);

  // Обновляем локальное хранилище
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("users", JSON.stringify(users));

  // Обновляем интерфейс, чтобы отразить изменения
  showUserTasks();
  showAdminTasks();
};