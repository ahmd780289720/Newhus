import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface StoredFile {
  id: string;
  operation_id: string;     // رقم العملية المرتبط بها الملف (مثل محضر، تحقيق، نزيل)
  file_path: string;        // مسار الملف داخل الجهاز
  mime_type: string;        // نوع الملف (pdf, jpg, png ...)
  createdAt: string;        // تاريخ إدراج الملف
  description?: string;     // ملاحظة أو وصف للملف
}

export class StorageRepository {

  /** إضافة ملف جديد */
  static async add(data: Omit<StoredFile, "id" | "createdAt">): Promise<StoredFile> {
    const db = await SQLiteService.getInstance();

    const record: StoredFile = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    await db.run(
      `
        INSERT INTO files (id, operation_id, file_path, mime_type)
        VALUES (?, ?, ?, ?)
      `,
      [record.id, record.operation_id, record.file_path, record.mime_type]
    );

    return record;
  }

  /** الحصول على جميع الملفات */
  static async getAll(): Promise<StoredFile[]> {
    const db = await SQLiteService.getInstance();
    const res = await db.query("SELECT * FROM files");

    return (res.values ?? []) as StoredFile[];
  }

  /** جلب الملفات المرتبطة بعملية معينة */
  static async getByOperation(operationId: string): Promise<StoredFile[]> {
    const db = await SQLiteService.getInstance();
    const res = await db.query(
      "SELECT * FROM files WHERE operation_id = ?",
      [operationId]
    );

    return (res.values ?? []) as StoredFile[];
  }

  /** تحديث وصف الملف */
  static async updateDescription(id: string, description: string): Promise<void> {
    const db = await SQLiteService.getInstance();
    await db.run(
      `UPDATE files SET description = ? WHERE id = ?`,
      [description, id]
    );
  }

  /** حذف ملف */
  static async delete(id: string): Promise<void> {
    const db = await SQLiteService.getInstance();
    await db.run(
      `DELETE FROM files WHERE id = ?`,
      [id]
    );
  }
}
