WP Project Manager
==================

<!--
ADD THESE LATER:

[![npm Version][npm-img]][npm-url]
[![Coverage][coveralls-img]][coveralls-url]
[![Windows Tests][appveyor-img]][appveyor-url]
-->

[![GitHub release][github-img]][github-url]
[![Build Status][travis-img]][travis-url]
[![dependencies Status][david-img]][david-url]
[![devDependencies Status][david-dev-img]][david-dev-url]

A Node CLI tool that simplifies the process of setting up a new WordPress
project and development environment.


## Dependencies

WP Project Manager depends on the following tools / programs. You'll need to
have all of these installed in order for everything to work properly:

- [Git][git]
- [Node.js][node]
- [Composer][composer]
- [Bower][bower]

We also strongly recommend installing:

- [Vagrant][vagrant]
- [VVV][vvv]

WP Project Manager uses Vagrant and VVV to create and configure a development
environment automatically when you create a new project. If you'd prefer to
use your own server environment you can use WP Project Manager without Vagrant
or VVV, but you'll need to configure the server and install all dependencies
prior to creating your new project. More info on this can be found in the
"Usage" section.


### Mac OS X Users

We recommend using [Homebrew][brew] and [Cask][cask] to install and manage
dependencies:

```sh
# Install Homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Update Git
brew install git

# Install Node and Composer
brew install node
brew install homebrew/php/composer

# Install Bower
npm i -g bower

# Install Vagrant
brew tap caskroom/cask
brew cask install vagrant
```

If you already installed Node using the standard installer, consider
[moving the global package location][npm-guide] to a user-writable directory.
The Node installer sets the global package location to a system directory,
which means you need to install global packages (like this one) using `sudo`.
And that's a Very Bad Thing™.

### Windows Users

We recommend installing [Git for Windows][git-for-win].
It will make your life much easier.

### GUI Applications

#### Git

- [SourceTree][sourcetree] (Mac, Windows)
- [GitHub Desktop][github-desktop] (Mac, Windows)
- [GitKraken][gitkraken] (Mac, Windows, Linux)

#### Vagrant

[Vagrant Manager][vagrant-manager] (Mac, Windows)





## Installation

Open up your preferred command line application and enter the following:

```sh
npm i -g https://github.com/wesm87/wp-project-manager.git
```

If you are installing on a server that is not aware of your GitHub credentials,
but can use ssh for GitHub, use the following command:

```sh
npm i -g git://git@github.com:wesm87/wp-project-manager.git
```


## Usage

You can configure settings for your new project one of two ways:

1. Create a `project.yml` file in your project folder or one of its parents.
2. Specify individual settings via command arguments.

You'll need to specify at least a project title using one of the above methods;
the rest will be filled in automatically. You can create a new `project.yml`
using the following command:

```sh
wppm config create
```

The command arguments use dot notation and match the structure of the
`project.yml` file. For example, if you wanted to set a custom theme name, you'd
use `--theme.name="My Theme Name"`.


### Creating a new project with VVV and Vagrant

If you're using VVV with stock settings, the following would be the simplest way
to get a new project up and running:

```sh
cd /path/to/vvv/

mkdir www/new-project-folder

cd www/new-project-folder

wppm project create --project.title="My New Project"

cd -

# If the Vagrant box is already running:
vagrant provision

# If the Vagrant box is *not* already running:
vagrant up --provision
```

After running the above commands, your dev URL would be `my-new-project.dev` and
the theme folder would be located at `htdocs/web/app/themes/my-new-project`.

### Creating a new project on your own server

WP Project Manager requires at least PHP 5.6; we do not support any version of
PHP that has reached "end of life" status. You can see which versions of PHP are
still officially supported [on this page][php-versions].

If you need to install the dependencies for WP Project Manager on your server,
you can use the following commands:

```sh
# Update (or install) Node.js
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs

# Install Gulp and Bower
npm install -g gulp bower

# Install PHP (you must be using Ubuntu 14.04 or later)
sudo apt-get install php5-fpm php5-cli php5-common php5-dev

# Install Composer
curl -sS "https://getcomposer.org/installer" | php
chmod +x "composer.phar"
mv "composer.phar" "/usr/local/bin/composer"
```

