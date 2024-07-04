import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import "./styles/stylesKanban.css"

import userTaskFieldTemplate from "./templates/userTaskField.html";
import adminTaskFieldTemplate from "./templates/adminTaskField.html";
import noAccessTemplate from "./templates/noAccess.html";

import { User } from "./models/User";

import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { userLoginMenu, userLogoutMenu } from "./services/userMenu";
import { addUser } from "./services/addUser";
import { showUserTasks, showAdminTasks, addFirstTask, Show } from "./services/task";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const contentElement = document.querySelector("#content");

// Функция для отображения контента неавторизованного пользователя
function showUnauthenticatedContent() {
  document.querySelector(".index_navbar").style.display = "flex";
  document.querySelector("#content").innerHTML = '<p id="content">Please Sign In to see your tasks!</p>';
}

// Функция для отображения контента авторизованного пользователя
function showUserAuthenticatedContent() {
  console.log("Nice to see you, user!");

  document.querySelector(".index_navbar").style.display = "none";
  contentElement.innerHTML = userTaskFieldTemplate;

  document.querySelector(".user-management-form").style.display = "none";

  document.querySelector(".name-user").innerHTML = 'Здравствуйте, ' + appState.currentUser.login;

  userLoginMenu();
  userLogoutMenu();

  showUserTasks();

  addFirstTask(document);
  Show();
}

// Функция для отображения контента авторизованного админа
function showAdminAuthenticatedContent() {
  console.log("Nice to see you, admin!");

  document.querySelector(".index_navbar").style.display = "none";
  contentElement.innerHTML = adminTaskFieldTemplate;
  
  document.querySelector(".user-management-form").style.display = "block";

  document.querySelector(".name-user").innerHTML = 'Здравствуйте, ' + appState.currentUser.login;

  userLoginMenu();
  userLogoutMenu();
  
  showAdminTasks();

  addFirstTask(document);
  Show();

  addUser();
}

// ! Функция для проверки авторизации пользователя (важная функция предотвращения выхода пользователя из системы при перезагрузке страницы)
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser && currentUser.length > 0) {
    const { login, password } = currentUser[0];
    
    if (authUser(login, password)) {
      if (appState.isAdmin == true) {
        console.log(appState.isAdmin)
        showAdminAuthenticatedContent();
      } else {
        console.log(appState.isAdmin)
        showUserAuthenticatedContent();
      }
      return;
    }
  }
  showUnauthenticatedContent();
}

// Обработчик входа
function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  if (authUser(login, password)) {
    localStorage.setItem('currentUser', JSON.stringify([{ login, password }]));
    
    if (appState.isAdmin == true) {
      alert(`Welcome back, ${appState._currentUser.login}!`);
      console.log(appState.isAdmin)
      showAdminAuthenticatedContent();
    } else {
      alert(`Welcome back, ${appState._currentUser.login}!`);
      console.log(appState.isAdmin)
      showUserAuthenticatedContent();
    }
  } else {
    contentElement.innerHTML = noAccessTemplate;
  }
}

// Обработчик выхода
export const handleLogout = function (e) {
  alert(`Sorry to see you go, ${appState.currentUser.login}!`);
  
  localStorage.removeItem("currentUser");
  appState.currentUser = null;

  showUnauthenticatedContent();
}

// ! Функция инициализации приложения (точка входа в веб-приложение)
function initializeApp() {
  generateTestUser(User);
  loginForm.addEventListener("submit", handleLogin);
  checkAuth();
}

initializeApp();