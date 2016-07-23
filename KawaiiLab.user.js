// ==UserScript==
// @name         KawaiiLab
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/KawaiiLab.user.js
// @version      2.1
// @description  Make SFMLab more kawaii
// @author       noodlebox
// @match        *://sfmlab.com/*
// @resource     logo_kawaii  https://files.noodlebox.moe/static/img/sfmlab_logo.png
// @resource     logo_mike  https://files.noodlebox.moe/static/img/sfmlab_logo_mike.png
// @run-at       document-idle
// @grant        GM_getResourceURL
// ==/UserScript==

(function () {
    // Add button to nav bar to enable Kawaii modes
    var button_kawaii = document.createElement("a");
    button_kawaii.href = "#";
    button_kawaii.id = "cycle-kawaii";
    var icon_kawaii = document.createElement("span");
    icon_kawaii.className = "glyphicon glyphicon-heart-empty";
    icon_kawaii.id = "cycle-kawaii-icon";
    button_kawaii.appendChild(icon_kawaii);
    button_kawaii.appendChild(document.createTextNode(" Toggle Kawaii"));
    var item_kawaii = document.createElement("li");
    item_kawaii.appendChild(button_kawaii);
    var navbar_list = document.querySelector("ul.nav.navbar-nav.navbar-right");
    navbar_list.insertBefore(item_kawaii, navbar_list.childNodes[0]);

    // Cycle Kawaii mode
    var kawaii = Number(localStorage.getItem("kawaii")) || 0;
    var logo_image = document.querySelector("a.navbar-brand img");
    var logo_text = document.querySelector("a#sfmlab_logo");
    function render_kawaii() {
        if (kawaii == 1) {
            // KawaiiLab
            logo_image.src = GM_getResourceURL("logo_kawaii");
            logo_text.innerHTML = logo_text.innerHTML.replace(/^.*Lab/, "KawaiiLab");
            icon_kawaii.className = "glyphicon glyphicon-heart";
        } else if (kawaii == 2) {
            // MikeLab
            logo_image.src = GM_getResourceURL("logo_mike");
            logo_text.innerHTML = logo_text.innerHTML.replace(/^.*Lab/, "MikeLab");
            icon_kawaii.className = "glyphicon glyphicon-heart";
        } else {
            // SFMLab (default)
            logo_image.src = "/static/img/sfmlab_logo.png";
            logo_text.innerHTML = logo_text.innerHTML.replace(/^.*Lab/, "SFMLab");
            icon_kawaii.className = "glyphicon glyphicon-heart-empty";
        }
    }
    function cycle_kawaii() {
        kawaii = (kawaii + 1) % 3;
        localStorage.setItem("kawaii", kawaii);
        render_kawaii();
    }
    button_kawaii.addEventListener("click", cycle_kawaii);
    render_kawaii();
})();

