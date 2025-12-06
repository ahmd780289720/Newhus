import { SQLiteService } from "../database/SQLiteService";

export type User = {
  id: string;
  username: string;
  password: string;
  role: string; // admin / officer / investigator / info_dept / warden
  createdAt: string;
};

export class UsersRepository {
  private static COLLECTION_KEY = "sec_sys_users_list";

  /** حفظ جميع المستخدمين */
  static async saveUsers(list: User[]): Promise<void> {
    await SQLiteService.upsertCollection(this.COLLECTION_KEY, list);
  }

  /** جلب جميع المستخدمين */
  static async getUsers(): Promise<User[]> {
    return await SQLiteService.getCollection<User[]>(this.COLLECTION_KEY, []);
  }

  /** إضافة مستخدم جديد */
  static async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
  }

  /** تحديث بيانات مستخدم */
  static async updateUser(updated: User): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = updated;
      await this.saveUsers(users);
    }
  }

  /** حذف مستخدم */
  static async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    await this.saveUsers(filtered);
  }

  /** البحث عن مستخدم بالاسم */
  static async findByUsername(username: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.username === username) ?? null;
  }
}
