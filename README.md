# Doxer

Doxer is a port of, and borrows heavily from, [Docco](https://github.com/jashkenas/docco) but for [Dox documentation](https://github.com/visionmedia/dox). Doxer is not perfect and maybe contains bugs.

[Docco](https://github.com/jashkenas/docco) -- the original
quick-and-dirty, hundred-line-long,literate-programming-style
documentation generator in CoffeeScript.

[Example page](http://frozzare.github.com/doxer/)

## Installation

Install from npm:

```
$ npm install -g doxer
```

## Usage

```
Usage: doxer [options] <file ...>

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -t, --title [title]    doxer title, default file name
  -d, --dir [directory]  output directory

```

### Usage example

```sh
$ doxer lib/*
```
Will only take `.js` and `.coffee` files, other will not be touched. After generating the documentation it will save `doxer.css` in output directory and a html for each JavaScript or CoffeeScript files.

## Supported top comments

```
/*!
 * Project comment
 * ...
 * ... 
 */
 
// Project comment
// ...
// ...

// Project comment

// ...
// ...
```