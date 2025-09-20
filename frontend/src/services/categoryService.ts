interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

class CategoryService {
  private static categories: Category[] = [];
  private static loading = false;
  private static loadPromise: Promise<Category[]> | null = null;

  static async getCategories(): Promise<Category[]> {
    // If already loaded, return cached categories
    if (this.categories.length > 0) {
      return this.categories;
    }

    // If currently loading, return the existing promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.loading = true;
    this.loadPromise = this.fetchCategories();

    try {
      const categories = await this.loadPromise;
      this.categories = categories;
      return categories;
    } finally {
      this.loading = false;
      this.loadPromise = null;
    }
  }

  private static async fetchCategories(): Promise<Category[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      return result.data.categories || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }

  static clearCache(): void {
    this.categories = [];
    this.loading = false;
    this.loadPromise = null;
  }
}

export default CategoryService;
export type { Category };
