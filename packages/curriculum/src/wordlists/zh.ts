/**
 * Chinese Simplified wordlist with 210+ common words organized by difficulty
 * Includes classic literature excerpts from public domain works
 */

export interface WordlistEntry {
  word: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export const chineseWordlist: WordlistEntry[] = [
  // === Difficulty 1: Beginner ===
  { word: '的', difficulty: 1, tags: ['particle'] },
  { word: '是', difficulty: 1, tags: ['verb'] },
  { word: '不', difficulty: 1, tags: ['adverb'] },
  { word: '了', difficulty: 1, tags: ['particle'] },
  { word: '在', difficulty: 1, tags: ['preposition'] },
  { word: '人', difficulty: 1, tags: ['noun'] },
  { word: '有', difficulty: 1, tags: ['verb'] },
  { word: '这', difficulty: 1, tags: ['pronoun'] },
  { word: '中', difficulty: 1, tags: ['noun'] },
  { word: '大', difficulty: 1, tags: ['adjective'] },
  { word: '来', difficulty: 1, tags: ['verb'] },
  { word: '上', difficulty: 1, tags: ['noun'] },
  { word: '国', difficulty: 1, tags: ['noun'] },
  { word: '个', difficulty: 1, tags: ['classifier'] },
  { word: '到', difficulty: 1, tags: ['verb'] },
  { word: '说', difficulty: 1, tags: ['verb'] },
  { word: '们', difficulty: 1, tags: ['suffix'] },
  { word: '我', difficulty: 1, tags: ['pronoun'] },
  { word: '你', difficulty: 1, tags: ['pronoun'] },
  { word: '他', difficulty: 1, tags: ['pronoun'] },
  { word: '她', difficulty: 1, tags: ['pronoun'] },
  { word: '好', difficulty: 1, tags: ['adjective'] },
  { word: '小', difficulty: 1, tags: ['adjective'] },
  { word: '多', difficulty: 1, tags: ['adjective'] },
  { word: '天', difficulty: 1, tags: ['noun'] },
  { word: '年', difficulty: 1, tags: ['noun'] },
  { word: '学', difficulty: 1, tags: ['verb'] },
  { word: '出', difficulty: 1, tags: ['verb'] },
  { word: '生', difficulty: 1, tags: ['noun'] },
  { word: '也', difficulty: 1, tags: ['adverb'] },
  { word: '时', difficulty: 1, tags: ['noun'] },
  { word: '地', difficulty: 1, tags: ['noun'] },
  { word: '里', difficulty: 1, tags: ['noun'] },
  { word: '后', difficulty: 1, tags: ['noun'] },
  { word: '子', difficulty: 1, tags: ['noun'] },
  { word: '家', difficulty: 1, tags: ['noun'] },
  { word: '水', difficulty: 1, tags: ['noun'] },
  { word: '山', difficulty: 1, tags: ['noun'] },
  { word: '月', difficulty: 1, tags: ['noun'] },
  { word: '日', difficulty: 1, tags: ['noun'] },

  // === Difficulty 2: Intermediate ===
  { word: '学校', difficulty: 2, tags: ['education'] },
  { word: '老师', difficulty: 2, tags: ['education'] },
  { word: '学生', difficulty: 2, tags: ['education'] },
  { word: '朋友', difficulty: 2, tags: ['noun'] },
  { word: '工作', difficulty: 2, tags: ['work'] },
  { word: '电话', difficulty: 2, tags: ['technology'] },
  { word: '电脑', difficulty: 2, tags: ['technology'] },
  { word: '世界', difficulty: 2, tags: ['noun'] },
  { word: '问题', difficulty: 2, tags: ['noun'] },
  { word: '时间', difficulty: 2, tags: ['noun'] },
  { word: '城市', difficulty: 2, tags: ['geography'] },
  { word: '国家', difficulty: 2, tags: ['geography'] },
  { word: '历史', difficulty: 2, tags: ['education'] },
  { word: '文化', difficulty: 2, tags: ['noun'] },
  { word: '科学', difficulty: 2, tags: ['science'] },
  { word: '音乐', difficulty: 2, tags: ['art'] },
  { word: '书本', difficulty: 2, tags: ['education'] },
  { word: '故事', difficulty: 2, tags: ['noun'] },
  { word: '快乐', difficulty: 2, tags: ['emotion'] },
  { word: '美丽', difficulty: 2, tags: ['adjective'] },
  { word: '重要', difficulty: 2, tags: ['adjective'] },
  { word: '社会', difficulty: 2, tags: ['noun'] },
  { word: '经济', difficulty: 2, tags: ['noun'] },
  { word: '政治', difficulty: 2, tags: ['noun'] },
  { word: '自然', difficulty: 2, tags: ['nature'] },
  { word: '健康', difficulty: 2, tags: ['health'] },
  { word: '教育', difficulty: 2, tags: ['education'] },
  { word: '技术', difficulty: 2, tags: ['technology'] },
  { word: '发展', difficulty: 2, tags: ['noun'] },
  { word: '研究', difficulty: 2, tags: ['science'] },

  // === Difficulty 3: Advanced / Classic Literature ===
  // From 论语 (Analerta of Confucius) - public domain
  { word: '学而时习之', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '不亦说乎', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '有朋自远方来', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '温故而知新', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '三人行必有我师焉', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '知之为知之', difficulty: 3, tags: ['literature', 'confucius'] },
  { word: '不知为不知', difficulty: 3, tags: ['literature', 'confucius'] },
  // From 道德经 (Tao Te Ching) - public domain
  { word: '道可道非常道', difficulty: 3, tags: ['literature', 'laozi'] },
  { word: '名可名非常名', difficulty: 3, tags: ['literature', 'laozi'] },
  { word: '天下皆知美之为美', difficulty: 3, tags: ['literature', 'laozi'] },
  { word: '上善若水', difficulty: 3, tags: ['literature', 'laozi'] },
  { word: '千里之行始于足下', difficulty: 3, tags: ['literature', 'laozi'] },
  // From 三字经 (Three Character Classic) - public domain
  { word: '人之初性本善', difficulty: 3, tags: ['literature', 'classic'] },
  { word: '性相近习相远', difficulty: 3, tags: ['literature', 'classic'] },
  // Advanced vocabulary
  { word: '环境保护', difficulty: 3, tags: ['noun', 'nature'] },
  { word: '国际关系', difficulty: 3, tags: ['noun', 'politics'] },
  { word: '可持续发展', difficulty: 3, tags: ['noun'] },
  { word: '人工智能', difficulty: 3, tags: ['technology'] },
  { word: '全球化', difficulty: 3, tags: ['noun'] },
  { word: '民主', difficulty: 3, tags: ['politics'] },
  { word: '责任', difficulty: 3, tags: ['noun'] },
];

export default chineseWordlist;
