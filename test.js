const { assert, expect } = require('chai')
const parse = require('./index').default

describe('validating input', function () {
	it('document', function () {
		expect(() => {
			parse(0)
		}).to.throw()
	})

	it('options', function () {
		expect(() => {
			parse('', 0)
		}).to.throw()
	})
})

describe('strict enforcement', function () {
	it('multiple fields', function () {
		expect(() => {
			parse(`
Contact: https://example.org/contact
Preferred-Languages: sv
Preferred-Languages: en
			`, { strict: true})
		}).to.throw()

		expect(() => {
			parse(`
Contact: https://example.org/contact
Canonical: https://example.org/.well-known/security.txt
Canonical: https://example.org/.well-known/security.txt
			`, { strict: true})
		}).to.throw()

		expect(() => {
			parse(`
Contact: https://example.org/contact
Expires: Thu, 31 Dec 2020 18:37:07 -0800
Expires: Thu, 31 Dec 2020 18:37:07 -0800
			`, { strict: true})
		}).to.throw()

		expect(() => {
			parse(`
Contact: https://example.org/contact
Preferred-Languages: sv
Preferred-Languages: en
			`)
		}).to.not.throw()

		expect(() => {
			parse(`
Contact: https://example.org/contact
Canonical: https://example.org/.well-known/security.txt
Canonical: https://example.org/.well-known/security.txt
			`)
		}).to.not.throw()

		expect(() => {
			parse(`
Contact: https://example.org/contact
Expires: Thu, 31 Dec 2020 18:37:07 -0800
Expires: Thu, 31 Dec 2020 18:37:07 -0800
			`)
		}).to.not.throw()

	})

	it('required fields', function () {
		expect(() => {
			parse('', { strict: true })
		}).to.throw()

		expect(() => {
			parse('')
		}).to.not.throw()
	})
})


describe('type parsing', function () {
	it('parseUrls', function () {
		let doc = parse(`
Contact: https://example.org/contact
Contact: tel:+1-201-555-0123
		`, { parseUrls: true })
		assert(doc.contact[0] instanceof URL, 'Contact field must be an instance of URL')
		assert(!(doc.contact[1] instanceof URL), 'Contact (tel) field must not be an instance of URL')

		doc = parse('Contact: https://example.org/contact')
		assert(!(doc.contact[0] instanceof URL), 'Contact field must not be an instance of URL')

	})

	it('parseDates', function () {
		let doc = parse('Expires: Thu, 31 Dec 2020 18:37:07 -0800', { parseDates: true })
		assert(doc.expires instanceof Date, 'Expires field must be an instance of Date')
		assert.equal(doc.expires.getTime(), new Date('Thu, 31 Dec 2020 18:37:07 -0800').getTime(), 'Expires field was not correct')

		doc = parse('Expires: Thu, 31 Dec 2020 18:37:07 -0800')
		assert(!(doc.expires instanceof Date), 'Expires field must not be an instance of Date')

		expect(function () {
			doc = parse('Expires: invalid date', {
				parseDates: true,
				strict: true
			})
		}).to.throw()

	})
})


describe('parses correctly', function () {
	it('whole document', function () {
		let doc = parse(`
# comment
Contact: mailto:security@example.org
Contact: https://example.org/contact
Encryption: https://example.org/key.pgp
Encryption: openpgp4fpr:5f2de5521c63a801ab59ccb603d49de44b29100f
Acknowledgments: https://example.org/hall-of-fame1
Acknowledgments: https://example.org/hall-of-fame2
# comment again

Preferred-Languages: sv, en, es
Canonical: https://example.org/.well-known/security.txt
Policy: https://example.org/policy1
Policy: https://example.org/policy2
Hiring: https://example.org/jobs1
Hiring: https://example.org/jobs2
Expires: Thu, 31 Dec 2020 18:37:07 -0800
		`)

		assert.equal(doc.contact[0], 'mailto:security@example.org', 'Contact field (0) was not correct')
		assert.equal(doc.contact[1], 'https://example.org/contact', 'Contact field (1) was not correct')

		assert.equal(doc.encryption[0], 'https://example.org/key.pgp', 'Encryption field (0) was not correct')
		assert.equal(doc.encryption[1], 'openpgp4fpr:5f2de5521c63a801ab59ccb603d49de44b29100f', 'Encryption field (1) was not correct')
		
		assert.equal(doc.acknowledgments[0], 'https://example.org/hall-of-fame1', 'Acknowledgements field (0) was not correct')
		assert.equal(doc.acknowledgments[1], 'https://example.org/hall-of-fame2', 'Acknowledgements field (1) was not correct')

		assert(doc.preferredLanguages.has('sv'), 'Preferred-Languages did not contain sv')
		assert(doc.preferredLanguages.has('en'), 'Preferred-Languages did not contain en')
		assert(doc.preferredLanguages.has('es'), 'Preferred-Languages did not contain es')

		assert.equal(doc.policy[0], 'https://example.org/policy1', 'Policy field (0) was not correct')
		assert.equal(doc.policy[1], 'https://example.org/policy2', 'Policy field (1) was not correct')

		assert.equal(doc.hiring[0], 'https://example.org/jobs1', 'Hiring field (0) was not correct')
		assert.equal(doc.hiring[1], 'https://example.org/jobs2', 'Hiring field (1) was not correct')

		assert.equal(doc.expires, 'Thu, 31 Dec 2020 18:37:07 -0800', 'Expires field was not correct')
	})
})