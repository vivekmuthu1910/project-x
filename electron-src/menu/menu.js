"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var ProjectXMenu = /** @class */ (function () {
    function ProjectXMenu() {
        this.menu = new electron_1.Menu();
    }
    ProjectXMenu.prototype.setMenu = function () {
        this.menu.append(new electron_1.MenuItem({
            label: 'Settings',
            submenu: [
                {
                    label: 'Videos Folder',
                },
            ],
        }));
        electron_1.Menu.setApplicationMenu(this.menu);
    };
    return ProjectXMenu;
}());
exports.ProjectXMenu = ProjectXMenu;
//# sourceMappingURL=menu.js.map