var XFUserToolsApp = {

    // system properties - overwritten at runtime
    SettingsService: null,

    blockedUsers: [],

    init: function () {

        chrome.runtime.sendMessage({name: 'getXFUTBackgroundAppData'}, function (XFUTBackgroundAppData) {

//            if (XFUTBackgroundAppData.disabledDomains.indexOf(window.location.hostname) > -1) {
//                // we do not process this page (silently falls-through)
//
//            } else {

                chrome.storage.sync.get('SettingsService', function (dbResult) {

                    XFUserToolsApp.SettingsService = dbResult.SettingsService;
                    
                        // let's hang on to the configuration settings for forming the urls.
                        XFUserToolsApp.blockedUsers = XFUserToolsApp.SettingsService.blockedUsers;



                        // run on the whole page to begin with
                        //var allTags = document.getElementsByTagName('*'); // non-jQuery (heavy, slow)

                        // let's hide all blocked posts and blocked quotes right away
                        XFUserToolsApp.hideBlockedPosts();
                        XFUserToolsApp.hideBlockedQuotes();

                        // watch for events - every time the page is modified, hide any content that is from a blocked user
                        var mutationObserver = new MutationObserver(function (mutations) {

                            mutations.forEach(function (mutation) {
                                mutation.addedNodes.forEach(function (node) {
                                    XFUserToolsApp.hideBlockedPosts();
                                    XFUserToolsApp.hideBlockedQuotes();
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
//
//            }

        });

    },

    hideBlockedPosts: function () {
        $.each(XFUserToolsApp.blockedUsers, (index, author) => {
            $('[data-author="' + author + '"]').hide();
        });
    },

    hideBlockedQuotes: function () {
        $.each(XFUserToolsApp.blockedUsers, (index, author) => {
            $('.bbWrapper blockquote a:contains("' + author + '")').each(function () {
                $(this).closest('blockquote').html('<p>Content from ' + author + ' has been hidden by <a href="">XF User Tools plugin</a></p>');
            });
        });
    }

};



// run the app
XFUserToolsApp.init();


