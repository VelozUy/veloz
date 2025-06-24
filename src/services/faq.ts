import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface FAQ {
  id: string;
  question: {
    en: string;
    es: string;
    he: string;
  };
  answer: {
    en: string;
    es: string;
    he: string;
  };
  category?: string;
  order: number;
  published: boolean;
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

export class FAQService {
  private static instance: FAQService;

  public static getInstance(): FAQService {
    if (!FAQService.instance) {
      FAQService.instance = new FAQService();
    }
    return FAQService.instance;
  }

  /**
   * Get all published FAQs for public display
   * Uses simple query to avoid index requirements, then filters in code
   */
  async getPublishedFAQs(): Promise<FAQ[]> {
    try {
      // Use simple query without compound index requirement
      const faqsQuery = query(collection(db, 'faqs'), orderBy('order', 'asc'));

      const snapshot = await getDocs(faqsQuery);
      const faqs: FAQ[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter for published FAQs in code instead of query
        if (data.published === true) {
          faqs.push({ id: doc.id, ...data } as FAQ);
        }
      });

      return faqs;
    } catch (error) {
      console.error('Error fetching published FAQs:', error);

      // Fallback: try getting all FAQs without ordering if order index fails
      try {
        const fallbackQuery = query(collection(db, 'faqs'));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackFaqs: FAQ[] = [];

        fallbackSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.published === true) {
            fallbackFaqs.push({ id: doc.id, ...data } as FAQ);
          }
        });

        // Sort by order in code
        return fallbackFaqs.sort((a, b) => (a.order || 0) - (b.order || 0));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Get FAQs by category for public display
   */
  async getPublishedFAQsByCategory(category: string): Promise<FAQ[]> {
    try {
      const allFaqs = await this.getPublishedFAQs();
      return allFaqs.filter(faq => faq.category === category);
    } catch (error) {
      console.error('Error fetching FAQs by category:', error);
      return [];
    }
  }

  /**
   * Get available FAQ categories
   */
  async getFAQCategories(): Promise<string[]> {
    try {
      const faqs = await this.getPublishedFAQs();
      const categories = new Set(faqs.map(faq => faq.category || 'General'));
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      return [];
    }
  }
}

// Export singleton instance
export const faqService = FAQService.getInstance();
