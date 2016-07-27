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

[Git](https://git-scm.com/)  
[Node.js](https://nodejs.org)  
[Composer](https://getcomposer.org/)  
[Bower](http://bower.io/)

We also strongly recommend installing:

[Vagrant](https://www.vagrantup.com)  
[VVV](https://github.com/Varying-Vagrant-Vagrants/VVV)

WP Project Manager uses Vagrant and VVV to create and configure a development
environment automatically when you create a new project. If you'd prefer to
use your own server environment you can use WP Project Manager without Vagrant
or VVV, but you'll need to configure the server and install all dependencies
prior to creating your new project. More info on this can be found in the
"Usage" section.


### Mac OS X Users

We recommend using [Homebrew][brew] and [Cask](https://caskroom.github.io/)
to install and manage dependencies:

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

We recommend installing [Git for Windows](https://git-for-windows.github.io/).
It will make your life much easier.

### GUI Applications

#### Git

[SourceTree](https://www.sourcetreeapp.com/) (Mac, Windows)  
[GitHub Desktop](https://desktop.github.com/) (Mac, Windows)  
[GitKraken](https://www.gitkraken.com/) (Mac, Windows, Linux)

#### Vagrant

[Vagrant Manager](http://vagrantmanager.com/) (Mac, Windows)





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

WP Project Manager requires at least PHP 5.5; we do not support any version of
PHP that has reached "end of life" status. Since 5.5 is nearing "end of life",
it will only be supported for a short while, after which 5.6 will be the new
minimum required version. You can see which versions of PHP are still officially
supported [on this page](http://php.net/supported-versions.php).

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
  to generate these yourself, just [visit this URL](https://roots.io/salts.html)
  and copy the the block under "Yaml Format", then paste it into your
  `project.yml` in the `secret` section. For example:

  ```yml
  secret:
    auth_key: "rt$^QrOSkvKmUNO17db5CoQ2^H=,Fs#{YDD7rSVL!O%{FBXWRCl@@k)BbHuNH}O2"
    secure_auth_key: "m_LZ0HW2>fBcrB&+JS]Ol<@ld&vK*vQ*c=2N5mp`x_<9B2-{j8*8s0gYzpzj=*Hw"
    logged_in_key: "QB`Wcfp%iF<$qEkXfl;i,R76H_|;VpgOx$b5*_o?@iyw/W)K$h)j_{]).3x6G,>*"
    nonce_key: "3`+TRW&s<r{BwD}Df3+r]icoQUvP*Z)|{N,1A3g>c%fT/<Q#o_po|xYR3+.Hah,z"
    auth_salt: "qzgA5Q7H*;d8P9(N5R*PL-BQN^_J5,8c<&%C4]l_WL<6):e-3u*^g.+V[e30b:=x"
    secure_auth_salt: "yUw!e;6W:7_3EJEv@rGF)V7T5Y:&x@i=R8Rq2ZSk|M{q/0Vy^^2qekf0xC?zDBX9"
    logged_in_salt: "fBd[CBI:]DLr6yn85=9S4OWkTx6p]:WZg%T*2+]DUz]O]ZaHU:|,6l;EOGs!kn[H"
    nonce_salt: "n(K=-uWc.lY5i^Fgc+X*U@nZL-lF<imt8o+etZ1-<t{RN7m|Bu^HvuMszQaA{7_+"
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




[issues-url]:    https://github.com/wesm87/wp-project-manager/issues

[brew]:          http://brew.sh
[cask]:          https://caskroom.github.io
[npm-guide]:     http://www.johnpapa.net/how-to-use-npm-global-without-sudo-on-osx

[github-img]:    https://img.shields.io/github/release/wesm87/wp-project-manager.svg
[github-url]:    https://github.com/wesm87/wp-project-manager
[npm-img]:       https://img.shields.io/npm/v/@wesm87/wp-project-manager.svg
[npm-url]:       https://www.npmjs.com/package/@wesm87/wp-project-manager
[coveralls-img]: https://img.shields.io/coveralls/wesm87/wp-project-manager.svg
[coveralls-url]: https://coveralls.io/r/wesm87/wp-project-manager
[travis-img]:    https://img.shields.io/travis/wesm87/wp-project-manager.svg
[travis-url]:    https://travis-ci.org/wesm87/wp-project-manager
[appveyor-img]:  https://img.shields.io/appveyor/ci/wesm87/wp-project-manager.svg
[appveyor-url]:  https://ci.appveyor.com/project/wesm87/wp-project-manager
[david-img]:     https://img.shields.io/david/wesm87/wp-project-manager.svg
[david-url]:     https://david-dm.org/wesm87/wp-project-manager
