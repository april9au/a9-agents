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

function copyDirRecursive(srcDir, dstDir) {
  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }
  for (const entry of fs.readdirSync(srcDir)) {
    const srcEntry = path.join(srcDir, entry);
    const dstEntry = path.join(dstDir, entry);
    if (fs.statSync(srcEntry).isDirectory()) {
      copyDirRecursive(srcEntry, dstEntry);
    } else {
      if (!fs.existsSync(dstEntry) || !fileContentEquals(srcEntry, dstEntry)) {
        fs.copyFileSync(srcEntry, dstEntry);
      }
    }
  }
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

  // Sync skills if configured (each skills/NAME/SKILL.md → destination/NAME.md)
  if (config.skills) {
    const skillsSrcDir = expandPath(config.skills.source);
    const skillsDstDir = expandPath(config.skills.destination);

    const resolvedSkillsSrc = path.isAbsolute(skillsSrcDir)
      ? skillsSrcDir
      : path.resolve(path.dirname(configFile), skillsSrcDir);

    console.log(`${colors.blue}Syncing skills...${colors.reset}\n`);
    console.log(`  Skills source:      ${resolvedSkillsSrc}`);
    console.log(`  Skills destination: ${skillsDstDir}\n`);

    if (!fs.existsSync(resolvedSkillsSrc) || !fs.statSync(resolvedSkillsSrc).isDirectory()) {
      log(colors.red, '✗', `Skills source directory '${resolvedSkillsSrc}' not found`);
    } else {
      if (!fs.existsSync(skillsDstDir)) {
        fs.mkdirSync(skillsDstDir, { recursive: true });
      }

      const skillDirs = fs.readdirSync(resolvedSkillsSrc).filter(entry => {
        return fs.statSync(path.join(resolvedSkillsSrc, entry)).isDirectory();
      });

      for (const skillName of skillDirs) {
        const srcSkillDir = path.join(resolvedSkillsSrc, skillName);
        const dstSkillDir = path.join(skillsDstDir, skillName);
        const skillMd = path.join(srcSkillDir, 'SKILL.md');

        if (!fs.existsSync(skillMd)) {
          log(colors.red, '✗', `${skillName} (SKILL.md not found)`);
          failCount++;
          continue;
        }

        try {
          copyDirRecursive(srcSkillDir, dstSkillDir);
          log(colors.green, '✓', skillName);
          successCount++;
        } catch (err) {
          log(colors.red, '✗', `${skillName} (copy failed: ${err.message})`);
          failCount++;
        }
      }

      console.log('');
    }
  }

  // Sync hooks if configured
  if (config.hooks) {
    const hooksSrcDir = expandPath(config.hooks.source);
    const hooksDstDir = expandPath(config.hooks.destination);

    const resolvedHooksSrc = path.isAbsolute(hooksSrcDir)
      ? hooksSrcDir
      : path.resolve(path.dirname(configFile), hooksSrcDir);

    console.log(`${colors.blue}Syncing hooks...${colors.reset}\n`);
    console.log(`  Hooks source:      ${resolvedHooksSrc}`);
    console.log(`  Hooks destination: ${hooksDstDir}\n`);

    if (!fs.existsSync(resolvedHooksSrc) || !fs.statSync(resolvedHooksSrc).isDirectory()) {
      log(colors.red, '✗', `Hooks source directory '${resolvedHooksSrc}' not found`);
    } else {
      if (!fs.existsSync(hooksDstDir)) {
        fs.mkdirSync(hooksDstDir, { recursive: true });
      }

      const hookFiles = fs.readdirSync(resolvedHooksSrc).filter(entry => {
        return fs.statSync(path.join(resolvedHooksSrc, entry)).isFile();
      });

      for (const hookFile of hookFiles) {
        const sourceFile = path.join(resolvedHooksSrc, hookFile);
        const destFile = path.join(hooksDstDir, hookFile);

        if (fs.existsSync(destFile) && fileContentEquals(sourceFile, destFile)) {
          log(colors.yellow, '○', `${hookFile} (already up to date)`);
          skipCount++;
          continue;
        }

        try {
          fs.copyFileSync(sourceFile, destFile);
          fs.chmodSync(destFile, '755');
          log(colors.green, '✓', hookFile);
          successCount++;
        } catch (err) {
          log(colors.red, '✗', `${hookFile} (copy failed: ${err.message})`);
          failCount++;
        }
      }

      console.log('');
    }
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
