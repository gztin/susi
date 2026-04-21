const fs = require('fs').promises;
const path = require('path');

// 基於英文資料生成日文和中文翻譯
class TranslationScraper {
  constructor() {
    this.englishData = null;
    this.translations = {
      // Pokemon 名稱翻譯對照表（部分示例）
      pokemon: {
        'Charizard': { ja: 'リザードン', 'zh-TW': '噴火龍' },
        'Blastoise': { ja: 'カメックス', 'zh-TW': '水箭龜' },
        'Venusaur': { ja: 'フシギバナ', 'zh-TW': '妙蛙花' },
        'Pikachu': { ja: 'ピカチュウ', 'zh-TW': '皮卡丘' },
        'Raichu': { ja: 'ライチュウ', 'zh-TW': '雷丘' },
        'Squirtle': { ja: 'ゼニガメ', 'zh-TW': '傑尼龜' },
        'Wartortle': { ja: 'カメール', 'zh-TW': '卡咪龜' },
        'Charmander': { ja: 'ヒトカゲ', 'zh-TW': '小火龍' },
        'Charmeleon': { ja: 'リザード', 'zh-TW': '火恐龍' },
        'Bulbasaur': { ja: 'フシギダネ', 'zh-TW': '妙蛙種子' },
        'Ivysaur': { ja: 'フシギソウ', 'zh-TW': '妙蛙草' },
        'Caterpie': { ja: 'キャタピー', 'zh-TW': '綠毛蟲' },
        'Metapod': { ja: 'トランセル', 'zh-TW': '鐵甲蛹' },
        'Butterfree': { ja: 'バタフリー', 'zh-TW': '巴大蝶' },
        'Weedle': { ja: 'ビードル', 'zh-TW': '獨角蟲' },
        'Kakuna': { ja: 'コクーン', 'zh-TW': '鐵殼蛹' },
        'Beedrill': { ja: 'スピアー', 'zh-TW': '大針蜂' },
        'Pidgey': { ja: 'ポッポ', 'zh-TW': '波波' },
        'Pidgeotto': { ja: 'ピジョン', 'zh-TW': '比比鳥' },
        'Pidgeot': { ja: 'ピジョット', 'zh-TW': '大比鳥' },
        'Rattata': { ja: 'コラッタ', 'zh-TW': '小拉達' },
        'Raticate': { ja: 'ラッタ', 'zh-TW': '拉達' },
        'Spearow': { ja: 'オニスズメ', 'zh-TW': '烈雀' },
        'Fearow': { ja: 'オニドリル', 'zh-TW': '大嘴雀' },
        'Ekans': { ja: 'アーボ', 'zh-TW': '阿柏蛇' },
        'Arbok': { ja: 'アーボック', 'zh-TW': '阿柏怪' },
        'Sandshrew': { ja: 'サンド', 'zh-TW': '穿山鼠' },
        'Sandslash': { ja: 'サンドパン', 'zh-TW': '穿山王' },
        'Nidoran♀': { ja: 'ニドラン♀', 'zh-TW': '尼多蘭♀' },
        'Nidorina': { ja: 'ニドリーナ', 'zh-TW': '尼多娜' },
        'Nidoqueen': { ja: 'ニドクイン', 'zh-TW': '尼多后' },
        'Nidoran♂': { ja: 'ニドラン♂', 'zh-TW': '尼多蘭♂' },
        'Nidorino': { ja: 'ニドリーノ', 'zh-TW': '尼多力諾' },
        'Nidoking': { ja: 'ニドキング', 'zh-TW': '尼多王' },
        'Clefairy': { ja: 'ピッピ', 'zh-TW': '皮皮' },
        'Clefable': { ja: 'ピクシー', 'zh-TW': '皮可西' },
        'Vulpix': { ja: 'ロコン', 'zh-TW': '六尾' },
        'Ninetales': { ja: 'キュウコン', 'zh-TW': '九尾' },
        'Jigglypuff': { ja: 'プリン', 'zh-TW': '胖丁' },
        'Wigglytuff': { ja: 'プクリン', 'zh-TW': '胖可丁' },
        'Zubat': { ja: 'ズバット', 'zh-TW': '超音蝠' },
        'Golbat': { ja: 'ゴルバット', 'zh-TW': '大嘴蝠' },
        'Oddish': { ja: 'ナゾノクサ', 'zh-TW': '走路草' },
        'Gloom': { ja: 'クサイハナ', 'zh-TW': '臭臭花' },
        'Vileplume': { ja: 'ラフレシア', 'zh-TW': '霸王花' },
        'Paras': { ja: 'パラス', 'zh-TW': '派拉斯' },
        'Parasect': { ja: 'パラセクト', 'zh-TW': '派拉斯特' },
        'Venonat': { ja: 'コンパン', 'zh-TW': '毛球' },
        'Venomoth': { ja: 'モルフォン', 'zh-TW': '摩魯蛾' },
        'Diglett': { ja: 'ディグダ', 'zh-TW': '地鼠' },
        'Dugtrio': { ja: 'ダグトリオ', 'zh-TW': '三地鼠' },
        'Meowth': { ja: 'ニャース', 'zh-TW': '喵喵' },
        'Persian': { ja: 'ペルシアン', 'zh-TW': '貓老大' },
        'Psyduck': { ja: 'コダック', 'zh-TW': '可達鴨' },
        'Golduck': { ja: 'ゴルダック', 'zh-TW': '哥達鴨' },
        'Mankey': { ja: 'マンキー', 'zh-TW': '猴怪' },
        'Primeape': { ja: 'オコリザル', 'zh-TW': '火爆猴' },
        'Growlithe': { ja: 'ガーディ', 'zh-TW': '卡蒂狗' },
        'Arcanine': { ja: 'ウインディ', 'zh-TW': '風速狗' },
        'Poliwag': { ja: 'ニョロモ', 'zh-TW': '蚊香蝌蚪' },
        'Poliwhirl': { ja: 'ニョロゾ', 'zh-TW': '蚊香君' },
        'Poliwrath': { ja: 'ニョロボン', 'zh-TW': '蚊香泳士' },
        'Abra': { ja: 'ケーシィ', 'zh-TW': '凱西' },
        'Kadabra': { ja: 'ユンゲラー', 'zh-TW': '勇基拉' },
        'Alakazam': { ja: 'フーディン', 'zh-TW': '胡地' },
        'Machop': { ja: 'ワンリキー', 'zh-TW': '腕力' },
        'Machoke': { ja: 'ゴーリキー', 'zh-TW': '豪力' },
        'Machamp': { ja: 'カイリキー', 'zh-TW': '怪力' },
        'Bellsprout': { ja: 'マダツボミ', 'zh-TW': '喇叭芽' },
        'Weepinbell': { ja: 'ウツドン', 'zh-TW': '口呆花' },
        'Victreebel': { ja: 'ウツボット', 'zh-TW': '大食花' },
        'Tentacool': { ja: 'メノクラゲ', 'zh-TW': '瑪瑙水母' },
        'Tentacruel': { ja: 'ドククラゲ', 'zh-TW': '毒刺水母' },
        'Geodude': { ja: 'イシツブテ', 'zh-TW': '小拳石' },
        'Graveler': { ja: 'ゴローン', 'zh-TW': '隆隆石' },
        'Golem': { ja: 'ゴローニャ', 'zh-TW': '隆隆岩' },
        'Ponyta': { ja: 'ポニータ', 'zh-TW': '小火馬' },
        'Rapidash': { ja: 'ギャロップ', 'zh-TW': '烈焰馬' },
        'Slowpoke': { ja: 'ヤドン', 'zh-TW': '呆呆獸' },
        'Slowbro': { ja: 'ヤドラン', 'zh-TW': '呆殼獸' },
        'Magnemite': { ja: 'コイル', 'zh-TW': '小磁怪' },
        'Magneton': { ja: 'レアコイル', 'zh-TW': '三合一磁怪' },
        'Farfetch\'d': { ja: 'カモネギ', 'zh-TW': '大蔥鴨' },
        'Doduo': { ja: 'ドードー', 'zh-TW': '嘟嘟' },
        'Dodrio': { ja: 'ドードリオ', 'zh-TW': '嘟嘟利' },
        'Seel': { ja: 'パウワウ', 'zh-TW': '小海獅' },
        'Dewgong': { ja: 'ジュゴン', 'zh-TW': '白海獅' },
        'Grimer': { ja: 'ベトベター', 'zh-TW': '臭泥' },
        'Muk': { ja: 'ベトベトン', 'zh-TW': '臭臭泥' },
        'Shellder': { ja: 'シェルダー', 'zh-TW': '大舌貝' },
        'Cloyster': { ja: 'パルシェン', 'zh-TW': '刺甲貝' },
        'Gastly': { ja: 'ゴース', 'zh-TW': '鬼斯' },
        'Haunter': { ja: 'ゴースト', 'zh-TW': '鬼斯通' },
        'Gengar': { ja: 'ゲンガー', 'zh-TW': '耿鬼' },
        'Onix': { ja: 'イワーク', 'zh-TW': '大岩蛇' },
        'Drowzee': { ja: 'スリープ', 'zh-TW': '催眠貘' },
        'Hypno': { ja: 'スリーパー', 'zh-TW': '引夢貘人' },
        'Krabby': { ja: 'クラブ', 'zh-TW': '大鉗蟹' },
        'Kingler': { ja: 'キングラー', 'zh-TW': '巨鉗蟹' },
        'Voltorb': { ja: 'ビリリダマ', 'zh-TW': '霹靂電球' },
        'Electrode': { ja: 'マルマイン', 'zh-TW': '頑皮雷彈' },
        'Exeggcute': { ja: 'タマタマ', 'zh-TW': '蛋蛋' },
        'Exeggutor': { ja: 'ナッシー', 'zh-TW': '椰蛋樹' },
        'Cubone': { ja: 'カラカラ', 'zh-TW': '卡拉卡拉' },
        'Marowak': { ja: 'ガラガラ', 'zh-TW': '嘎啦嘎啦' },
        'Hitmonlee': { ja: 'サワムラー', 'zh-TW': '飛腿郎' },
        'Hitmonchan': { ja: 'エビワラー', 'zh-TW': '快拳郎' },
        'Lickitung': { ja: 'ベロリンガ', 'zh-TW': '大舌頭' },
        'Koffing': { ja: 'ドガース', 'zh-TW': '瓦斯彈' },
        'Weezing': { ja: 'マタドガス', 'zh-TW': '雙彈瓦斯' },
        'Rhyhorn': { ja: 'サイホーン', 'zh-TW': '獨角犀牛' },
        'Rhydon': { ja: 'サイドン', 'zh-TW': '鑽角犀獸' },
        'Chansey': { ja: 'ラッキー', 'zh-TW': '吉利蛋' },
        'Tangela': { ja: 'モンジャラ', 'zh-TW': '蔓藤怪' },
        'Kangaskhan': { ja: 'ガルーラ', 'zh-TW': '袋獸' },
        'Horsea': { ja: 'タッツー', 'zh-TW': '墨海馬' },
        'Seadra': { ja: 'シードラ', 'zh-TW': '海刺龍' },
        'Goldeen': { ja: 'トサキント', 'zh-TW': '角金魚' },
        'Seaking': { ja: 'アズマオウ', 'zh-TW': '金魚王' },
        'Staryu': { ja: 'ヒトデマン', 'zh-TW': '海星星' },
        'Starmie': { ja: 'スターミー', 'zh-TW': '寶石海星' },
        'Mr. Mime': { ja: 'バリヤード', 'zh-TW': '魔牆人偶' },
        'Scyther': { ja: 'ストライク', 'zh-TW': '飛天螳螂' },
        'Jynx': { ja: 'ルージュラ', 'zh-TW': '迷唇姐' },
        'Electabuzz': { ja: 'エレブー', 'zh-TW': '電擊獸' },
        'Magmar': { ja: 'ブーバー', 'zh-TW': '鴨嘴火獸' },
        'Pinsir': { ja: 'カイロス', 'zh-TW': '凱羅斯' },
        'Tauros': { ja: 'ケンタロス', 'zh-TW': '肯泰羅' },
        'Magikarp': { ja: 'コイキング', 'zh-TW': '鯉魚王' },
        'Gyarados': { ja: 'ギャラドス', 'zh-TW': '暴鯉龍' },
        'Lapras': { ja: 'ラプラス', 'zh-TW': '拉普拉斯' },
        'Ditto': { ja: 'メタモン', 'zh-TW': '百變怪' },
        'Eevee': { ja: 'イーブイ', 'zh-TW': '伊布' },
        'Vaporeon': { ja: 'シャワーズ', 'zh-TW': '水伊布' },
        'Jolteon': { ja: 'サンダース', 'zh-TW': '雷伊布' },
        'Flareon': { ja: 'ブースター', 'zh-TW': '火伊布' },
        'Porygon': { ja: 'ポリゴン', 'zh-TW': '多邊獸' },
        'Omanyte': { ja: 'オムナイト', 'zh-TW': '菊石獸' },
        'Omastar': { ja: 'オムスター', 'zh-TW': '多刺菊石獸' },
        'Kabuto': { ja: 'カブト', 'zh-TW': '化石盔' },
        'Kabutops': { ja: 'カブトプス', 'zh-TW': '鐮刀盔' },
        'Aerodactyl': { ja: 'プテラ', 'zh-TW': '化石翼龍' },
        'Snorlax': { ja: 'カビゴン', 'zh-TW': '卡比獸' },
        'Articuno': { ja: 'フリーザー', 'zh-TW': '急凍鳥' },
        'Zapdos': { ja: 'サンダー', 'zh-TW': '閃電鳥' },
        'Moltres': { ja: 'ファイヤー', 'zh-TW': '火焰鳥' },
        'Dratini': { ja: 'ミニリュウ', 'zh-TW': '迷你龍' },
        'Dragonair': { ja: 'ハクリュー', 'zh-TW': '哈克龍' },
        'Dragonite': { ja: 'カイリュー', 'zh-TW': '快龍' },
        'Mewtwo': { ja: 'ミュウツー', 'zh-TW': '超夢' },
        'Mew': { ja: 'ミュウ', 'zh-TW': '夢幻' }
      },
      
      // 訓練家卡片翻譯
      trainer: {
        'Professor Oak': { ja: 'オーキド博士', 'zh-TW': '大木博士' },
        'Bill': { ja: 'マサキ', 'zh-TW': '正輝' },
        'Computer Search': { ja: 'パソコン通信', 'zh-TW': '電腦搜尋' },
        'Potion': { ja: 'キズぐすり', 'zh-TW': '傷藥' },
        'Super Potion': { ja: 'いいキズぐすり', 'zh-TW': '好傷藥' },
        'Energy Removal': { ja: 'エネルギー除去', 'zh-TW': '能量移除' },
        'Super Energy Removal': { ja: 'スーパーエネルギー除去', 'zh-TW': '超級能量移除' },
        'Switch': { ja: 'ポケモン交代', 'zh-TW': '寶可夢交換' },
        'Gust of Wind': { ja: '突風', 'zh-TW': '突風' },
        'PlusPower': { ja: 'プラスパワー', 'zh-TW': '力量強化' },
        'Defender': { ja: 'ディフェンダー', 'zh-TW': '防禦者' }
      },
      
      // 技能名稱翻譯
      attacks: {
        'Fire Spin': { ja: 'かえんほうしゃ', 'zh-TW': '火焰旋渦' },
        'Flamethrower': { ja: 'かえんほうしゃ', 'zh-TW': '噴射火焰' },
        'Slash': { ja: 'きりさく', 'zh-TW': '劈開' },
        'Ember': { ja: 'ひのこ', 'zh-TW': '火花' },
        'Thunderbolt': { ja: '10まんボルト', 'zh-TW': '十萬伏特' },
        'Thunder': { ja: 'かみなり', 'zh-TW': '打雷' },
        'Agility': { ja: 'でんこうせっか', 'zh-TW': '高速移動' },
        'Quick Attack': { ja: 'でんこうせっか', 'zh-TW': '電光一閃' },
        'Tackle': { ja: 'たいあたり', 'zh-TW': '撞擊' },
        'Scratch': { ja: 'ひっかく', 'zh-TW': '抓' },
        'Bite': { ja: 'かみつく', 'zh-TW': '咬住' },
        'Surf': { ja: 'なみのり', 'zh-TW': '衝浪' },
        'Hydro Pump': { ja: 'ハイドロポンプ', 'zh-TW': '水炮' },
        'Water Gun': { ja: 'みずでっぽう', 'zh-TW': '水槍' },
        'Bubble Beam': { ja: 'バブルこうせん', 'zh-TW': '泡沫光線' },
        'Vine Whip': { ja: 'つるのムチ', 'zh-TW': '藤鞭' },
        'Razor Leaf': { ja: 'はっぱカッター', 'zh-TW': '飛葉快刀' },
        'Solar Beam': { ja: 'ソーラービーム', 'zh-TW': '日光束' },
        'Petal Dance': { ja: 'はなびらのまい', 'zh-TW': '花瓣舞' }
      },
      
      // 特性名稱翻譯
      abilities: {
        'Energy Burn': { ja: 'エネルギーバーン', 'zh-TW': '能量燃燒' },
        'Rain Dance': { ja: 'あまごい', 'zh-TW': '求雨' },
        'Damage Swap': { ja: 'ダメージスワップ', 'zh-TW': '傷害轉移' },
        'Pokemon Power': { ja: 'ポケパワー', 'zh-TW': '寶可夢之力' }
      },

      // 稀有度翻譯
      rarity: {
        'Common': { ja: 'コモン', 'zh-TW': '普通' },
        'Uncommon': { ja: 'アンコモン', 'zh-TW': '不常見' },
        'Rare': { ja: 'レア', 'zh-TW': '稀有' },
        'Rare Holo': { ja: 'レアホロ', 'zh-TW': '稀有閃卡' },
        'Promo': { ja: 'プロモ', 'zh-TW': '宣傳卡' }
      },

      // 卡片類型翻譯
      supertypes: {
        'Pokémon': { ja: 'ポケモン', 'zh-TW': '寶可夢' },
        'Trainer': { ja: 'トレーナー', 'zh-TW': '訓練家' },
        'Energy': { ja: 'エネルギー', 'zh-TW': '能量' }
      },

      // 子類型翻譯
      subtypes: {
        'Basic': { ja: 'たね', 'zh-TW': '基本' },
        'Stage 1': { ja: '1進化', 'zh-TW': '1階進化' },
        'Stage 2': { ja: '2進化', 'zh-TW': '2階進化' },
        'Supporter': { ja: 'サポート', 'zh-TW': '支援者' },
        'Item': { ja: 'グッズ', 'zh-TW': '物品' },
        'Stadium': { ja: 'スタジアム', 'zh-TW': '競技場' },
        'Special': { ja: '特殊', 'zh-TW': '特殊' }
      },

      // 能量類型翻譯
      energyTypes: {
        'Fire': { ja: '炎', 'zh-TW': '火' },
        'Water': { ja: '水', 'zh-TW': '水' },
        'Grass': { ja: '草', 'zh-TW': '草' },
        'Lightning': { ja: '雷', 'zh-TW': '雷' },
        'Psychic': { ja: '超', 'zh-TW': '超' },
        'Fighting': { ja: '闘', 'zh-TW': '格鬥' },
        'Darkness': { ja: '悪', 'zh-TW': '惡' },
        'Metal': { ja: '鋼', 'zh-TW': '鋼' },
        'Dragon': { ja: 'ドラゴン', 'zh-TW': '龍' },
        'Colorless': { ja: '無', 'zh-TW': '無色' },
        'Fairy': { ja: 'フェアリー', 'zh-TW': '妖精' }
      },

      // 常見攻擊描述翻譯
      attackTexts: {
        'Discard 2 Energy cards attached to': { 
          ja: 'に付いているエネルギーカードを2枚捨てる', 
          'zh-TW': '丟棄附加在身上的2張能量卡' 
        },
        'in order to use this attack': { 
          ja: 'この技を使うため', 
          'zh-TW': '才能使用這個攻擊' 
        },
        'Flip a coin': { 
          ja: 'コインを投げる', 
          'zh-TW': '擲硬幣' 
        },
        'If heads': { 
          ja: '表なら', 
          'zh-TW': '如果正面' 
        },
        'If tails': { 
          ja: '裏なら', 
          'zh-TW': '如果反面' 
        },
        'this attack does nothing': { 
          ja: 'この技は失敗', 
          'zh-TW': '這個攻擊無效' 
        },
        'Choose 1 of your opponent\'s Pokémon': { 
          ja: '相手のポケモンを1匹選ぶ', 
          'zh-TW': '選擇對手的1隻寶可夢' 
        },
        'This attack does': { 
          ja: 'この技は', 
          'zh-TW': '這個攻擊造成' 
        },
        'damage to': { 
          ja: 'のダメージを与える', 
          'zh-TW': '點傷害給' 
        }
      },

      // 常見特性描述翻譯
      abilityTexts: {
        'As often as you like during your turn': { 
          ja: '自分の番に何度でも', 
          'zh-TW': '在你的回合中可以任意次數' 
        },
        'before your attack': { 
          ja: '攻撃する前に', 
          'zh-TW': '在攻擊前' 
        },
        'you may turn all Energy attached to': { 
          ja: 'に付いているすべてのエネルギーを', 
          'zh-TW': '你可以將附加在身上的所有能量轉換為' 
        },
        'into Fire Energy for the rest of the turn': { 
          ja: 'そのターンの間、炎エネルギーにする', 
          'zh-TW': '火能量，直到回合結束' 
        },
        'This power can\'t be used if': { 
          ja: 'この力は使えない', 
          'zh-TW': '如果處於以下狀態，此能力無法使用' 
        },
        'is Asleep, Confused, or Paralyzed': { 
          ja: 'が眠り、混乱、麻痺状態の時', 
          'zh-TW': '睡眠、混亂或麻痺狀態' 
        }
      },
      
      // 系列名稱翻譯
      sets: {
        // 經典系列 (1999-2002)
        'Base': { ja: 'ポケットモンスター', 'zh-TW': '基本系列' },
        'Jungle': { ja: 'ポケモンジャングル', 'zh-TW': '叢林' },
        'Fossil': { ja: 'ポケモン化石の秘密', 'zh-TW': '化石' },
        'Team Rocket': { ja: 'ロケット団', 'zh-TW': '火箭隊' },
        'Gym Heroes': { ja: 'ポケモンジム', 'zh-TW': '道館英雄' },
        'Gym Challenge': { ja: 'ポケモンジム拡張パック', 'zh-TW': '道館挑戰' },
        'Neo Genesis': { ja: '金・銀 新世界へ...', 'zh-TW': '新世代' },
        'Neo Discovery': { ja: '金・銀 ポケモンを発見!', 'zh-TW': '新發現' },
        'Neo Revelation': { ja: '金・銀 めざめる超能力', 'zh-TW': '新啟示' },
        'Neo Destiny': { ja: '金・銀 闇、そして光へ...', 'zh-TW': '新命運' },
        'Base Set 2': { ja: 'ポケットモンスター第2弾', 'zh-TW': '基本系列2' },
        'Legendary Collection': { ja: 'レジェンドコレクション', 'zh-TW': '傳奇收藏' },
        'Expedition Base Set': { ja: '遠征ベースセット', 'zh-TW': '遠征基本系列' },
        'Southern Islands': { ja: 'サザンアイランド', 'zh-TW': '南方群島' },
        'Wizards Black Star Promos': { ja: 'ウィザーズブラックスタープロモ', 'zh-TW': '威世智黑星宣傳卡' },
        
        // 最新系列 (2024-2026)
        'Perfect Order': { ja: 'パーフェクトオーダー', 'zh-TW': '完美秩序' },
        'Ascended Heroes': { ja: 'アセンデッドヒーローズ', 'zh-TW': '昇華英雄' },
        'Phantasmal Flames': { ja: 'ファントムフレイム', 'zh-TW': '幻影烈焰' },
        'Mega Evolution': { ja: 'メガシンカ', 'zh-TW': '超級進化' },
        'White Flare': { ja: 'ホワイトフレア', 'zh-TW': '白色閃焰' },
        'Black Bolt': { ja: 'ブラックボルト', 'zh-TW': '黑色雷電' },
        'Destined Rivals': { ja: 'デスティニーライバル', 'zh-TW': '宿命對手' },
        'Journey Together': { ja: 'ジャーニートゥゲザー', 'zh-TW': '共同旅程' },
        'Prismatic Evolutions': { ja: 'プリズマティックエボリューション', 'zh-TW': '稜鏡進化' },
        'Surging Sparks': { ja: 'サージングスパーク', 'zh-TW': '激流火花' },
        'Stellar Crown': { ja: 'ステラークラウン', 'zh-TW': '星辰王冠' },
        'Shrouded Fable': { ja: 'シュラウデッドフェイブル', 'zh-TW': '神秘傳說' },
        'Twilight Masquerade': { ja: 'トワイライトマスカレード', 'zh-TW': '黃昏假面舞會' },
        'Temporal Forces': { ja: 'テンポラルフォース', 'zh-TW': '時空之力' },
        'Paldean Fates': { ja: 'パルデアの運命', 'zh-TW': '帕底亞命運' },
        'Paradox Rift': { ja: 'パラドックスリフト', 'zh-TW': '悖論裂縫' },
        'Obsidian Flames': { ja: 'オブシディアンフレイム', 'zh-TW': '黑曜石烈焰' },
        'Paldea Evolved': { ja: 'パルデア進化', 'zh-TW': '帕底亞進化' },
        'Scarlet & Violet': { ja: 'スカーレット&バイオレット', 'zh-TW': '朱紫' },
        'Crown Zenith': { ja: 'クラウンゼニス', 'zh-TW': '王冠頂點' },
        'Silver Tempest': { ja: 'シルバーテンペスト', 'zh-TW': '銀色風暴' },
        'Lost Origin': { ja: 'ロストオリジン', 'zh-TW': '失落起源' },
        'Pokemon GO': { ja: 'ポケモンGO', 'zh-TW': '寶可夢GO' },
        'Astral Radiance': { ja: 'アストラルレディアンス', 'zh-TW': '星輝光芒' },
        'Brilliant Stars': { ja: 'ブリリアントスター', 'zh-TW': '璀璨星辰' },
        'Fusion Strike': { ja: 'フュージョンストライク', 'zh-TW': '融合突擊' },
        'Evolving Skies': { ja: 'エボルビングスカイ', 'zh-TW': '進化天空' },
        'Chilling Reign': { ja: 'チリングレイン', 'zh-TW': '寒冰統治' },
        'Battle Styles': { ja: 'バトルスタイル', 'zh-TW': '戰鬥風格' }
      },
      
      // 屬性翻譯
      types: {
        'Fire': { ja: '炎', 'zh-TW': '火' },
        'Water': { ja: '水', 'zh-TW': '水' },
        'Grass': { ja: '草', 'zh-TW': '草' },
        'Lightning': { ja: '雷', 'zh-TW': '雷' },
        'Psychic': { ja: '超', 'zh-TW': '超' },
        'Fighting': { ja: '闘', 'zh-TW': '格鬥' },
        'Darkness': { ja: '悪', 'zh-TW': '惡' },
        'Metal': { ja: '鋼', 'zh-TW': '鋼' },
        'Dragon': { ja: 'ドラゴン', 'zh-TW': '龍' },
        'Colorless': { ja: '無', 'zh-TW': '無色' },
        'Fairy': { ja: 'フェアリー', 'zh-TW': '妖精' }
      }
    };
  }

