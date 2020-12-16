# switch-to-11ty

Automatically migrate from [Jekyll](https://jekyllrb.com) to [11ty](https://www.11ty.dev)

> Eleventy was created to be a JavaScript alternative to Jekyll.

## Overview

Inspired by Paul Lloyd's excellent tutorial, "[Turn Jekyll up to Eleventy](https://24ways.org/2018/turn-jekyll-up-to-eleventy)."

### Limitations

To keep things simple, we're assuming you are:

* Using the default Markdown config
* Using the default Liquid templates
* Using SASS
* Not using a Jekyll theme (or will migrate it by hand yourself)
* Not using Jekyll plugins (or will migrate them by hand yourself)
* All your static site assets are in `assets`

### What it does

1. Installs 11ty (of course)
2. Migrates site configs to `_data/site.json`
3. Creates a starter config file `.eleventy.js`
4. Configures ignore files `.eleventyignore`, and `.gitignore`
5. Rewrite all include tags from Jekyll-style to Shopify-style
6. Moves `_layouts/*` to `_includes/layouts`, and adds aliases in `.eleventy.js`
7. Deletes the Jekyll config files, cache directories, and components

## Installation

```
$ npm install -g switch-to-11ty
```

## Usage

```
switch-to-11ty <dir>

Convert a Jekyll project to 11ty

Positionals:
  dir                                                                   [string]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Roadmap

- [x] Rewrite all include tags from Jekyll-style to Shopify-style
- [ ] Sanity check: fail if not in git source control, unless a force argument is passed
- [ ] Respect the Jekyll `data_dir`, `layout_dir`, and `includes_dir` settings
- [ ] Set up a compatible SASS build pipeline
- [ ] Re-implement the Jekyll Liquid filters in Javascript
- [ ] Auto-detect asset directories other than `assets`

## License

MIT license
