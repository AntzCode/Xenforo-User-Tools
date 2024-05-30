
/**
 * XFUTBackgroundApp - define background actions
 */
var XFUTBackgroundApp = {
  currentUrl: null,
  currentDomain: null,
  disabledDomains: [],

  init: function () {
    //    chrome.storage.sync.get('disabledDomains', function(dbResponse){
    //      XFUTBackgroundApp.disabledDomains = dbResponse.disabledDomains;
    //    });
  }

};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  //  if(message.name === 'getXFUTBackgroundAppData') {
  //    sendResponse({
  //      currentUrl : XFUTBackgroundApp.currentUrl,
  //      currentDomain : XFUTBackgroundApp.currentDomain,
  //      disabledDomains : XFUTBackgroundApp.disabledDomains
  //    });
  //  }

  //  if(message.name === 'updateDisabledDomains') {
  //    chrome.storage.sync.get('disabledDomains', function(dbResponse){
  //      XFUTBackgroundApp.disabledDomains = dbResponse.disabledDomains;
  //    });
  //  }
  //  if(message.name === 'addDisabledDomain') {
  //    if(XFUTBackgroundApp.disabledDomains.indexOf(message.domainName)<0){
  //      XFUTBackgroundApp.disabledDomains.push(message.domainName);
  //    }
  //    chrome.storage.sync.set({disabledDomains : XFUTBackgroundApp.disabledDomains});
  //  }
  //  if(message.name === 'removeDisabledDomain') {
  //    while(XFUTBackgroundApp.disabledDomains.indexOf(message.domainName)>-1){
  //      XFUTBackgroundApp.disabledDomains.splice(XFUTBackgroundApp.disabledDomains.indexOf(message.domainName), 1);
  //    }
  //    chrome.storage.sync.set({disabledDomains : XFUTBackgroundApp.disabledDomains});
  //  }

});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {


  if (typeof (tab.url) === 'string') {
    if (tab.highlighted) {
      // only process changes to the current active tab
      XFUTBackgroundApp.currentUrl = tab.url;
      var urlFindings = tab.url.match(/(http[s]{0,1}:\/\/)([^\/]*)(\/{0,1}.*)/);
      if (urlFindings !== null && urlFindings.length >= 3) {
        XFUTBackgroundApp.currentDomain = urlFindings[2];
      } else {
        XFUTBackgroundApp.currentDomain = '';
      }
    }
  }

});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ disabledDomains: [] });
  chrome.storage.sync.set({ SettingsService: { blockedUsers: [] } });
});

XFUTBackgroundApp.init();

