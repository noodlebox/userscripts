// ==UserScript==
// @name         DiscordOwnerTag
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordOwnerTag.user.js
// @version      1.0.2
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

    // Get the relevant user ID for an element, or undefined
    function getUserId(e) {
        var props = getInternalProps(e);
        if (props === undefined) {
            return undefined;
        }

        try {
            return props.user.id;
        } catch (err) {
            // Catch TypeError if no user in props
        }

        try {
            return props.message.author.id;
        } catch (err) {
            // Catch TypeError if no message in props
        }

        return undefined;
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
            var ownerId, usernames;
            try {
                // Get the ID of the server's owner
                ownerId = getInternalProps($(".guild.selected")[0]).guild.ownerId;
            } catch (err) {
                // (Probably) not looking at a server
                return;
            }

            // Check if changed servers and need to redo member list tagging
            // React likes to make minimal changes to the DOM, so owner tags
            // will stick around (or not get added) when a user is in both this
            // and the previous server.
            if (ownerId !== prevOwnerId) {
                // Get all visible members
                usernames = $(".member-username");
                // Remove tags that were added
                usernames.find(".kawaii-tag").remove();
                usernames.filter(".kawaii-tagged").removeClass("kawaii-tagged");
                // Add the set of message authors affected by this mutation
                usernames = usernames.add(mutationFind(mutation, ".username-wrapper"));
            } else {
                // Get the set of message authors and server members affected by this mutation
                usernames = mutationFind(mutation, ".member-username, .username-wrapper");
            }

            // Process usernames
            usernames.filter((_, e) => getUserId(e) === ownerId).not(".kawaii-tagged")
                .append($("<span>", {class: "bot-tag kawaii-tag"}).text("OWNER"))
                .addClass("kawaii-tagged");

            prevOwnerId = ownerId;
        });
    });

    chat_observer.observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
