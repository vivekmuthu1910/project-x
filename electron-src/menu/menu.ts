import { Menu, MenuItem, BrowserWindow } from 'electron';

export class ProjectXMenu {
  menu: Menu = new Menu();

  constructor(private win: BrowserWindow) {}

  setMenu() {
    this.menu.append(
      new MenuItem({
        label: 'Settings',
        submenu: [
          {
            label: 'Videos Folder',
          },
        ],
      })
    );
    Menu.setApplicationMenu(this.menu);
  }
}
