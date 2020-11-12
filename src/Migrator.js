const fg = require('fast-glob');
const fs = require('fs');
const { Liquid } = require('liquidjs');
const get = require('lodash.get');
const omit = require('lodash.omit');
const path = require('path');
const pull = require('lodash.pull');
const YAML = require('yaml');

class Migrator {
  static loadConfig (dir) {
    const file = path.join(dir, '_config.yml');
    return YAML.parse(fs.readFileSync(file, { encoding: 'utf8' }));
  }

  constructor (jekyllConfig = {}) {
    this.liquid = new Liquid({
      root: path.join(__dirname, 'templates'),
      cache: false
    });

    this.jekyllConfig = (typeof jekyllConfig === 'string')
      ? this.constructor.loadConfig(jekyllConfig)
      : jekyllConfig;
  }

  createRequiredDirs (dir) {
    fs.mkdirSync(path.join(dir, '_data'), { recursive: true });
    fs.mkdirSync(path.join(dir, '_includes'), { recursive: true });
  }

  moveLayouts (dir) {
    // _layouts/* -> _includes/layouts
    if (fs.existsSync(path.join(dir, '_layouts'))) {
      fs.renameSync(path.join(dir, '_layouts'), path.join(dir, '_includes', 'layouts'));
    }
  }

  renderConfigFile (dir) {
    // render templates/.eleventy.js.liquid -> .eleventy.js
    const collections = Object.keys(get(this, 'jekyllConfig.collections', {}));
    const layoutFiles = fg.sync('*.html', { cwd: path.join(dir, '_layouts'), baseNameMatch: true })
      .map(name => path.parse(name))
      .map(parts => ({ ...parts, dir: parts.dir ? parts.dir + '/' : '' }));
    const config = { ...this.jekyllConfig, collections, layoutFiles };
    const contents = this.liquid.renderFileSync('eleventyconfig.liquid', config);
    const file = path.join(dir, '.eleventy.js');
    fs.writeFileSync(file, contents);
  }

  renderIgnoreFile (dir) {
    // Remove these from the list
    const jekyllExcludes = [
      '.sass-cache/',
      '.jekyll-cache/',
      'Gemfile',
      'Gemfile.lock',
      'gemfiles/',
      'vendor',
      'vendor/bundle/',
      'vendor/cache/',
      'vendor/gems/',
      'vendor/ruby/'
    ];

    // Add these to the list
    const eleventyExcludes = [
      'package.json',
      'package-lock.json',
      'node_modules'
    ];

    const contents = pull(
      get(this, 'jekyllConfig.exclude', []),
      jekyllExcludes
    ).concat(eleventyExcludes).join('\n');

    const file = path.join(dir, '.eleventyignore');
    fs.writeFileSync(file, contents);
  }

  renderGitIgnoreFile (dir) {
    const srcDir = path.join(__dirname, 'templates');
    fs.copyFileSync(path.join(srcDir, 'gitignore'), path.join(dir, '.gitignore'));
  }

  renderSiteConfigFile (dir) {
    // render jekyllConfig -> _data/site.json
    const site = omit(this.jekyllConfig, [
      'collections',
      'collections_dir',
      'data_dir',
      'defaults',
      'destination',
      'detach',
      'disable_disk_cache',
      'excerpt_separator',
      'exclude',
      'future',
      'force_polling',
      'highlighter',
      'host',
      'ignore_theme_config',
      'include',
      'includes_dir',
      'incremental',
      'keep_files',
      'kramdown',
      'layout_dir',
      'limit_posts',
      'liquid',
      'livereload',
      'livereload_ignore',
      'livereload_min_delay',
      'lsi',
      'markdown',
      'markdown_ext',
      'open_url',
      'plugins',
      'plugins_dir',
      'port',
      'profile',
      'quiet',
      'safe',
      'sass',
      'show_dir_listing',
      'show_drafts',
      'skip_initial_build',
      'source',
      'strict_front_matter',
      'theme',
      'unpublished',
      'verbose',
      'webrick',
      'whitelist'
    ]);
    const contents = JSON.stringify(site, null, 4);
    const file = path.join(dir, '_data', 'site.json');
    fs.writeFileSync(file, contents);
  }

  // @TODO scan all files for include tags and rewrite them to Shopify syntax
  convertIncludeTags (dir) {
    // convert {% include include.html value="key" %} -> {% include include.html, value: "key" %}
    // in each include, convert {{ include.value }} -> {{ value }}
  }

  cleanupJekyllFiles (dir) {
    for (const file of ['_config.yml', 'Gemfile', 'Gemfile.lock']) {
      try {
        fs.unlinkSync(path.join(dir, file), { force: true });
      } catch (e) {
        // ignore
      }
    }

    fs.rmdirSync(path.join(dir, '.jekyll-cache'), { recursive: true });
    fs.rmdirSync(path.join(dir, '.jekyll-metadata'), { recursive: true });
    fs.rmdirSync(path.join(dir, '.sass-cache'), { recursive: true });
    fs.rmdirSync(path.join(dir, '.bundle'), { recursive: true });
    fs.rmdirSync(path.join(dir, 'vendor'), { recursive: true });
    fs.rmdirSync(path.join(dir, 'gemfiles'), { recursive: true });
    fs.rmdirSync(path.join(dir, '_site'), { recursive: true });
  }
}

module.exports = Migrator;