  async loadEnglishData() {
    try {
      const dataPath = path.join(__dirname, '../frontend/data/pokemonEN.json');
      const data = await fs.readFile(dataPath, 'utf8');
      this.englishData = JSON.parse(data);
      console.log('✅ 英文資料載入成功');
      return true;
    } catch (error) {
      console.error('❌ 無法載入英文資料:', error.message);
      return false;
    }
  }

  translateCard(card, targetLang) {
    const translatedCard = { ...card };
    
    // 翻譯卡片名稱
    const pokemonTranslation = this.translations.pokemon[card.name];
    const trainerTranslation = this.translations.trainer[card.name];
    
    if (pokemonTranslation && pokemonTranslation[targetLang]) {
      translatedCard.name = pokemonTranslation[targetLang];
    } else if (trainerTranslation && trainerTranslation[targetLang]) {
      translatedCard.name = trainerTranslation[targetLang];
    }
    
    // 翻譯超級類型
    if (card.supertype) {
      const supertypeTranslation = this.translations.supertypes[card.supertype];
      if (supertypeTranslation && supertypeTranslation[targetLang]) {
        translatedCard.supertype = supertypeTranslation[targetLang];
      }
    }
    
    // 翻譯子類型
    if (card.subtypes && card.subtypes.length > 0) {
      translatedCard.subtypes = card.subtypes.map(subtype => {
        const subtypeTranslation = this.translations.subtypes[subtype];
        return subtypeTranslation && subtypeTranslation[targetLang] ? subtypeTranslation[targetLang] : subtype;
      });
    }
    
    // 翻譯屬性
    if (card.types && card.types.length > 0) {
      translatedCard.types = card.types.map(type => {
        const typeTranslation = this.translations.types[type];
        return typeTranslation && typeTranslation[targetLang] ? typeTranslation[targetLang] : type;
      });
    }
    
    // 翻譯稀有度
    if (card.rarity) {
      const rarityTranslation = this.translations.rarity[card.rarity];
      if (rarityTranslation && rarityTranslation[targetLang]) {
        translatedCard.rarity = rarityTranslation[targetLang];
      }
    }
    
    // 翻譯技能
    if (card.attacks && card.attacks.length > 0) {
      translatedCard.attacks = card.attacks.map(attack => {
        const translatedAttack = { ...attack };
        
        // 翻譯技能名稱
        const attackTranslation = this.translations.attacks[attack.name];
        if (attackTranslation && attackTranslation[targetLang]) {
          translatedAttack.name = attackTranslation[targetLang];
        }
        
        // 翻譯能量消耗
        if (attack.cost && attack.cost.length > 0) {
          translatedAttack.cost = attack.cost.map(energyType => {
            const energyTranslation = this.translations.energyTypes[energyType];
            return energyTranslation && energyTranslation[targetLang] ? energyTranslation[targetLang] : energyType;
          });
        }
        
        // 翻譯技能描述
        if (attack.text) {
          translatedAttack.text = this.translateText(attack.text, targetLang, card.name);
        }
        
        return translatedAttack;
      });
    }
    
    // 翻譯特性
    if (card.abilities && card.abilities.length > 0) {
      translatedCard.abilities = card.abilities.map(ability => {
        const translatedAbility = { ...ability };
        
        // 翻譯特性名稱
        const abilityTranslation = this.translations.abilities[ability.name];
        if (abilityTranslation && abilityTranslation[targetLang]) {
          translatedAbility.name = abilityTranslation[targetLang];
        }
        
        // 翻譯特性類型
        if (ability.type) {
          const typeTranslation = this.translations.abilities[ability.type];
          if (typeTranslation && typeTranslation[targetLang]) {
            translatedAbility.type = typeTranslation[targetLang];
          }
        }
        
        // 翻譯特性描述
        if (ability.text) {
          translatedAbility.text = this.translateText(ability.text, targetLang, card.name);
        }
        
        return translatedAbility;
      });
    }
    
    // 翻譯弱點
    if (card.weaknesses && card.weaknesses.length > 0) {
      translatedCard.weaknesses = card.weaknesses.map(weakness => {
        const translatedWeakness = { ...weakness };
        const typeTranslation = this.translations.types[weakness.type];
        if (typeTranslation && typeTranslation[targetLang]) {
          translatedWeakness.type = typeTranslation[targetLang];
        }
        return translatedWeakness;
      });
    }
    
    // 翻譯抗性
    if (card.resistances && card.resistances.length > 0) {
      translatedCard.resistances = card.resistances.map(resistance => {
        const translatedResistance = { ...resistance };
        const typeTranslation = this.translations.types[resistance.type];
        if (typeTranslation && typeTranslation[targetLang]) {
          translatedResistance.type = typeTranslation[targetLang];
        }
        return translatedResistance;
      });
    }
    
    // 翻譯系列名稱
    if (card.set && card.set.name) {
      const setTranslation = this.translations.sets[card.set.name];
      if (setTranslation && setTranslation[targetLang]) {
        translatedCard.set = { ...card.set };
        translatedCard.set.name = setTranslation[targetLang];
      }
    }
    
    // 更新語言標記
    translatedCard.language = targetLang;
    
    // 生成新的 ID
    const langPrefix = targetLang === 'ja' ? 'jp' : 'tw';
    translatedCard.id = `${langPrefix}-${card.id}`;
    
    return translatedCard;
  }

