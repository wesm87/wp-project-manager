WP Project Manager
==================

[![GitHub release][github-img]][github-url] [![npm Version][npm-img]][npm-url]

<!--
ADD THESE LATER:

(David-DM needs to fix this: https://github.com/alanshaw/david-www/issues/176)

[![Dependency Status][david-img]][david-url]
[![Coverage][coveralls-img]][coveralls-url]
[![Build Status][travis-img]][travis-url]
[![Windows Tests][appveyor-img]][appveyor-url]
-->

A Node CLI tool that simplifies the process of setting up a new WordPress
project and development environment.


## Dependencies

WP Project Manager depends on the following tools / programs. You'll need to
have all of these installed in order for everything to work properly:

[Node.js](https://nodejs.org)  
[Vagrant](https://www.vagrantup.com)  
[VVV](https://github.com/Varying-Vagrant-Vagrants/VVV)

If you're using Mac OS X, Node and VVV are available through [Homebrew][brew],
and Vagrant is available through [Homebrew Cask][cask]. I would recommend
installing at least Node using Homebrew, since the standard installer sets the
global package location to a system directory, which means you'd need to install
this package as a root user or use `sudo`, and that's a Very Bad Thing™.

If you already installed Node using the standard installer, consider
[moving the global package directory][npm-guide] to a user-writable location.


## Installation

Open up your preferred command line application and enter the following:

```sh
npm i -g https://github.com/Decisionary/wp-project-manager.git
```

If you need access to the repo contact [JC][jc-email].


## Usage

You can configure settings for your new project one of three ways:

1. Create a `project.yml` file in your project folder or one of its parents.
2. Add a new `wpProjectManager` key in your `package.json`.
3. Specify individual settings via command arguments.

You'll need to specify at least a project title using one of the above methods;
the rest will be filled in automatically. Check the `project.yml` or
`package.json` included in this repository to see all of the available options.
The command arguments use dot notation and match the structure of the config
files. For example, if you wanted to set a custom theme name, you'd use
`--theme.name=`.

If you're using VVV with stock settings, the following would be the simplest way
to get a new project up and running:

```sh
cd /path/to/vvv/

mkdir www/new-project-folder

cd www/new-project-folder

wppm --project.title="My New Project"

cd -

# If the Vagrant box is already running:
vagrant provision

# If the Vagrant box is *not* already running:
vagrant up --provision
```

If you ran the above code, your dev URL would be `my-new-project.dev` and the
theme folder would be located at `htdocs/web/app/themes/my-new-project`.

Note: if you need to import a production database into your development
environment, you'll need to set the database prefix in your project config,
or use the `--db.prefix` argument:

```sh
wppm --project.title="My New Project" --db.prefix="myprefix_"
```

Note #2: `wppm` is just an alias for `wp-project-manager`, so if by chance
you already have a program called `wppm` installed you can use the long
form version instead.


## License

© [Decisionary Tech](http://decisionarytech.com/)


[jc-email]:      mailto:jc@decisionarytech.com

[brew]:          http://brew.sh
[cask]:          https://caskroom.github.io
[npm-guide]:     http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx

[github-img]:    https://img.shields.io/github/release/Decisionary/wp-project-manager.svg
[github-url]:    https://github.com/Decisionary/wp-project-manager
[npm-img]:       https://img.shields.io/npm/v/@decisionary/wp-project-manager.svg
[npm-url]:       https://www.npmjs.com/package/@decisionary/wp-project-manager
[coveralls-img]: https://img.shields.io/coveralls/Decisionary/wp-project-manager.svg
[coveralls-url]: https://coveralls.io/r/Decisionary/wp-project-manager
[travis-img]:    https://img.shields.io/travis/Decisionary/wp-project-manager.svg
[travis-url]:    https://travis-ci.org/Decisionary/wp-project-manager
[appveyor-img]:  https://img.shields.io/appveyor/ci/Decisionary/wp-project-manager.svg
[appveyor-url]:  https://ci.appveyor.com/project/Decisionary/wp-project-manager
[david-img]:     https://img.shields.io/david/Decisionary/wp-project-manager.svg
[david-url]:     https://david-dm.org/Decisionary/wp-project-manager
