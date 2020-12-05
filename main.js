const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

// Set env
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;

let mainWindow;
let aboutWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/icon.ico`,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile('./app/index.html');
};
const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    title: 'About ImageShrink',
    width: 300,
    height: 300,
    resizable: false,
    icon: `${__dirname}/assets/icons/icon.ico`,
  });

  aboutWindow.loadFile('./app/about.html');
};

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  {
    role: 'fileMenu',
  },
  {
    role: 'editMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: createAboutWindow,
      },
    ],
  },
];

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink');
  shrinkImage(options);
});

const shrinkImage = async ({ imgPath, quality, dest }) => {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([`${slash(imgPath)}`], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    log.info(files);
    shell.openPath(dest);
    mainWindow.webContents.send('image:done');
  } catch (err) {
    console.log(err);
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