  // 新增文字翻譯方法
  translateText(text, targetLang, pokemonName = '') {
    if (!text) return text;
    
    let translatedText = text;
    
    // 翻譯攻擊描述中的常見片段
    Object.entries(this.translations.attackTexts).forEach(([english, translations]) => {
      if (translations[targetLang]) {
        translatedText = translatedText.replace(new RegExp(english, 'gi'), translations[targetLang]);
      }
    });
    
    // 翻譯特性描述中的常見片段
    Object.entries(this.translations.abilityTexts).forEach(([english, translations]) => {
      if (translations[targetLang]) {
        translatedText = translatedText.replace(new RegExp(english, 'gi'), translations[targetLang]);
      }
    });
    
    // 翻譯寶可夢名稱在描述中的出現
    if (pokemonName) {
      const pokemonTranslation = this.translations.pokemon[pokemonName];
      if (pokemonTranslation && pokemonTranslation[targetLang]) {
        translatedText = translatedText.replace(new RegExp(pokemonName, 'gi'), pokemonTranslation[targetLang]);
      }
    }
    
    // 翻譯能量類型在描述中的出現
    Object.entries(this.translations.energyTypes).forEach(([english, translations]) => {
      if (translations[targetLang]) {
        translatedText = translatedText.replace(new RegExp(`${english} Energy`, 'gi'), `${translations[targetLang]}エネルギー`);
      }
    });
    
    return translatedText;
  }

