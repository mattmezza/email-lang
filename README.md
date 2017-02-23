# SYNOPSIS
A language to model emails.

# BUILD

[![Travis](https://img.shields.io/travis/mattmezza/email-lang.svg)]()

```bash
npm install --save-dev email-lang
```

# USAGE

### email.txt
Write an email file that follows the language specification

```
From: "matteomerola.me" <mattmezza@gmail.com>
Subject: Comment about the novel
Date: February 21, 2017 at 7:02:47 AM GMT+1
To: Tiffany <tiffany.holsen@me.com>
Reply-To: Matteo <mattmezza@gmail.com>

We all know the numerous film adaptations of the novel!

Cheers,
  Matt.
```

### index.js
Create an instance of the model then pass data into it one or more times.

```js
const fs = require('fs')
const compile = require('email-lang')

let emails = compile(fs.readFileSync('email.txt', 'utf8'))

console.log(emails[0].subject) // prints "Comment about the novel"
```

### output

The result will be an array of emails structured as follows

```js
[
  {
    from: {
      name: 'Matteo',
      email: 'mattmezza@gmail.com'
    },
    subject: 'The subject of the email',
    to: {
      name: 'Recipient',
      email: 'recipient@email.it'
    },
    replyTo: {
      name: 'Matteo',
      email: 'mattmezza@gmail.com'
    },
    text: 'The body content of the email message'
  },
  {
    ...// another email if any
  }
]
```

# LICENSE

http://matteomerola.me

[![License](https://img.shields.io/npm/l/array.from.svg)](/LICENSE)
