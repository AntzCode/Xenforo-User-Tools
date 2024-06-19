/**
 * XFUTIndexApp - handle actions on the Index page
 */
var XFUTIndexApp = {

  init: function () {
    //    
    //    document.getElementById('disableDomainSelector').style.display = 'hidden';
    //    
    //    setTimeout(function(){
    //      
    //      // we have to figure out whether the active tab is of a domain that the user has opted to exclude
    //      chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function(tabs){
    //        if(tabs.length < 1){
    //            return;
    //        }
    //        var tab = tabs[0];
    //        var urlFindings = tab.url.match(/(http[s]{0,1}:\/\/)([^\/]*)(\/{0,1}.*)/);
    //        if(urlFindings !== null && urlFindings.length >=3 ){
    //          // so now we know the domain name of the active tab
    //          document.getElementById('disableDomainName').innerText = urlFindings[2];
    //          document.getElementById('disableDomainSelector').style.display = 'block';
    //          
    //        }
    //        
    //        chrome.runtime.sendMessage({name : 'getXFUTBackgroundAppData'}, function(XFUTBackgroundAppData){
    //
    //          if(XFUTBackgroundAppData.disabledDomains.indexOf(document.getElementById('disableDomainName').innerText)>-1){
    //            // yes, the user has excluded the app from operating on this domain
    //            document.getElementById('disableDomain').checked = "checked";
    //          }else{
    //            // no the user has not excluded this domain from our processing
    //            document.getElementById('disableDomain').checked = null;
    //          }
    //
    //        });
    //          
    //      });
    //      
    //    }, 200);
    //    
    //    
    //    document.getElementById('disableDomain').addEventListener('change', function(event){
    //      
    //      setTimeout(function(){
    //        
    //        if(event.target.checked){
    //          // save the addition of the domain to excluded domains
    //          chrome.runtime.sendMessage({
    //            name : 'addDisabledDomain', 
    //            domainName : document.getElementById('disableDomainName').innerText
    //          });
    //          
    //        }else{
    //          // remove the domain from excluded domains
    //          chrome.runtime.sendMessage({
    //            name : 'removeDisabledDomain', 
    //            domainName : document.getElementById('disableDomainName').innerText
    //          });
    //          
    //        }
    //        
    //      }, 200);
    //      
    //    });
    //    
    //    document.getElementById('openSettingsPageLink').addEventListener('click', function(){chrome.runtime.openOptionsPage();});
    //    
  }

};

document.addEventListener('DOMContentLoaded', function () {
  XFUTIndexApp.init();
}, false);

