# security.txt Node Parser
![](https://github.com/movitz-s/security-txt-node-parser/workflows/Node.js%20CI/badge.svg)
![](https://codecov.io/gh/movitz-s/security-txt-node-parser/branch/master/graph/badge.svg)
> parsing security.txt documents, zero dependencies, based on [draft-foudil-securitytxt-09](https://tools.ietf.org/html/draft-foudil-securitytxt-09)

## Installing
```sh
npm install security-txt-node-parser
```

## Example
```js
const parseSecurityTxt = require('security-txt-node-parser').default

const securityTxt = await fetch('https://securitytxt.org/.well-known/security.txt')
	.then(resp => resp.text())
	.then(text => parseSecurityTxt(text))

console.log(securityTxt.contact[0]) // https://hackerone.com/ed
```

### Options

These options are avaliable

```js
parseSecurityTxt(document, {
	strict: true,
	parseUrls: true,
	parseDates: true
})
```

#### strict
default: false  
if strict is true, an error will be thrown if the document is invalid

#### parseUrls
default: false  
if parseUrls is true, any urls will be wrapped in the URL object

#### parseDates
default: false
if parseDates is true, any dates will be wrapped in the Date object

## Licence
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
