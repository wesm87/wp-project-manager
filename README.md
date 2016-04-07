# wp-scaffold-project [![Coverage percentage][coveralls-image]][coveralls-url]

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

© [Decisionary Tech](http://decisionarytech.com/)


[coveralls-image]: https://coveralls.io/repos/wesm87/wp-scaffold-project/badge.svg
[coveralls-url]: https://coveralls.io/r/wesm87/wp-scaffold-project
