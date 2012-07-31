/*!
 * Doxer
 * Copyright(c) 2012 Fredrik Forsmo <fredrik.forsmo@gmail.com>
 * MIT Licensed
 */

var fs = require('fs')
  , dox = require('dox')
  , ejs = require('ejs')
  , exec = require('child_process').exec
  , hl = require('highlight').Highlight
  , template = fs.readFileSync(__dirname + '/../resources/doxer.ejs', 'utf8').toString()
  , style = fs.readFileSync(__dirname + '/../resources/doxer.css', 'utf8').toString()
  , sections = []
  , html;

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
  options.files.sort().forEach(generate);
  
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
 * Generate documentation html and code html for file
 *
 * @param {String} file
 */

function generate (file) {
  var fileSrc = fs.readFileSync(file, 'utf8').toString()
    , parsed = dox.parseComments(fileSrc, { raw: false })
    , topComment = /(\/\*\!(.|\n)+?\*\/)/.exec(fileSrc);
    
  if (topComment !== null && topComment[1]) {
    sections.push({
      docs_html: '<pre><code class="top">' + topComment[1] + '</code></pre>',
      code_html: readUntilDox(fileSrc, topComment[1])
    });
  } else {
    var lines = fileSrc.split('\n');
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
    
    sections.push({
      docs_html: '<pre><code class="top">' + topComment + '</code></pre>',
      code_html: readUntilDox(fileSrc, topComment)
    });
  }
      
  parsed.map(function (doc) {
    if (doc.ignore || doc.isPrivate) return;
                
    sections.push({
      docs_html: doc.description.full,
      code_html: hl(doc.code)
    });
  });
}

/**
 * Read until dox syntax starts
 *
 * @param {String} src
 * @param {String} topComment
 * @return {String}
 */
 
function readUntilDox (src, topComment) {
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
  
  res = res.replace(topComment, '');

  return hl(res.trim());
}