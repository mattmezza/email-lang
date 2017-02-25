'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lexer = require('./lexer');

var _lexer2 = _interopRequireDefault(_lexer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EMAIL_HEADER_RE = /^From: (([A-Za-z0-9'_+ .,]+)|(".*" ))?<.*@.*\.[a-z0-9]+>[\n\r]Subject: (.*)[\n\r]Date: (.*)[\n\r]To: (.*)[\n\r](Reply-To: (([A-Za-z0-9'_+ .,]+)|(".*" ))?<.*@.*\.[a-z0-9]+>[\n\r])?/;

function parseAddress(lexer, type) {
  lexer.match.anyspace();
  var token = void 0;
  switch (type) {
    case 'from':
      token = lexer.match.from();
      break;
    case 'to':
      token = lexer.match.to();
      break;
    case 'reply-to':
    default:
      token = lexer.match.replyTo();
  }
  if (!token) {
    return;
  }
  var a = {};
  lexer.match.whitespace();
  // try to read "name"
  var name = lexer.match.string();
  if (!name) {
    // there is no "name", check if there is an email address unquoted
    var unquotedEmail = lexer.match.unquotedEmail();
    if (!unquotedEmail) {
      // there is no unquoted email, check if there is a quoted email
      var _email = lexer.match.email();
      if (!_email) {
        // no quoted name, no un quoted email no email... maybe an unquoted name??
        var unquotedName = lexer.match.name();
        if (!unquotedName) {
          // what??? this is unacceptable...
          lexer.error('Missing email and name in address');
        } else {
          name = unquotedName;
        }
      } else {
        // there is no name, only a <email>
        a.email = _email;
        lexer.match.anyspace();
        return a;
      }
    } else {
      // there is no name, only email provided
      a.email = unquotedEmail[0];
      lexer.match.anyspace();
      return a;
    }
  }
  if (name) {
    a.name = name.toString().trim();
    lexer.match.anyspace();
  }
  var email = lexer.match.email();
  if (!email) {
    lexer.error('Missing email in address');
  }
  a.email = email;
  lexer.match.anyspace();
  return a;
}

//
// Parser() uses tokens from Lexer() to define the grammer for a
// source stream and output a tree that can be cached or compiled.
//

exports.default = function (str) {
  var lexer = (0, _lexer2.default)(str);
  var emails = [];
  while (lexer.length()) {
    var email = {};
    var from = parseAddress(lexer, 'from');
    from ? email.from = from : lexer.error('missing From:');
    lexer.match.anyspace();
    var subject = lexer.match.subject();
    subject ? email.subject = subject.toString().trim() : lexer.error('missing Subject:');
    lexer.match.anyspace();
    var date = lexer.match.date();
    date ? email.date = date.toString().trim() : lexer.error('missing Date:');
    var to = parseAddress(lexer, 'to');
    to ? email.to = to : lexer.error('missing To:');
    var replyTo = parseAddress(lexer, 'reply-to');
    replyTo ? email.replyTo = replyTo : lexer.error('missing Reply-To:');
    var text = '';
    var line = lexer.match.entireline();
    while (line) {
      // if it is the last line - no \n at the end just break
      if (!line) break;
      // if the next lines represent a new email break and start over
      if (lexer.exec(EMAIL_HEADER_RE)) break;
      text += line;
      // read next line
      line = lexer.match.entireline();
      if (!line && !lexer.exec(/\n/)) {
        // no \n anymore, add the line, consume all and break
        text += lexer.consumeAll();
        break;
      }
    }
    email.text = text;
    emails.push(email);
  }
  return emails;
};