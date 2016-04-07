# wp-scaffold-project [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Creates a new VVV site, installs WordPress and related dev tools, scaffolds a new plugin, and creates a new theme using a custom starter theme.

## Installation

```sh
cd /path/to/my-new-project-folder

git clone https://wesm87@bitbucket.org/wesm87/wp-scaffold-project.git wp-scaffold-project

cd wp-scaffold-project

npm install
```

## Usage

For a full list of available options, check the `project.yml` file included with this package.

If you create a new `project.yml` file in your project directory, that file will be used instead.

```js
cd /path/to/my-new-project-folder

node wp-scaffold-project --project.title="My New Project" --project.url="my.new-project.dev"
```
## License

ISC © [Wes Moberly](https://github.com/wesm87)


[npm-image]: https://badge.fury.io/js/wp-scaffold-project.svg
[npm-url]: https://npmjs.org/package/wp-scaffold-project
[travis-image]: https://travis-ci.org/wesm87/wp-scaffold-project.svg?branch=master
[travis-url]: https://travis-ci.org/wesm87/wp-scaffold-project
[daviddm-image]: https://david-dm.org/wesm87/wp-scaffold-project.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/wesm87/wp-scaffold-project
[coveralls-image]: https://coveralls.io/repos/wesm87/wp-scaffold-project/badge.svg
[coveralls-url]: https://coveralls.io/r/wesm87/wp-scaffold-project
