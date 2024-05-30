/**
 * XFUTOptionsApp - handle actions on the Options page
 */
var XFUTOptionsApp = {

  usernameMaxLength: 65,
  SettingsService: null,
  blockedUsers: [],

  init: function () {

    var form = document.forms['options'];

    this.getOption('SettingsService', function (SettingsService) {
      XFUTOptionsApp.SettingsService = SettingsService || { blockedUsers: [] };

      XFUTOptionsApp.redrawBlockedUsers();

    });

  },

  redrawBlockedUsers: function () {

    jQuery('#blocked-users').html('');

    jQuery.each(XFUTOptionsApp.SettingsService.blockedUsers, function (index, username) {
      var tr = jQuery('<tr />');
      var unTD = jQuery('<td />').text(username);
      var delImg = jQuery('<img class="delete-button" alt="Delete" title="Unblock User" />')
        .prop('src', chrome.extension.getURL('/images/site/trash-icon.png'))
        .prop('width', '24').prop('height', '24')
        .data('username', username);
      var delTD = jQuery('<td class="action delete" />').append(delImg);
      tr.append(unTD).append(delTD);
      jQuery('#blocked-users').append(tr);
    });

    // add a new user
    var tr = jQuery('<tr />');
    var textField = jQuery('<input type="text" name="username" class="add-username" placeholder="... enter a username to block:" />');
    var unTD = jQuery('<td />').append(textField);
    var addBtn = jQuery('<button name="add" class="add-button">Block This User</button>');
    var addTD = jQuery('<td class="action add" />').append(addBtn);
    tr.append(unTD).append(addTD);
    jQuery('#blocked-users').append(tr);
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

  XFUTOptionsApp.init();

}, false);

