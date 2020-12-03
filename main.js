const { app, BrowserWindow, Menu, globalShortcut } = require('electron');

// Set env
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;

let mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/icon.ico`,
  });

  //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile('./app/index.html');
};

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register('Ctrl+R', () => mainWindow.reload());
  globalShortcut.register('Ctrl+Shift+I', () => mainWindow.toggleDevTools());

  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  {
    label: 'Fájl',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Ctrl+W',
        click: () => app.quit(),
      },
    ],
  },
];

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
