import tape from 'tape'
import fs from 'fs'
import parse from '../dist/parser'

tape('Testing 3 emails', (t) => {
  let emails = parse(fs.readFileSync('./tests/3.txt', 'utf-8'))
  fs.writeFileSync('./tests/emails.json', JSON.stringify(emails, null, 2), 'utf8')
  t.equal(emails.length, 3)
  t.end()
})
