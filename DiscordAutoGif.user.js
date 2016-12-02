// ==UserScript==
// @name         DiscordAutoGif
// @namespace    https://files.noodlebox.moe/
// @downloadURL  https://files.noodlebox.moe/userscripts/DiscordAutoGif.user.js
// @version      1.0.1
// @description  Automatically play GIF and GIFV embeds without hovering
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

    // Automatically play GIFs and "GIFV" Videos
    $.fn.autoGif = function () {
        // Handle GIF
        this.find(".image:has(canvas)").each(function () {
            var image = $(this);
            var canvas = image.children("canvas").first();
            // Replace GIF preview with actual image
            var src = canvas.attr("src");
            if(src !== undefined) {
                image.replaceWith($("<img>", {
                    src: canvas.attr("src"),
                    width: canvas.attr("width"),
                    height: canvas.attr("height"),
                }).addClass("image kawaii-autogif"));
            }
        });

        // Handle GIFV
        this.find(".embed-thumbnail-gifv:has(video)").each(function () {
            var embed = $(this);
            var video = embed.children("video").first();
            // Remove the class, embed-thumbnail-gifv, to avoid the "GIF" overlay
            embed.removeClass("embed-thumbnail-gifv").addClass("kawaii-autogif");
            // Prevent the default behavior of pausing the video
            embed.parent().on("mouseout.autoGif", function (event) {
                event.stopPropagation();
            });
            video[0].play();
        });

        return this;
    };

    // Helper function for finding all elements matching selector affected by a mutation
    var mutationFind = function (mutation, selector) {
        var target = $(mutation.target), addedNodes = $(mutation.addedNodes);
        var mutated = target.add(addedNodes).filter(selector);
        var descendants = addedNodes.find(selector);
        var ancestors = target.parents(selector);
        return mutated.add(descendants).add(ancestors);
    };

    // Watch for new embeds in chat messages
    new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            mutationFind(mutation, ".accessory").autoGif();
        });
    }).observe(document, { childList:true, subtree:true });
})(jQuery.noConflict(true));
