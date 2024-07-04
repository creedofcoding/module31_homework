import { getFromStorage } from "../utils";
import { User } from "../models/User";
import { showUserTasks, showAdminTasks } from "../services/task";
import { appState } from "../app";

export const addUser = function () {
  const userForm = document.querySelector("#user-form");
  userForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Получаем значения имени пользователя и пароля из формы
    const login = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    // Создаем объект пользователя
    const newUser = new User(login, password);

    // Получаем текущих пользователей из локального хранилища
    const users = getFromStorage("users") || [];

    // Проверяем, нет ли уже пользователя с таким именем
    const existingUser = users.find((u) => u.login === newUser.login);
    if (existingUser) {
      alert("Пользователь с таким именем уже существует!");
      return;
    }

    // Добавляем нового пользователя в массив пользователей
    users.push(newUser);

    // Сохраняем обновленный массив пользователей в локальное хранилище
    User.save(newUser);

    // Очищаем поля формы
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";

    // Обновляем список пользователей на странице
    updateUsersList(users);
  });

  const updateUsersList = function (users) {
    const userList = document.querySelector("#user-list");

    // Удаляем дубликаты из списка пользователей
    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex((u) => u.login === user.login)
    );

    // Очищаем текущий список пользователей
    userList.textContent = "";

    // Добавляем каждого пользователя в список
    uniqueUsers.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Login: ${user.login} | Password: ${user.password}`;

      // Создаем кнопку "Remove User" для удаления пользователя
      const removeButton = document.createElement("button");
      removeButton.textContent = "- Remove User";
      removeButton.addEventListener("click", function () {
        removeUser(user.login, user.password);
      });
      listItem.appendChild(removeButton);

      userList.appendChild(listItem);
    });
  };

  // Функция для удаления пользователя
  const removeUser = function (login, password) {
    // Проверка, чтобы администратор не мог удалить сам себя
    if (login === appState._currentUser.login) {
      alert("You can't delete yourself!");
      return;
    }

    // Получаем текущих пользователей из локального хранилища
    let users = getFromStorage("users") || [];
    users.innerHTML = "";

    // Фильтруем пользователей, оставляя только тех, чей логин не совпадает с удаляемым
    users = users.filter((user) => user.login !== login);

    // Обновляем список пользователей в локальном хранилище
    localStorage.setItem("users", JSON.stringify(users));

    // Обновляем список пользователей на странице
    updateUsersList(users);
  };

  updateUsersList(getFromStorage("users") || []);
};
