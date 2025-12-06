import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface ReportRecord {
  id: string;
  report_type: string;       // نوع التقرير (زيارات، نزلاء، حركة...)
  filters: any;              // خيارات الفلترة المختارة
  createdAt: string;         // تاريخ إنشاء التقرير
  note?: string;             // ملاحظات — اختياري
}

export class ReportsRepository {

  /** إضافة تقرير محفوظ */
  static async add(report: Omit<ReportRecord, "id" | "createdAt">): Promise<ReportRecord> {
    const db = await SQLiteService.getInstance();

    const record: ReportRecord = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...report,
    };

    await db.run(
      `
      INSERT INTO collections (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
      [
        `report_${record.id}`,
        JSON.stringify(record),
      ]
    );

    return record;
  }

  /** جلب كل التقارير المحفوظة */
  static async getAll(): Promise<ReportRecord[]> {
    const db = await SQLiteService.getInstance();
    const res = await db.query(
      "SELECT key, value FROM collections WHERE key LIKE 'report_%'"
    );

    if (!res.values) return [];

    return res.values.map((row: any) => JSON.parse(row.value)) as ReportRecord[];
  }

  /** حذف تقرير */
  static async delete(id: string): Promise<void> {
    const db = await SQLiteService.getInstance();
    await db.run("DELETE FROM collections WHERE key = ?", [`report_${id}`]);
  }

  /** جلب تقرير واحد */
  static async get(id: string): Promise<ReportRecord | null> {
    const db = await SQLiteService.getInstance();
    const res = await db.query(
      "SELECT value FROM collections WHERE key = ?",
      [`report_${id}`]
    );

    if (!res.values || res.values.length === 0) return null;

    return JSON.parse(res.values[0].value) as ReportRecord;
  }
}
