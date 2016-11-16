// ==UserScript==
// @name         DiscordOwnerTag
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordOwnerTag.user.js
// @version      1.2.3
// @description  Show a tag next to a Discord server owner's name
// @author       noodlebox
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @match        *://discordapp.com/channels/*
// @match        *://discordapp.com/invite/*
// @match        *://canary.discordapp.com/channels/*
// @match        *://canary.discordapp.com/invite/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function ($) {
    "use strict";

    // This is super hackish, and will likely break as Discord's internal API changes
    // Anything using this or what it returns should be prepared to catch some exceptions
    function getInternalProps(e) {
        if (e === undefined) {
            return undefined;
        }
        try {
            let reactInternal = e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
            let owner = reactInternal._currentElement._owner;
            if (owner !== null) {
                return owner._instance.props;
            } else {
                let surrogate;
                surrogate = e.closest(".message");
                if (surrogate !== null) {
                    let index = [...surrogate.parentNode.childNodes].indexOf(surrogate);
                    let reactInternal = surrogate[Object.keys(surrogate).find(k => k.startsWith("__reactInternalInstance"))];
                    return reactInternal._hostParent._currentElement.props.children[0][index].props;
                }
                surrogate = e.closest(".member");
                if (surrogate !== null) {
                    let index = [...surrogate.parentNode.childNodes].indexOf(surrogate) - 1;
                    let reactInternal = surrogate[Object.keys(surrogate).find(k => k.startsWith("__reactInternalInstance"))];
                    return reactInternal._hostParent._currentElement.props.children[1][1][index].props;
                }
                surrogate = reactInternal._hostParent._currentElement.props.children;
                while (surrogate !== undefined && surrogate.props === undefined) {
                    surrogate = surrogate.find(v => v !== undefined && v !== null);
                }
                return surrogate.props;
            }
        } catch (err) {
            //console.error("getInternalProps:", e, err);
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

    // Get the relevant user color for an element, or undefined
    function getUserColor(e) {
        var props = getInternalProps(e);
        if (props === undefined) {
            return undefined;
        }

        try {
            return props.message.colorString;
        } catch (err) {
            // Catch TypeError if no message in props
        }

        // Return colorString or undefined if not present
        return props.colorString;
    }

    // Get the relevant guild ID for an element, or undefined
    function getGuildId(e) {
        var props = getInternalProps(e);
        if (props === undefined) {
            return undefined;
        }

        try {
            return props.guild.id;
        } catch (err) {
            // Catch TypeError if no guild in props
        }

        return undefined;
    }

    // Get the relevant guild owner ID for an element, or undefined
    function getOwnerId(e) {
        var props = getInternalProps(e);
        if (props === undefined) {
            return undefined;
        }

        try {
            return props.guild.ownerId;
        } catch (err) {
            // Catch TypeError if no guild in props
        }

        return undefined;
    }

    var prevGuildId;

    function processServer(mutation) {
        var guild, guildId, ownerId, usernames, tags;

        guild = $(".guild.selected")[0];

        // Get the ID of the server
        guildId = getGuildId(guild);

        // Get the ID of the server's owner
        ownerId = getOwnerId(guild);
        if (ownerId === undefined) {
            // (Probably) not looking at a server
            return;
        }

        // Check if changed servers and need to redo member list tagging
        // React likes to make minimal changes to the DOM, so owner tags
        // will stick around (or not get added) when a user is in both this
        // and the previous server.
        if (guildId !== prevGuildId) {
            // Get all visible members
            usernames = $(".member-username-inner");
            // Remove tags that were added
            usernames.siblings(".kawaii-tag").remove();
            usernames.filter(".kawaii-tagged").removeClass("kawaii-tagged");
            // Add the set of message authors affected by this mutation
            usernames = usernames.add(mutationFind(mutation, ".user-name"));
        } else {
            // Get the set of message authors and server members affected by this mutation
            usernames = mutationFind(mutation, ".member-username-inner, .user-name");
        }

        // Process usernames
        usernames.filter((_, e) => getUserId(e) === ownerId).not(".kawaii-tagged").after(function () {
            var color = getUserColor(this);
            var tag = $("<span>", {
                class: "bot-tag kawaii-tag",
            }).text("OWNER");
            if (color !== null) {
                tag.css("background-color", color);
            }
            return tag;
        }).addClass("kawaii-tagged");

        tags = mutationFind(mutation, ".discord-tag");

        tags.filter((_, e) => getUserId(e) === ownerId).not(".kawaii-tagged")
            .append($("<span>", {class: "bot-tag bot-tag-invert kawaii-tag"}).text("OWNER"))
            .addClass("kawaii-tagged");

        prevGuildId = guildId;
    }

    function processProfile(mutation) {
        var profile, userId, guilds;

        profile = mutationFind(mutation, "#user-profile-modal");
        userId = getUserId(profile[0]);
        if (userId === undefined) {
            // (Probably) not looking at a profile
            return;
        }

        guilds = profile.find(".guild .avatar-large");

        guilds.filter((_, e) => getOwnerId(e) === userId).parent().not(".kawaii-tagged")
            .append($("<span>", {class: "bot-tag kawaii-tag"}).text("OWNER"))
            .addClass("kawaii-tagged");
    }

    // Helper function for finding all elements matching selector affected by a mutation
    function mutationFind(mutation, selector) {
        var target = $(mutation.target), addedNodes = $(mutation.addedNodes);
        var mutated = target.add(addedNodes).filter(selector);
        var descendants = addedNodes.find(selector);
        var ancestors = target.parents(selector);
        return mutated.add(descendants).add(ancestors);
    }

    // Watch for new usernames
    new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            processServer(mutation);
            processProfile(mutation);
        });
    }).observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
