import { SQLiteService } from '../database/SQLiteService';
import { FileService } from './FileService';
import { v4 as uuid } from 'uuid';

export class FileRepository {

  static async addPDF(operationId: string, base64PDF: string) {
    const fileName = await FileService.savePDF(base64PDF);
    const db = await SQLiteService.getInstance();

    const fileId = uuid();

    await db.run(
      "INSERT INTO files (id, operation_id, file_path, mime_type) VALUES (?, ?, ?, ?)",
      [fileId, operationId, fileName, "application/pdf"]
    );

    return { fileId, fileName };
  }

  static async getFilesForOperation(operationId: string) {
    const db = await SQLiteService.getInstance();
    const result = await db.query(
      "SELECT * FROM files WHERE operation_id = ?",
      [operationId]
    );
    return result.values;
  }
}
