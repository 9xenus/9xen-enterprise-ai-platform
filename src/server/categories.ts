import { db } from '../lib/db';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service' | 'both';
  parentId?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export class DynamicCategories {
  async getCategories(type?: string): Promise<Category[]> {
    return await (db as any).getCategories(type);
  }

  async createCategory(cat: Partial<Category>): Promise<Category> {
    return await (db as any).saveCategory(cat);
  }

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    return await (db as any).saveCategory({ ...cat, id });
  }

  async deleteCategory(id: string): Promise<boolean> {
    return await (db as any).deleteCategory(id);
  }

  async getProductsByCategory(slug: string): Promise<any[]> {
    const prods = await db.getProducts();
    return prods.filter((p: any) => p.category === slug);
  }

  async getServicesByCategory(slug: string): Promise<any[]> {
    const svcs = await db.getServices();
    return svcs.filter((s: any) => s.category === slug);
  }
}

export const dynamicCategories = new DynamicCategories();
