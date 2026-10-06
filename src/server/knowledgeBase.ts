import { companyKnowledgeBase, searchKnowledge } from '../knowledge/companyKnowledge';

export class KnowledgeBaseService {
  getAllEntries() {
    return companyKnowledgeBase;
  }

  search(query: string) {
    return searchKnowledge(query);
  }

  getByCategory(category: string) {
    return companyKnowledgeBase.filter(e => e.category === category);
  }

  getEntry(id: string) {
    return companyKnowledgeBase.find(e => e.id === id);
  }

  buildContext(query: string): string {
    const results = searchKnowledge(query);
    if (results.length === 0) return '';
    return 'Company Knowledge Base:\n' + results.map(r => `- ${r.title}: ${r.content}`).join('\n');
  }
}

export const knowledgeBase = new KnowledgeBaseService();
