import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printData: (data: Blob, printerName: string) =>
        ipcRenderer.invoke('print-canvas', data, printerName),
    runInkcut: (coordinates: any) => ipcRenderer.invoke('run-inkcut', coordinates),
});
