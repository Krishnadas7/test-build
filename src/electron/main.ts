import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { preloadPath } from './pathResolver.js';
import { exec } from 'child_process';
import os from 'os';
import fs from 'fs'
function generateSVGFromCoordinates(coordinates: any[]) {
    const svgElements = coordinates.map((shape) => {
        const { type, left, top, width, height, angle } = shape;

        switch (type) {
            case 'rect':
                return `<rect x="${left}" y="${top}" width="${width}" height="${height}" transform="rotate(${angle}, ${left + width / 2}, ${top + height / 2})" stroke="black" fill="none"/>`;

            case 'circle':
                const radius = width / 2; // assuming width = height
                return `<circle cx="${left + radius}" cy="${top + radius}" r="${radius}" transform="rotate(${angle}, ${left + radius}, ${top + radius})" stroke="black" fill="none"/>`;

            case 'line':
                // Assuming line drawn from center
                const x1 = left;
                const y1 = top;
                const x2 = left + width;
                const y2 = top + height;
                return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black"/>`;

            default:
                return '';
        }
    });

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">
        ${svgElements.join('\n')}
    </svg>`;
}

app.on('ready', () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: preloadPath(),
        },
    });

    if (isDev()) win.webContents.openDevTools();

    // Fetch available printers
    ipcMain.handle('get-printers', () => {
        let printers;
        try {
            printers = win.webContents.getPrintersAsync();
        } catch (error) {
            console.error('Error', error);
            printers = [{ name: 'no printers' }]; // In case of error, return a default value
        }
        return printers;
    });

    ipcMain.handle('print-canvas', async (event, canvasDataUrl, printerName) => {
        try {
            const win = new BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                },
            });
            // Load the file into the BrowserWindow
            await win.loadURL(`${canvasDataUrl}`);
            win.webContents.print(
                {
                    silent: false,
                },
                (success, failureReason) => {
                    if (success) {
                        console.log('Printing successful');
                    } else {
                        console.error('Printing failed:', failureReason);
                    }
                    win.destroy();
                }
            );
        } catch (error) {
            console.error('Error printing canvas:', error);
        }
    });

    ipcMain.handle('print-file', async (event, filePath) => {
        try {
            // Load the file into the BrowserWindow
            await win.loadFile(filePath);

            // Print the loaded file
            const options = {
                silent: true,
            };

            const result: any = await win.webContents.print(options);

            if (!result.success) {
                console.error('Failed to create print preview:', result.errorType);
                return;
            }
        } catch (error) {
            console.error('Error printing file:', error);
        } finally {
            win.close();
        }
    });
    
    ipcMain.handle('run-inkcut', async (event, coordinates) => {
        try {
            const filePath = path.join(os.tmpdir(), 'cut-shape.svg');
    
            const svgContent = generateSVGFromCoordinates(coordinates);
            fs.writeFileSync(filePath, svgContent, 'utf-8');
    
            // ✅ Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error('❌ SVG file not created!');
                throw new Error('SVG file was not created.');
            } else {
                console.log('✅ SVG file created at:', filePath);
            }
    
            return new Promise((resolve, reject) => {
                exec(`inkcut "${filePath}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Inkcut error:', stderr);
                        reject(stderr);
                    } else {
                        console.log('✅ Inkcut opened with file.');
                        resolve(stdout);
                    }
                });
            });
        } catch (err) {
            console.error('runInkcut failed:', err);
            throw err;
        }
    });

    if (isDev()) win.loadURL('http://localhost:7091/');
    else win.loadFile(path.join(app.getAppPath() + '/react-dist/index.html'));
});
