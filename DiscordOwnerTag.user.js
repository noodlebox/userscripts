// ==UserScript==
// @name         DiscordOwnerTag
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordOwnerTag.user.js
// @version      1.0.0
// @description  Show a tag next to a Discord server owner's name
// @author       noodlebox
// @require      https://code.jquery.com/jquery-3.1.0.min.js
// @match        *://discordapp.com/channels/*
// @match        *://discordapp.com/invite/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function ($) {
    "use strict";

    // This is super hackish, and will likely break as Discord's internal API changes
    // Anything using this or what it returns should be prepared to catch some exceptions
    function getInternalProps(e) {
        try {
            var reactInternal = e[Object.keys(e).filter(k => k.startsWith("__reactInternalInstance"))[0]];
            return reactInternal._currentElement._owner._instance.props;
        } catch (err) {
            return undefined;
        }
    }

    // Helper function for finding all elements matching selector affected by a mutation
    var mutationFind = function (mutation, selector) {
        var target = $(mutation.target), addedNodes = $(mutation.addedNodes);
        var mutated = target.add(addedNodes).filter(selector);
        var descendants = addedNodes.find(selector);
        var ancestors = target.parents(selector);
        return mutated.add(descendants).add(ancestors);
    };

    // Watch for new usernames
    var chat_observer = new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            // Get the ID of the server's owner
            var server = $(".guild.selected")[0];
            if (server === undefined) {
                // Not looking at a server
                return;
            }
            var ownerId = getInternalProps(server).guild.ownerId;

            // Get the set of usernames affected by this mutation
            var usernames = mutationFind(mutation, ".username-wrapper")
                .filter((_, e) => getInternalProps(e).message.author.id === ownerId);
            var members = mutationFind(mutation, ".member-username")
                .filter((_, e) => getInternalProps(e).user.id === ownerId);

            // Process usernames
            usernames.add(members).not(".kawaii-tagged")
                .append($("<span>", {class: "bot-tag"}).text("OWNER"))
                .addClass("kawaii-tagged");
        });
    });

    chat_observer.observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
