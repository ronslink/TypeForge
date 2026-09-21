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
    { id: 'don-quijote', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', year: 1605, excerpt: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda." },
    { id: 'lazarillo', title: 'Lazarillo de Tormes', author: 'Anónimo', year: 1554, excerpt: "Pues sepa Vuestra Merced, ante todas cosas, que a mí llaman Lázaro de Tormes, hijo de Tomé González y de Antona Pérez, naturales de Tejares, aldea de Salamanca. Mi nacimiento fue dentro del río Tormes, por la cual causa tomé el sobrenombre, y fue desta manera: mi padre, que Dios perdone, tenía cargo de proveer una molienda de una aceña." },
    { id: 'galdos-fortunata', title: 'Fortunata y Jacinta', author: 'Benito Pérez Galdós', year: 1887, excerpt: "Las dos ramas de la familia Santa Cruz habitaban desde tiempo inmemorial en la calle de Pontejos, esquina a la de Esparteros. En aquella época no había casas de vecindad como ahora; cada familia tenía su piso, y los vecinos de un edificio se conocían y trataban como si vivieran en un mismo hogar." },
  ],
  fr: [
    { id: 'les-miserables', title: 'Les Misérables', author: 'Victor Hugo', year: 1862, excerpt: "Il y a un spectacle plus grand que la mer, c'est le ciel; il y a un spectacle plus grand que le ciel, c'est l'intérieur de l'âme. Faire le poème de la conscience humaine, ne fût-ce qu'à propos d'un seul homme, ce serait fondre toutes les épopées dans une épopée supérieure et définitive." },
    { id: 'comte-de-monte-cristo', title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', year: 1844, excerpt: "Le 24 février 1815, la vigie de Notre-Dame de la Garde signala le trois-mâts le Pharaon, venant de Smyrne, Trieste et Naples. Comme d'habitude, un pilote côtier partit aussitôt du port, rasa le château d'If, et alla aborder le bâtiment entre le cap de Morgiou et l'île de Rion." },
    { id: 'madame-bovary', title: 'Madame Bovary', author: 'Gustave Flaubert', year: 1857, excerpt: "Nous étions à l'étude, quand le Proviseur entra, suivi d'un nouveau habillé en bourgeois et d'un garçon de classe qui portait un grand pupitre. Ceux qui dormaient se réveillèrent, et chacun se leva comme surpris dans son travail." },
    { id: 'germinal', title: 'Germinal', author: 'Émile Zola', year: 1885, excerpt: "Dans la plaine rase, sous la nuit sans étoiles, d'une obscurité et d'une épaisseur d'encre, un homme suivait seul la grande route de Marchiennes à Montsou, dix kilomètres de pavé coupant tout droit, à travers les champs de betteraves." },
  ],
  de: [
    { id: 'faust', title: 'Faust: Der Tragödie erster Teil', author: 'Johann Wolfgang von Goethe', year: 1808, excerpt: "Habe nun, ach! Philosophie, Juristerei und Medizin, und leider auch Theologie durchaus studiert, mit heißem Bemühn. Da steh ich nun, ich armer Tor, und bin so klug als wie zuvor. Heiße Magister, heiße Doktor gar, und ziehe schon an die zehen Jahr herauf, herab und quer und krumm meine Schüler an der Nase herum." },
    { id: 'buddenbrooks', title: 'Buddenbrooks', author: 'Thomas Mann', year: 1901, excerpt: "Was ist das, was ist das, fragte Tony... Was war das nur für ein langweiliger Katechismus? Es handelte sich um die vier Ursachen des Aristoteles, die sie auswendig lernen mussten, obgleich keiner von ihnen hätte sagen können, wozu das nütze sei." },
    { id: 'verwandlung', title: 'Die Verwandlung', author: 'Franz Kafka', year: 1915, excerpt: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch." },
  ],
  pt: [
    { id: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899, excerpt: "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da Lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos pode ser que não fossem inteiramente maus." },
    { id: 'os-maias', title: 'Os Maias', author: 'Eça de Queirós', year: 1888, excerpt: "A casa que os Maias vieram habitar em Lisboa, no outono de 1875, era conhecida na vizinhança da rua de São Francisco de Sales pela Casa do Ramalhete, ou simplesmente o Ramalhete. Algures, havia de ter havido, decorando um portão, esse velho ramo de flores de pedra que lhe dera o nome." },
  ],
  it: [
    { id: 'divine-comedy', title: 'La Divina Commedia', author: 'Dante Alighieri', year: 1320, excerpt: "Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura, ché la diritta via era smarrita. Ahi quanto a dir qual era è cosa dura esta selva selvaggia e aspra e forte che nel pensier rinova la paura!" },
    { id: 'promessi-sposi', title: 'I Promessi Sposi', author: 'Alessandro Manzoni', year: 1827, excerpt: "Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene non interrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi, e a prender corso e figura di fiume, tra un promontorio a destra, e un'ampia costiera dall'altra parte." },
  ],
  ru: [
    { id: 'war-and-peace', title: 'Война и мир', author: 'Лев Толстой', year: 1869, excerpt: "Ну что, mon prince, Гéнуа и Лукка — поместья фамилии Бонапарте. Нет, я вас предупреждаю, если вы мне не скажете, что у нас война, если вы ещё позволите себе защищать все гадости и ужасы этого Антихриста — право, я вас не знаю, вы уж не друг мой." },
    { id: 'crime-and-punishment', title: 'Преступление и наказание', author: 'Фёдор Достоевский', year: 1866, excerpt: "В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и медленно, как бы в нерешимости, отправился к К-ну мосту." },
    { id: 'fathers-and-sons', title: 'Отцы и дети', author: 'Иван Тургенев', year: 1862, excerpt: "— Что, Петр, не видать еще? — спрашивал 20-го мая 1859 года, выходя без шапки на низкое крылечко постоялого двора на шоссе, барин лет сорока с небольшим, в запыленном пальто и клетчатых панталонах, у своего слуги, молодого и щекастого малого с беловатым пухом на подбородке и маленькими тусклыми глазенками." },
  ],
  uk: [
    { id: 'kobzar', title: 'Кобзар', author: 'Тарас Шевченко', year: 1840, excerpt: "Думи мої, думи мої, лихо мені з вами! Нащо стали на папері сумними рядами? Чом вас вітер не розвіяв в степу, як пилину? Чом вас люди не забули, як глупу дитину?" },
    { id: 'tini-zabutykh', title: 'Тіні забутих предків', author: 'Михайло Коцюбинський', year: 1911, excerpt: "Вони жили по різних боках потока і не знали одне одного. По той бік мешкали Гутенюки — рід старий, міцний, з діда-прадіда осілий в тій ущелині. По сей — Палійчуки, прийшлі, але вже давно пообростали корінням у чорну гуцульську землю." },
  ],
  ar: [
    { id: '1001-nights', title: 'ألف ليلة وليلة', author: 'مجهول', year: 800, excerpt: "قالت شهرزاد: بلغني أيها الملك السعيد أنه كان في قديم الزمان وسالف العصر والأوان ملك من ملوك ساسان بجزائر الهند والصين صاحب جند وأعوان وخدم وحشم. وكان له ولدان أحدهما كبير والآخر صغير وكانا فارسين بطلين وكان الكبير منهما أفرس من الصغير." },
    { id: 'muqaddimah', title: 'المقدمة', author: 'ابن خلدون', year: 1377, excerpt: "اعلم أن فن التاريخ فن عزيز المذهب جم الفوائد شريف الغاية إذ هو يوقفنا على أحوال الماضين من الأمم في أخلاقهم والأنبياء في سيرهم والملوك في دولهم وسياستهم حتى تتم فائدة الاقتداء في ذلك لمن يرومه في أحوال الدين والدنيا." },
  ],
  he: [
    { id: 'agno-heart', title: 'סיפור פשוט', author: 'ש"י עגנון', year: 1935, excerpt: "בעיר שלנו היה נהוג שכל בחור שהגיע לפרקו ביקש לו כלה ממשפחה מכובדת. ובימים ההם הייתה בלומה נינג'ל מן הבנות המבוקשות, שכן אביה היה סוחר ישר ונאמן ואמה עקרת הבית המסורה לבעלה ולילדיה." },
  ],
  ja: [
    { id: 'genji', title: '源氏物語', author: '紫式部', year: 1008, excerpt: "いづれの御時にか、女御、更衣あまた侍ひ給ひける中に、いとやむごとなき際にはあらぬが、すぐれて時めき給ふありけり。はじめより我はと思ひ上がり給へる御方々、めざましきものにおとしめ嫉み給ふ。" },
    { id: 'wagahai', title: '吾輩は猫である', author: '夏目漱石', year: 1905, excerpt: "吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。" },
    { id: 'kokoro', title: 'こころ', author: '夏目漱石', year: 1914, excerpt: "私はその人を常に先生と呼んでいた。だからここでもただ先生と書くだけで本名は打ち明けない。これは世間を憚かる遠慮というよりも、その方が私にとって自然だからである。私はその人の記憶を呼び起すごとに、すぐ「先生」といいたくなる。" },
  ],
  zh: [
    { id: 'dream-red', title: '红楼梦', author: '曹雪芹', year: 1791, excerpt: "满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借通灵之说，撰此石头记一书也，故曰甄士隐云云。" },
    { id: 'journey-west', title: '西游记', author: '吴承恩', year: 1592, excerpt: "混沌未分天地乱，茫茫渺渺无人见。自从盘古破鸿蒙，开辟从兹清浊辨。覆载群生仰至仁，发明万物皆成善。欲知造化会元功，须看西游释厄传。" },
  ],
  ko: [
    { id: 'chunhyangjeon', title: '춘향전', author: '작자 미상', year: 1754, excerpt: "숙종대왕 즉위 초에 성덕이 넓으시어 성자 성손은 계계승승하사 금고옥촉이 요순시절이라. 이때에 전라도 남원부에 월매라 하는 기생이 있으되 절색이요 재주 있어 남원 고을에 제일이라." },
    { id: 'guunmong', title: '구운몽', author: '김만중', year: 1687, excerpt: "천하에 명산이 다섯 있으니, 동쪽에는 동악 태산이, 서쪽에는 서악 화산이, 남쪽에는 남악 형산이, 북쪽에는 북악 항산이, 이들 가운데엔 중악 숭산이 있다. 오악 중에 오직 형산이 중국에서 가장 멀어 구의산이 그 남쪽에 있고, 동정호가 그 북쪽에 있고, 소상강 물이 그 세 면을 두르고 있으니, 가장 빼어나게 아름다운 곳이다." },
  ],
  hi: [
    { id: 'pariksha-guru', title: 'परीक्षा गुरु', author: 'लाला श्रीनिवासदास', year: 1882, excerpt: "लाला मदनमोहन एक अंग्रेजी सौदागर की दुकान में नई-नई फैशन का अंग्रेजी असबाब देख रहे हैं। लाला ब्रजकिशोर, मुंशी चुन्नीलाल और मास्टर शिंभूदयाल उनके साथ हैं। मदनमोहन ने सौदागर से पूछा कि काँच की यह बड़ी जोड़ी उनको पसंद है, इसकी कीमत क्या है?" },
    { id: 'chandrakanta-santati', title: 'चन्द्रकान्ता सन्तति', author: 'देवकीनन्दन खत्री', year: 1896, excerpt: "नौगढ़ के राजा सुरेन्द्रसिंह के लड़के वीरेन्द्रसिंह की शादी विजयगढ़ के महाराज जयसिंह की लड़की चन्द्रकान्ता के साथ हो गई। बहुतों की यह राय हुई कि महाराज शिवदत्त का दिल अभी साफ नहीं हुआ, इसलिए अब उनको कैद में ही रखना मुनासिब है।" },
  ],
  tr: [
    { id: 'araba-sevdasi', title: 'Araba Sevdası', author: 'Recaizade Mahmut Ekrem', year: 1896, excerpt: "Kağıthane yollarında araba kullanma hevesiyle en şiddetli poyrazın karşısında tiril tiril titreyen Bihruz Bey, yazın da otuz otuz beş derece sıcak günlerde Çamlıca, Haydarpaşa, Fenerbahçesi yollarında en kızgın güneşin altında haşım haşım haşlanır, ama bu sıkıntıyı kendisine en büyük zevk sayardı." },
    { id: 'cezmi', title: 'Cezmi', author: 'Namık Kemal', year: 1880, excerpt: "Cezmi bu keşâkeşler, bu tereddütlerle düşman karşısına gelip de tüfenk alevi, kılıç parıltısı nazarında cevelan etmeye başlayınca muharebeyi ne daha arzusu kuvvede iken tasavvur ettiği gibi bir safa ve ikbal mesiresi hâlinde gördü, ne de bir bela-yı mübrim cevelangâhı hükmünde buldu." },
  ],
  pl: [
    { id: 'pan-tadeusz', title: 'Pan Tadeusz', author: 'Adam Mickiewicz', year: 1834, excerpt: "Litwo! Ojczyzno moja! ty jesteś jak zdrowie; Ile cię trzeba cenić, ten tylko się dowie, Kto cię stracił. Dziś piękność twą w całej ozdobie Widzę i opisuję, bo tęsknię po tobie." },
    { id: 'lalka', title: 'Lalka', author: 'Bolesław Prus', year: 1890, excerpt: "Pani Stawska wróciła do domu z robotą w kieszeni i kawałkiem chleba pod pachą. Twarz miała bladą i sfrasowaną, bo robotę przyniosła trudną, a chleb drogi. Za to suknia na niej była prawie nowa i kapelusz całkiem nowy." },
  ],
  nl: [
    { id: 'max-havelaar', title: 'Max Havelaar', author: 'Multatuli', year: 1860, excerpt: "Ik ben makelaar in koffie, en woon op de Lauriergracht No 37. Het is mijn gewoonte niet, romans te schrijven of zulke dingen, en het heeft lang geduurd, eer ik er toe overging een paar rijën op te zetten." },
  ],
  sv: [
    { id: 'nils', title: 'Nils Holgerssons underbara resa', author: 'Selma Lagerlöf', year: 1906, excerpt: "Det var en gång en pojke. Han var ungefär fjorton år gammal, lång och ranglig och flaxhårig. Han var inte bra till mycket. Han hade lust för ingenting annat än att äta och sova. Och förutom det hade han lust att supa och sova." },
  ],
  no: [
    { id: 'peer-gynt', title: 'Peer Gynt', author: 'Henrik Ibsen', year: 1867, excerpt: "Peer, du lyver! Åse, din mor, sto og lyttet, hørte alt. Peer Gynt stod midt i en løgn og visste at han løy, og leste han likevel videre som om ingenting hadde hendt, med den selvsikre mine som bare en uforskammet gutt kan ha." },
  ],
  da: [
    { id: 'andersen-fairy', title: 'Eventyr, fortalte for Børn', author: 'H.C. Andersen', year: 1835, excerpt: "Der kom en soldat marcherende hen ad landevejen: én, to! én, to! Han havde sin tornyster på ryggen og en sabel ved siden, for han havde været i krigen, og nu skulle han hjem. Så mødte han en gammel heks på landevejen." },
  ],
  fi: [
    { id: 'kalevala', title: 'Kalevala', author: 'Elias Lönnrot', year: 1835, excerpt: "Mieleni minun tekevi, aivoni ajattelevi lähteäni laulamahan, saa'ani sanelemahan, sukuvirttä suoltamahan, lajivirttä laulamahan. Sanat suussani sulavat, puhe'et putoelevat, kielelleni kerkiävät, hampahilleni hajoovat." },
  ],
  cs: [
    { id: 'babicka', title: 'Babička', author: 'Božena Němcová', year: 1855, excerpt: "V jiném čase nebýval by nikdo zvláště šťasten, žije-li blíže Starého Bělidla neb statek samotného rolníka, ale babičce bylo dobře. Tam byl svět, jaký milovala — prostí lidé, poctivá práce, průzračná voda a šumící stromy." },
  ],
  hu: [
    { id: 'egri-csillagok', title: 'Egri csillagok', author: 'Géza Gárdonyi', year: 1901, excerpt: "Gergely ott ült a körtefa tövében, és bámult a levegőbe. Szép, napfényes délelőtt volt. A méhek dongtak a virágok körül, és messzire zümmögött a szél, de Gergely nem látott, nem hallott semmit, csak ült és gondolkodott." },
  ],
  el: [
    { id: 'odyssey', title: 'Οδύσσεια', author: 'Όμηρος', year: -800, excerpt: "Άνδρα μοι έννεπε, Μούσα, πολύτροπον, ός μάλα πολλά πλάγχθη, επεί Τροίης ιερόν πτολίεθρον έπερσε· πολλών δ' ανθρώπων ίδεν άστεα και νόον έγνω, πολλά δ' ό γ' εν πόντω πάθεν άλγεα όν κατά θυμόν." },
  ],
  th: [
    { id: 'ramakien', title: 'รามเกียรติ์', author: 'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลก', year: 1798, excerpt: "เมื่อนั้น องค์พระรามผู้ทรงฤทธิ์ ได้ยินสียงโห่ร้องกึกก้อง ทรงพระโกรธดั่งไฟกัลป์ จึงมีพระบัญชาแก่พระลักษมณ์ ให้เตรียมพลเสนาออกรบ" },
  ],
  vi: [
    { id: 'kieu', title: 'Truyện Kiều', author: 'Nguyễn Du', year: 1820, excerpt: "Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau. Trải qua một cuộc bể dâu, Những điều trông thấy mà đau đớn lòng." },
    { id: 'bai-luyen-tieng-viet', title: 'Bài luyện tiếng Việt', author: 'TypeForge', year: 2026, excerpt: "Mỗi ngày, chúng ta dành một ít thời gian luyện gõ bằng cả hai tay. Những câu ngắn, rõ ràng giúp ngón tay ghi nhớ vị trí phím, tăng độ chính xác và tạo nhịp gõ đều đặn." },
  ],
  id: [
    { id: 'bumi-manusia', title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', year: 1980, excerpt: "Panggil saja aku Minke. Nama itu diberikan orang kepadaku, entah mengapa. Sejak kecil aku sudah terbiasa dipanggil begitu. Kalau diingat-ingat sekarang, nama itu agak aneh juga: seperti nama kuda pacuan." },
    { id: 'latihan-bahasa-indonesia', title: 'Latihan Bahasa Indonesia', author: 'TypeForge', year: 2026, excerpt: "Setiap hari, luangkan beberapa menit untuk berlatih mengetik dengan kedua tangan. Kalimat yang jelas membantu jari mengingat letak tombol, meningkatkan ketepatan, dan membangun irama yang nyaman." },
  ],
  ms: [
    { id: 'hikayat', title: 'Hikayat Hang Tuah', author: 'Pengarang Anonim', year: 1700, excerpt: "Maka tersebutlah perkataan seorang Melayu yang bernama Hang Mahmud, ia pun pergi mendapatkan Bendahara itu. Maka kata Hang Mahmud: Tuanku, patik ini datang hendak memohonkan kasih Tuanku, kerana anakanda patik ini sudah besar." },
  ],
  tl: [
    { id: 'noli-me-tangere', title: 'Noli Me Tangere', author: 'José Rizal', year: 1887, excerpt: "Sa huling mga araw ng Oktubre, nang hapon, ang Kapitan Tiago ay nagbibigay ng isang piging na tinatawag sa wikang Tagalog na handaan. Sa kabila ng pahayag na ito, ipinaalam sa lahat ng kaibigan, at ng mga kaibigan ng mga kaibigan, at ng mga kaibigan ng mga kaibigan ng mga kaibigan." },
  ],
  sw: [
    { id: 'utendi-wa-tambuka', title: 'Utendi wa Tambuka', author: 'Bwana Mwengo', year: 1728, excerpt: "Bismillahi naanza, kwa jina la Mola wangu, nikiomba msaada wake, katika kazi hii yangu. Ninasifu na kumheshimu, Mwenyezi Mungu wa kweli, ambaye ametupa uhai, na baraka zake za hali." },
  ],
};
