export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const deleteFromStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  const index = storageData.findIndex((n) => n.id === obj.id);
  if (index !== -1) {
    storageData.splice(index, 1);
  }
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  //localStorage.clear();

  const testAdmin = new User("admin", "123", true);
  User.save(testAdmin);

  const testUser = new User("test", "123");
  User.save(testUser);
};
