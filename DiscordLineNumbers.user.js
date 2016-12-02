// ==UserScript==
// @name         DiscordLineNumbers
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordLineNumbers.user.js
// @version      1.1.0
// @description  Add line numbers to code blocks
// @author       noodlebox
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @match        *://*.discordapp.com/channels/*
// @match        *://*.discordapp.com/invite/*
// @match        *://*.discordapp.com/login
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function ($) {
    "use strict";

    // Helper function for finding all elements matching selector affected by a mutation
    function mutationFind(mutation, selector) {
        var target = $(mutation.target), addedNodes = $(mutation.addedNodes);
        var mutated = target.add(addedNodes).filter(selector);
        var descendants = addedNodes.find(selector);
        var ancestors = target.parents(selector);
        return mutated.add(descendants).add(ancestors);
    }

    // Watch for new code blocks
    new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            mutationFind(mutation, ".hljs").not(":has(ol)")
                .each(function () {
                    this.innerHTML = this.innerHTML.split("\n").map(line => "<li>"+line+"</li>").join("");
                })
                .wrapInner($("<ol>").addClass("kawaii-linenumbers"));
        });
    }).observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
