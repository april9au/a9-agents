#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function expandPath(filePath) {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

function fileContentEquals(file1, file2) {
  try {
    const content1 = fs.readFileSync(file1, 'utf8');
    const content2 = fs.readFileSync(file2, 'utf8');
    return content1 === content2;
  } catch (err) {
    return false;
  }
}

async function syncAgents() {
  console.log(`${colors.blue}=== Claude Agents Sync Tool ===${colors.reset}\n`);

  // Get config file path
  const configFile = process.argv[2] || 'agents-config.json';

  // Check if config file exists
  if (!fs.existsSync(configFile)) {
    log(colors.red, '✗', `Configuration file '${configFile}' not found`);
    console.log('Usage: node sync-agents.js [config-file]');
    console.log('Example: node sync-agents.js agents-config.json');
    process.exit(1);
  }

  // Parse configuration
  let config;
  try {
    const configContent = fs.readFileSync(configFile, 'utf8');
    config = JSON.parse(configContent);
  } catch (err) {
    log(colors.red, '✗', `Error parsing configuration file: ${err.message}`);
    process.exit(1);
  }

  // Extract configuration
  let sourceDir = config.source;
  let destDir = config.destination;
  const whitelist = config.whitelist || [];

  // Expand tilde in paths
  sourceDir = expandPath(sourceDir);
  destDir = expandPath(destDir);

  // Resolve relative paths
  if (!path.isAbsolute(sourceDir)) {
    sourceDir = path.resolve(path.dirname(configFile), sourceDir);
  }

  console.log(`${colors.blue}Configuration:${colors.reset}`);
  console.log(`  Source:      ${sourceDir}`);
  console.log(`  Destination: ${destDir}`);
  console.log(`  Agents:      ${whitelist.length} whitelisted\n`);

  // Counter for tracking
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  function syncFiles(label, srcDir, dstDir, files) {
    console.log(`${colors.blue}Syncing ${label}...${colors.reset}\n`);

    if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
      log(colors.red, '✗', `Source directory '${srcDir}' not found`);
      failCount += files.length;
      return;
    }

    if (!fs.existsSync(dstDir)) {
      log(colors.yellow, '○', `Creating destination directory: ${dstDir}`);
      try {
        fs.mkdirSync(dstDir, { recursive: true });
      } catch (err) {
        log(colors.red, '✗', `Failed to create destination directory: ${err.message}`);
        failCount += files.length;
        return;
      }
    }

    for (const file of files) {
      const sourceFile = path.join(srcDir, file);
      const destFile = path.join(dstDir, file);

      if (!fs.existsSync(sourceFile)) {
        log(colors.red, '✗', `${file} (source not found)`);
        failCount++;
        continue;
      }

      if (fs.existsSync(destFile) && fileContentEquals(sourceFile, destFile)) {
        log(colors.yellow, '○', `${file} (already up to date)`);
        skipCount++;
        continue;
      }

      try {
        fs.copyFileSync(sourceFile, destFile);
        log(colors.green, '✓', file);
        successCount++;
      } catch (err) {
        log(colors.red, '✗', `${file} (copy failed: ${err.message})`);
        failCount++;
      }
    }

    console.log('');
  }

  syncFiles('agents', sourceDir, destDir, whitelist);

  // Sync commands if configured
  if (config.commands) {
    const cmdSrcDir = expandPath(config.commands.source);
    const cmdDstDir = expandPath(config.commands.destination);
    const cmdWhitelist = config.commands.whitelist || [];

    const resolvedCmdSrc = path.isAbsolute(cmdSrcDir)
      ? cmdSrcDir
      : path.resolve(path.dirname(configFile), cmdSrcDir);

    console.log(`  Commands source:      ${resolvedCmdSrc}`);
    console.log(`  Commands destination: ${cmdDstDir}`);
    console.log(`  Commands:            ${cmdWhitelist.length} whitelisted\n`);

    syncFiles('commands', resolvedCmdSrc, cmdDstDir, cmdWhitelist);
  }

  // Summary
  console.log(`${colors.blue}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}Synced:${colors.reset}    ${successCount} file(s)`);
  console.log(`${colors.yellow}Skipped:${colors.reset}   ${skipCount} file(s) (up to date)`);
  if (failCount > 0) {
    console.log(`${colors.red}Failed:${colors.reset}    ${failCount} file(s)`);
    process.exit(1);
  }

  console.log(`\n${colors.green}All files synced successfully!${colors.reset}`);
  process.exit(0);
}

// Run the sync
syncAgents().catch(err => {
  console.error(`${colors.red}Unexpected error: ${err.message}${colors.reset}`);
  process.exit(1);
});
