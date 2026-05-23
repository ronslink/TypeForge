export interface PublicDomainBook {
  id: string;
  title: string;
  author: string;
  year: number;
  excerpt: string;
}

export const FAMOUS_BOOKS: Record<string, PublicDomainBook[]> = {
  en: [
    { id: 'alice', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', year: 1865, excerpt: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, and what is the use of a book, thought Alice, without pictures or conversation?" },
    { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', year: 1818, excerpt: "It is with considerable difficulty that I remember the original era of my being: all the events of that period appear confused and indistinct. A strange multiplicity of sensations seized me, and I saw, felt, heard, and smelt at the same time; and it was, indeed, a long time before I learned to distinguish between the operations of my various senses." },
    { id: 'moby-dick', title: 'Moby Dick', author: 'Herman Melville', year: 1851, excerpt: "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation." },
    { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, excerpt: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters." },
    { id: 'two-cities', title: 'A Tale of Two Cities', author: 'Charles Dickens', year: 1859, excerpt: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair." },
    { id: 'dracula', title: 'Dracula', author: 'Bram Stoker', year: 1897, excerpt: "I was not able to light on any map or work giving the exact locality of the Castle Dracula, as there are no maps of this country as yet to compare with our own Ordnance Survey Maps; but I found that Bistritz, the post town named by Count Dracula, is a fairly well-known place." },
    { id: 'dorian-gray', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', year: 1890, excerpt: "The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn. From the corner of the divan of Persian saddle-bags on which he was lying, smoking, as was his custom, innumerable cigarettes, Lord Henry Wotton could just catch the gleam of the honey-sweet and honey-coloured blossoms of a laburnum." },
    { id: 'great-expectations', title: 'Great Expectations', author: 'Charles Dickens', year: 1861, excerpt: "My father's family name being Pirrip, and my Christian name Philip, my infant tongue could make of both names nothing longer or more explicit than Pip. So, I called myself Pip, and came to be called Pip. I give Pirrip as my father's family name, on the authority of his tombstone and my sister." },
  ],
  es: [
    { id: 'don-quijote', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', year: 1605, excerpt: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivÃ­a un hidalgo de los de lanza en astillero, adarga antigua, rocÃ­n flaco y galgo corredor. Una olla de algo mÃ¡s vaca que carnero, salpicÃ³n las mÃ¡s noches, duelos y quebrantos los sÃ¡bados, lantejas los viernes, algÃºn palomino de aÃ±adidura los domingos, consumÃ­an las tres partes de su hacienda." },
    { id: 'lazarillo', title: 'Lazarillo de Tormes', author: 'AnÃ³nimo', year: 1554, excerpt: "Pues sepa Vuestra Merced, ante todas cosas, que a mÃ­ llaman LÃ¡zaro de Tormes, hijo de TomÃ© GonzÃ¡lez y de Antona PÃ©rez, naturales de Tejares, aldea de Salamanca. Mi nacimiento fue dentro del rÃ­o Tormes, por la cual causa tomÃ© el sobrenombre, y fue desta manera: mi padre, que Dios perdone, tenÃ­a cargo de proveer una molienda de una aceÃ±a." },
    { id: 'galdos-fortunata', title: 'Fortunata y Jacinta', author: 'Benito PÃ©rez GaldÃ³s', year: 1887, excerpt: "Las dos ramas de la familia Santa Cruz habitaban desde tiempo inmemorial en la calle de Pontejos, esquina a la de Esparteros. En aquella Ã©poca no habÃ­a casas de vecindad como ahora; cada familia tenÃ­a su piso, y los vecinos de un edificio se conocÃ­an y trataban como si vivieran en un mismo hogar." },
  ],
  fr: [
    { id: 'les-miserables', title: 'Les MisÃ©rables', author: 'Victor Hugo', year: 1862, excerpt: "Il y a un spectacle plus grand que la mer, c'est le ciel; il y a un spectacle plus grand que le ciel, c'est l'intÃ©rieur de l'Ã¢me. Faire le poÃ¨me de la conscience humaine, ne fÃ»t-ce qu'Ã  propos d'un seul homme, ce serait fondre toutes les Ã©popÃ©es dans une Ã©popÃ©e supÃ©rieure et dÃ©finitive." },
    { id: 'comte-de-monte-cristo', title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', year: 1844, excerpt: "Le 24 fÃ©vrier 1815, la vigie de Notre-Dame de la Garde signala le trois-mÃ¢ts le Pharaon, venant de Smyrne, Trieste et Naples. Comme d'habitude, un pilote cÃ´tier partit aussitÃ´t du port, rasa le chÃ¢teau d'If, et alla aborder le bÃ¢timent entre le cap de Morgiou et l'Ã®le de Rion." },
    { id: 'madame-bovary', title: 'Madame Bovary', author: 'Gustave Flaubert', year: 1857, excerpt: "Nous Ã©tions Ã  l'Ã©tude, quand le Proviseur entra, suivi d'un nouveau habillÃ© en bourgeois et d'un garÃ§on de classe qui portait un grand pupitre. Ceux qui dormaient se rÃ©veillÃ¨rent, et chacun se leva comme surpris dans son travail." },
    { id: 'germinal', title: 'Germinal', author: 'Ã‰mile Zola', year: 1885, excerpt: "Dans la plaine rase, sous la nuit sans Ã©toiles, d'une obscuritÃ© et d'une Ã©paisseur d'encre, un homme suivait seul la grande route de Marchiennes Ã  Montsou, dix kilomÃ¨tres de pavÃ© coupant tout droit, Ã  travers les champs de betteraves." },
  ],
  de: [
    { id: 'faust', title: 'Faust: Der TragÃ¶die erster Teil', author: 'Johann Wolfgang von Goethe', year: 1808, excerpt: "Habe nun, ach! Philosophie, Juristerei und Medizin, und leider auch Theologie durchaus studiert, mit heiÃŸem BemÃ¼hn. Da steh ich nun, ich armer Tor, und bin so klug als wie zuvor. HeiÃŸe Magister, heiÃŸe Doktor gar, und ziehe schon an die zehen Jahr herauf, herab und quer und krumm meine SchÃ¼ler an der Nase herum." },
    { id: 'buddenbrooks', title: 'Buddenbrooks', author: 'Thomas Mann', year: 1901, excerpt: "Was ist das, was ist das, fragte Tony... Was war das nur fÃ¼r ein langweiliger Katechismus? Es handelte sich um die vier Ursachen des Aristoteles, die sie auswendig lernen mussten, obgleich keiner von ihnen hÃ¤tte sagen kÃ¶nnen, wozu das nÃ¼tze sei." },
    { id: 'steppenwolf', title: 'Der Steppenwolf', author: 'Hermann Hesse', year: 1927, excerpt: "Von diesen Aufzeichnungen, die ein Zufall mir in die HÃ¤nde spielte, wurde ich tief ergriffen und muss sie, fast ohne sie verÃ¤ndert zu haben, der Ã–ffentlichkeit Ã¼bergeben. Sie bilden das Dokument einer Zeitkrankheit, die nicht den einzelnen befÃ¤llt, sondern das Wesen der Epoche selbst." },
  ],
  pt: [
    { id: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899, excerpt: "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheÃ§o de vista e de chapÃ©u. Cumprimentou-me, sentou-se ao pÃ© de mim, falou da Lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos pode ser que nÃ£o fossem inteiramente maus." },
    { id: 'os-maias', title: 'Os Maias', author: 'EÃ§a de QueirÃ³s', year: 1888, excerpt: "A casa que os Maias vieram habitar em Lisboa, no outono de 1875, era conhecida na vizinhanÃ§a da rua de SÃ£o Francisco de Sales pela Casa do Ramalhete, ou simplesmente o Ramalhete. Algures, havia de ter havido, decorando um portÃ£o, esse velho ramo de flores de pedra que lhe dera o nome." },
  ],
  it: [
    { id: 'divine-comedy', title: 'La Divina Commedia', author: 'Dante Alighieri', year: 1320, excerpt: "Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura, chÃ© la diritta via era smarrita. Ahi quanto a dir qual era Ã¨ cosa dura esta selva selvaggia e aspra e forte che nel pensier rinova la paura!" },
    { id: 'promessi-sposi', title: 'I Promessi Sposi', author: 'Alessandro Manzoni', year: 1827, excerpt: "Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene non interrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi, e a prender corso e figura di fiume, tra un promontorio a destra, e un'ampia costiera dall'altra parte." },
  ],
  ru: [
    { id: 'war-and-peace', title: 'Ð’Ð¾Ð¹Ð½Ð° Ð¸ Ð¼Ð¸Ñ€', author: 'Ð›ÐµÐ² Ð¢Ð¾Ð»ÑÑ‚Ð¾Ð¹', year: 1869, excerpt: "ÐÑƒ Ñ‡Ñ‚Ð¾, mon prince, Ð“Ã©Ð½ÑƒÐ° Ð¸ Ð›ÑƒÐºÐºÐ° â€” Ð¿Ð¾Ð¼ÐµÑÑ‚ÑŒÑ Ñ„Ð°Ð¼Ð¸Ð»Ð¸Ð¸ Ð‘Ð¾Ð½Ð°Ð¿Ð°Ñ€Ñ‚Ðµ. ÐÐµÑ‚, Ñ Ð²Ð°Ñ Ð¿Ñ€ÐµÐ´ÑƒÐ¿Ñ€ÐµÐ¶Ð´Ð°ÑŽ, ÐµÑÐ»Ð¸ Ð²Ñ‹ Ð¼Ð½Ðµ Ð½Ðµ ÑÐºÐ°Ð¶ÐµÑ‚Ðµ, Ñ‡Ñ‚Ð¾ Ñƒ Ð½Ð°Ñ Ð²Ð¾Ð¹Ð½Ð°, ÐµÑÐ»Ð¸ Ð²Ñ‹ ÐµÑ‰Ñ‘ Ð¿Ð¾Ð·Ð²Ð¾Ð»Ð¸Ñ‚Ðµ ÑÐµÐ±Ðµ Ð·Ð°Ñ‰Ð¸Ñ‰Ð°Ñ‚ÑŒ Ð²ÑÐµ Ð³Ð°Ð´Ð¾ÑÑ‚Ð¸ Ð¸ ÑƒÐ¶Ð°ÑÑ‹ ÑÑ‚Ð¾Ð³Ð¾ ÐÐ½Ñ‚Ð¸Ñ…Ñ€Ð¸ÑÑ‚Ð° â€” Ð¿Ñ€Ð°Ð²Ð¾, Ñ Ð²Ð°Ñ Ð½Ðµ Ð·Ð½Ð°ÑŽ, Ð²Ñ‹ ÑƒÐ¶ Ð½Ðµ Ð´Ñ€ÑƒÐ³ Ð¼Ð¾Ð¹." },
    { id: 'crime-and-punishment', title: 'ÐŸÑ€ÐµÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ Ð¸ Ð½Ð°ÐºÐ°Ð·Ð°Ð½Ð¸Ðµ', author: 'Ð¤Ñ‘Ð´Ð¾Ñ€ Ð”Ð¾ÑÑ‚Ð¾ÐµÐ²ÑÐºÐ¸Ð¹', year: 1866, excerpt: "Ð’ Ð½Ð°Ñ‡Ð°Ð»Ðµ Ð¸ÑŽÐ»Ñ, Ð² Ñ‡Ñ€ÐµÐ·Ð²Ñ‹Ñ‡Ð°Ð¹Ð½Ð¾ Ð¶Ð°Ñ€ÐºÐ¾Ðµ Ð²Ñ€ÐµÐ¼Ñ, Ð¿Ð¾Ð´ Ð²ÐµÑ‡ÐµÑ€, Ð¾Ð´Ð¸Ð½ Ð¼Ð¾Ð»Ð¾Ð´Ð¾Ð¹ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐº Ð²Ñ‹ÑˆÐµÐ» Ð¸Ð· ÑÐ²Ð¾ÐµÐ¹ ÐºÐ°Ð¼Ð¾Ñ€ÐºÐ¸, ÐºÐ¾Ñ‚Ð¾Ñ€ÑƒÑŽ Ð½Ð°Ð½Ð¸Ð¼Ð°Ð» Ð¾Ñ‚ Ð¶Ð¸Ð»ÑŒÑ†Ð¾Ð² Ð² Ð¡-Ð¼ Ð¿ÐµÑ€ÐµÑƒÐ»ÐºÐµ, Ð½Ð° ÑƒÐ»Ð¸Ñ†Ñƒ Ð¸ Ð¼ÐµÐ´Ð»ÐµÐ½Ð½Ð¾, ÐºÐ°Ðº Ð±Ñ‹ Ð² Ð½ÐµÑ€ÐµÑˆÐ¸Ð¼Ð¾ÑÑ‚Ð¸, Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑÑ Ðº Ðš-Ð½Ñƒ Ð¼Ð¾ÑÑ‚Ñƒ." },
    { id: 'master-margarita', title: 'ÐœÐ°ÑÑ‚ÐµÑ€ Ð¸ ÐœÐ°Ñ€Ð³Ð°Ñ€Ð¸Ñ‚Ð°', author: 'ÐœÐ¸Ñ…Ð°Ð¸Ð» Ð‘ÑƒÐ»Ð³Ð°ÐºÐ¾Ð²', year: 1967, excerpt: "ÐžÐ´Ð½Ð°Ð¶Ð´Ñ‹ Ð²ÐµÑÐ½Ð¾Ð¹, Ð² Ñ‡Ð°Ñ Ð½ÐµÐ±Ñ‹Ð²Ð°Ð»Ð¾ Ð¶Ð°Ñ€ÐºÐ¾Ð³Ð¾ Ð·Ð°ÐºÐ°Ñ‚Ð°, Ð² ÐœÐ¾ÑÐºÐ²Ðµ, Ð½Ð° ÐŸÐ°Ñ‚Ñ€Ð¸Ð°Ñ€ÑˆÐ¸Ñ… Ð¿Ñ€ÑƒÐ´Ð°Ñ…, Ð¿Ð¾ÑÐ²Ð¸Ð»Ð¸ÑÑŒ Ð´Ð²Ð¾Ðµ Ð³Ñ€Ð°Ð¶Ð´Ð°Ð½. ÐŸÐµÑ€Ð²Ñ‹Ð¹ Ð¸Ð· Ð½Ð¸Ñ… â€” Ð¿Ñ€Ð¸Ð±Ð»Ð¸Ð·Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ ÑÐ¾Ñ€Ð¾ÐºÐ°Ð»ÐµÑ‚Ð½Ð¸Ð¹, Ð¾Ð´ÐµÑ‚Ñ‹Ð¹ Ð² ÑÐµÑ€ÐµÐ½ÑŒÐºÑƒÑŽ Ð»ÐµÑ‚Ð½ÑŽÑŽ Ð¿Ð°Ñ€Ñƒ, Ð±Ñ‹Ð» Ð¼Ð°Ð»ÐµÐ½ÑŒÐºÐ¾Ð³Ð¾ Ñ€Ð¾ÑÑ‚Ð°, ÑƒÐ¿Ð¸Ñ‚Ð°Ð½, Ð»Ñ‹Ñ, ÑÐ²Ð¾ÑŽ Ð¿Ñ€Ð¸Ð»Ð¸Ñ‡Ð½ÑƒÑŽ ÑˆÐ»ÑÐ¿Ñƒ Ð¿Ð¸Ñ€Ð¾Ð¶ÐºÐ¾Ð¼ Ð½Ñ‘Ñ Ð² Ñ€ÑƒÐºÐµ." },
  ],
  uk: [
    { id: 'kobzar', title: 'ÐšÐ¾Ð±Ð·Ð°Ñ€', author: 'Ð¢Ð°Ñ€Ð°Ñ Ð¨ÐµÐ²Ñ‡ÐµÐ½ÐºÐ¾', year: 1840, excerpt: "Ð”ÑƒÐ¼Ð¸ Ð¼Ð¾Ñ—, Ð´ÑƒÐ¼Ð¸ Ð¼Ð¾Ñ—, Ð»Ð¸Ñ…Ð¾ Ð¼ÐµÐ½Ñ– Ð· Ð²Ð°Ð¼Ð¸! ÐÐ°Ñ‰Ð¾ ÑÑ‚Ð°Ð»Ð¸ Ð½Ð° Ð¿Ð°Ð¿ÐµÑ€Ñ– ÑÑƒÐ¼Ð½Ð¸Ð¼Ð¸ Ñ€ÑÐ´Ð°Ð¼Ð¸? Ð§Ð¾Ð¼ Ð²Ð°Ñ Ð²Ñ–Ñ‚ÐµÑ€ Ð½Ðµ Ñ€Ð¾Ð·Ð²Ñ–ÑÐ² Ð² ÑÑ‚ÐµÐ¿Ñƒ, ÑÐº Ð¿Ð¸Ð»Ð¸Ð½Ñƒ? Ð§Ð¾Ð¼ Ð²Ð°Ñ Ð»ÑŽÐ´Ð¸ Ð½Ðµ Ð·Ð°Ð±ÑƒÐ»Ð¸, ÑÐº Ð³Ð»ÑƒÐ¿Ñƒ Ð´Ð¸Ñ‚Ð¸Ð½Ñƒ?" },
    { id: 'tini-zabutykh', title: 'Ð¢Ñ–Ð½Ñ– Ð·Ð°Ð±ÑƒÑ‚Ð¸Ñ… Ð¿Ñ€ÐµÐ´ÐºÑ–Ð²', author: 'ÐœÐ¸Ñ…Ð°Ð¹Ð»Ð¾ ÐšÐ¾Ñ†ÑŽÐ±Ð¸Ð½ÑÑŒÐºÐ¸Ð¹', year: 1911, excerpt: "Ð’Ð¾Ð½Ð¸ Ð¶Ð¸Ð»Ð¸ Ð¿Ð¾ Ñ€Ñ–Ð·Ð½Ð¸Ñ… Ð±Ð¾ÐºÐ°Ñ… Ð¿Ð¾Ñ‚Ð¾ÐºÐ° Ñ– Ð½Ðµ Ð·Ð½Ð°Ð»Ð¸ Ð¾Ð´Ð½Ðµ Ð¾Ð´Ð½Ð¾Ð³Ð¾. ÐŸÐ¾ Ñ‚Ð¾Ð¹ Ð±Ñ–Ðº Ð¼ÐµÑˆÐºÐ°Ð»Ð¸ Ð“ÑƒÑ‚ÐµÐ½ÑŽÐºÐ¸ â€” Ñ€Ñ–Ð´ ÑÑ‚Ð°Ñ€Ð¸Ð¹, Ð¼Ñ–Ñ†Ð½Ð¸Ð¹, Ð· Ð´Ñ–Ð´Ð°-Ð¿Ñ€Ð°Ð´Ñ–Ð´Ð° Ð¾ÑÑ–Ð»Ð¸Ð¹ Ð² Ñ‚Ñ–Ð¹ ÑƒÑ‰ÐµÐ»Ð¸Ð½Ñ–. ÐŸÐ¾ ÑÐµÐ¹ â€” ÐŸÐ°Ð»Ñ–Ð¹Ñ‡ÑƒÐºÐ¸, Ð¿Ñ€Ð¸Ð¹ÑˆÐ»Ñ–, Ð°Ð»Ðµ Ð²Ð¶Ðµ Ð´Ð°Ð²Ð½Ð¾ Ð¿Ð¾Ð¾Ð±Ñ€Ð¾ÑÑ‚Ð°Ð»Ð¸ ÐºÐ¾Ñ€Ñ–Ð½Ð½ÑÐ¼ Ñƒ Ñ‡Ð¾Ñ€Ð½Ñƒ Ð³ÑƒÑ†ÑƒÐ»ÑŒÑÑŒÐºÑƒ Ð·ÐµÐ¼Ð»ÑŽ." },
  ],
  ar: [
    { id: '1001-nights', title: 'Ø£Ù„Ù Ù„ÙŠÙ„Ø© ÙˆÙ„ÙŠÙ„Ø©', author: 'Ù…Ø¬Ù‡ÙˆÙ„', year: 800, excerpt: "Ù‚Ø§Ù„Øª Ø´Ù‡Ø±Ø²Ø§Ø¯: Ø¨Ù„ØºÙ†ÙŠ Ø£ÙŠÙ‡Ø§ Ø§Ù„Ù…Ù„Ùƒ Ø§Ù„Ø³Ø¹ÙŠØ¯ Ø£Ù†Ù‡ ÙƒØ§Ù† ÙÙŠ Ù‚Ø¯ÙŠÙ… Ø§Ù„Ø²Ù…Ø§Ù† ÙˆØ³Ø§Ù„Ù Ø§Ù„Ø¹ØµØ± ÙˆØ§Ù„Ø£ÙˆØ§Ù† Ù…Ù„Ùƒ Ù…Ù† Ù…Ù„ÙˆÙƒ Ø³Ø§Ø³Ø§Ù† Ø¨Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ù‡Ù†Ø¯ ÙˆØ§Ù„ØµÙŠÙ† ØµØ§Ø­Ø¨ Ø¬Ù†Ø¯ ÙˆØ£Ø¹ÙˆØ§Ù† ÙˆØ®Ø¯Ù… ÙˆØ­Ø´Ù…. ÙˆÙƒØ§Ù† Ù„Ù‡ ÙˆÙ„Ø¯Ø§Ù† Ø£Ø­Ø¯Ù‡Ù…Ø§ ÙƒØ¨ÙŠØ± ÙˆØ§Ù„Ø¢Ø®Ø± ØµØºÙŠØ± ÙˆÙƒØ§Ù†Ø§ ÙØ§Ø±Ø³ÙŠÙ† Ø¨Ø·Ù„ÙŠÙ† ÙˆÙƒØ§Ù† Ø§Ù„ÙƒØ¨ÙŠØ± Ù…Ù†Ù‡Ù…Ø§ Ø£ÙØ±Ø³ Ù…Ù† Ø§Ù„ØµØºÙŠØ±." },
    { id: 'muqaddimah', title: 'Ø§Ù„Ù…Ù‚Ø¯Ù…Ø©', author: 'Ø§Ø¨Ù† Ø®Ù„Ø¯ÙˆÙ†', year: 1377, excerpt: "Ø§Ø¹Ù„Ù… Ø£Ù† ÙÙ† Ø§Ù„ØªØ§Ø±ÙŠØ® ÙÙ† Ø¹Ø²ÙŠØ² Ø§Ù„Ù…Ø°Ù‡Ø¨ Ø¬Ù… Ø§Ù„ÙÙˆØ§Ø¦Ø¯ Ø´Ø±ÙŠÙ Ø§Ù„ØºØ§ÙŠØ© Ø¥Ø° Ù‡Ùˆ ÙŠÙˆÙ‚ÙÙ†Ø§ Ø¹Ù„Ù‰ Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ù…Ø§Ø¶ÙŠÙ† Ù…Ù† Ø§Ù„Ø£Ù…Ù… ÙÙŠ Ø£Ø®Ù„Ø§Ù‚Ù‡Ù… ÙˆØ§Ù„Ø£Ù†Ø¨ÙŠØ§Ø¡ ÙÙŠ Ø³ÙŠØ±Ù‡Ù… ÙˆØ§Ù„Ù…Ù„ÙˆÙƒ ÙÙŠ Ø¯ÙˆÙ„Ù‡Ù… ÙˆØ³ÙŠØ§Ø³ØªÙ‡Ù… Ø­ØªÙ‰ ØªØªÙ… ÙØ§Ø¦Ø¯Ø© Ø§Ù„Ø§Ù‚ØªØ¯Ø§Ø¡ ÙÙŠ Ø°Ù„Ùƒ Ù„Ù…Ù† ÙŠØ±ÙˆÙ…Ù‡ ÙÙŠ Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø¯ÙŠÙ† ÙˆØ§Ù„Ø¯Ù†ÙŠØ§." },
  ],
  he: [
    { id: 'agno-heart', title: '×¡×™×¤×•×¨ ×¤×©×•×˜', author: '×©"×™ ×¢×’× ×•×Ÿ', year: 1935, excerpt: "×‘×¢×™×¨ ×©×œ× ×• ×”×™×” × ×”×•×’ ×©×›×œ ×‘×—×•×¨ ×©×”×’×™×¢ ×œ×¤×¨×§×• ×‘×™×§×© ×œ×• ×›×œ×” ×ž×ž×©×¤×—×” ×ž×›×•×‘×“×ª. ×•×‘×™×ž×™× ×”×”× ×”×™×™×ª×” ×‘×œ×•×ž×” × ×™× ×’'×œ ×ž×Ÿ ×”×‘× ×•×ª ×”×ž×‘×•×§×©×•×ª, ×©×›×Ÿ ××‘×™×” ×”×™×” ×¡×•×—×¨ ×™×©×¨ ×•× ××ž×Ÿ ×•××ž×” ×¢×§×¨×ª ×”×‘×™×ª ×”×ž×¡×•×¨×” ×œ×‘×¢×œ×” ×•×œ×™×œ×“×™×”." },
  ],
  ja: [
    { id: 'genji', title: 'æºæ°ç‰©èªž', author: 'ç´«å¼éƒ¨', year: 1008, excerpt: "ã„ã¥ã‚Œã®å¾¡æ™‚ã«ã‹ã€å¥³å¾¡ã€æ›´è¡£ã‚ã¾ãŸä¾ã²çµ¦ã²ã‘ã‚‹ä¸­ã«ã€ã„ã¨ã‚„ã‚€ã”ã¨ãªãéš›ã«ã¯ã‚ã‚‰ã¬ãŒã€ã™ãã‚Œã¦æ™‚ã‚ãçµ¦ãµã‚ã‚Šã‘ã‚Šã€‚ã¯ã˜ã‚ã‚ˆã‚Šæˆ‘ã¯ã¨æ€ã²ä¸ŠãŒã‚Šçµ¦ã¸ã‚‹å¾¡æ–¹ã€…ã€ã‚ã–ã¾ã—ãã‚‚ã®ã«ãŠã¨ã—ã‚å«‰ã¿çµ¦ãµã€‚" },
    { id: 'wagahai', title: 'å¾è¼©ã¯çŒ«ã§ã‚ã‚‹', author: 'å¤ç›®æ¼±çŸ³', year: 1905, excerpt: "å¾è¼©ã¯çŒ«ã§ã‚ã‚‹ã€‚åå‰ã¯ã¾ã ç„¡ã„ã€‚ã©ã“ã§ç”Ÿã‚ŒãŸã‹ã¨ã‚“ã¨è¦‹å½“ãŒã¤ã‹ã¬ã€‚ä½•ã§ã‚‚è–„æš—ã„ã˜ã‚ã˜ã‚ã—ãŸæ‰€ã§ãƒ‹ãƒ£ãƒ¼ãƒ‹ãƒ£ãƒ¼æ³£ã„ã¦ã„ãŸäº‹ã ã‘ã¯è¨˜æ†¶ã—ã¦ã„ã‚‹ã€‚å¾è¼©ã¯ã“ã“ã§å§‹ã‚ã¦äººé–“ã¨ã„ã†ã‚‚ã®ã‚’è¦‹ãŸã€‚" },
    { id: 'kokoro', title: 'ã“ã“ã‚', author: 'å¤ç›®æ¼±çŸ³', year: 1914, excerpt: "ç§ã¯ãã®äººã‚’å¸¸ã«å…ˆç”Ÿã¨å‘¼ã‚“ã§ã„ãŸã€‚ã ã‹ã‚‰ã“ã“ã§ã‚‚ãŸã å…ˆç”Ÿã¨æ›¸ãã ã‘ã§æœ¬åã¯æ‰“ã¡æ˜Žã‘ãªã„ã€‚ã“ã‚Œã¯ä¸–é–“ã‚’æ†šã‹ã‚‹é æ…®ã¨ã„ã†ã‚ˆã‚Šã‚‚ã€ãã®æ–¹ãŒç§ã«ã¨ã£ã¦è‡ªç„¶ã ã‹ã‚‰ã§ã‚ã‚‹ã€‚ç§ã¯ãã®äººã®è¨˜æ†¶ã‚’å‘¼ã³èµ·ã™ã”ã¨ã«ã€ã™ãã€Œå…ˆç”Ÿã€ã¨ã„ã„ãŸããªã‚‹ã€‚" },
  ],
  zh: [
    { id: 'dream-red', title: 'çº¢æ¥¼æ¢¦', author: 'æ›¹é›ªèŠ¹', year: 1791, excerpt: "æ»¡çº¸è’å”è¨€ï¼Œä¸€æŠŠè¾›é…¸æ³ªã€‚éƒ½äº‘ä½œè€…ç—´ï¼Œè°è§£å…¶ä¸­å‘³ï¼Ÿæ­¤å¼€å·ç¬¬ä¸€å›žä¹Ÿã€‚ä½œè€…è‡ªäº‘ï¼šå› æ›¾åŽ†è¿‡ä¸€ç•ªæ¢¦å¹»ä¹‹åŽï¼Œæ•…å°†çœŸäº‹éšåŽ»ï¼Œè€Œå€Ÿé€šçµä¹‹è¯´ï¼Œæ’°æ­¤çŸ³å¤´è®°ä¸€ä¹¦ä¹Ÿï¼Œæ•…æ›°ç”„å£«éšäº‘äº‘ã€‚" },
    { id: 'journey-west', title: 'è¥¿æ¸¸è®°', author: 'å´æ‰¿æ©', year: 1592, excerpt: "æ··æ²Œæœªåˆ†å¤©åœ°ä¹±ï¼ŒèŒ«èŒ«æ¸ºæ¸ºæ— äººè§ã€‚è‡ªä»Žç›˜å¤ç ´é¸¿è’™ï¼Œå¼€è¾Ÿä»Žå…¹æ¸…æµŠè¾¨ã€‚è¦†è½½ç¾¤ç”Ÿä»°è‡³ä»ï¼Œå‘æ˜Žä¸‡ç‰©çš†æˆå–„ã€‚æ¬²çŸ¥é€ åŒ–ä¼šå…ƒåŠŸï¼Œé¡»çœ‹è¥¿æ¸¸é‡ŠåŽ„ä¼ ã€‚" },
  ],
  ko: [
    { id: 'chunhyangjeon', title: 'ì¶˜í–¥ì „', author: 'ìž‘ìž ë¯¸ìƒ', year: 1754, excerpt: "ìˆ™ì¢…ëŒ€ì™• ì¦‰ìœ„ ì´ˆì— ì„±ë•ì´ ë„“ìœ¼ì‹œì–´ ì„±ìž ì„±ì†ì€ ê³„ê³„ìŠ¹ìŠ¹í•˜ì‚¬ ê¸ˆê³ ì˜¥ì´‰ì´ ìš”ìˆœì‹œì ˆì´ë¼. ì´ë•Œì— ì „ë¼ë„ ë‚¨ì›ë¶€ì— ì›”ë§¤ë¼ í•˜ëŠ” ê¸°ìƒì´ ìžˆìœ¼ë˜ ì ˆìƒ‰ì´ìš” ìž¬ì£¼ ìžˆì–´ ë‚¨ì› ê³ ì„ì— ì œì¼ì´ë¼." },
  ],
  hi: [
    { id: 'godan', title: 'à¤—à¥‹à¤¦à¤¾à¤¨', author: 'à¤®à¥à¤‚à¤¶à¥€ à¤ªà¥à¤°à¥‡à¤®à¤šà¤‚à¤¦', year: 1936, excerpt: "à¤¹à¥‹à¤°à¥€ à¤¨à¥‡ à¤¦à¥‹à¤¨à¥‹à¤‚ à¤¬à¥ˆà¤²à¥‹à¤‚ à¤•à¥‹ à¤¸à¤¾à¤¨à¥€-à¤ªà¤¾à¤¨à¥€ à¤¦à¥‡ à¤¦à¤¿à¤¯à¤¾ à¤¥à¤¾ à¤”à¤° à¤–à¥à¤¦ à¤¨à¤¾à¤à¤¦ à¤•à¥‡ à¤ªà¤¾à¤¸ à¤¬à¥ˆà¤ à¤•à¤° à¤ªà¥à¤°à¤¾à¤¨à¥€ à¤œà¥‚à¤¤à¥€ à¤•à¥€ à¤®à¤°à¤®à¥à¤®à¤¤ à¤•à¤° à¤°à¤¹à¤¾ à¤¥à¤¾à¥¤ à¤§à¤¨à¤¿à¤¯à¤¾ à¤šà¥‚à¤²à¥à¤¹à¥‡ à¤•à¥‡ à¤¸à¤¾à¤®à¤¨à¥‡ à¤¬à¥ˆà¤ à¥€ à¤°à¥‹à¤Ÿà¤¿à¤¯à¤¾à¤ à¤¸à¥‡à¤‚à¤• à¤°à¤¹à¥€ à¤¥à¥€à¥¤ à¤¦à¥‹à¤¨à¥‹à¤‚ à¤•à¥‡ à¤¬à¥€à¤š à¤®à¥‡à¤‚ à¤‰à¤®à¥à¤° à¤•à¤¾ à¤•à¥‹à¤ˆ à¤…à¤‚à¤¤à¤° à¤¨ à¤¥à¤¾à¥¤" },
  ],
  tr: [
    { id: 'ince-memed', title: 'Ä°nce Memed', author: 'YaÅŸar Kemal', year: 1955, excerpt: "Ã‡ukurova'nÄ±n gÃ¶beÄŸinde, daÄŸlarÄ±n eteÄŸinde, yeÅŸil bir ormanlÄ±k iÃ§inde, kÃ¼Ã§Ã¼k bir kÃ¶y vardÄ±. KÃ¶yÃ¼n adÄ± DeÄŸirmenoluk'tu. KÃ¶ylÃ¼ler bÃ¼tÃ¼n ToroslarÄ±n iÃ§inde en gÃ¼zel yeri burasÄ±dÄ±r derlerdi." },
    { id: 'kuyucakli', title: 'KuyucaklÄ± Yusuf', author: 'Sabahattin Ali', year: 1937, excerpt: "Kuyucak, Ege'nin ortasÄ±nda, kÃ¼Ã§Ã¼k bir kasabadÄ±r. Ä°nsanlar burada sakin, mÃ¼tevazÄ± bir hayat yaÅŸarlar. Yusuf bu kasabada doÄŸmuÅŸ, bÃ¼yÃ¼mÃ¼ÅŸ; kasabanÄ±n her taÅŸÄ±nÄ±, her kÃ¶ÅŸesini tanÄ±r gibidir." },
  ],
  pl: [
    { id: 'pan-tadeusz', title: 'Pan Tadeusz', author: 'Adam Mickiewicz', year: 1834, excerpt: "Litwo! Ojczyzno moja! ty jesteÅ› jak zdrowie; Ile ciÄ™ trzeba ceniÄ‡, ten tylko siÄ™ dowie, Kto ciÄ™ straciÅ‚. DziÅ› piÄ™knoÅ›Ä‡ twÄ… w caÅ‚ej ozdobie WidzÄ™ i opisujÄ™, bo tÄ™skniÄ™ po tobie." },
    { id: 'lalka', title: 'Lalka', author: 'BolesÅ‚aw Prus', year: 1890, excerpt: "Pani Stawska wrÃ³ciÅ‚a do domu z robotÄ… w kieszeni i kawaÅ‚kiem chleba pod pachÄ…. Twarz miaÅ‚a bladÄ… i sfrasowanÄ…, bo robotÄ™ przyniosÅ‚a trudnÄ…, a chleb drogi. Za to suknia na niej byÅ‚a prawie nowa i kapelusz caÅ‚kiem nowy." },
  ],
  nl: [
    { id: 'max-havelaar', title: 'Max Havelaar', author: 'Multatuli', year: 1860, excerpt: "Ik ben makelaar in koffie, en woon op de Lauriergracht No 37. Het is mijn gewoonte niet, romans te schrijven of zulke dingen, en het heeft lang geduurd, eer ik er toe overging een paar rijÃ«n op te zetten." },
  ],
  sv: [
    { id: 'nils', title: 'Nils Holgerssons underbara resa', author: 'Selma LagerlÃ¶f', year: 1906, excerpt: "Det var en gÃ¥ng en pojke. Han var ungefÃ¤r fjorton Ã¥r gammal, lÃ¥ng och ranglig och flaxhÃ¥rig. Han var inte bra till mycket. Han hade lust fÃ¶r ingenting annat Ã¤n att Ã¤ta och sova. Och fÃ¶rutom det hade han lust att supa och sova." },
  ],
  no: [
    { id: 'peer-gynt', title: 'Peer Gynt', author: 'Henrik Ibsen', year: 1867, excerpt: "Peer, du lyver! Ã…se, din mor, sto og lyttet, hÃ¸rte alt. Peer Gynt stod midt i en lÃ¸gn og visste at han lÃ¸y, og leste han likevel videre som om ingenting hadde hendt, med den selvsikre mine som bare en uforskammet gutt kan ha." },
  ],
  da: [
    { id: 'andersen-fairy', title: 'Eventyr, fortalte for BÃ¸rn', author: 'H.C. Andersen', year: 1835, excerpt: "Der kom en soldat marcherende hen ad landevejen: Ã©n, to! Ã©n, to! Han havde sin tornyster pÃ¥ ryggen og en sabel ved siden, for han havde vÃ¦ret i krigen, og nu skulle han hjem. SÃ¥ mÃ¸dte han en gammel heks pÃ¥ landevejen." },
  ],
  fi: [
    { id: 'kalevala', title: 'Kalevala', author: 'Elias LÃ¶nnrot', year: 1835, excerpt: "Mieleni minun tekevi, aivoni ajattelevi lÃ¤hteÃ¤ni laulamahan, saa'ani sanelemahan, sukuvirttÃ¤ suoltamahan, lajivirttÃ¤ laulamahan. Sanat suussani sulavat, puhe'et putoelevat, kielelleni kerkiÃ¤vÃ¤t, hampahilleni hajoovat." },
  ],
  cs: [
    { id: 'babicka', title: 'BabiÄka', author: 'BoÅ¾ena NÄ›mcovÃ¡', year: 1855, excerpt: "V jinÃ©m Äase nebÃ½val by nikdo zvlÃ¡Å¡tÄ› Å¡Å¥asten, Å¾ije-li blÃ­Å¾e StarÃ©ho BÄ›lidla neb statek samotnÃ©ho rolnÃ­ka, ale babiÄce bylo dobÅ™e. Tam byl svÄ›t, jakÃ½ milovala â€” prostÃ­ lidÃ©, poctivÃ¡ prÃ¡ce, prÅ¯zraÄnÃ¡ voda a Å¡umÃ­cÃ­ stromy." },
  ],
  hu: [
    { id: 'egri-csillagok', title: 'Egri csillagok', author: 'GÃ©za GÃ¡rdonyi', year: 1901, excerpt: "Gergely ott Ã¼lt a kÃ¶rtefa tÃ¶vÃ©ben, Ã©s bÃ¡mult a levegÅ‘be. SzÃ©p, napfÃ©nyes dÃ©lelÅ‘tt volt. A mÃ©hek dongtak a virÃ¡gok kÃ¶rÃ¼l, Ã©s messzire zÃ¼mmÃ¶gÃ¶tt a szÃ©l, de Gergely nem lÃ¡tott, nem hallott semmit, csak Ã¼lt Ã©s gondolkodott." },
  ],
  el: [
    { id: 'odyssey', title: 'ÎŸÎ´ÏÏƒÏƒÎµÎ¹Î±', author: 'ÎŒÎ¼Î·ÏÎ¿Ï‚', year: -800, excerpt: "Î†Î½Î´ÏÎ± Î¼Î¿Î¹ Î­Î½Î½ÎµÏ€Îµ, ÎœÎ¿ÏÏƒÎ±, Ï€Î¿Î»ÏÏ„ÏÎ¿Ï€Î¿Î½, ÏŒÏ‚ Î¼Î¬Î»Î± Ï€Î¿Î»Î»Î¬ Ï€Î»Î¬Î³Ï‡Î¸Î·, ÎµÏ€ÎµÎ¯ Î¤ÏÎ¿Î¯Î·Ï‚ Î¹ÎµÏÏŒÎ½ Ï€Ï„Î¿Î»Î¯ÎµÎ¸ÏÎ¿Î½ Î­Ï€ÎµÏÏƒÎµÂ· Ï€Î¿Î»Î»ÏŽÎ½ Î´' Î±Î½Î¸ÏÏŽÏ€Ï‰Î½ Î¯Î´ÎµÎ½ Î¬ÏƒÏ„ÎµÎ± ÎºÎ±Î¹ Î½ÏŒÎ¿Î½ Î­Î³Î½Ï‰, Ï€Î¿Î»Î»Î¬ Î´' ÏŒ Î³' ÎµÎ½ Ï€ÏŒÎ½Ï„Ï‰ Ï€Î¬Î¸ÎµÎ½ Î¬Î»Î³ÎµÎ± ÏŒÎ½ ÎºÎ±Ï„Î¬ Î¸Ï…Î¼ÏŒÎ½." },
  ],
  th: [
    { id: 'ramakien', title: 'à¸£à¸²à¸¡à¹€à¸à¸µà¸¢à¸£à¸•à¸´à¹Œ', author: 'à¸žà¸£à¸°à¸šà¸²à¸—à¸ªà¸¡à¹€à¸”à¹‡à¸ˆà¸žà¸£à¸°à¸žà¸¸à¸—à¸˜à¸¢à¸­à¸”à¸Ÿà¹‰à¸²à¸ˆà¸¸à¸¬à¸²à¹‚à¸¥à¸', year: 1798, excerpt: "à¹€à¸¡à¸·à¹ˆà¸­à¸™à¸±à¹‰à¸™ à¸­à¸‡à¸„à¹Œà¸žà¸£à¸°à¸£à¸²à¸¡à¸œà¸¹à¹‰à¸—à¸£à¸‡à¸¤à¸—à¸˜à¸´à¹Œ à¹„à¸”à¹‰à¸¢à¸´à¸™à¸ªà¸µà¸¢à¸‡à¹‚à¸«à¹ˆà¸£à¹‰à¸­à¸‡à¸à¸¶à¸à¸à¹‰à¸­à¸‡ à¸—à¸£à¸‡à¸žà¸£à¸°à¹‚à¸à¸£à¸˜à¸”à¸±à¹ˆà¸‡à¹„à¸Ÿà¸à¸±à¸¥à¸›à¹Œ à¸ˆà¸¶à¸‡à¸¡à¸µà¸žà¸£à¸°à¸šà¸±à¸à¸Šà¸²à¹à¸à¹ˆà¸žà¸£à¸°à¸¥à¸±à¸à¸©à¸¡à¸“à¹Œ à¹ƒà¸«à¹‰à¹€à¸•à¸£à¸µà¸¢à¸¡à¸žà¸¥à¹€à¸ªà¸™à¸²à¸­à¸­à¸à¸£à¸š" },
  ],
  vi: [
    { id: 'kieu', title: 'Truyá»‡n Kiá»u', author: 'Nguyá»…n Du', year: 1820, excerpt: "TrÄƒm nÄƒm trong cÃµi ngÆ°á»i ta, Chá»¯ tÃ i chá»¯ má»‡nh khÃ©o lÃ  ghÃ©t nhau. Tráº£i qua má»™t cuá»™c bá»ƒ dÃ¢u, Nhá»¯ng Ä‘iá»u trÃ´ng tháº¥y mÃ  Ä‘au Ä‘á»›n lÃ²ng." },
  ],
  id: [
    { id: 'bumi-manusia', title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', year: 1980, excerpt: "Panggil saja aku Minke. Nama itu diberikan orang kepadaku, entah mengapa. Sejak kecil aku sudah terbiasa dipanggil begitu. Kalau diingat-ingat sekarang, nama itu agak aneh juga: seperti nama kuda pacuan." },
  ],
  ms: [
    { id: 'hikayat', title: 'Hikayat Hang Tuah', author: 'Pengarang Anonim', year: 1700, excerpt: "Maka tersebutlah perkataan seorang Melayu yang bernama Hang Mahmud, ia pun pergi mendapatkan Bendahara itu. Maka kata Hang Mahmud: Tuanku, patik ini datang hendak memohonkan kasih Tuanku, kerana anakanda patik ini sudah besar." },
  ],
  tl: [
    { id: 'noli-me-tangere', title: 'Noli Me Tangere', author: 'JosÃ© Rizal', year: 1887, excerpt: "Sa huling mga araw ng Oktubre, nang hapon, ang Kapitan Tiago ay nagbibigay ng isang piging na tinatawag sa wikang Tagalog na handaan. Sa kabila ng pahayag na ito, ipinaalam sa lahat ng kaibigan, at ng mga kaibigan ng mga kaibigan, at ng mga kaibigan ng mga kaibigan ng mga kaibigan." },
  ],
  sw: [
    { id: 'utendi-wa-tambuka', title: 'Utendi wa Tambuka', author: 'Bwana Mwengo', year: 1728, excerpt: "Bismillahi naanza, kwa jina la Mola wangu, nikiomba msaada wake, katika kazi hii yangu. Ninasifu na kumheshimu, Mwenyezi Mungu wa kweli, ambaye ametupa uhai, na baraka zake za hali." },
  ],
};
