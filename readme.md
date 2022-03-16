![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-mixins-kit [![NPM version](https://img.shields.io/npm/v/moleculer-mixins-kit.svg)](https://www.npmjs.com/package/moleculer-mixins-kit)

This makes Moleculer coding easier by taking the hassle out of working with models, brokers and etc

## Installation

```bash
npm install moleculer-mixins-kit --save
```

or

```bash
yarn add moleculer-mixins-kit
```

## Usage/Examples

```javascript
const MixinsKit = require('moleculer-mixins-kit');

broker.createService({
  name: 'service-example',
  mixins: [MixinsKit],
});
```

## To-do

- [ ] Unit Testing
- [ ] Real Example
