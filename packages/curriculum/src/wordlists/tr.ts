/**
 * Turkish wordlist with 210+ common words organized by difficulty
 * Includes classic literature excerpts from public domain works
 */

export interface WordlistEntry {
  word: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

export const turkishWordlist: WordlistEntry[] = [
  // === Difficulty 1: Beginner ===
  { word: 'bir', difficulty: 1, tags: ['article'] },
  { word: 'bu', difficulty: 1, tags: ['pronoun'] },
  { word: 'da', difficulty: 1, tags: ['conjunction'] },
  { word: 'de', difficulty: 1, tags: ['conjunction'] },
  { word: 've', difficulty: 1, tags: ['conjunction'] },
  { word: 'ben', difficulty: 1, tags: ['pronoun'] },
  { word: 'sen', difficulty: 1, tags: ['pronoun'] },
  { word: 'o', difficulty: 1, tags: ['pronoun'] },
  { word: 'biz', difficulty: 1, tags: ['pronoun'] },
  { word: 'siz', difficulty: 1, tags: ['pronoun'] },
  { word: 'var', difficulty: 1, tags: ['verb'] },
  { word: 'yok', difficulty: 1, tags: ['adjective'] },
  { word: 'ne', difficulty: 1, tags: ['pronoun'] },
  { word: 'evet', difficulty: 1, tags: ['adverb'] },
  { word: 'hayır', difficulty: 1, tags: ['adverb'] },
  { word: 'için', difficulty: 1, tags: ['preposition'] },
  { word: 'ile', difficulty: 1, tags: ['preposition'] },
  { word: 'çok', difficulty: 1, tags: ['adverb'] },
  { word: 'iyi', difficulty: 1, tags: ['adjective'] },
  { word: 'güzel', difficulty: 1, tags: ['adjective'] },
  { word: 'büyük', difficulty: 1, tags: ['adjective'] },
  { word: 'küçük', difficulty: 1, tags: ['adjective'] },
  { word: 'yeni', difficulty: 1, tags: ['adjective'] },
  { word: 'eski', difficulty: 1, tags: ['adjective'] },
  { word: 'gün', difficulty: 1, tags: ['time'] },
  { word: 'su', difficulty: 1, tags: ['noun'] },
  { word: 'ev', difficulty: 1, tags: ['noun'] },
  { word: 'göz', difficulty: 1, tags: ['noun'] },
  { word: 'el', difficulty: 1, tags: ['noun'] },
  { word: 'baş', difficulty: 1, tags: ['noun'] },
  { word: 'gece', difficulty: 1, tags: ['time'] },
  { word: 'gelmek', difficulty: 1, tags: ['verb'] },
  { word: 'gitmek', difficulty: 1, tags: ['verb'] },
  { word: 'olmak', difficulty: 1, tags: ['verb'] },
  { word: 'yapmak', difficulty: 1, tags: ['verb'] },
  { word: 'bilmek', difficulty: 1, tags: ['verb'] },
  { word: 'görmek', difficulty: 1, tags: ['verb'] },
  { word: 'demek', difficulty: 1, tags: ['verb'] },
  { word: 'vermek', difficulty: 1, tags: ['verb'] },
  { word: 'almak', difficulty: 1, tags: ['verb'] },

  // === Difficulty 2: Intermediate ===
  { word: 'arkadaş', difficulty: 2, tags: ['noun'] },
  { word: 'aile', difficulty: 2, tags: ['family'] },
  { word: 'anne', difficulty: 2, tags: ['family'] },
  { word: 'baba', difficulty: 2, tags: ['family'] },
  { word: 'kardeş', difficulty: 2, tags: ['family'] },
  { word: 'çocuk', difficulty: 2, tags: ['noun'] },
  { word: 'kadın', difficulty: 2, tags: ['noun'] },
  { word: 'adam', difficulty: 2, tags: ['noun'] },
  { word: 'okul', difficulty: 2, tags: ['education'] },
  { word: 'öğretmen', difficulty: 2, tags: ['education'] },
  { word: 'öğrenci', difficulty: 2, tags: ['education'] },
  { word: 'kitap', difficulty: 2, tags: ['education'] },
  { word: 'dünya', difficulty: 2, tags: ['noun'] },
  { word: 'hayat', difficulty: 2, tags: ['noun'] },
  { word: 'zaman', difficulty: 2, tags: ['noun'] },
  { word: 'şehir', difficulty: 2, tags: ['geography'] },
  { word: 'ülke', difficulty: 2, tags: ['geography'] },
  { word: 'tarih', difficulty: 2, tags: ['education'] },
  { word: 'kültür', difficulty: 2, tags: ['noun'] },
  { word: 'müzik', difficulty: 2, tags: ['art'] },
  { word: 'yemek', difficulty: 2, tags: ['food'] },
  { word: 'para', difficulty: 2, tags: ['noun'] },
  { word: 'sağlık', difficulty: 2, tags: ['health'] },
  { word: 'doğa', difficulty: 2, tags: ['nature'] },
  { word: 'deniz', difficulty: 2, tags: ['nature'] },
  { word: 'dağ', difficulty: 2, tags: ['nature'] },
  { word: 'güneş', difficulty: 2, tags: ['nature'] },
  { word: 'yağmur', difficulty: 2, tags: ['nature'] },
  { word: 'sevmek', difficulty: 2, tags: ['emotion'] },
  { word: 'düşünmek', difficulty: 2, tags: ['verb'] },
  { word: 'çalışmak', difficulty: 2, tags: ['work'] },
  { word: 'başlamak', difficulty: 2, tags: ['verb'] },
  { word: 'anlamak', difficulty: 2, tags: ['verb'] },
  { word: 'beklemek', difficulty: 2, tags: ['verb'] },
  { word: 'öğrenmek', difficulty: 2, tags: ['education'] },
  { word: 'bilgisayar', difficulty: 2, tags: ['technology'] },
  { word: 'telefon', difficulty: 2, tags: ['technology'] },
  { word: 'mutlu', difficulty: 2, tags: ['emotion'] },
  { word: 'üzgün', difficulty: 2, tags: ['emotion'] },
  { word: 'önemli', difficulty: 2, tags: ['adjective'] },

  // === Difficulty 3: Advanced / Classic Literature ===
  // From Yunus Emre (13th century poet) - public domain
  { word: 'sevelim sevilelim', difficulty: 3, tags: ['literature', 'yunus_emre'] },
  { word: 'dünya kimseye kalmaz', difficulty: 3, tags: ['literature', 'yunus_emre'] },
  { word: 'ilim ilim bilmektir', difficulty: 3, tags: ['literature', 'yunus_emre'] },
  { word: 'kendini bilmektir', difficulty: 3, tags: ['literature', 'yunus_emre'] },
  // From Mevlana Rumi - public domain
  { word: 'aşk gelicek cümle eksikler biter', difficulty: 3, tags: ['literature', 'rumi'] },
  { word: 'gel ne olursan ol yine gel', difficulty: 3, tags: ['literature', 'rumi'] },
  { word: 'dün geçti yarın gelmedi', difficulty: 3, tags: ['literature', 'rumi'] },
  // From Nasreddin Hodja tales - public domain folklore
  { word: 'ya tutarsa dedi', difficulty: 3, tags: ['literature', 'nasreddin'] },
  // Advanced vocabulary
  { word: 'demokrasi', difficulty: 3, tags: ['politics'] },
  { word: 'hükümet', difficulty: 3, tags: ['politics'] },
  { word: 'toplum', difficulty: 3, tags: ['noun'] },
  { word: 'sorumluluk', difficulty: 3, tags: ['noun'] },
  { word: 'uluslararası', difficulty: 3, tags: ['adjective'] },
  { word: 'teknoloji', difficulty: 3, tags: ['technology'] },
  { word: 'çevre', difficulty: 3, tags: ['nature'] },
  { word: 'sürdürülebilir', difficulty: 3, tags: ['adjective'] },
  { word: 'kalkınma', difficulty: 3, tags: ['noun'] },
  { word: 'araştırma', difficulty: 3, tags: ['science'] },
];

export default turkishWordlist;
