/**
 * XFUTOptionsApp - handle actions on the Options page
 */
var XFUTOptionsApp = {

  blockingMode: 'blacklist',
  usernameMaxLength: 65,
  SettingsService: null,
  blockedUsers: [],
  approvedUsers: [],

  init: function () {

    var form = document.forms['options'];

    this.getOption('SettingsService', function (SettingsService) {
      XFUTOptionsApp.SettingsService = SettingsService || { blockedUsers: [], approvedUsers: [], blockingMode: [] };

      XFUTOptionsApp.redrawBlockedUsers();
      XFUTOptionsApp.redrawApprovedUsers();
      XFUTOptionsApp.redrawBlockingModeToggleButton();    

    });

  },

  redrawApprovedUsers: function(){
    this.redrawUsernameTable(XFUTOptionsApp.SettingsService.approvedUsers, '#approved-users', 'whitelist');
  },

  redrawBlockedUsers: function(){
    this.redrawUsernameTable(XFUTOptionsApp.SettingsService.blockedUsers, '#blocked-users', 'blacklist');
  },

  redrawUsernameTable: function (usernames, tableSelector, tableMode) {

    jQuery(tableSelector).html('');

    jQuery.each(usernames, async function (index, username) {
      var tr = jQuery('<tr />');
      var unTD = jQuery('<td />').text(username);
      var delImg = jQuery('<img class="delete-button" alt="Delete" title="'+(tableMode === 'blacklist' ? 'Unblock User' : 'Diapprove User')+'" />')
        .prop('src', chrome.runtime.getURL('/images/site/trash-icon.png'))
        .prop('width', '24').prop('height', '24')
        .data('username', username);
      var delTD = jQuery('<td class="action delete" />').append(delImg);
      tr.append(unTD).append(delTD);
      jQuery(tableSelector).append(tr);
    });

    // add a new user
    var tr = jQuery('<tr />');
    var textField = jQuery('<input type="text" name="username" class="add-username" placeholder="... enter a username to '+(tableMode === 'blacklist' ? 'block' : 'approve')+':" />');
    var unTD = jQuery('<td />').append(textField);
    var addBtn = jQuery('<button name="add" class="add-button">'+(tableMode === 'blacklist' ? 'Block' : 'Approve')+' This User</button>');
    var addTD = jQuery('<td class="action add" />').append(addBtn);
    tr.append(unTD).append(addTD);
    jQuery(tableSelector).append(tr);

  },

  addBlockedUser: function (username) {
    // enforce character limit to prevent errors on bad formatting
    username = username.trimToLength(XFUTOptionsApp.usernameMaxLength);

    // must not be empty
    if (username.length < 1) {
      return;
    }

    // do not allow duplicates
    if (jQuery.inArray(username, XFUTOptionsApp.SettingsService.blockedUsers) < 0) {
      XFUTOptionsApp.SettingsService.blockedUsers[XFUTOptionsApp.SettingsService.blockedUsers.length] = username + "";
      this.setOption('SettingsService', XFUTOptionsApp.SettingsService);
    }

    XFUTOptionsApp.redrawBlockedUsers();

  },

  removeBlockedUser: function (username) {
    if (jQuery.inArray(username, XFUTOptionsApp.SettingsService.blockedUsers) > -1) {
      XFUTOptionsApp.SettingsService.blockedUsers.splice(XFUTOptionsApp.SettingsService.blockedUsers.indexOf(username), 1);
      this.setOption('SettingsService', XFUTOptionsApp.SettingsService);

      XFUTOptionsApp.redrawBlockedUsers();

    }
  },

  addApprovedUser: function (username) {
    // enforce character limit to prevent errors on bad formatting
    username = username.trimToLength(XFUTOptionsApp.usernameMaxLength);

    // must not be empty
    if (username.length < 1) {
      return;
    }

    // do not allow duplicates
    if (jQuery.inArray(username, XFUTOptionsApp.SettingsService.approvedUsers) < 0) {
      XFUTOptionsApp.SettingsService.approvedUsers[XFUTOptionsApp.SettingsService.approvedUsers.length] = username + "";
      this.setOption('SettingsService', XFUTOptionsApp.SettingsService);
    }

    XFUTOptionsApp.redrawApprovedUsers();

  },

  removeApprovedUser: function (username) {
    if (jQuery.inArray(username, XFUTOptionsApp.SettingsService.approvedUsers) > -1) {
      XFUTOptionsApp.SettingsService.approvedUsers.splice(XFUTOptionsApp.SettingsService.approvedUsers.indexOf(username), 1);
      this.setOption('SettingsService', XFUTOptionsApp.SettingsService);

      XFUTOptionsApp.redrawApprovedUsers();

    }
  },

  getOption: function (name, callbackFunction) {
    try {
      chrome.storage.sync.get(name, function (value) {
        callbackFunction(value[name]);
      });
    } catch (e) {
      callbackFunction(null);
    }
  },

  setOption: function (name, value, callbackFunction) {
    try {
      var option = {};
      option[name] = value;
      chrome.storage.sync.set(option, callbackFunction);
    } catch (e) {
      callbackFunction(false);
    }
  },

  setBlockingMode: function(mode){
    // validation - only allowed disabled, blacklist or whitelist
    mode = (['blacklist','whitelist','disabled'].indexOf(mode) > -1) ? mode : 'blacklist';
    XFUTOptionsApp.SettingsService.blockingMode=mode;
    this.setOption('SettingsService', XFUTOptionsApp.SettingsService);
    setTimeout(() => this.redrawBlockingModeToggleButton());
    setTimeout(() => alert('Please reload the page to see the changes'), 5);
  },

  toggleBlockingMode: function(blockingMode=null){
    switch(XFUTOptionsApp.SettingsService.blockingMode){
        case 'whitelist':
            XFUTOptionsApp.setBlockingMode('disabled');
        break;
        case 'disabled':
            XFUTOptionsApp.setBlockingMode('blacklist');
        break;
        case 'blacklist':
        default:
            XFUTOptionsApp.setBlockingMode('whitelist');
    break;
    }
  },

  redrawBlockingModeToggleButton: function(){
    var button = jQuery('#toggle-blocking-mode');
    button.removeClass(['blacklist','whitelist','disabled']);
    button.addClass(XFUTOptionsApp.SettingsService.blockingMode);
    switch(XFUTOptionsApp.SettingsService.blockingMode){
        case 'blacklist':
            button.html('Blocking Selected Users (blacklist)');
        break;
        case 'whitelist':
            button.html('Only Showing Approved Users (whitelist)');       
        break;
        case 'disabled':
            button.html('Disabled (not blocking any content)');
        break;
    }
  }

};


