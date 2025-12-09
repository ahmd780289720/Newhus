import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface Belonging {
  id: string;
  inmate_id: string;
  type: string;       // PHONE | MONEY | WEAPON | DOCUMENT | OTHER
  data: any;          // JSON
  created_at: string;
}

export class BelongingsRepository {

  static async add(inmate_id: string, type: string, data: any): Promise<Belonging> {
    const db = await SQLiteService.getInstance();
    const item: Belonging = {
      id: uuidv4(),
      inmate_id,
      type,
      data,
      created_at: new Date().toISOString(),
    };

    await db.run(
      `INSERT INTO belongings (id, inmate_id, type, data, created_at) VALUES (?, ?, ?, ?, ?)`,
      [item.id, item.inmate_id, item.type, JSON.stringify(item.data), item.created_at]
    );

    return item;
  }

  static async update(id: string, data: any): Promise<void> {
    const db = await SQLiteService.getInstance();
    await db.run(
      `UPDATE belongings SET data = ? WHERE id = ?`,
      [JSON.stringify(data), id]
    );
  }

  static async delete(id: string): Promise<void> {
    const db = await SQLiteService.getInstance();
    await db.run(`DELETE FROM belongings WHERE id = ?`, [id]);
  }

  static async getByInmate(inmate_id: string): Promise<Belonging[]> {
    const db = await SQLiteService.getInstance();
    const res = await db.query(
      `SELECT * FROM belongings WHERE inmate_id = ?`,
      [inmate_id]
    );

    if (!res.values) return [];
    return res.values.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data),
    })) as Belonging[];
  }
}