  async generateTranslations() {
    if (!this.englishData) {
      console.error('❌ 請先載入英文資料');
      return;
    }

    console.log('🔄 開始生成翻譯資料...');

    const languages = ['ja', 'zh-TW'];
    const typeMapping = {
      'ja': {
        'Fire': '炎', 'Water': '水', 'Grass': '草', 'Lightning': '雷',
        'Psychic': '超', 'Fighting': '闘', 'Darkness': '悪', 'Metal': '鋼',
        'Dragon': 'ドラゴン', 'Colorless': '無', 'Fairy': 'フェアリー'
      },
      'zh-TW': {
        'Fire': '火系', 'Water': '水系', 'Grass': '草系', 'Lightning': '雷系',
        'Psychic': '超能系', 'Fighting': '格鬥系', 'Darkness': '惡系', 'Metal': '鋼系',
        'Dragon': '龍系', 'Colorless': '無色系', 'Fairy': '妖精系'
      }
    };

    for (const lang of languages) {
      console.log(`📝 生成 ${lang} 翻譯...`);
      
      const translatedData = {
        lastUpdated: new Date().toISOString(),
        language: lang,
        cards: {}
      };

      // 初始化屬性分類
      Object.values(typeMapping[lang]).forEach(type => {
        translatedData.cards[type] = {};
      });

      // 翻譯每張卡片
      Object.entries(this.englishData.cards).forEach(([englishType, sets]) => {
        const translatedType = typeMapping[lang][englishType] || (lang === 'ja' ? '無' : '無色系');
        
        Object.entries(sets).forEach(([setName, cards]) => {
          if (!translatedData.cards[translatedType][setName]) {
            translatedData.cards[translatedType][setName] = [];
          }
          
          cards.forEach(card => {
            const translatedCard = this.translateCard(card, lang);
            translatedData.cards[translatedType][setName].push(translatedCard);
          });
        });
      });

      // 儲存翻譯資料
      const fileName = lang === 'ja' ? 'pokemonJP.json' : 'pokemonTW.json';
      const filePath = path.join(__dirname, '../frontend/data', fileName);
      await fs.writeFile(filePath, JSON.stringify(translatedData, null, 2), 'utf8');
      
      // 統計
      const stats = this.generateStats(translatedData);
      console.log(`✅ ${lang} 翻譯完成:`);
      console.log(`   總卡片數: ${stats.totalCards}`);
      console.log(`   檔案位置: ${filePath}`);
    }
  }

  generateStats(data) {
    let totalCards = 0;
    Object.values(data.cards).forEach(typeData => {
      Object.values(typeData).forEach(setCards => {
        totalCards += setCards.length;
      });
    });
    return { totalCards };
  }
}

async function main() {
  console.log('🌍 開始生成多語言翻譯資料...');
  
  const scraper = new TranslationScraper();
  
  try {
    const loaded = await scraper.loadEnglishData();
    if (!loaded) {
      console.error('❌ 無法載入英文資料，請先執行英文資料爬取');
      return;
    }
    
    await scraper.generateTranslations();
    
    console.log('');
    console.log('🎉 翻譯完成！');
    console.log('📂 生成的檔案:');
    console.log('  - 日文: frontend/data/pokemonJP.json');
    console.log('  - 繁中: frontend/data/pokemonTW.json');
    console.log('');
    console.log('現在你可以重新啟動 Docker 服務：');
    console.log('  docker-compose restart');
    
  } catch (error) {
    console.error('❌ 翻譯過程中發生錯誤:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TranslationScraper };