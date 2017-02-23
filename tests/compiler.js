import test from 'tape'
import translate from '../index'

test('Test MANUAL SHORT', (assert) => {
  let emails = translate(`From: "matteomerola.me" <mattmezza@gmail.com>
Subject: Hello from Ibiza
Date: February 21, 2017 at 7:02:47 AM GMT+1
To: Tiffany <tiffany.holsen@me.com>
Reply-To: Matteo <mattmezza@gmail.com>

We all know the numerous film adaptations of the novel!
`)
  assert.equal(emails.length, 1)
  let email = emails[0]
  assert.equal(email.from.name, 'matteomerola.me')
  assert.equal(email.from.email, 'mattmezza@gmail.com')
  assert.equal(email.subject, 'Hello from Ibiza')
  assert.equal(email.date, 'February 21, 2017 at 7:02:47 AM GMT+1')
  assert.equal(email.to.name, 'Tiffany')
  assert.equal(email.to.email, 'tiffany.holsen@me.com')
  assert.equal(email.replyTo.name, 'Matteo')
  assert.equal(email.replyTo.email, 'mattmezza@gmail.com')
  assert.equal(email.text, 'We all know the numerous film adaptations of the novel!\n')
  assert.end()
})

test('Test single email with multi line body text', (assert) => {
  let emails = translate(`From: "matteomerola.me" <mattmezza@gmail.com>
Subject: Hello from Ibiza
Date: February 21, 2017 at 7:02:47 AM GMT+1
To: Tiffany <tiffany.holsen@me.com>
Reply-To: Matteo <mattmezza@gmail.com>

We all know the numerous film adaptations of the novel, but how many of us have read it? The adventure classic tells the story of the young Gascon gentleman d'Artagnan and his three friends from the regiment of the King's Musketeers: Athos, Porthos, and Aramis. Apart from the gripping adventure and history, the book also a political undertone with examples of abuse and injustice of the old regime. Enjoy!

The three Musketeers by Alexandre Dumas

In those times panics were common, and few days passed without some city or other registering in its archives an event of this kind. There were nobles, who made war against each other; there was the king, who made war against the cardinal; there was Spain, which made war against the king. Then, in addition to these concealed or public, secret or open wars, there were robbers, mendicants, Huguenots, wolves, and scoundrels, who made war upon everybody. e citizens always took up arms readily against thieves, wolves or scoundrels, often against nobles or Huguenots, sometimes against the king, but never against cardinal or Spain. It resulted, then, from this habit that on the said first Monday of April, 1625, the citizens, on hearing the clamor, and seeing neither the red-and-yellow standard nor the livery of the Duc de Richelieu, rushed toward the hostel of the Jolly Miller. When arrived there, the cause of the hubbub was apparent to all. A young man--we can sketch his portrait at a dash. Imagine to yourself a Don Quixote of eighteen; a Don Quixote without his corselet, without his coat of mail, without his cuisses; a Don Quixote clothed in a woolen doublet, the blue colour of which had faded into a nameless shade between lees of wine and a heavenly azure; face long and brown; high cheek bones, a sign of sagacity; the maxillary muscles enormously developed, an infallible sign by which a Gascon may always be detected, even without his cap--and our young man wore a cap set off with a sort of feather; the eye open and intelligent; the nose hooked, but finely chiselled. Too big for a youth, too small for a grown man, an experienced eye might have taken him for a farmer's son upon a journey had it not been for the long sword which, dangling from a leather baldric, hit against the calves of its owner as he walked, and against the rough side of his steed when he was on horseback. For our young man had a steed which was the observed of all observers. It was a Bearn pony, from twelve to fourteen years old, yellow in his hide, without a hair in his tail, but not without windfalls on his legs, which, though going with his head lower than his knees, rendering a martingale quite unnecessary, contrived nevertheless to perform his eight leagues a day. Unfortunately, the qualities of this horse were so well concealed under his strange-coloured hide and his unaccountable gait, that at a time when everybody was a connoisseur in horseflesh, the appearance of the aforesaid pony at Meung--which place he had entered about a quarter of an hour before, by the gate of Beaugency--produced an unfavourable feeling, which extended to his rider.



Tweet

Share
Copyright © 2017 All rights reserved.
You are receiving this email because you opted in at our website.

Unsubscribe from this list`)
  assert.equal(emails.length, 1)
  let email = emails[0]
  assert.equal(email.from.name, 'matteomerola.me')
  assert.equal(email.from.email, 'mattmezza@gmail.com')
  assert.equal(email.subject, 'Hello from Ibiza')
  assert.equal(email.date, 'February 21, 2017 at 7:02:47 AM GMT+1')
  assert.equal(email.to.name, 'Tiffany')
  assert.equal(email.to.email, 'tiffany.holsen@me.com')
  assert.equal(email.replyTo.name, 'Matteo')
  assert.equal(email.replyTo.email, 'mattmezza@gmail.com')
  assert.true(email.text.toString().indexOf('Musketeers') !== -1)
  assert.end()
})

