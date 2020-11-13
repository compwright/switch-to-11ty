const childProcess = require('child_process');
const path = require('path');
const Migrator = require('./Migrator');

module.exports = function (argv) {
  // Install 11ty
  const execConfig = { cwd: argv.dir, stdio: [0, 1, 2] };
  try {
    require(path.join(argv.dir, 'package.json'));
  } catch (e) {
    childProcess.execSync('npm init -y', execConfig);
  } finally {
    childProcess.execSync('npm install --save-dev @11ty/eleventy', execConfig); // jekyll-liquid-filters
  }

  // Migrate Jekyll files to 11ty
  const migrator = new Migrator(argv.dir);
  migrator.createRequiredDirs(argv.dir);
  migrator.renderSiteConfigFile(argv.dir);
  migrator.renderConfigFile(argv.dir);
  migrator.renderIgnoreFile(argv.dir);
  migrator.convertIncludeTags(argv.dir);
  migrator.moveLayouts(argv.dir);
  migrator.cleanupJekyllFiles(argv.dir);
  migrator.renderGitIgnoreFile(argv.dir);
};
