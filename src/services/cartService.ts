export interface CartItem {
  id: string;
  workerId: string;
  serviceTitle: string;
  providerName: string;
  trade: string;
  hourlyRate: number;
  hours: number;
  imageUrl: string;
  city: string;
}

const CART_STORAGE_KEY = 'tegagn_customer_cart_v1';

export const cartService = {
  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveItems(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('tegagn_cart_changed'));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  },

  addItem(item: Omit<CartItem, 'hours'>, hours: number = 1): void {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === item.id || (i.workerId === item.workerId && i.serviceTitle === item.serviceTitle));

    if (existingIndex >= 0) {
      items[existingIndex].hours += hours;
    } else {
      items.push({ ...item, hours: Math.max(1, hours) });
    }
    this.saveItems(items);
  },

  updateHours(id: string, hours: number): void {
    const items = this.getItems();
    const target = items.find(i => i.id === id);
    if (target) {
      if (hours <= 0) {
        this.removeItem(id);
      } else {
        target.hours = hours;
        this.saveItems(items);
      }
    }
  },

  removeItem(id: string): void {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  },

  clearCart(): void {
    this.saveItems([]);
  },

  getCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.hours, 0);
  },

  getSubtotal(): number {
    return this.getItems().reduce((sum, item) => sum + (item.hourlyRate * item.hours), 0);
  }
};
