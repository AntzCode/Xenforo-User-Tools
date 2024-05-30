/**
 * XFUserToolsApp - the App that runs as a Chrome Plugin content script
 */
var XFUserToolsApp = {

    // system properties - overwritten at runtime
    SettingsService: null,

    // list of blocked users
    blockedUsers: [],

    // list of approved users
    approvedUsers: [],

    init: function () {

        chrome.runtime.sendMessage({ name: 'getXFUTBackgroundAppData' }, function (XFUTBackgroundAppData) {

            //            if (XFUTBackgroundAppData.disabledDomains.indexOf(window.location.hostname) > -1) {
            //                // we do not process this page (silently falls-through)
            //
            //            } else {

            chrome.storage.sync.get('SettingsService', function (dbResult) {

                XFUserToolsApp.SettingsService = dbResult.SettingsService;

                // let's hang on to the configuration settings for forming the urls.
                XFUserToolsApp.blockedUsers = XFUserToolsApp.SettingsService.blockedUsers;
                XFUserToolsApp.approvedUsers = XFUserToolsApp.SettingsService.approvedUsers;

                // run on the whole page to begin with
                //var allTags = document.getElementsByTagName('*'); // non-jQuery (heavy, slow)

                if (XFUserToolsApp.SettingsService.blockingMode === 'blacklist') {
                    // let's hide all blocked posts and blocked quotes right away
                    XFUserToolsApp.hideBlockedPosts(document.body);
                    XFUserToolsApp.hideBlockedQuotes(document.body);
                    XFUserToolsApp.hideBlockedReactions(document.body);
                }

                if (XFUserToolsApp.SettingsService.blockingMode === 'whitelist') {
                    // let's hide all unapproved posts and unapproved quotes right away

                    // hide all to start with
                    $('[data-author]', document.body).hide();

                    XFUserToolsApp.showApprovedPosts(document.body);
                    // XFUserToolsApp.hideUnapprovedQuotes();
                }

                // watch for events - every time the page is modified, hide any content that is from a blocked user
                var mutationObserver = new MutationObserver(function (mutations) {

                    mutations.forEach(function (mutation) {
                        
                        mutation.addedNodes.forEach(function (node) {

                            if (XFUserToolsApp.SettingsService.blockingMode === 'blacklist') {
                                XFUserToolsApp.hideBlockedPosts(node);
                                XFUserToolsApp.hideBlockedQuotes(node);
                                XFUserToolsApp.hideBlockedReactions(node);
                            }

                            if (XFUserToolsApp.SettingsService.blockingMode === 'whitelist') {
                                // let's hide all unapproved posts and unapproved quotes right away
                                // hide all to start with
                                $('[data-author]', node).hide();
                                XFUserToolsApp.showApprovedPosts(node);
                            }
            
                        });
                    });

                });

                mutationObserver.observe(document.body, {
                    characterData: true,
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ["data-xf-user-tools-processed"]
                });

            });

        });

    },

    hideBlockedPosts: function (scope) {
        $.each(XFUserToolsApp.blockedUsers, (index, author) => {
            $('[data-author="' + author + '"]', scope).hide();
        });
    },

    hideBlockedQuotes: function (scope) {
        $.each(XFUserToolsApp.blockedUsers, (index, author) => {
            $('.bbWrapper blockquote a:contains("' + author + '")', scope).each(function () {
                $(this).closest('blockquote').html('<p>Content from ' + author + ' has been hidden by <a href="">XF User Tools plugin</a></p>');
            });
        });
    },

    hideBlockedReactions: function(scope) {
        // remove usernames from reactions
        $('.reactionsBar-link bdi', scope).each(function(){
            let reactionUsername = $(this).text();
            if(XFUserToolsApp.blockedUsers.indexOf(reactionUsername) > -1){
                // remove the username of the person who reacted to the post
                $(this).html('?');
            }
        });
    },

    showApprovedPosts: function (scope) {

        // show posts by whitelisted users
        $.each(XFUserToolsApp.approvedUsers, (index, author) => {
            $('[data-author="' + author + '"]', scope).each(function(){
                $(this).show();

                // hide any quotes in this post that are not from approved members
                $('.bbWrapper blockquote', this).each(function(){
                    let quoteAuthorUsername = $(this).data('quote');

                    if(XFUserToolsApp.approvedUsers.indexOf(quoteAuthorUsername) < 0){
                        // the quote's author is not on the whitelist
                        $(this).html('<p>Content from '+quoteAuthorUsername+' has been hidden by <a href="">XF User Tools plugin</a></p>');
                    }
                });
            });
        });

        // process any posts that contain quotes from approved users
        $.each(XFUserToolsApp.approvedUsers, (index, author) => {

            $('.bbWrapper blockquote a:contains("' + author + '")', scope).each(function () {
                
                $(this).closest('article.message').each(function () {
                    
                    // we have to un-hide this post because it contains a quote from a whitelisted user
                    $(this).show();
                    
                    // find out who the post's author is
                    blockedAuthorUsername = $('section.message-user .message-name .username', this).text();

                    if(XFUserToolsApp.approvedUsers.indexOf(blockedAuthorUsername) < 0){
                        // the post's author is not on the whitelist

                        // find the quotes that are from approved users
                        let preservedBlockQuotes = [];

                        // replace the user's username and avatar with a plain text usernam
                        $('section.message-user', this).html('<p><u style="font-family: monospace; display: block; margin: 0.5em;" title="Filtered by Xenforo User Tools">' + blockedAuthorUsername + '</u><br />(XF User Tools)</p>');
                        
                        $.each(XFUserToolsApp.approvedUsers, (index, approvedAuthor) => {
                            $('.message-body .bbWrapper blockquote a:contains("' + approvedAuthor + '")', this).each(function () {
                                preservedBlockQuotes[preservedBlockQuotes.length] = $(this).closest('blockquote').prop('outerHTML');
                            });
                        });

                        // delete the post's content and replace it with only the approved quotes
                        $('.message-body', this).html('<p>Content has been hidden by <a href="">XF User Tools plugin</a>, only showing content from approved users</p>' + preservedBlockQuotes.join(''));

                    }else{
                        // the post was created by an approved user, then we shall strip-out any non-approved quotes in it

                        // flag all quotes for removal unless on whitelist
                        $('.message-body .bbWrapper blockquote', this).addClass('xf-user-tools-blockquote-unapproved');

                        $.each(XFUserToolsApp.approvedUsers, (index, approvedAuthor) => {
                            $('.message-body .bbWrapper blockquote a:contains("' + approvedAuthor + '")', this).each(function () {
                                // unflag it
                                $(this).closest('blockquote').removeClass('xf-user-tools-blockquote-unapproved');
                            });
                        });

                        $('.message-body .bbWrapper blockquote.xf-user-tools-blockquote-unapproved', this).each(function(){
                            
                            // replace the quote content with a message saying it was removed
                            $(this).html('<p>Content has been hidden by <a href="">XF User Tools plugin</a></p>');
                        });
                        
                    }

                });
            });
        });

        // remove usernames from reactions
        $('.reactionsBar-link bdi', scope).each(function(){
            let reactionUsername = $(this).text();
            if(XFUserToolsApp.approvedUsers.indexOf(reactionUsername) < 0){
                // remove the username of the person who reacted to the post
                $(this).html('?');
            }
        });


    }

};

// run the app
XFUserToolsApp.init();
