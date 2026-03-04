const fs = require('fs');
const path = require('path');
const packager = require('electron-packager');

async function run() {
  const rootDir = process.cwd();
  const stageDir = path.join(rootDir, '.electron-stage');
  const releaseDir = path.join(rootDir, 'release');
  const sourcePackagePath = path.join(rootDir, 'package.json');
  const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));

  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });
  fs.cpSync(path.join(rootDir, 'dist'), path.join(stageDir, 'dist'), { recursive: true });
  fs.cpSync(path.join(rootDir, 'electron'), path.join(stageDir, 'electron'), { recursive: true });

  const stagedPackage = {
    name: sourcePackage.name,
    version: sourcePackage.version,
    main: 'electron/main.cjs',
    private: true
  };

  fs.writeFileSync(
    path.join(stageDir, 'package.json'),
    JSON.stringify(stagedPackage, null, 2)
  );

  const iconPath = path.join(rootDir, 'assets', 'icon.ico');
  const options = {
    dir: stageDir,
    out: releaseDir,
    overwrite: true,
    asar: true,
    platform: 'win32',
    arch: 'x64',
    prune: true,
    name: 'SmartKid Quiz Game'
  };

  if (fs.existsSync(iconPath)) {
    options.icon = iconPath;
  }

  await packager(options);

  fs.rmSync(stageDir, { recursive: true, force: true });
  console.log('Packaging complete. Output folder: release');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
