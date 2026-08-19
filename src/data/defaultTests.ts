import { TestExam } from '../types';

export const DEFAULT_TESTS: TestExam[] = [
  {
    id: 'grade6-unit1-school',
    title: 'Kiểm tra Thường xuyên Tiếng Anh 6 - Unit 1: My New School & Friends',
    grade: 6,
    unit: 'Unit 1 & 2',
    topic: 'My New School, Friends & Daily Activities',
    description: 'Đánh giá kỹ năng từ vựng đồ dùng học tập, thì Hiện tại đơn, đọc hiểu về trường học và liên kết từ.',
    durationMinutes: 15,
    createdAt: '2026-08-19',
    rounds: {
      multipleChoice: [
        {
          id: 'g6-mcq-1',
          question: 'Listen and choose: "My brother usually ______ judo in the school gym on Tuesdays."',
          options: ['A. plays', 'B. does', 'C. has', 'D. goes'],
          correctAnswer: 1, // B. does judo
          explanation: 'Ta dùng động từ "do" đi với môn võ/hoạt động cá nhân: "do judo", "do karate".',
          audioText: 'My brother usually does judo in the school gym on Tuesdays.',
        },
        {
          id: 'g6-mcq-2',
          question: 'Which word has the underlined part pronounced differently? (Phần phát âm khác)',
          options: ['A. books', 'B. cups', 'C. pencils', 'D. desks'],
          correctAnswer: 2, // C. pencils /z/ while others are /s/
          explanation: '"pencils" có đuôi -s phát âm là /z/, các từ còn lại kết thúc bằng âm vô thanh /k/, /p/ nên phát âm là /s/.',
          audioText: 'books, cups, pencils, desks.',
        },
        {
          id: 'g6-mcq-3',
          question: 'Look at the description: "A room where students can read books and borrow them." What is it?',
          options: ['A. Computer room', 'B. Library', 'C. Cafeteria', 'D. Playground'],
          correctAnswer: 1, // B. Library
          explanation: '"Library" (thư viện) là nơi học sinh đọc và mượn sách.',
          audioText: 'A room where students can read books and borrow them. It is a library.',
        },
        {
          id: 'g6-mcq-4',
          question: 'Choose the best response: "Would you like to have lunch with us at the canteen?" - "______"',
          options: ['A. Yes, I would love to.', 'B. No, I am not.', 'C. You are welcome.', 'D. It is twelve o’clock.'],
          correctAnswer: 0, // A
          explanation: 'Đáp lại lời mời "Would you like to...?", ta dùng "Yes, I would love to" (Vâng, mình rất thích).',
          audioText: 'Would you like to have lunch with us at the canteen? Yes, I would love to.',
        },
      ],
      trueFalse: [
        {
          id: 'g6-tf-1',
          statement: 'In the passage, An’s new school has a large playground with many green trees.',
          isTrue: true,
          passage: 'Hi, I am An. I study at Sunrise Secondary School. My school is very modern and big. It has 30 classrooms, a science lab, a library, and a large playground with many green trees. All students wear uniforms on Mondays and Fridays. I have many new friendly classmates.',
          explanation: 'Đoạn văn có câu: "It has 30 classrooms, a science lab, a library, and a large playground with many green trees."',
        },
        {
          id: 'g6-tf-2',
          statement: 'Students at Sunrise School must wear uniforms every day from Monday to Friday.',
          isTrue: false,
          passage: 'Hi, I am An. I study at Sunrise Secondary School. My school is very modern and big. It has 30 classrooms, a science lab, a library, and a large playground with many green trees. All students wear uniforms on Mondays and Fridays. I have many new friendly classmates.',
          explanation: 'Thông tin trong bài: "All students wear uniforms on Mondays and Fridays" (Chỉ mặc thứ Hai và thứ Sáu, không phải tất cả các ngày).',
        },
        {
          id: 'g6-tf-3',
          statement: 'The word "friendly" describes An’s new classmates.',
          isTrue: true,
          passage: 'Hi, I am An. I study at Sunrise Secondary School. My school is very modern and big. It has 30 classrooms, a science lab, a library, and a large playground with many green trees. All students wear uniforms on Mondays and Fridays. I have many new friendly classmates.',
          explanation: 'Trong bài có câu: "I have many new friendly classmates."',
        },
      ],
      dragDrop: [
        {
          id: 'g6-dd-1',
          title: 'Ghép cặp Từ vựng & Nghĩa tiếng Việt (Vocabulary Matching)',
          instruction: 'Kéo hoặc nhấp chọn các từ vựng tiếng Anh tương ứng với nghĩa tiếng Việt chính xác.',
          pairs: [
            { id: 'p1', left: 'Compass', right: 'Com-pa' },
            { id: 'p2', left: 'Calculator', right: 'Máy tính cầm tay' },
            { id: 'p3', left: 'Pencil sharpener', right: 'Gọt bút chì' },
            { id: 'p4', left: 'Rubber / Eraser', right: 'Cục tẩy' },
          ],
          explanation: 'Compass = Com-pa; Calculator = Máy tính cầm tay; Pencil sharpener = Gọt bút chì; Rubber = Cục tẩy.',
        },
        {
          id: 'g6-dd-2',
          title: 'Ghép Cụm Động từ với Danh từ phù hợp (Collocations)',
          instruction: 'Nối động từ ở cột trái với danh từ/cụm từ thích hợp ở cột phải.',
          pairs: [
            { id: 'p5', left: 'play', right: 'football and chess' },
            { id: 'p6', left: 'do', right: 'homework and judo' },
            { id: 'p7', left: 'have', right: 'breakfast and English lessons' },
            { id: 'p8', left: 'wear', right: 'school uniform' },
          ],
          explanation: 'play + sports/games; do + homework/martial arts; have + meals/subjects; wear + clothes/uniform.',
        },
      ],
      fillBlank: [
        {
          id: 'g6-fb-1',
          title: 'Điền từ thích hợp vào đoạn văn (Fill in the blanks)',
          instruction: 'Điền từ thích hợp vào ô trống [1] và [2] để hoàn thiện đoạn văn miêu tả lớp học.',
          passage: 'Nam is a new student in grade 6. Every morning, he [1] to school by bicycle. At break time, he and his classmates usually [2] badminton in the yard.',
          wordBank: ['goes', 'rides', 'plays', 'play', 'study'],
          blanks: [
            { id: 'b1', blankIndex: 1, acceptedAnswers: ['goes', 'rides'], hint: 'Động từ chỉ di chuyển ở ngôi He (thì hiện tại đơn)' },
            { id: 'b2', blankIndex: 2, acceptedAnswers: ['play'], hint: 'Động từ chơi thể thao (ngôi số nhiều "he and his classmates")' },
          ],
          explanation: '[1] He đi với động từ thêm -es: "goes" to school hoặc "rides". [2] "he and his classmates" là chủ ngữ số nhiều nên động từ nguyên mẫu: "play".',
        },
        {
          id: 'g6-fb-2',
          title: 'Điền giới từ và danh từ phù hợp',
          instruction: 'Hoàn thành 2 câu sau bằng cách điền từ thích hợp vào chỗ trống.',
          passage: '1. My classroom is [1] the second floor.\n2. We have English lessons [2] Mondays and Wednesdays.',
          wordBank: ['on', 'in', 'at', 'under'],
          blanks: [
            { id: 'b3', blankIndex: 1, acceptedAnswers: ['on'], hint: 'Giới từ đi với tầng lầu (the second floor)' },
            { id: 'b4', blankIndex: 2, acceptedAnswers: ['on'], hint: 'Giới từ đi với các ngày trong tuần' },
          ],
          explanation: 'Dùng giới từ "on" cho tầng nhà ("on the second floor") và các ngày trong tuần ("on Mondays").',
        },
      ],
    },
  },
  {
    id: 'grade7-unit2-healthy-community',
    title: 'Kiểm tra Thường xuyên Tiếng Anh 7 - Unit 2 & 3: Healthy Living & Community Service',
    grade: 7,
    unit: 'Unit 2 & 3',
    topic: 'Healthy Living, Volunteer Work & Past Simple Tense',
    description: 'Đánh giá kỹ năng từ vựng sức khỏe, hoạt động tình nguyện, thì Quá khứ đơn, đọc hiểu và nối từ.',
    durationMinutes: 15,
    createdAt: '2026-08-19',
    rounds: {
      multipleChoice: [
        {
          id: 'g7-mcq-1',
          question: 'To avoid having sunburn, you should wear a hat and apply ______ before going out.',
          options: ['A. sunscreen', 'B. eye drops', 'C. painkillers', 'D. warm clothes'],
          correctAnswer: 0, // A
          explanation: 'Để tránh bị cháy nắng (sunburn), chúng ta nên bôi kem chống nắng (sunscreen).',
          audioText: 'To avoid having sunburn, you should wear a hat and apply sunscreen before going out.',
        },
        {
          id: 'g7-mcq-2',
          question: 'Last weekend, our youth club ______ warm clothes and books to children in mountainous areas.',
          options: ['A. donates', 'B. donated', 'C. is donating', 'D. will donate'],
          correctAnswer: 1, // B. donated
          explanation: '"Last weekend" là dấu hiệu của thì Quá khứ đơn (Past Simple), động từ chia ở V2/ed: donated.',
          audioText: 'Last weekend, our youth club donated warm clothes and books to children in mountainous areas.',
        },
        {
          id: 'g7-mcq-3',
          question: 'Choose the word with the different stress pattern (Trọng âm khác các từ còn lại):',
          options: ['A. donate', 'B. provide', 'C. tutor', 'D. collect'],
          correctAnswer: 2, // C. tutor (trọng âm 1), others (trọng âm 2)
          explanation: '"tutor" có trọng âm rơi vào âm tiết thứ 1 (\'tju:tə), còn donate, provide, collect rơi vào âm tiết thứ 2.',
          audioText: 'donate, provide, tutor, collect.',
        },
        {
          id: 'g7-mcq-4',
          question: 'Eating too much fast food and sweet snacks can cause ______ and dental problems.',
          options: ['A. obesity', 'B. fitness', 'C. energy', 'D. allergy'],
          correctAnswer: 0, // A. obesity
          explanation: 'Ăn quá nhiều thức ăn nhanh và đồ ngọt có thể gây béo phì (obesity) và các vấn đề về răng.',
          audioText: 'Eating too much fast food and sweet snacks can cause obesity and dental problems.',
        },
      ],
      trueFalse: [
        {
          id: 'g7-tf-1',
          statement: 'Green Earth club only plants flowers in school gardens.',
          isTrue: false,
          passage: 'Green Earth is a volunteer group founded by middle school students in Da Nang. Every Sunday morning, members clean up litter on local beaches, plant trees along neighborhood streets, and tutor primary school pupils. Last summer, they raised funds to build a mini library for an orphanage.',
          explanation: 'Họ làm nhiều hoạt động: dọn rác bãi biển, trồng cây đường phố, phụ đạo học sinh tiểu học, không chỉ trồng hoa ở trường.',
        },
        {
          id: 'g7-tf-2',
          statement: 'The club raised funds to build a mini library for an orphanage last summer.',
          isTrue: true,
          passage: 'Green Earth is a volunteer group founded by middle school students in Da Nang. Every Sunday morning, members clean up litter on local beaches, plant trees along neighborhood streets, and tutor primary school pupils. Last summer, they raised funds to build a mini library for an orphanage.',
          explanation: 'Thông tin trong bài: "Last summer, they raised funds to build a mini library for an orphanage."',
        },
        {
          id: 'g7-tf-3',
          statement: 'The members of Green Earth club do their community activities on Saturday afternoons.',
          isTrue: false,
          passage: 'Green Earth is a volunteer group founded by middle school students in Da Nang. Every Sunday morning, members clean up litter on local beaches, plant trees along neighborhood streets, and tutor primary school pupils. Last summer, they raised funds to build a mini library for an orphanage.',
          explanation: 'Trong bài nêu rõ: "Every Sunday morning" (Mỗi sáng Chủ nhật), không phải chiều thứ Bảy.',
        },
      ],
      dragDrop: [
        {
          id: 'g7-dd-1',
          title: 'Nối hoạt động tình nguyện với đối tượng thụ hưởng',
          instruction: 'Ghép hoạt động ở cột trái với đối tượng được hỗ trợ ở cột phải.',
          pairs: [
            { id: 'p1', left: 'Tutor math & English', right: 'Homeless children / primary pupils' },
            { id: 'p2', left: 'Donate blood', right: 'Patients in hospitals' },
            { id: 'p3', left: 'Clean up & read books', right: 'Elderly people in nursing homes' },
            { id: 'p4', left: 'Pick up plastic bottles', right: 'Public parks and beaches' },
          ],
          explanation: 'Tutor math & English -> Primary pupils; Donate blood -> Patients; Read books -> Elderly people; Pick up plastic -> Parks & beaches.',
        },
      ],
      fillBlank: [
        {
          id: 'g7-fb-1',
          title: 'Điền dạng đúng của động từ hoặc từ vựng',
          instruction: 'Điền từ thích hợp vào các chỗ trống [1] và [2].',
          passage: 'Yesterday, Minh [1] (feel) tired because he stayed up late. His doctor advised him to drink more water and do regular [2] (exercise).',
          wordBank: ['felt', 'feels', 'exercise', 'exercising'],
          blanks: [
            { id: 'b1', blankIndex: 1, acceptedAnswers: ['felt'], hint: 'Quá khứ của động từ "feel"' },
            { id: 'b2', blankIndex: 2, acceptedAnswers: ['exercise', 'exercises'], hint: 'Từ vựng chỉ việc tập thể dục ("regular exercise")' },
          ],
          explanation: '[1] Yesterday dùng thì quá khứ đơn: felt. [2] Cụm từ "do regular exercise" (tập thể dục đều đặn).',
        },
      ],
    },
  },
  {
    id: 'grade8-unit3-teenagers-countryside',
    title: 'Kiểm tra Thường xuyên Tiếng Anh 8 - Unit 2 & 3: Life in the Countryside & Teen Life',
    grade: 8,
    unit: 'Unit 2 & 3',
    topic: 'Comparative Adverbs, Life in Countryside & Social Media Pressure',
    description: 'Đánh giá trạng từ so sánh hơn, từ vựng đời sống nông thôn, áp lực thanh thiếu niên và kỹ năng đọc hiểu.',
    durationMinutes: 15,
    createdAt: '2026-08-19',
    rounds: {
      multipleChoice: [
        {
          id: 'g8-mcq-1',
          question: 'Farmers in my hometown work ______ during the harvest season than in the rainy season.',
          options: ['A. harder', 'B. more hard', 'C. more hardly', 'D. as hard'],
          correctAnswer: 0, // A. harder (trạng từ ngắn hard -> harder)
          explanation: '"Hard" vừa là tính từ vừa là trạng từ. Dạng so sánh hơn của hard là "harder".',
          audioText: 'Farmers in my hometown work harder during the harvest season than in the rainy season.',
        },
        {
          id: 'g8-mcq-2',
          question: 'Many teenagers suffer from peer ______ because they want to fit in with their classmates.',
          options: ['A. pressure', 'B. stress', 'C. club', 'D. communication'],
          correctAnswer: 0, // A. peer pressure
          explanation: '"Peer pressure" là cụm từ cố định mang nghĩa "áp lực đồng trang lứa".',
          audioText: 'Many teenagers suffer from peer pressure because they want to fit in with their classmates.',
        },
        {
          id: 'g8-mcq-3',
          question: 'During paddy harvest, children love running across the vast ______ fields.',
          options: ['A. green', 'B. golden', 'C. noisy', 'D. polluted'],
          correctAnswer: 1, // B. golden paddy fields
          explanation: 'Mùa thu hoạch lúa, cánh đồng lúa chín vàng ươm ("golden paddy fields").',
          audioText: 'During paddy harvest, children love running across the vast golden fields.',
        },
        {
          id: 'g8-mcq-4',
          question: 'She spoke ______ than usual because she was nervous during the presentation.',
          options: ['A. more fast', 'B. faster', 'C. fastlier', 'D. most fast'],
          correctAnswer: 1, // B. faster
          explanation: 'Trạng từ "fast" có dạng so sánh hơn là "faster".',
          audioText: 'She spoke faster than usual because she was nervous during the presentation.',
        },
      ],
      trueFalse: [
        {
          id: 'g8-tf-1',
          statement: 'Life in the countryside is described as noisy, crowded, and stressful.',
          isTrue: false,
          passage: 'Living in the countryside offers a tranquil atmosphere that city life cannot match. The air is fresh and unpolluted. People live closely together, always willing to lend a helping hand to neighbors. Although rural areas may lack big shopping malls and amusement parks, the peaceful scenery and healthy organic food make it a wonderful place to grow up.',
          explanation: 'Bài đọc miêu tả cuộc sống nông thôn là "tranquil" (yên bình), "fresh and unpolluted", không phải noisy hay stressful.',
        },
        {
          id: 'g8-tf-2',
          statement: 'According to the author, rural neighbors are hospitable and supportive.',
          isTrue: true,
          passage: 'Living in the countryside offers a tranquil atmosphere that city life cannot match. The air is fresh and unpolluted. People live closely together, always willing to lend a helping hand to neighbors. Although rural areas may lack big shopping malls and amusement parks, the peaceful scenery and healthy organic food make it a wonderful place to grow up.',
          explanation: 'Bài viết có câu: "People live closely together, always willing to lend a helping hand to neighbors."',
        },
      ],
      dragDrop: [
        {
          id: 'g8-dd-1',
          title: 'Ghép từ vựng Nông thôn & Tiếng Anh tương ứng',
          instruction: 'Nối từ tiếng Anh ở cột trái với định nghĩa hoặc từ tương đương ở cột phải.',
          pairs: [
            { id: 'p1', left: 'Harvest time', right: 'Mùa gặt / Mùa thu hoạch' },
            { id: 'p2', left: 'Herd cattle / buffalo', right: 'Chăn thả gia súc / trâu bò' },
            { id: 'p3', left: 'Vast pasture', right: 'Đồng cỏ bao la' },
            { id: 'p4', left: 'Brave nomadic life', right: 'Cuộc sống du mục dũng cảm' },
          ],
          explanation: 'Harvest time = Mùa gặt; Herd cattle = Chăn trâu/bò; Vast pasture = Đồng cỏ rộng lớn; Nomadic = Du mục.',
        },
      ],
      fillBlank: [
        {
          id: 'g8-fb-1',
          title: 'Hoàn thành câu so sánh hơn với trạng từ',
          instruction: 'Điền dạng so sánh hơn của trạng từ trong ngoặc vào chỗ trống [1] và [2].',
          passage: '1. In the village, horses can run [1] (fast) than cows.\n2. Lan solved the math problem [2] (easily) than her brother.',
          wordBank: ['faster', 'more easily', 'easilier', 'more fast'],
          blanks: [
            { id: 'b1', blankIndex: 1, acceptedAnswers: ['faster'], hint: 'So sánh hơn của fast' },
            { id: 'b2', blankIndex: 2, acceptedAnswers: ['more easily'], hint: 'So sánh hơn của trạng từ dài easily' },
          ],
          explanation: '[1] fast -> faster. [2] easily là trạng từ dài -> more easily.',
        },
      ],
    },
  },
  {
    id: 'grade9-unit4-past-wonders',
    title: 'Kiểm tra Thường xuyên Tiếng Anh 9 - Unit 4 & 5: Life in the Past & Wonders of Viet Nam',
    grade: 9,
    unit: 'Unit 4 & 5',
    topic: 'Used to, Past Habits, Wishes & Wonders of Viet Nam',
    description: 'Đánh giá cấu trúc used to, câu ước Wish, danh lam thắng cảnh Việt Nam và từ vựng phong tục truyền thống.',
    durationMinutes: 15,
    createdAt: '2026-08-19',
    rounds: {
      multipleChoice: [
        {
          id: 'g9-mcq-1',
          question: 'People in the past ______ rely on handwritten letters because they didn’t have smartphones or internet.',
          options: ['A. used to', 'B. were used to', 'C. are using to', 'D. get used to'],
          correctAnswer: 0, // A. used to
          explanation: '"used to + V-inf" diễn tả một thói quen hoặc tình trạng đã từng xảy ra trong quá khứ và không còn ở hiện tại.',
          audioText: 'People in the past used to rely on handwritten letters because they did not have smartphones or internet.',
        },
        {
          id: 'g9-mcq-2',
          question: 'I wish our school ______ more modern lab equipment for chemistry experiments.',
          options: ['A. has', 'B. had', 'C. will have', 'D. is having'],
          correctAnswer: 1, // B. had
          explanation: 'Cấu trúc câu ước ở hiện tại: S + wish(es) + S + V2/ed (had).',
          audioText: 'I wish our school had more modern lab equipment for chemistry experiments.',
        },
        {
          id: 'g9-mcq-3',
          question: 'Ha Long Bay and Son Doong Cave are recognized as natural ______ of Viet Nam.',
          options: ['A. wonders', 'B. traditions', 'C. habits', 'D. souvenirs'],
          correctAnswer: 0, // A. wonders
          explanation: '"Natural wonders" là kỳ quan thiên nhiên.',
          audioText: 'Ha Long Bay and Son Doong Cave are recognized as natural wonders of Viet Nam.',
        },
        {
          id: 'g9-mcq-4',
          question: 'It is suggested that tourists ______ preserve historical sites and avoid littering.',
          options: ['A. should', 'B. must have', 'C. ought', 'D. would better'],
          correctAnswer: 0, // A. should
          explanation: 'Cấu trúc giả định / đề xuất: It is suggested that S + (should) + V-bare.',
          audioText: 'It is suggested that tourists should preserve historical sites and avoid littering.',
        },
      ],
      trueFalse: [
        {
          id: 'g9-tf-1',
          statement: 'Son Doong Cave was officially explored and confirmed as the largest natural cave in the world.',
          isTrue: true,
          passage: 'Located in Phong Nha - Ke Bang National Park, Quang Binh Province, Son Doong Cave was discovered by a local man named Ho Khanh in 1991. Later in 2009, British cave researchers thoroughly explored it and confirmed it as the largest natural cave passage in the world. Inside the cave, there is an entire jungle ecosystem, subterranean rivers, and enormous stalagmites.',
          explanation: 'Bài viết nêu: "confirmed it as the largest natural cave passage in the world."',
        },
        {
          id: 'g9-tf-2',
          statement: 'Son Doong Cave was discovered in the year 2009 by British tourists.',
          isTrue: false,
          passage: 'Located in Phong Nha - Ke Bang National Park, Quang Binh Province, Son Doong Cave was discovered by a local man named Ho Khanh in 1991. Later in 2009, British cave researchers thoroughly explored it and confirmed it as the largest natural cave passage in the world. Inside the cave, there is an entire jungle ecosystem, subterranean rivers, and enormous stalagmites.',
          explanation: 'Hang được phát hiện năm 1991 bởi người dân địa phương tên Hồ Khanh (năm 2009 là đoàn thám hiểm Anh vào khảo sát).',
        },
      ],
      dragDrop: [
        {
          id: 'g9-dd-1',
          title: 'Ghép Danh thắng Việt Nam với Địa danh Tỉnh/Thành phố',
          instruction: 'Nối các kỳ quan và di sản ở cột trái với địa phương tương ứng ở cột phải.',
          pairs: [
            { id: 'p1', left: 'Trang An Scenic Landscape Complex', right: 'Ninh Binh Province' },
            { id: 'p2', left: 'Hoi An Ancient Town', right: 'Quang Nam Province' },
            { id: 'p3', left: 'Son Doong Cave', right: 'Quang Binh Province' },
            { id: 'p4', left: 'Hue Imperial Citadel', right: 'Thua Thien Hue' },
          ],
          explanation: 'Tràng An (Ninh Bình), Hội An (Quảng Nam), Sơn Đoòng (Quảng Bình), Hoàng thành Huế (Thừa Thiên Huế).',
        },
      ],
      fillBlank: [
        {
          id: 'g9-fb-1',
          title: 'Hoàn thành câu sử dụng used to / wish',
          instruction: 'Điền từ thích hợp vào chỗ trống [1] và [2].',
          passage: '1. My grandfather [1] (use) to travel to work on an old bicycle.\n2. She wishes she [2] (speak) English as fluently as a native speaker.',
          wordBank: ['used', 'use', 'spoke', 'speaks'],
          blanks: [
            { id: 'b1', blankIndex: 1, acceptedAnswers: ['used'], hint: 'Cụm từ "used to"' },
            { id: 'b2', blankIndex: 2, acceptedAnswers: ['spoke'], hint: 'Động từ lùi thì sau wish (quá khứ của speak)' },
          ],
          explanation: '[1] used to + V-inf. [2] Câu ước ở hiện tại lùi thì: speak -> spoke.',
        },
      ],
    },
  },
];
