// ==UserScript==
// @name         Quora: No login
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/QuoraNoLogin.user.js
// @version      1.2
// @description  Bypass modal login prompt
// @author       noodlebox
// @match        *://www.quora.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.addEventListener('load', function () {
  // Hide modal signup prompt
  $("div[id$='_signup_wall_wrapper']").css("display", "none");
  // Remove overflow: hidden from body to allow scrolling
  $("body").removeClass("signup_wall_prevent_scroll");
});
