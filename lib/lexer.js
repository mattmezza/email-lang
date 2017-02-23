const QUOTED_RE = /^"/
const OPEN_RE = /^<\s*/
const CLOSE_RE = /^>/
const WORD_RE = /^([-|+]?\w+)/
const NAME_RE = /^[A-Za-z0-9'-_][^<]+/
const EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const WHITESPACE_RE = /^[^\S\n\r]*/ // but not new lines
const ANYSPACE_RE = /^\s*/ // any whitespace
const NON_WHITESPACE_RE = /^\S+/ // any non whitespace
const NEWLINE_RE = /[\n\r]+/ // the next NL
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

  function matcher (re) {
    var m = re.exec(lexer.source)
    // console.log('>', arguments.callee.caller.name, "'" + m + "'", lexer.source)
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
  pm.whitespace = () => matcher(WHITESPACE_RE)
  pm.anyspace = () => matcher(ANYSPACE_RE)
  pm.newline = () => matcher(NEWLINE_RE)
  pm.open = () => matcher(OPEN_RE)
  pm.close = () => matcher(CLOSE_RE)
  pm.from = () => matcher(FROM_RE)
  pm.to = () => matcher(TO_RE)
  pm.name = () => matcher(NAME_RE)
  pm.replyTo = () => matcher(REPLY_TO_RE)
  pm.entireline = () => matcher(ENTIRELINE_RE)
  pm.string = () => {
    var quote = matcher(QUOTED_RE)
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
  pm.email = () => {
    var open = matcher(OPEN_RE)
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
    var key = matcher(SUBJECT_RE)
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
    var key = matcher(DATE_RE)
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
  pm.nonwhitespace = () => matcher(NON_WHITESPACE_RE)
  pm.word = () => {
    var m = matcher(WORD_RE)
    return m && m[0]
  }

  return lexer
}
