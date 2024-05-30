/**
 * XFUTTranslations - Define Translation Content
 */
var XFUTTranslations = {

  _: function (name, locale) {
    if (typeof locale === 'undefined') {
      if (window.navigator.languages) {
        locale = window.navigator.languages[0];
      } else {
        locale = window.navigator.userLanguage || window.navigator.language;
      }
      locale.replace('-', '_');
    }
    if (typeof this[name] !== 'undefined') {
      if (typeof this[name][locale] === 'string') {
        return this[name][locale];
      }
    }
    return name;
  },


  /**
   * Tools Page
   */

  "Xenforo User Tools - Settings": {
    en_GB: "Xenforo User Tools - Settings"
  },

  "Xenforo User Tools": {
    en_GB: "Xenforo User Tools Plugin"
  },


  /**
   * Settings Page
   */
  "Xenforo User Tools Settings": {
    en_GB: "Xenforo User Tools Settings"
  },
  "Xenforo User Tools - Settings": {
    en_GB: "Xenforo User Tools : Settings"
  },


  /**
   * Index Page
   */
  "Xenforo User Tools - Index": {
    en_GB: "Xenforo User Tools"
  },
  " Do not process ": {
    en_GB: " Do not process "
  },
  "What is it?": {
    en_GB: "What is it?"
  },
  "What is it? (p1)": {
    en_GB: "A browser plugin to provide extended features for websites that are running the Xenforo forums software"
  }

};
