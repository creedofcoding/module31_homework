import { documentHTML, handleLogout } from "../app";

export const userLoginMenu = function () {
    const menuBtn = document.querySelector(".button-menu");
    const menudisplay = document.querySelector(".menu");
    const menulist = document.querySelector(".list-menu");

    menuBtn.addEventListener("click", function (e) {
        //console.log('123');
        if (menuBtn.style.transform == 'rotate(180deg)') {
            menuBtn.style.transform = 'rotate(0deg)';
            menudisplay.style.display = 'none';
            menulist.style.display = 'none';
        } else {
            menuBtn.style.transform = 'rotate(180deg)';
            menudisplay.style.display = 'block';
            menulist.style.display = 'flex';
        }
    });
};

export const userLogoutMenu = function () {
    const logoutBtn = document.querySelector(".list-menu-logout");
    logoutBtn.addEventListener("click", (e) => handleLogout());
};
