/*!
 * Doxer
 * Copyright(c) 2012 Fredrik Forsmo <fredrik.forsmo@gmail.com>
 * MIT Licensed
 */

var fs = require('fs')
  , dox = require('dox')
  , ejs = require('ejs')
  , exec = require('child_process').exec
  , hl = require('highlight').Highlight;
  
/**
 * Doxer version.
 */

exports.version = '0.1.3';

/**
 * Process all files
 *
 * @param {Object} options
 */

exports.process = function (options, callback) {
  var template = fs.readFileSync(__dirname + '/../resources/doxer.ejs', 'utf8').toString()
    , style = fs.readFileSync(__dirname + '/../resources/doxer.css', 'utf8').toString()
    , html
    , sections = [];

  if (typeof options.files === 'string') {
    options.files = [options.files];
  }

  options.files.sort().forEach(function (file) {
    if (file.indexOf('.js') !== -1 || file.indexOf('.coffee') !== -1) {
      file = fs.readFileSync(file, 'utf8').toString();
    }
    
    sections = generate(sections, file);
  });
  
  // Render template with sections and title 
  html = ejs.render(template, {
    title: options.title,
    sections: sections
  });
  
  if (typeof callback === 'function') {
    callback({ html: html, style: style });
  } else {
    exec('mkdir -p docs', function () {
      fs.writeFile('docs/doxer.html', html);
      fs.writeFile('docs/doxer.css', style);
    });
  }
}

/**
 * Escape given `html`
 *
 * @param {String} html
 * @return {String} escaped html
 */

function escape (html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Replace `###*` and `###` with Dox syntax instead. (Experimental)
 *
 * @param {String} source
 * @param {String} replaced source
 */

function toDox (source) {
  var lines = source.split('\n')
    , i
    , coffeeComment = /^\s*\#\#\#/;
        
  for (i = 0; i < lines.length; i++) {
    if (coffeeComment.test(lines[i])) {
      if (/\#\*/.test(lines[i])) {
        lines[i] = '/' + lines[i].replace(coffeeComment, '*');
      } else {
        lines[i] = lines[i].replace(coffeeComment, '*/');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Extract top comments from source
 *
 * @param {String} source code
 * @param {Object}
 */

function extractTopComment (source) {
  var topComment = /(\/\*\!(.|\n)+?\*\/)/.exec(source)
    , comment = ''
    , result = {};
  
  if (topComment !== null && topComment[1]) {
    comment = escape(topComment[1]);
    topComment = topComment[1];
  } else {
    var lines = source.split('\n');
    topComment = '';
    for (var i = 0; i < lines.length; i++) {
      if (/\/\/.*$/m.test(lines[i])) {
        topComment += lines[i] + '\n';
      } else {
        // Maybe it's a new line between project name comment and copyright comment
        if (/\/\/.*$/m.test(lines[i + 1])) continue;
        break;
      }
    }
    
    comment = escape(topComment);
  }
  
  if (topComment && comment) {
    result = {
      docs_html: '<pre><code class="top">' + comment + '</code></pre>',
      code_html: readUntilDox(source, topComment)
    };
  }
  
  return result; 
}

/** 
 * Generate documentation html and code html for `source`
 *
 * @param {Array} sections
 * @param {String} source
 * @return {Array}
 */

function generate (sections, source) {
  var parsed
    , topComment;
    
  sections = sections || [];
  
  // Replacing ### with Dox syntax instead no compiling of CoffeeScript.
  source = toDox(source);
  
  // Parsing Dox comments
  parsed = dox.parseComments(source, { raw: false });
  
  // Extract top comment
  comment = extractTopComment(source);
  
  if (comment.docs_html !== undefined) {
    sections.push(comment);
  }
        
  parsed.forEach(function (doc) {
    if (doc.ignore || doc.isPrivate) return;
                
    sections.push({
      docs_html: doc.description.full,
      code_html: hl(doc.code)
    });
  });
  
  return sections;
}

/**
 * Read until dox syntax starts
 *
 * @param {String} src
 * @param {String} comment
 * @return {String}
 */
 
function readUntilDox (src, comment) {
  var res = ''
    , lines = src.split('\n');
        
  for (var i = 0; i < lines.length; i++) {
    // Regex instead of indexOf fixes so dox don't break here.
    if (/\*\*/.test(lines[i])) {
      break;
    } else {
      res += lines[i] + '\n';
    }
  }
  
  res = res.replace(comment, '');

  return hl(res.trim());
}