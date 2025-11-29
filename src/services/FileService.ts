import { Filesystem, Directory } from '@capacitor/filesystem';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  static async savePDF(base64Data: string) {
    const fileName = uuidv4() + '.pdf';

    await Filesystem.writeFile({
      path: `pdf/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
    });

    return fileName;
  }

  static async readPDF(fileName: string) {
    const result = await Filesystem.readFile({
      path: `pdf/${fileName}`,
      directory: Directory.Data,
    });

    return result.data;
  }

  static async deletePDF(fileName: string) {
    await Filesystem.deleteFile({
      path: `pdf/${fileName}`,
      directory: Directory.Data,
    });
  }
}
