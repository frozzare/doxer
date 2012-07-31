var fs = require('fs')
  , hl = require('highlight.js');

/**
 * Escape given `html`
 *
 * @param {String} html
 * @return {String} escaped html
 */

exports.escape = function (html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Shortcut function for highlight code
 *
 * @param {Boolean} coffee
 * @param {String} code
 * @return {String} highlighted code
 */

exports.highlight = function (coffee, code) {
  return hl.highlight(coffee ? 'coffeescript' : 'javascript', code).value;
};

/**
 * Replace `###*` and `###` with Dox syntax instead. (Experimental)
 *
 * @param {String} source
 * @param {String} replaced source
 */

exports.toDox = function (source) {
  var lines = source.split('\n')
    , coffeeComment = /^\s*\#\#\#/;

  for (var i = 0; i < lines.length; i++) {
    if (coffeeComment.test(lines[i])) {
      if (/\#\*/.test(lines[i])) {
        lines[i] = '/' + lines[i].replace(coffeeComment, '*');
      } else {
        lines[i] = lines[i].replace(coffeeComment, '*/\n');
      }
    }
  }

  return lines.join('\n');
};