test('Testing 2 emails', (assert) => {
  let emails = translate(`From: "matteomerola.me" <mattmezza@gmail.com>
Subject: Hello from Ibiza
Date: February 21, 2017 at 7:02:47 AM GMT+1
To: Tiffany <tiffany.holsen@me.com>
Reply-To: Matteo <mattmezza@gmail.com>

We all know the numerous film adaptations of the novel, but how many of us have read it? The adventure classic tells the story of the young Gascon gentleman d'Artagnan and his three friends from the regiment of the King's Musketeers: Athos, Porthos, and Aramis. Apart from the gripping adventure and history, the book also a political undertone with examples of abuse and injustice of the old regime. Enjoy!
Ciao
In those times panics were common, and few days passed without some city or other registering in its archives an event of this kind. There were nobles, who made war against each other; there was the king, who made war against the cardinal; there was Spain, which made war against the king. Then, in addition to these concealed or public, secret or open wars, there were robbers, mendicants, Huguenots, wolves, and scoundrels, who made war upon everybody. e citizens always took up arms readily against thieves, wolves or scoundrels, often against nobles or Huguenots, sometimes against the king, but never against cardinal or Spain. It resulted, then, from this habit that on the said first Monday of April, 1625, the citizens, on hearing the clamor, and seeing neither the red-and-yellow standard nor the livery of the Duc de Richelieu, rushed toward the hostel of the Jolly Miller. When arrived there, the cause of the hubbub was apparent to all. A young man--we can sketch his portrait at a dash. Imagine to yourself a Don Quixote of eighteen; a Don Quixote without his corselet, without his coat of mail, without his cuisses; a Don Quixote clothed in a woolen doublet, the blue colour of which had faded into a nameless shade between lees of wine and a heavenly azure; face long and brown; high cheek bones, a sign of sagacity; the maxillary muscles enormously developed, an infallible sign by which a Gascon may always be detected, even without his cap--and our young man wore a cap set off with a sort of feather; the eye open and intelligent; the nose hooked, but finely chiselled. Too big for a youth, too small for a grown man, an experienced eye might have taken him for a farmer's son upon a journey had it not been for the long sword which, dangling from a leather baldric, hit against the calves of its owner as he walked, and against the rough side of his steed when he was on horseback. For our young man had a steed which was the observed of all observers. It was a Bearn pony, from twelve to fourteen years old, yellow in his hide, without a hair in his tail, but not without windfalls on his legs, which, though going with his head lower than his knees, rendering a martingale quite unnecessary, contrived nevertheless to perform his eight leagues a day. Unfortunately, the qualities of this horse were so well concealed under his strange-coloured hide and his unaccountable gait, that at a time when everybody was a connoisseur in horseflesh, the appearance of the aforesaid pony at Meung--which place he had entered about a quarter of an hour before, by the gate of Beaugency--produced an unfavourable feeling, which extended to his rider.

From: "matteomerola.me" <mattmezza@gmail.com>
Subject: Hello from Ibiza
Date: February 21, 2017 at 7:02:47 AM GMT+1
To: Tiffany <tiffany.holsen@me.com>
Reply-To: Matteo <mattmezza@gmail.com>

Start a day with the par excellence imagist poem, in which Pound describes a moment on the underground in Paris in two lines, and fourteen words only. Inspired by haiku, the poet draws together the urban reality of the city and the world of nature, the momentary and the eternal. Enjoy!
In a station of a metro
The apparition of these faces in the crowd; Petals on a we, black bough.`)
  assert.equal(emails.length, 2)
  let email = emails[0]
  assert.equal(email.from.name, 'matteomerola.me')
  assert.equal(email.from.email, 'mattmezza@gmail.com')
  assert.equal(email.subject, 'Hello from Ibiza')
  assert.equal(email.date, 'February 21, 2017 at 7:02:47 AM GMT+1')
  assert.equal(email.to.name, 'Tiffany')
  assert.equal(email.to.email, 'tiffany.holsen@me.com')
  assert.equal(email.replyTo.name, 'Matteo')
  assert.equal(email.replyTo.email, 'mattmezza@gmail.com')
  assert.true(email.text.toString().indexOf('adaptations') !== -1)
  email = emails[1]
  assert.equal(email.from.name, 'matteomerola.me')
  assert.equal(email.from.email, 'mattmezza@gmail.com')
  assert.equal(email.subject, 'Hello from Ibiza')
  assert.equal(email.date, 'February 21, 2017 at 7:02:47 AM GMT+1')
  assert.equal(email.to.name, 'Tiffany')
  assert.equal(email.to.email, 'tiffany.holsen@me.com')
  assert.equal(email.replyTo.name, 'Matteo')
  assert.equal(email.replyTo.email, 'mattmezza@gmail.com')
  assert.true(email.text.toString().indexOf('Pound') !== -1)
  assert.end()
})
