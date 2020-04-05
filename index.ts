type SecurityTxtDocument = {
	contact: Array<string | URL>;
	encryption: Array<string | URL>;
	acknowledgments: Array<string | URL>;
	preferredLanguages: Set<string>;
	canonical?: string | URL;
	policy: Array<string | URL>;
	hiring: Array<string | URL>;
	expires?: string | Date;
	isSigned: Boolean;
	signature?: string;
}

type SecurityTxtOptions = {
	strict?: boolean;
	parseUrls?: boolean;
	parseDates?: boolean;
}

const defaultOptions: SecurityTxtOptions = {
	strict: false,
	parseUrls: false,
	parseDates: false
}

export default function (rawSecurityTxt: string, options: SecurityTxtOptions = defaultOptions): SecurityTxtDocument {

	if (typeof rawSecurityTxt != 'string') {
		throw new Error('rawSecurityTxt must be a string')
	}
	if (typeof options != 'object') {
		throw new Error('options must be an object')
	}

	const result: SecurityTxtDocument = {
		contact: [],
		encryption: [],
		acknowledgments: [],
		preferredLanguages: new Set(),
		policy: [],
		hiring: [],
		isSigned: false
	}

	function urlOrString(value: string): string | URL {
		try {
			if (options.parseUrls && value.startsWith('http')) {
				return new URL(value)
			}
		} catch (error) {
			// If the URL parsing fails, just return the raw string
		}
		return value
	}

	let lines = rawSecurityTxt.match(/[^\r\n]+/g) || []
	lines.forEach(line => {
		if (line.startsWith('#')) return

		const match = /^(?<key>.*): (?<value>.*)$/.exec(line)
		if (!match) return

		const key = match.groups.key.toLowerCase()
		const value = match.groups.value

		switch (key) {
			case 'acknowledgments':
			case 'encryption':
			case 'hiring':
			case 'policy':
			case 'contact':
				result[key].push(urlOrString(value))
				break

			case 'canonical':
				if (options.strict && result.canonical != undefined) {
					throw new Error('There can only be one Canonical field')
				}
				result.canonical = urlOrString(value)
				break

			case 'expires':
				let date = new Date(value)
				if (options.strict) {
					if (result.expires != undefined) {
						throw new Error('There can only be one Expired field')
					}
					if (options.parseDates && isNaN(date.getTime())) {
						throw new Error('Could not parse Expired field, invalid date')
					}
				}
				result.expires = options.parseDates && !isNaN(date.getTime()) ? date : value
				break

			case 'preferred-languages':
				if (options.strict && result.preferredLanguages != undefined) {
					throw new Error('There can only be one Preferred-Languages field')
				}
				value.split(',').forEach(lang => result.preferredLanguages.add(lang.trim()))
				break
		}
	})

	if (options.strict && result.contact.length == 0) {
		throw new Error('Contact field must be present')
	}

	return result
}
