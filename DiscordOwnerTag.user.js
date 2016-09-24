// ==UserScript==
// @name         DiscordOwnerTag
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordOwnerTag.user.js
// @version      1.0.1
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

    var prevOwnerId;

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

            var members;
            // Check if changed servers and need to redo member list tagging
            // React likes to make minimal changes to the DOM, so owner tags
            // will stick around (or not get added) when a user is in both this
            // and the previous server.
            if (ownerId !== prevOwnerId) {
                // Get all visible members
                members = $(".member-username");
                // Remove tags that were added
                members.find(".kawaii-tag").remove();
                members.filter(".kawaii-tagged").removeClass("kawaii-tagged");
            } else {
                // Get the set of server members affected by this mutation
                members = mutationFind(mutation, ".member-username");
            }
            members = members.filter((_, e) => getInternalProps(e).user.id === ownerId);

            // Get the set of message authors affected by this mutation
            var usernames = mutationFind(mutation, ".username-wrapper")
                .filter((_, e) => getInternalProps(e).message.author.id === ownerId);

            // Process usernames
            usernames.add(members).not(".kawaii-tagged")
                .append($("<span>", {class: "bot-tag kawaii-tag"}).text("OWNER"))
                .addClass("kawaii-tagged");

            prevOwnerId = ownerId;
        });
    });

    chat_observer.observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