// trim a string to a defined length, if it exceeds that length 
// from: https://stackoverflow.com/questions/4637942/how-can-i-truncate-a-string-in-jquery - 20201012
String.prototype.trimToLength = function (m) {
  return (this.length > m)
    ? jQuery.trim(this).substring(0, m).split(" ").slice(0, -1).join(" ") + "..."
    : this + "";
};


document.addEventListener('DOMContentLoaded', function () {

  // delegate an event listener to delete a blocked user from the list when button is clicked
  jQuery('#blocked-users').delegate('.delete-button', 'click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to unblock ' + jQuery(e.target).data('username') + '?')) {
      XFUTOptionsApp.removeBlockedUser(jQuery(e.target).data('username'));
      alert('Please reload the page to see the changes');
    }

  });

  // delegate an event listener to add a user to the blocked users list when button is clicked
  jQuery('#blocked-users').delegate('.add-button', 'click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    XFUTOptionsApp.addBlockedUser(jQuery('#blocked-users .add-username').val());
    alert('Please reload the page to see the changes');

  });
  
  // delegate an event listener to delete an approved user from the list when button is clicked
  jQuery('#approved-users').delegate('.delete-button', 'click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to disapprove ' + jQuery(e.target).data('username') + '?')) {
      XFUTOptionsApp.removeApprovedUser(jQuery(e.target).data('username'));
      alert('Please reload the page to see the changes');
    }

  });

  // delegate an event listener to add a user to the approved users list when button is clicked
  jQuery('#approved-users').delegate('.add-button', 'click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    XFUTOptionsApp.addApprovedUser(jQuery('#approved-users .add-username').val());
    alert('Please reload the page to see the changes');

  });

  jQuery('#toggle-blocking-mode').on('click', function(e){
    XFUTOptionsApp.toggleBlockingMode();
  });

  XFUTOptionsApp.init();

}, false);

