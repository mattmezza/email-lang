const QUOTED_RE = /^"/
const OPEN_RE = /^<\s*/
const CLOSE_RE = /^>/
const WORD_RE = /^([-|+]?\w+)/
const NAME_RE = /^[A-Za-z0-9'-_][^<]+/
const EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/
const WHITESPACE_RE = /^[^\S\n\r]*/ // but not new lines
const ANYSPACE_RE = /^\s*/ // any whitespace
const NON_WHITESPACE_RE = /^\S+/ // any non whitespace
const NEWLINE_RE = /^[\n\r]+/ // the next NL
const FROM_RE = /^From:/
const SUBJECT_RE = /^Subject:/
const DATE_RE = /^Date:/
const TO_RE = /^To:/
const REPLY_TO_RE = /^Reply-To:/
const ENTIRELINE_RE = /^.*[\n\r]/

//
// Lexer() provides a simple API that can read and reduce a source stream.
// each method is either a helper or a matcher that represents a token.
//
export default (str, options) => {
  options = options || {}

  var lexer = {
    source: str.slice()
  }

  var lineno = 1
  var column = 1

  function updatePosition (str) {
    var lines = str.match(/\n/g)
    if (lines) lineno += lines.length
    var i = str.lastIndexOf('\n')
    column = ~i ? str.length - i : column + str.length
  }

  function matcher (re, name = undefined) {
    var m = re.exec(lexer.source)
    let len = 100
    len = (lexer.length() < len) ? lexer.length() : len
    let matchedString = null
    if (m !== null) {
      let mLen = len
      mLen = (m.length < mLen) ? m.length : mLen
      matchedString = m.slice(0, mLen)
      matchedString = JSON.stringify(matchedString)
    }
    // console.log(`> ${name}\t\t${matchedString} => ${JSON.stringify(lexer.source.slice(0, len))}`)
    // console.log(`${JSON.stringify(m)}`)
    if (m === null) return
    var str = m[0]
    updatePosition(str)
    lexer.source = lexer.source.slice(m.index + str.length)
    return m
  }

  lexer.data = () => lexer.source

  lexer.pos = () => {
    return {column, lineno}
  }

  lexer.length = () => lexer.source.length

  lexer.exec = (re) => re.exec(lexer.source)

  lexer.peek = (index, len) => lexer.source.slice(index || 0, len || 1)

  lexer.pop = (index, len) => {
    var s = lexer.source.slice(index || 0, len || 1)
    lexer.source = lexer.source.slice(len || 1)
    return s
  }

  lexer.consumeAll = () => {
    let all = lexer.source
    lexer.source = ''
    return all
  }

  lexer.error = (msg) => {
    var err = new SyntaxError([
      msg, ':',
      lineno, ':',
      column
    ].join(''))
    err.reason = msg
    err.line = lineno
    err.column = column
    throw err
  }

  var pm = lexer.match = {}
  pm.whitespace = () => matcher(WHITESPACE_RE, 'whitespace')
  pm.anyspace = () => matcher(ANYSPACE_RE, 'anyspace')
  pm.newline = () => matcher(NEWLINE_RE, 'newline')
  pm.open = () => matcher(OPEN_RE, 'open<')
  pm.close = () => matcher(CLOSE_RE, 'close>')
  pm.from = () => matcher(FROM_RE, 'From:')
  pm.to = () => matcher(TO_RE, 'To:')
  pm.name = () => matcher(NAME_RE, 'name')
  pm.replyTo = () => matcher(REPLY_TO_RE, 'Reply-To:')
  pm.entireline = () => matcher(ENTIRELINE_RE, 'entireline')
  pm.string = () => {
    var quote = matcher(QUOTED_RE, 'quoted')
    if (!quote) return
    var value = ''
    while (lexer.source[0] !== quote[0]) {
      if (lexer.length() === 0) {
        lexer.error('missing end of string')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }
  pm.unquotedEmail = () => matcher(EMAIL_RE, 'unquoted_email')
  pm.email = () => {
    var open = matcher(OPEN_RE, 'open<')
    if (!open) return
    var value = ''
    while (lexer.source[0] !== '>') {
      if (lexer.length() === 0) {
        lexer.error('missing end of email')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    if (!EMAIL_RE.exec(value)) {
      lexer.error('malformed email')
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }
  pm.subject = () => {
    var key = matcher(SUBJECT_RE, 'Subject:')
    if (!key) return
    var value = ''
    while (lexer.source[0] !== '\n') {
      if (lexer.length() === 0) {
        lexer.error('missing new line to end Subject:')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }
  pm.date = () => {
    var key = matcher(DATE_RE, 'Date:')
    if (!key) return
    var value = ''
    while (lexer.source[0] !== '\n') {
      if (lexer.length() === 0) {
        lexer.error('missing new line to end Date:')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }
  pm.nonwhitespace = () => matcher(NON_WHITESPACE_RE, 'non_whitespace')
  pm.word = () => {
    var m = matcher(WORD_RE, 'word')
    return m && m[0]
  }

  return lexer
}
