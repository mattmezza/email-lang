import Lexer from './lexer'
const EMAIL_HEADER_RE = /^From: (([A-Za-z0-9'_+ .,]+)|(".*" ))?<.*@.*\.[a-z0-9]+>[\n\r]Subject: (.*)[\n\r]Date: (.*)[\n\r]To: (.*)[\n\r](Reply-To: (([A-Za-z0-9'_+ .,]+)|(".*" ))?<.*@.*\.[a-z0-9]+>[\n\r])?/

function parseAddress (lexer, type) {
  lexer.match.anyspace()
  let token
  switch (type) {
    case 'from':
      token = lexer.match.from()
      break
    case 'to':
      token = lexer.match.to()
      break
    case 'reply-to':
    default:
      token = lexer.match.replyTo()
  }
  if (!token) {
    return
  }
  let a = {}
  lexer.match.whitespace()
  // try to read "name"
  let name = lexer.match.string()
  if (!name) {
    // there is no "name", check if there is an email address unquoted
    let unquotedEmail = lexer.match.unquotedEmail()
    if (!unquotedEmail) {
      // there is no unquoted email, check if there is a quoted email
      let email = lexer.match.email()
      if (!email) {
        // no quoted name, no un quoted email no email... maybe an unquoted name??
        let unquotedName = lexer.match.name()
        if (!unquotedName) {
          // what??? this is unacceptable...
          lexer.error('Missing email and name in address')
        } else {
          name = unquotedName
        }
      } else {
        // there is no name, only a <email>
        a.email = email
        lexer.match.anyspace()
        return a
      }
    } else {
      // there is no name, only email provided
      a.email = unquotedEmail[0]
      lexer.match.anyspace()
      return a
    }
  }
  if (name) {
    a.name = name.toString().trim()
    lexer.match.anyspace()
  }
  let email = lexer.match.email()
  if (!email) {
    lexer.error('Missing email in address')
  }
  a.email = email
  lexer.match.anyspace()
  return a
}

//
// Parser() uses tokens from Lexer() to define the grammer for a
// source stream and output a tree that can be cached or compiled.
//
export default (str) => {
  var lexer = Lexer(str)
  var emails = []
  while (lexer.length()) {
    var email = {}
    let from = parseAddress(lexer, 'from')
    from ? email.from = from : lexer.error('missing From:')
    lexer.match.anyspace()
    let subject = lexer.match.subject()
    subject ? email.subject = subject.toString().trim() : lexer.error('missing Subject:')
    lexer.match.anyspace()
    let date = lexer.match.date()
    date ? email.date = date.toString().trim() : lexer.error('missing Date:')
    let to = parseAddress(lexer, 'to')
    to ? email.to = to : lexer.error('missing To:')
    let replyTo = parseAddress(lexer, 'reply-to')
    replyTo ? email.replyTo = replyTo : lexer.error('missing Reply-To:')
    let text = ''
    let line = lexer.match.entireline()
    while (line) {
      // if it is the last line - no \n at the end just break
      if (!line) break
      // if the next lines represent a new email break and start over
      if (lexer.exec(EMAIL_HEADER_RE)) break
      text += line
      // read next line
      line = lexer.match.entireline()
      if (!line && !lexer.exec(/\n/)) {
        // no \n anymore, add the line, consume all and break
        text += lexer.consumeAll()
        break
      }
    }
    email.text = text
    emails.push(email)
  }
  return emails
}
