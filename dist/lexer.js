'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var QUOTED_RE = /^"/;
var OPEN_RE = /^<\s*/;
var CLOSE_RE = /^>/;
var WORD_RE = /^([-|+]?\w+)/;
var NAME_RE = /^[A-Za-z0-9'-_][^<]+/;
var EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var WHITESPACE_RE = /^[^\S\n\r]*/; // but not new lines
var ANYSPACE_RE = /^\s*/; // any whitespace
var NON_WHITESPACE_RE = /^\S+/; // any non whitespace
var NEWLINE_RE = /[\n\r]+/; // the next NL
var FROM_RE = /^From:/;
var SUBJECT_RE = /^Subject:/;
var DATE_RE = /^Date:/;
var TO_RE = /^To:/;
var REPLY_TO_RE = /^Reply-To:/;
var ENTIRELINE_RE = /^.*[\n\r]/;

//
// Lexer() provides a simple API that can read and reduce a source stream.
// each method is either a helper or a matcher that represents a token.
//

exports.default = function (str, options) {
  options = options || {};

  var lexer = {
    source: str.slice()
  };

  var lineno = 1;
  var column = 1;

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  function matcher(re) {
    var m = re.exec(lexer.source);
    // console.log('>', arguments.callee.caller.name, "'" + m + "'", lexer.source)
    if (m === null) return;
    var str = m[0];
    updatePosition(str);
    lexer.source = lexer.source.slice(m.index + str.length);
    return m;
  }

  lexer.data = function () {
    return lexer.source;
  };

  lexer.pos = function () {
    return { column: column, lineno: lineno };
  };

  lexer.length = function () {
    return lexer.source.length;
  };

  lexer.exec = function (re) {
    return re.exec(lexer.source);
  };

  lexer.peek = function (index, len) {
    return lexer.source.slice(index || 0, len || 1);
  };

  lexer.pop = function (index, len) {
    var s = lexer.source.slice(index || 0, len || 1);
    lexer.source = lexer.source.slice(len || 1);
    return s;
  };

  lexer.error = function (msg) {
    var err = new SyntaxError([msg, ':', lineno, ':', column].join(''));
    err.reason = msg;
    err.line = lineno;
    err.column = column;
    throw err;
  };

  var pm = lexer.match = {};
  pm.whitespace = function () {
    return matcher(WHITESPACE_RE);
  };
  pm.anyspace = function () {
    return matcher(ANYSPACE_RE);
  };
  pm.newline = function () {
    return matcher(NEWLINE_RE);
  };
  pm.open = function () {
    return matcher(OPEN_RE);
  };
  pm.close = function () {
    return matcher(CLOSE_RE);
  };
  pm.from = function () {
    return matcher(FROM_RE);
  };
  pm.to = function () {
    return matcher(TO_RE);
  };
  pm.name = function () {
    return matcher(NAME_RE);
  };
  pm.replyTo = function () {
    return matcher(REPLY_TO_RE);
  };
  pm.entireline = function () {
    return matcher(ENTIRELINE_RE);
  };
  pm.string = function () {
    var quote = matcher(QUOTED_RE);
    if (!quote) return;
    var value = '';
    while (lexer.source[0] !== quote[0]) {
      if (lexer.length() === 0) {
        lexer.error('missing end of string');
      }
      value += lexer.source[0];
      lexer.source = lexer.source.slice(1);
    }
    lexer.source = lexer.source.slice(1);
    updatePosition(value);
    return value;
  };
  pm.email = function () {
    var open = matcher(OPEN_RE);
    if (!open) return;
    var value = '';
    while (lexer.source[0] !== '>') {
      if (lexer.length() === 0) {
        lexer.error('missing end of email');
      }
      value += lexer.source[0];
      lexer.source = lexer.source.slice(1);
    }
    if (!EMAIL_RE.exec(value)) {
      lexer.error('malformed email');
    }
    lexer.source = lexer.source.slice(1);
    updatePosition(value);
    return value;
  };
  pm.subject = function () {
    var key = matcher(SUBJECT_RE);
    if (!key) return;
    var value = '';
    while (lexer.source[0] !== '\n') {
      if (lexer.length() === 0) {
        lexer.error('missing new line to end Subject:');
      }
      value += lexer.source[0];
      lexer.source = lexer.source.slice(1);
    }
    lexer.source = lexer.source.slice(1);
    updatePosition(value);
    return value;
  };
  pm.date = function () {
    var key = matcher(DATE_RE);
    if (!key) return;
    var value = '';
    while (lexer.source[0] !== '\n') {
      if (lexer.length() === 0) {
        lexer.error('missing new line to end Date:');
      }
      value += lexer.source[0];
      lexer.source = lexer.source.slice(1);
    }
    lexer.source = lexer.source.slice(1);
    updatePosition(value);
    return value;
  };
  pm.nonwhitespace = function () {
    return matcher(NON_WHITESPACE_RE);
  };
  pm.word = function () {
    var m = matcher(WORD_RE);
    return m && m[0];
  };

  return lexer;
};