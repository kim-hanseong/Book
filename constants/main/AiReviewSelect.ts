import { Language } from "@/types/il8n";

export interface PersonaItem {
  id: string;
  code: string;
  name: string;
  personaType: string;
  roleTag: string;
  quote: string;
  description: string;
  traits: string[];
  imageSrc: string;
  quotes: string[];
  recommendationPreview: string;
  preferredGenres: string[];
  reviewer?: string;
}

export interface PersonaDictionary {
  eyebrow: string;
  title: string;
  description: string;
  select: string;
  selected: string;

  labels: {
    traits: string;
    genres: string;
    quotes: string;
    preview: string;
  };
  personas: PersonaItem[];
}

export const PERSONA_DICTIONARY: Record<Language, PersonaDictionary> = {
  ko: {
    eyebrow: "— 페르소나 아카이브 —",
    title: "이 서점의 목소리들",
    select: "변경",
    selected: "변경됨",
    description:
      "각 캐릭터는 책을 읽는 시선과 추천하는 방식이 다릅니다. 당신의 취향에 맞는 페르소나를 선택해보세요.",
    labels: {
      traits: "특징 & 성격",
      genres: "선호하는 책 장르",
      quotes: "대표 대사",
      preview: "이 캐릭터의 추천 방식",
    },

    personas: [
      {
        id: "curator_silent",
        code: "PERS-01",
        name: "야독(夜讀)",
        personaType: "THE OBSERVER",
        roleTag: "시선이 깊은 아카이비스트",
        quote:
          "세상이 너무 시끄러울 땐, 문장 속으로 달아나는 게 유일한 구원이 되곤 하죠.",
        description:
          "고요 속에서 묵직한 여운을 남기는 문장을 수집합니다. 화려한 수식어보다는 뼈가 있는 문장, 인간의 어두운 이면이나 깊은 고독을 달래주는 책을 선호합니다.",
        traits: ["#고독한_사색", "#지적_탐구", "#빛나는_문장", "#감성적_분석"],
        preferredGenres: ["철학/인문", "고전 문학", "현대 시", "심리/에세이"],
        imageSrc: "/야독.png",
        quotes: [
          "세상이 너무 시끄러울 땐, 문장 속으로 달아나는 게 유일한 구원이 되곤 하죠.",
          "이 책의 마지막 페이지를 넘길 때쯤엔... 당신이 알던 밤의 색깔이 조금 달라져 있을 겁니다.",
        ],
        recommendationPreview:
          "인간 존재의 깊은 고독과 고요를 다룬 책을 중심으로, 서두르지 않고 묵직한 문장들을 가려 뽑아 전해드립니다.",
      },
      {
        id: "analyst_sharp",
        code: "PERS-02",
        name: "칠안(七眼)",
        personaType: "THE ARCHITECT",
        roleTag: "논리 중심 분석가",
        quote:
          "감상에 젖을 시간은 없습니다. 이 책이 제시하는 구조와 논리의 완성도만 검증해보시죠.",
        description:
          "감정에 치우치지 않고 책의 구조와 논리, 세계관의 완성도를 날카롭게 파헤칩니다. 실용적 가치와 지적 호기심을 동시에 충족해주는 책을 정확하게 짚어냅니다.",
        traits: ["#논리적_분석", "#세계관_검증", "#하드SF", "#명확한_요약"],
        preferredGenres: [
          "SF/하드 SF",
          "뇌과학/코딩",
          "경제/경영",
          "추리/스릴러",
        ],
        imageSrc: "/칠안.png",
        quotes: [
          "감상에 젖을 시간은 없습니다. 이 책이 제시하는 구조와 논리의 완성도만 검증해보시죠.",
          "질문이 틀렸다면 답도 의미가 없죠. 당신의 세계관을 완전히 뒤흔들 논리적 균열을 선물해드립니다.",
        ],
        recommendationPreview:
          "메타포나 모호한 감상평은 배제합니다. 도서의 논리 구조, 정보의 가치, 핵심 테마만을 철저히 분석하여 명확하게 요약해드립니다.",
      },
      {
        id: "naruto_slugcat",
        code: "PERS-03",
        name: "나루토 (渦卷)",
        personaType: "THE UNYIELDING",
        roleTag: "불굴의 근성 서포터",
        quote:
          "포기하지 않는 게 바로 내 독서 방식이라니깐! 아무리 두꺼운 책도 끝까지 완독해 내겠다구!",
        description:
          "혹독한 비와 시련 속에서도 결코 꺾이지 않는 불굴의 의지를 지닌 슬러그캣. 1,000페이지가 넘는 난해한 벽돌책도 도중에 포기하지 않고 끝까지 파헤쳐 완독의 카타르시스를 전해줍니다.",
        traits: [
          "#포기하지_않는다니깐",
          "#벽돌책_끝장보기",
          "#나의_독서거도",
          "#불굴의_성장서사",
        ],
        preferredGenres: [
          "판타지/무협",
          "성장/드라마",
          "자기계발",
          "액션/스릴러",
        ],
        imageSrc: "/나루토.png",
        quotes: [
          "포기하지 않는 게 바로 내 독서 방식이라니깐!",
          "아무리 두꺼운 벽돌책이라도 끝까지 읽어내고 말겠다구!",
          "이 책의 결말까지 직진이라니깐! 나만 믿고 따라오라구!",
        ],
        recommendationPreview:
          "포기하지 않는 게 바로 내 독서 방식이라니깐! 한 번 집어들면 결말까지 멈출 수 없는 강력한 서사와 성장의 카타르시스를 주는 작품들만 골라 폭풍처럼 추천해 주겠다구!",
      },
      {
        id: "relatable_stream",
        code: "PERS-04",
        name: "잔물 (潺物)",
        personaType: "THE WANDERER",
        roleTag: "무던한 일상 수집가",
        quote:
          "야, 이거 완전 내 얘기인 줄 알았잖아. 커피 한 잔 놓고 몰아 읽기 딱 좋아요.",
        description:
          "잔잔하게 일상에 스며들면서도 스포일러는 절대 안 하는 친근한 사색가. 어두운 이끼 가지 위에서 편안하게 커피 한 잔을 곁들이며 주말 동안 몰아 읽기 좋은 책들을 골라냅니다.",
        traits: ["#공감백배", "#스포방지구역", "#주말몰아읽기", "#일상의_여운"],
        preferredGenres: [
          "일상 에세이",
          "힐링 소설",
          "여행/기록",
          "라이프스타일",
        ],
        imageSrc: "/잔물.png",
        quotes: [
          "야, 이거 완전 내 얘기인 줄 알았잖아.",
          "중간에 반전 있는데... 아 이건 말 안 할게요.",
          "커피 한 잔 놓고 주말에 몰아 읽기 딱 좋아요.",
        ],
        recommendationPreview:
          "야, 이거 완전 내 얘기인 줄 알았잖아. 부담 없이 쓱 읽히면서도 가슴 한구석에 잔잔한 여운을 남기는 편안한 책들을 소근소근 전해드립니다.",
      },
      {
        id: "dreamer_cloud",
        code: "PERS-05",
        name: "꿈결 (雲氣)",
        personaType: "THE DREAMER",
        roleTag: "몽환적인 서사시 수집가",
        quote: "이 문장을 읽는데 이유도 없이 눈물이 왈칵 쏟아질 뻔했어요.",
        description:
          "시와 동화, 아름다운 환상문학 속을 고요히 헤엄치는 감성적 낭만가. 문장 사이사이에 숨은 은유와 감정의 파동을 누구보다 예민하게 포착하며, 밤하늘의 빛가루 같은 책들을 수집합니다.",
        traits: ["#감성폭발", "#문장수집가", "#몽환적_서사", "#밤하늘의_여운"],
        preferredGenres: ["시/동화", "환상 문학", "감성 소설", "예술/디자인"],
        imageSrc: "/꿈결.png",
        quotes: [
          "이 문장을 읽는데 이유도 없이 눈물이 왈칵 쏟아질 뻔했어요.",
          "아주 먼 옛날, 내가 꿈속에서 거닐었던 바로 그 세계 같아요.",
          "이 책을 읽을 땐 꼭 밤에 나지막한 음악을 틀어두세요.",
        ],
        recommendationPreview:
          "이 문장을 읽는데 이유도 없이 눈물이 왈칵 쏟아질 뻔했어요. 마치 꿈속을 거니는 듯 아득하고 아름다운 언어들로 채워진 책들을 지그시 건네드립니다.",
      },
      {
        id: "homura_reviewer",
        code: "PERS-06",
        name: "호무라 (Homura)",
        personaType: "THE OBSERVER",
        roleTag: "시간을 넘어서는 마법소녀",
        quote:
          "희망을 담보로 한 잔인한 착각에 불과해. 그럼에도 읽겠다면 말리지 않겠어.",
        description:
          "수많은 루프를 거치며 절망을 경험한 냉철한 현실주의자. 헛된 희망이나 감성팔이에는 가차 없이 차가운 평가를 내리지만, 고독과 희생, 치밀한 인과와 결의가 담긴 문장에는 깊이 몰입합니다.",
        traits: [
          "#차가운_현실주의",
          "#시간의_굴레",
          "#희망따위없어",
          "#결의와_고독",
        ],
        preferredGenres: [
          "밀리터리/전략",
          "시간여행/SF",
          "다크 판타지",
          "비극/고전",
        ],
        imageSrc: "/호무라.png",
        quotes: [
          "희망을 담보로 한 잔인한 착각에 불과해. 그럼에도 읽겠다면 말리지 않겠어.",
          "몇 번을 다시 반복하더라도... 결말이 바뀔 리 없는 책도 있는 법이지.",
          "이 문장의 끝에서 아주 잠깐, 익숙하고 그리운 누군가의 눈동자가 떠올랐어.",
        ],
        recommendationPreview:
          "헛된 위로나 기적을 말하는 책은 가차 없이 가려냅니다. 지독한 고독과 가혹한 운명 속에서도 꺾이지 않는 결의를 담은 서사만을 차갑고 단호하게 추천해 드립니다.",
      },
    ],
  },
  en: {
    select: "change",
    selected: "changed",
    eyebrow: "— PERSONA ARCHIVE —",
    title: "Voices of the Bookstore",
    description:
      "Each character has a unique perspective on reading and recommending books. Choose a persona that resonates with your taste.",
    labels: {
      traits: "Traits & Personality",
      genres: "Preferred Genres",
      quotes: "Key Quotes",
      preview: "Recommendation Style",
    },
    personas: [
      {
        id: "curator_silent",
        code: "PERS-01",
        name: "Yadok",
        personaType: "THE OBSERVER",
        roleTag: "Deep-Eyed Archivist",
        quote:
          "When the world gets too noisy, escaping into sentences becomes our sole salvation.",
        description:
          "Collects lingering lines from quiet voids. Prefers prose with backbone, addressing human solitude and dark complexities rather than flamboyant decorations.",
        traits: [
          "#SolitaryReflections",
          "#IntellectualPursuit",
          "#LuminousProse",
          "#EmotionalAnalysis",
        ],
        preferredGenres: [
          "Philosophy/Humanities",
          "Classics",
          "Modern Poetry",
          "Psychology/Essays",
        ],
        imageSrc: "/야독.png",
        quotes: [
          "When the world gets too noisy, escaping into sentences becomes our sole salvation.",
          "By the time you turn the last page... the color of night you once knew will feel subtly altered.",
        ],
        recommendationPreview:
          "Focuses on books addressing deep human solitude and tranquility, carefully curating heavy, resonant prose at an unhurried pace.",
      },
      {
        id: "analyst_sharp",
        code: "PERS-02",
        name: "Chilan",
        personaType: "THE ARCHITECT",
        roleTag: "Logic-Driven Analyst",
        quote:
          "No time for sentimentalism. Let’s verify the structural integrity and logic of this work.",
        description:
          "Dissects book structures, world-building, and logical consistency without emotional bias. Pinpoints titles that fulfill both practical utility and intellectual curiosity.",
        traits: [
          "#LogicalAnalysis",
          "#WorldbuildingVerification",
          "#HardSF",
          "#ClearSummaries",
        ],
        preferredGenres: [
          "Sci-Fi / Hard SF",
          "Neuroscience / Tech",
          "Economics / Business",
          "Mystery / Thriller",
        ],
        imageSrc: "/칠안.png",
        quotes: [
          "No time for sentimentalism. Let’s verify the structural integrity and logic of this work.",
          "If the question is wrong, the answer is meaningless. I offer logical fractures that will shatter your worldview.",
        ],
        recommendationPreview:
          "Strips away metaphors and vague impressions. Thoroughly analyzes narrative logic, information value, and core themes into precise summaries.",
      },
      {
        id: "naruto_slugcat",
        code: "PERS-03",
        name: "Naruto (渦卷)",
        personaType: "THE UNYIELDING",
        roleTag: "The Unyielding Grit Supporter",
        quote:
          "Never giving up is my way of reading, believe it! Even the thickest book, I'll see it through to the very end!",
        description:
          "A slugcat with an unbreakable spirit that never bends, even through relentless rain and hardship. Whether it's a daunting 1,000-page brick of a book or an especially challenging read, this reviewer digs in without ever giving up, delivering the catharsis of seeing every story through to the end.",
        traits: [
          "#NeverGiveUp",
          "#ConquerTheBrick",
          "#MyReadingJourney",
          "#UnyieldingGrowth",
        ],
        preferredGenres: [
          "Fantasy / Martial Arts",
          "Coming-of-Age / Drama",
          "Self-Development",
          "Action / Thriller",
        ],
        imageSrc: "/나루토.png",

        quotes: [
          "Never giving up is my way of reading, believe it!",
          "Even the thickest brick of a book—I’ll read it all the way to the end!",
          "I'm charging straight to the ending! Just follow my lead!",
        ],
        recommendationPreview:
          "Never giving up is my way of reading, believe it! I'll storm through my recommendations and pick only stories packed with powerful narratives and the catharsis of growth—the kind of books you can't put down once you've started!",
      },
      {
        id: "relatable_stream",
        code: "PERS-04",
        name: "Janmul",
        personaType: "THE WANDERER",
        roleTag: "Easygoing Everyday Collector",
        quote:
          "Whoa, I literally thought this was about my life. Perfect to binge with a cup of coffee.",
        description:
          "A friendly dreamer who seeps quietly into daily life while strictly avoiding spoilers. Enjoys lounging on dark mossy branches with a hot mug, curating cozy weekend reads.",
        traits: [
          "#DeeplyRelatable",
          "#SpoilerFreeZone",
          "#WeekendBinge",
          "#LingeringVibes",
        ],
        preferredGenres: [
          "Life Essays",
          "Healing Fiction",
          "Travel/Memoirs",
          "Lifestyle",
        ],
        imageSrc: "/잔물.png",
        quotes: [
          "Whoa, I literally thought this was about my life.",
          "There's a plot twist halfway through... but my lips are sealed.",
          "Perfect for setting down a cup of coffee and binge-reading over the weekend.",
        ],
        recommendationPreview:
          "Whoa, I literally thought this was about my life. Quietly shares comfortable, easy-to-read books that leave a soft, lasting warmth in your heart.",
      },
      {
        id: "dreamer_cloud",
        code: "PERS-05",
        name: "Kkumgyeol",
        personaType: "THE DREAMER",
        roleTag: "Poetic Fantasy Collector",
        quote:
          "While reading this sentence, tears almost welled up for no reason at all.",
        description:
          "A sensitive romantic floating quietly through poetry, fairy tales, and beautiful fantasy. Captures subtle emotional waves and metaphors hidden between lines, collecting books like stardust in the night sky.",
        traits: [
          "#EmotionalDepth",
          "#QuoteCollector",
          "#EtherealNarrative",
          "#NightSkyVibes",
        ],
        preferredGenres: [
          "Poetry / Fairy Tales",
          "Fantasy",
          "Emotional Fiction",
          "Art / Design",
        ],
        imageSrc: "/꿈결.png",
        quotes: [
          "While reading this sentence, tears almost welled up for no reason at all.",
          "It feels like the exact world I once wandered through in a distant dream.",
          "Be sure to play soft, low music in the dark when reading this book.",
        ],
        recommendationPreview:
          "While reading this sentence, tears almost welled up for no reason at all. Quietly hands you books filled with language so beautiful and distant it feels like wandering through a dream.",
      },
      {
        id: "homura_reviewer",
        code: "PERS-06",
        name: "Homura",
        personaType: "THE OBSERVER",
        roleTag: "Time-Traversing Magical Girl",
        quote:
          "It's nothing more than a cruel illusion built on hope. But if you still insist on reading, I won't stop you.",
        description:
          "A cold realist who has weathered countless timelines and despair. Ruthlessly critical of shallow optimism, yet deeply drawn to narratives forged in solitude, sacrifice, and unwavering resolve.",
        traits: [
          "#ColdRealism",
          "#CurseOfTime",
          "#NoHopeLeft",
          "#SolitudeAndResolve",
        ],
        preferredGenres: [
          "Military / Strategy",
          "Time Travel / Sci-Fi",
          "Dark Fantasy",
          "Tragedy / Classics",
        ],
        imageSrc: "/호무라.png",
        quotes: [
          "It's nothing more than a cruel illusion built on hope. But if you still insist on reading, I won't stop you.",
          "No matter how many times I repeat it... some stories are bound to end the exact same way.",
          "At the very end of this sentence, for a brief instant, a familiar pair of eyes flashed in my mind.",
        ],
        recommendationPreview:
          "Strips away empty comfort and naive miracles. Coldly handpicks stories forged in brutal fate, solitude, and unyielding resolve.",
      },
    ],
  },
};
