// ==UserScript==
// @name         CGCookie: Gallery Fix
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/CGCookieGalleryFix.user.js
// @version      1.0
// @description  Fix bug in gallery when too few items exist to allow scrolling
// @author       noodlebox
// @match        *://cgcookie.com/gallery/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function ($) {
    'use strict';

    // A scroll event handler is created which, when fully scrolled to the bottom, does a few things.
    // Most importantly, it hides the .gallery--gradient which blocks access to the filtering UI.
    // If a page is too short to allow scrolling, this never triggers, rendering the UI unusable.
    $(".gallery--wrap").on("mouseenter", function () { $(window).scroll(); });
})(jQuery); // Use the existing jQuery instance
