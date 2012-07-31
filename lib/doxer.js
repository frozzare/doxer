/*!
 * Doxer
 * Copyright(c) 2012 Fredrik Forsmo <fredrik.forsmo@gmail.com>
 * MIT Licensed
 */

var fs = require('fs')
  , dox = require('dox')
  , ejs = require('ejs')
  , exec = require('child_process').exec
  , utils = require('./utils')
  , coffee = false;
  
/**
 * Doxer version.
 */

exports.version = '0.1.5';

/**
 * Process all files
 *
 * @param {Object} options
 */

exports.process = function (options) {
  var template = fs.readFileSync(__dirname + '/../resources/doxer.ejs', 'utf8').toString()
    , style = fs.readFileSync(__dirname + '/../resources/doxer.css', 'utf8').toString()
    , sections = {}
    , sources = [];

  exec('mkdir -p ' + options.dir, function () {
    fs.writeFile(options.dir + '/doxer.css', style);
  });

  // Sorting files
  options.files = options.files.sort();
  
  // Adding to sources for jump to page menu
  options.files.forEach(function (file) {
    if (/.js$/.test(file) || /.coffee$/.test(file)) {
      file = file.split('/').pop();
      sources.push({
        fileName: file,
        destination: file.replace(/js|coffee/, 'html')
      });
    }
  });

  // Generate
  options.files.forEach(function (file) {
    if (!/.js$/.test(file) && !/.coffee$/.test(file)) return;
    
    var source = fs.readFileSync(file, 'utf8').toString()
      , fileName = file.split('/').pop()
      , html
      , sections = generate(source);
        
    if (/.coffee$/.test(file)) coffee = true;
              
    html = ejs.render(template, {
      title: options.title || fileName,
      sections: sections,
      sources: sources
    });
  
    fileName = fileName.replace(/js|coffee/, 'html');
    
    console.log('doxer: %s -> %s/%s', file, options.dir, fileName);
    
    fs.writeFile(options.dir + '/' + fileName, html);  
  });
};

/**
 * Extract top comments from source
 *
 * @param {String} source
 * @param {Object}
 */

function extractTopComment (source) {
  var topComment = /(\/\*\!(.|\n)+?\*\/)/.exec(source)
    , lineComment = /\/\/.*$/m
    , comment = ''
    , result = {};
  
  if (topComment !== null && topComment[1]) {
    comment = utils.escape(topComment[1]);
    topComment = topComment[1];
  } else {
    var lines = source.split('\n');
    topComment = '';
    
    for (var i = 0; i < lines.length; i++) {
      if (lineComment.test(lines[i])) {
        topComment += lines[i] + '\n';
      } else {
        // Let's check for a comment on the next line, maybe it's a empty new line between.
        if (lineComment.test(lines[i + 1])) continue;
        break;
      }
    }
    
    comment = utils.escape(topComment);
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

function generate (source) {
  var parsed
    , topComment
    , sections = [];
    
  sections = sections || [];
  
  // Replacing CoffeeScript ###*/### with Dox syntax
  source = utils.toDox(source);
  
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
      code_html: utils.highlight(coffee, doc.code)
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

  return utils.highlight(coffee, res.trim());
}