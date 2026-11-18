// Пошук локального Chrome / Edge для puppeteer-core.
const fs = require('fs');
const path = require('path');

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const pf = process.env['PROGRAMFILES'] || 'C:\\Program Files';
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const local = process.env['LOCALAPPDATA'] || '';
  const candidates = [
    path.join(pf, 'Google/Chrome/Application/chrome.exe'),
    path.join(pf86, 'Google/Chrome/Application/chrome.exe'),
    path.join(local, 'Google/Chrome/Application/chrome.exe'),
    path.join(pf86, 'Microsoft/Edge/Application/msedge.exe'),
    path.join(pf, 'Microsoft/Edge/Application/msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) throw new Error('Не знайдено Chrome/Edge. Вкажіть шлях у змінній CHROME_PATH.');
  return found;
}

async function launch() {
  const puppeteer = require('puppeteer-core');
  return puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows'
    ]
  });
}

function fileUrl(p) {
  return 'file:///' + path.resolve(p).replace(/\\/g, '/');
}

module.exports = { launch, fileUrl, findBrowser };