Once you've verified your server meets the minimum requirements and has all of
the listed dependencies installed, the next step would be to create a new
project folder on your server and create a `project.yml` file inside that
folder. Edit your `project.yml` file and set `vvv` to false, set `db.rootUser`
to your MySQL root user, and set `db.rootPass` to the password for your MySQL
root user. Set `project.title` and any other values you want to specify in your
project config, then create your new project:

```sh
mkdir /path/to/project/folder

cd /path/to/project/folder

wppm

bash ./scripts/wp-init.sh
```

### Special considerations

- If by chance you already have a program called `wppm` installed, we've included
  a `wp-project-manager` command as well (in fact, `wppm` is just an alias for
  `wp-project-manager`).

- If you plan on sharing a database between your production and development
  servers, you'll need to set `db.prefix` in your project config so it matches
  the prefix used in the production database. You can also use the the
  `--db.prefix` argument:

  ```sh
  wppm project create --db.prefix="myprefix_"
  ```

- When you create a new project, the various authentication keys and salts used
  by WordPress internally are automatically generated for you. If you'd prefer
  to generate these yourself, just [visit this URL][keys-and-salts] and copy the
  block under "Yaml Format", then paste it into your `project.yml` in the
  `secret` section. For example:

  ```yml
  secret:
    auth_key: "..."
    secure_auth_key: "..."
    logged_in_key: "..."
    nonce_key: "..."
    auth_salt: "..."
    secure_auth_salt: "..."
    logged_in_salt: "..."
    nonce_salt: "..."
  ```


## Project Structure

WP Project Manager uses Bedrock as its base for new projects, which has
a different structure than you may be used to. Here's a quick reference:

- Web root: `htdocs/web`
- WordPress core: `htdocs/web/wp`
- wp-content: `htdocs/web/app`
- wp-config: `htdocs/config/environments/development.php`
- Admin URL: `/wp/wp-admin`
- Login URL: `/wp/wp-login.php`

Note that if `WP_ENV` is set to `staging`, the config file would be
`staging.php`, and the same for `production`. This is a convenient way to
define environment-specific settings (such as enabling `WP_DEBUG` for
`development` but not `production`).




[issues-url]:      https://github.com/wesm87/wp-project-manager/issues

[git]:             https://git-scm.com
[git-for-win]:     https://git-for-windows.github.io
[sourcetree]:      https://www.sourcetreeapp.com
[github-desktop]:  https://desktop.github.com
[gitkraken]:       https://www.gitkraken.com
[node]:            https://nodejs.org
[composer]:        https://getcomposer.org
[bower]:           http://bower.io
[vagrant]:         https://www.vagrantup.com
[vagrant-manager]: http://vagrantmanager.com
[vvv]:             https://github.com/Varying-Vagrant-Vagrants/VVV
[brew]:            http://brew.sh
[cask]:            https://caskroom.github.io

[npm-guide]:       http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx
[php-versions]:    http://php.net/supported-versions.php
[keys-and-salts]:  https://roots.io/salts.html

[npm-img]:         https://img.shields.io/npm/v/wp-project-manager.svg?style=flat-square
[npm-url]:         https://www.npmjs.com/package/wp-project-manager

[github-img]:      https://img.shields.io/github/tag/wesm87/wp-project-manager.svg?style=flat-square
[github-url]:      https://github.com/wesm87/wp-project-manager

[travis-img]:      https://img.shields.io/travis/wesm87/wp-project-manager.svg?style=flat-square
[travis-url]:      https://travis-ci.org/wesm87/wp-project-manager

[david-img]:       https://img.shields.io/david/wesm87/wp-project-manager.svg?style=flat-square
[david-url]:       https://david-dm.org/wesm87/wp-project-manager

[david-dev-img]:   https://img.shields.io/david/dev/wesm87/wp-project-manager.svg?style=flat-square
[david-dev-url]:   https://david-dm.org/wesm87/wp-project-manager?type=dev

[coveralls-img]:   https://img.shields.io/coveralls/wesm87/wp-project-manager.svg?style=flat-square
[coveralls-url]:   https://coveralls.io/r/wesm87/wp-project-manager

[appveyor-img]:    https://img.shields.io/appveyor/ci/wesm87/wp-project-manager.svg?style=flat-square
[appveyor-url]:    https://ci.appveyor.com/project/wesm87/wp-project-manager
