// This file contains all your questions and can be imported by QuizPage
export const questionBank = {
math: [
  {
    id: 1,
    question: "Faktorkan ungkapan kuadratik berikut: x² + 5x + 6",
    options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x+2)(x+4)", "(x+3)(x+3)"],
    correctAnswer: 0,
    explanation: "x² + 5x + 6 = (x+2)(x+3) kerana 2×3=6 dan 2+3=5",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 2,
    question: "Cari nilai x bagi persamaan: 3x - 7 = 14",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    explanation: "3x - 7 = 14 → 3x = 21 → x = 7",
    category: "Algebra",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "Selesaikan ketaksamaan: 2x + 5 > 15",
    options: ["x > 5", "x > 10", "x > 7.5", "x > 6"],
    correctAnswer: 0,
    explanation: "2x + 5 > 15 → 2x > 10 → x > 5",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "Hitung luas segi tiga dengan tapak 8cm dan tinggi 6cm",
    options: ["24 cm²", "48 cm²", "32 cm²", "28 cm²"],
    correctAnswer: 0,
    explanation: "Luas = ½ × tapak × tinggi = ½ × 8 × 6 = 24 cm²",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 5,
    question: "Cari nilai sin 60°",
    options: ["½", "√3/2", "√2/2", "1/√2"],
    correctAnswer: 1,
    explanation: "sin 60° = √3/2 (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "medium"
  },
  {
    id: 6,
    question: "Hitung hasil: log₁₀100 + log₁₀1000",
    options: ["5", "6", "7", "8"],
    correctAnswer: 0,
    explanation: "log₁₀100 = 2, log₁₀1000 = 3, jadi 2 + 3 = 5",
    category: "Logaritma",
    difficulty: "medium"
  },
  {
    id: 7,
    question: "Cari hasil tambah punca bagi persamaan kuadratik x² - 7x + 12 = 0",
    options: ["7", "12", "-7", "-12"],
    correctAnswer: 0,
    explanation: "Hasil tambah punca = -b/a = -(-7)/1 = 7",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 8,
    question: "Cari nilai bagi log₅125",
    options: ["3", "4", "5", "2"],
    correctAnswer: 0,
    explanation: "log₅125 = 3 kerana 5³ = 125",
    category: "Logaritma",
    difficulty: "medium"
  },
  {
    id: 9,
    question: "Selesaikan persamaan serentak: 2x + y = 7, x - y = 2",
    options: ["x=3, y=1", "x=2, y=3", "x=4, y=-1", "x=3, y=2"],
    correctAnswer: 0,
    explanation: "Tambahkan kedua-dua persamaan: 3x = 9 → x=3, gantikan x=3: 6+y=7 → y=1",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 10,
    question: "Hitung isipadu sebuah silinder dengan jejari 7cm dan tinggi 10cm",
    options: ["1540 cm³", "440 cm³", "154 cm³", "308 cm³"],
    correctAnswer: 0,
    explanation: "Isipadu = πr²h = 22/7 × 7² × 10 = 1540 cm³",
    category: "Geometri",
    difficulty: "medium"
  },
  {
    id: 11,
    question: "Cari nilai cos 45°",
    options: ["1/√2", "√3/2", "½", "1"],
    correctAnswer: 0,
    explanation: "cos 45° = 1/√2 (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "easy"
  },
  {
    id: 12,
    question: "Permudahkan: (3x²y)³ ÷ (9x⁴y²)",
    options: ["3x²y", "x²y", "3xy", "27x²y"],
    correctAnswer: 0,
    explanation: "(3x²y)³ = 27x⁶y³, ÷ (9x⁴y²) = 3x²y",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 13,
    question: "Hitung luas permukaan kubus dengan sisi 5cm",
    options: ["150 cm²", "125 cm²", "100 cm²", "175 cm²"],
    correctAnswer: 0,
    explanation: "Luas permukaan = 6 × sisi² = 6 × 25 = 150 cm²",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 14,
    question: "Cari nilai tan 30°",
    options: ["1/√3", "√3", "1", "√3/2"],
    correctAnswer: 0,
    explanation: "tan 30° = 1/√3 (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "medium"
  },
  {
    id: 15,
    question: "Selesaikan: 5(x - 3) = 2x + 9",
    options: ["x = 8", "x = 6", "x = 7", "x = 9"],
    correctAnswer: 0,
    explanation: "5x - 15 = 2x + 9 → 3x = 24 → x = 8",
    category: "Algebra",
    difficulty: "easy"
  },
  {
    id: 16,
    question: "Hitung panjang hipotenus segi tiga bersudut tegak dengan sisi 6cm dan 8cm",
    options: ["10 cm", "12 cm", "14 cm", "9 cm"],
    correctAnswer: 0,
    explanation: "Menggunakan Teorem Pythagoras: √(6² + 8²) = √(36 + 64) = √100 = 10 cm",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 17,
    question: "Cari nilai x jika 2ˣ = 32",
    options: ["5", "6", "4", "7"],
    correctAnswer: 0,
    explanation: "2ˣ = 32 → 2ˣ = 2⁵ → x = 5",
    category: "Indeks",
    difficulty: "easy"
  },
  {
    id: 18,
    question: "Hitung perimeter segi empat tepat dengan panjang 12cm dan lebar 8cm",
    options: ["40 cm", "48 cm", "36 cm", "44 cm"],
    correctAnswer: 0,
    explanation: "Perimeter = 2(panjang + lebar) = 2(12 + 8) = 40 cm",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 19,
    question: "Permudahkan: (2x + 3)(x - 4)",
    options: ["2x² - 5x - 12", "2x² + 5x - 12", "2x² - 5x + 12", "2x² + 5x + 12"],
    correctAnswer: 0,
    explanation: "(2x + 3)(x - 4) = 2x² - 8x + 3x - 12 = 2x² - 5x - 12",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 20,
    question: "Cari nilai sin²θ + cos²θ",
    options: ["1", "0", "sin2θ", "cos2θ"],
    correctAnswer: 0,
    explanation: "Ini adalah identiti trigonometri asas: sin²θ + cos²θ = 1",
    category: "Trigonometri",
    difficulty: "easy"
  },
  {
    id: 21,
    question: "Hitung luas bulatan dengan jejari 14cm (guna π = 22/7)",
    options: ["616 cm²", "308 cm²", "154 cm²", "88 cm²"],
    correctAnswer: 0,
    explanation: "Luas = πr² = 22/7 × 14 × 14 = 616 cm²",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 22,
    question: "Faktorkan sepenuhnya: 2x² - 8x",
    options: ["2x(x - 4)", "2(x² - 4x)", "x(2x - 8)", "2x(x - 2)"],
    correctAnswer: 0,
    explanation: "2x² - 8x = 2x(x - 4)",
    category: "Algebra",
    difficulty: "easy"
  },
  {
    id: 23,
    question: "Cari nilai tan 45°",
    options: ["1", "0", "√3", "1/√3"],
    correctAnswer: 0,
    explanation: "tan 45° = 1 (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "easy"
  },
  {
    id: 24,
    question: "Selesaikan: 4ˣ⁻¹ = 16",
    options: ["x = 3", "x = 2", "x = 4", "x = 5"],
    correctAnswer: 0,
    explanation: "4ˣ⁻¹ = 16 → 4ˣ⁻¹ = 4² → x - 1 = 2 → x = 3",
    category: "Indeks",
    difficulty: "medium"
  },
  {
    id: 25,
    question: "Hitung isipadu kubus dengan sisi 4cm",
    options: ["64 cm³", "48 cm³", "32 cm³", "16 cm³"],
    correctAnswer: 0,
    explanation: "Isipadu = sisi³ = 4 × 4 × 4 = 64 cm³",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 26,
    question: "Permudahkan: log₂8 + log₂4",
    options: ["5", "6", "4", "3"],
    correctAnswer: 0,
    explanation: "log₂8 = 3, log₂4 = 2, jadi 3 + 2 = 5",
    category: "Logaritma",
    difficulty: "easy"
  },
  {
    id: 27,
    question: "Cari hasil darab punca bagi persamaan 2x² - 5x + 3 = 0",
    options: ["1.5", "2.5", "3", "1"],
    correctAnswer: 0,
    explanation: "Hasil darab punca = c/a = 3/2 = 1.5",
    category: "Algebra",
    difficulty: "medium"
  },
  {
    id: 28,
    question: "Hitung luas trapezium dengan sisi selari 6cm dan 10cm, tinggi 4cm",
    options: ["32 cm²", "24 cm²", "40 cm²", "28 cm²"],
    correctAnswer: 0,
    explanation: "Luas = ½ × (hasil tambah sisi selari) × tinggi = ½ × (6+10) × 4 = 32 cm²",
    category: "Geometri",
    difficulty: "medium"
  },
  {
    id: 29,
    question: "Cari nilai cos 60°",
    options: ["½", "√3/2", "1/√2", "1"],
    correctAnswer: 0,
    explanation: "cos 60° = ½ (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "easy"
  },
  {
    id: 30,
    question: "Selesaikan: 3(2x - 5) = 21",
    options: ["x = 6", "x = 5", "x = 4", "x = 7"],
    correctAnswer: 0,
    explanation: "3(2x - 5) = 21 → 6x - 15 = 21 → 6x = 36 → x = 6",
    category: "Algebra",
    difficulty: "easy"
  },
  {
    id: 31,
    question: "Hitung lilitan bulatan dengan diameter 21cm (guna π = 22/7)",
    options: ["66 cm", "33 cm", "132 cm", "99 cm"],
    correctAnswer: 0,
    explanation: "Lilitan = πd = 22/7 × 21 = 66 cm",
    category: "Geometri",
    difficulty: "easy"
  },
  {
    id: 32,
    question: "Permudahkan: 5² × 5³ ÷ 5⁴",
    options: ["5", "25", "125", "1"],
    correctAnswer: 0,
    explanation: "5² × 5³ ÷ 5⁴ = 5⁽²⁺³⁻⁴⁾ = 5¹ = 5",
    category: "Indeks",
    difficulty: "easy"
  },
  {
    id: 33,
    question: "Cari nilai sin 90°",
    options: ["1", "0", "½", "√3/2"],
    correctAnswer: 0,
    explanation: "sin 90° = 1 (nilai standard dalam trigonometri)",
    category: "Trigonometri",
    difficulty: "easy"
  },
  {
    id: 34,
    question: "Hitung luas permukaan sfera dengan jejari 7cm (guna π = 22/7)",
    options: ["616 cm²", "308 cm²", "154 cm²", "1232 cm²"],
    correctAnswer: 0,
    explanation: "Luas permukaan = 4πr² = 4 × 22/7 × 7 × 7 = 616 cm²",
    category: "Geometri",
    difficulty: "medium"
  },
  {
    id: 35,
    question: "Selesaikan: x² - 9 = 0",
    options: ["x = 3 atau x = -3", "x = 9 atau x = -9", "x = 3", "x = 9"],
    correctAnswer: 0,
    explanation: "x² - 9 = 0 → (x - 3)(x + 3) = 0 → x = 3 atau x = -3",
    category: "Algebra",
    difficulty: "easy"
  },
  {
    id: 36,
    question: "Cari nilai log₁₀0.01",
    options: ["-2", "-1", "2", "1"],
    correctAnswer: 0,
    explanation: "log₁₀0.01 = -2 kerana 10⁻² = 0.01",
    category: "Logaritma",
    difficulty: "medium"
  }
],
  sejarah: [
    {
      id: 11,
      question: "Bilakah Tanah Melayu mencapai kemerdekaan?",
      options: ["31 Ogos 1957", "16 September 1963", "31 Ogos 1963", "16 September 1957"],
      correctAnswer: 0,
      explanation: "Tanah Melayu mencapai kemerdekaan pada 31 Ogos 1957",
      category: "sejarah",
      difficulty: "easy"
    },
    {
      id: 12,
      question: "Siapakah Yang di-Pertuan Agong pertama Malaysia?",
      options: ["Tuanku Abdul Rahman", "Sultan Hisamuddin Alam Shah", "Sultan Ismail Nasiruddin Shah", "Tuanku Jaafar"],
      correctAnswer: 0,
      explanation: "Tuanku Abdul Rahman ibni Almarhum Tuanku Muhammad merupakan Yang di-Pertuan Agong pertama",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 13,
      question: "Apakah tujuan penubuhan Malayan Union pada tahun 1946?",
      options: ["Menyatukan negeri-negeri Melayu di bawah pentadbiran British", "Memberi kemerdekaan kepada Tanah Melayu", "Menentang komunis", "Memajukan ekonomi"],
      correctAnswer: 0,
      explanation: "Malayan Union ditubuhkan untuk menyatukan negeri-negeri Melayu di bawah pentadbiran British yang berpusat",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 14,
      question: "Peristiwa 13 Mei 1969 berkaitan dengan...",
      options: ["Rusuhan kaum", "Kemerdekaan", "Pembentukan Malaysia", "Pilihan raya umum"],
      correctAnswer: 0,
      explanation: "Peristiwa 13 Mei 1969 ialah rusuhan kaum yang berlaku selepas pilihan raya umum 1969",
      category: "sejarah",
      difficulty: "hard"
    },
    {
      id: 15,
      question: "Siapakah Perdana Menteri Malaysia yang pertama?",
      options: ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn", "Tun Dr. Mahathir Mohamad"],
      correctAnswer: 0,
      explanation: "Tunku Abdul Rahman Putra Al-Haj merupakan Perdana Menteri Malaysia yang pertama",
      category: "sejarah",
      difficulty: "easy"
    },
    {
      id: 16,
      question: "Apakah yang dimaksudkan dengan Sistem Ahli?",
      options: ["Sistem pentadbiran sebelum merdeka", "Sistem pendidikan", "Sistem ekonomi", "Sistem pertahanan"],
      correctAnswer: 0,
      explanation: "Sistem Ahli ialah sistem pentadbiran yang diperkenalkan sebelum merdeka untuk melatih penduduk tempatan dalam pentadbiran",
      category: "sejarah",
      difficulty: "hard"
    },
    {
      id: 17,
      question: "Bilakah Malaysia ditubuhkan?",
      options: ["16 September 1963", "31 Ogos 1957", "31 Ogos 1963", "16 September 1957"],
      correctAnswer: 0,
      explanation: "Malaysia ditubuhkan pada 16 September 1963 dengan penyertaan Tanah Melayu, Singapura, Sabah dan Sarawak",
      category: "sejarah",
      difficulty: "easy"
    },
    {
      id: 18,
      question: "Apakah tujuan Rukun Negara diperkenalkan?",
      options: ["Memupuk perpaduan kaum", "Memajukan ekonomi", "Memperkukuh pertahanan", "Membangunkan pendidikan"],
      correctAnswer: 0,
      explanation: "Rukun Negara diperkenalkan selepas Peristiwa 13 Mei 1969 untuk memupuk perpaduan kaum",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 19,
      question: "Siapakah yang mengetuai Suruhanjaya Reid?",
      options: ["Lord Reid", "Sir Henry Lee", "Sir Gerald Templer", "Sir Malcolm MacDonald"],
      correctAnswer: 0,
      explanation: "Lord Reid mengetuai Suruhanjaya Reid yang merangka Perlembagaan Persekutuan Tanah Melayu",
      category: "sejarah",
      difficulty: "hard"
    },
    {
      id: 20,
      question: "Apakah yang dimaksudkan dengan 'Darurat' dalam konteks sejarah Malaysia?",
      options: ["Perang menentang komunis", "Kemerdekaan", "Pembentukan Malaysia", "Rusuhan kaum"],
      correctAnswer: 0,
      explanation: "Darurat merujuk kepada perang menentang pengganas komunis dari 1948 hingga 1960",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 37,
      question: "Apakah tujuan penubuhan ASEAN?",
      options: ["Menggalakkan kerjasama ekonomi dan politik", "Menentang kuasa Barat", "Membentuk pasaran bersama", "Menjajah negara jiran"],
      correctAnswer: 0,
      explanation: "ASEAN ditubuhkan untuk menggalakkan kerjasama ekonomi, sosial dan politik antara negara anggota",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 38,
      question: "Siapakah yang mengetuai rombongan ke London untuk merundingkan kemerdekaan?",
      options: ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Tan Cheng Lock", "Tun V.T. Sambanthan"],
      correctAnswer: 0,
      explanation: "Tunku Abdul Rahman mengetuai rombongan ke London untuk merundingkan kemerdekaan Tanah Melayu",
      category: "sejarah",
      difficulty: "medium"
    },
    {
      id: 39,
      question: "Apakah kesan utama Dasar Ekonomi Baru (DEB)?",
      options: ["Mengurangkan ketidakseimbangan ekonomi antara kaum", "Memperkenalkan sistem komunis", "Menghapuskan sistem raja berperlembagaan", "Menyatukan semua sekolah"],
      correctAnswer: 0,
      explanation: "DEB dilancarkan untuk mengurangkan ketidakseimbangan ekonomi antara kaum dan membasmi kemiskinan",
      category: "sejarah",
      difficulty: "hard"
    },
    {
      id: 40,
      question: "Bilakah Singapura keluar dari Malaysia?",
      options: ["9 Ogos 1965", "16 September 1965", "31 Ogos 1965", "1 Januari 1965"],
      correctAnswer: 0,
      explanation: "Singapura keluar dari Malaysia pada 9 Ogos 1965 dan menjadi negara merdeka",
      category: "sejarah",
      difficulty: "medium"
    }
  ],
  science: [
    {
      id: 21,
      question: "Apakah proses semula jadi yang menyebabkan pembentukan hujan?",
      options: ["Kitaran air", "Fotosintesis", "Respirasi", "Pelakuran"],
      correctAnswer: 0,
      explanation: "Kitaran air melibatkan penyejatan, kondensasi, dan pemendakan yang menyebabkan pembentukan hujan",
      category: "Sains Bumi",
      difficulty: "medium"
    },
    {
      id: 22,
      question: "Apakah sumber tenaga utama untuk Bumi?",
      options: ["Matahari", "Angin", "Air", "Bahan api fosil"],
      correctAnswer: 0,
      explanation: "Matahari adalah sumber tenaga utama yang memacu semua proses kehidupan di Bumi",
      category: "Tenaga",
      difficulty: "easy"
    },
    {
      id: 23,
      question: "Apakah fungsi utama daun pada tumbuhan?",
      options: ["Tempat berlakunya fotosintesis", "Menyerap air dari tanah", "Menyokong tumbuhan", "Menyimpan makanan"],
      correctAnswer: 0,
      explanation: "Daun mengandungi klorofil dan merupakan tempat utama fotosintesis berlaku dalam tumbuhan",
      category: "Sains Tumbuhan",
      difficulty: "easy"
    },
    {
      id: 24,
      question: "Apakah yang menyebabkan gempa bumi?",
      options: ["Pergerakan plat tektonik", "Letusan gunung berapi", "Perubahan cuaca", "Pengaruh bulan"],
      correctAnswer: 0,
      explanation: "Gempa bumi disebabkan oleh pergerakan dan geseran antara plat tektonik di kerak Bumi",
      category: "Sains Bumi",
      difficulty: "medium"
    },
    {
      id: 25,
      question: "Apakah tiga keadaan jirim yang asas?",
      options: ["Pepejal, cecair, gas", "Panas, sejuk, suam", "Keras, lembut, sederhana", "Besar, kecil, sederhana"],
      correctAnswer: 0,
      explanation: "Tiga keadaan jirim asas ialah pepejal, cecair, dan gas",
      category: "Jirim",
      difficulty: "easy"
    },
    {
      id: 26,
      question: "Apakah fungsi sistem saraf dalam badan manusia?",
      options: ["Mengawal dan menyelaraskan semua aktiviti badan", "Mengangkut oksigen", "Mencernakan makanan", "Menyingkirkan sisa"],
      correctAnswer: 0,
      explanation: "Sistem saraf berfungsi mengawal dan menyelaraskan semua aktiviti badan melalui penghantaran isyarat elektrik",
      category: "Sains Manusia",
      difficulty: "medium"
    },
    {
      id: 27,
      question: "Apakah yang dimaksudkan dengan ekosistem?",
      options: ["Komuniti organisma dan persekitarannya", "Kumpulan haiwan sahaja", "Kumpulan tumbuhan sahaja", "Persekitaran fizikal semata-mata"],
      correctAnswer: 0,
      explanation: "Ekosistem ialah komuniti organisma hidup yang berinteraksi antara satu sama lain dan dengan persekitaran fizikal mereka",
      category: "Ekologi",
      difficulty: "easy"
    },
    {
      id: 28,
      question: "Apakah proses perubahan dari cecair kepada gas?",
      options: ["Penyejatan", "Kondensasi", "Pembekuan", "Peleburan"],
      correctAnswer: 0,
      explanation: "Penyejatan ialah proses perubahan cecair kepada gas pada suhu di bawah takat didih",
      category: "Jirim",
      difficulty: "medium"
    },
    {
      id: 29,
      question: "Apakah fungsi akar pada tumbuhan?",
      options: ["Menyerap air dan nutrien dari tanah", "Melakukan fotosintesis", "Menghasilkan bunga", "Menyebarkan biji benih"],
      correctAnswer: 0,
      explanation: "Akar berfungsi menyerap air dan nutrien mineral dari tanah serta mengukuhkan tumbuhan",
      category: "Sains Tumbuhan",
      difficulty: "easy"
    },
    {
      id: 30,
      question: "Apakah yang menyebabkan siang dan malam?",
      options: ["Putaran Bumi pada paksinya", "Peredaran Bumi mengelilingi Matahari", "Kedudukan Bulan", "Perubahan musim"],
      correctAnswer: 0,
      explanation: "Siang dan malam disebabkan oleh putaran Bumi pada paksinya setiap 24 jam",
      category: "Astronomi",
      difficulty: "easy"
    },
    {
      id: 31,
      question: "Apakah sumber tenaga boleh baharu?",
      options: ["Tenaga suria, angin, dan hidro", "Arang batu dan minyak", "Gas asli", "Tenaga nuklear"],
      correctAnswer: 0,
      explanation: "Tenaga boleh baharu seperti suria, angin, dan hidro boleh diperbaharui dan mesra alam",
      category: "Tenaga",
      difficulty: "medium"
    },
    {
      id: 32,
      question: "Apakah fungsi tulang dalam badan manusia?",
      options: ["Menyokong badan dan melindungi organ", "Mencernakan makanan", "Mengangkut darah", "Menapis udara"],
      correctAnswer: 0,
      explanation: "Tulang berfungsi menyokong badan, melindungi organ dalaman, dan menghasilkan sel darah",
      category: "Sains Manusia",
      difficulty: "easy"
    },
    {
      id: 41,
      question: "Apakah yang dimaksudkan dengan pemuliharaan?",
      options: ["Pengurusan sumber semula jadi secara bijak", "Pemburuan haiwan liar", "Pembalakan haram", "Pembuangan sisa"],
      correctAnswer: 0,
      explanation: "Pemuliharaan ialah pengurusan sumber semula jadi secara bijak untuk generasi masa depan",
      category: "Alam Sekitar",
      difficulty: "medium"
    },
    {
      id: 42,
      question: "Apakah proses tumbuhan menyerap karbon dioksida dan membebaskan oksigen?",
      options: ["Fotosintesis", "Respirasi", "Transpirasi", "Germinasi"],
      correctAnswer: 0,
      explanation: "Fotosintesis ialah proses di mana tumbuhan menyerap karbon dioksida dan membebaskan oksigen menggunakan tenaga suria",
      category: "Sains Tumbuhan",
      difficulty: "medium"
    },
    {
      id: 43,
      question: "Apakah yang menyebabkan arus elektrik mengalir?",
      options: ["Perbezaan keupayaan (voltan)", "Rintangan tinggi", "Suhu rendah", "Tekanan tinggi"],
      correctAnswer: 0,
      explanation: "Arus elektrik mengalir akibat perbezaan keupayaan (voltan) antara dua titik",
      category: "Tenaga",
      difficulty: "medium"
    },
    {
      id: 44,
      question: "Apakah kitaran semula jadi yang penting untuk kehidupan?",
      options: ["Kitaran karbon, nitrogen, dan air", "Kitaran musim", "Kitaran bulan", "Kitaran pasang surut"],
      correctAnswer: 0,
      explanation: "Kitaran karbon, nitrogen, dan air adalah penting untuk mengekalkan keseimbangan ekosistem",
      category: "Ekologi",
      difficulty: "hard"
    },
    {
      id: 45,
      question: "Apakah fungsi sistem imun dalam badan?",
      options: ["Melawan penyakit dan jangkitan", "Mencernakan makanan", "Mengangkut oksigen", "Mengawal suhu badan"],
      correctAnswer: 0,
      explanation: "Sistem imun berfungsi melawan patogen dan melindungi badan daripada penyakit",
      category: "Sains Manusia",
      difficulty: "medium"
    },
    {
      id: 46,
      question: "Apakah yang dimaksudkan dengan biodegradasi?",
      options: ["Penguraian bahan oleh mikroorganisma", "Pembakaran bahan", "Pelarutan bahan dalam air", "Pemejalwapan bahan"],
      correctAnswer: 0,
      explanation: "Biodegradasi ialah proses penguraian bahan organik oleh bakteria dan mikroorganisma",
      category: "Alam Sekitar",
      difficulty: "medium"
    },
    {
      id: 47,
      question: "Apakah planet ketiga dari Matahari dalam sistem suria kita?",
      options: ["Bumi", "Zuhrah", "Marikh", "Musytari"],
      correctAnswer: 0,
      explanation: "Bumi adalah planet ketiga dari Matahari, selepas Utarid dan Zuhrah",
      category: "Astronomi",
      difficulty: "easy"
    },
    {
      id: 48,
      question: "Apakah kesan rumah hijau?",
      options: ["Pemanasan global akibat gas rumah hijau", "Penyejukan Bumi", "Peningkatan oksigen", "Pengurangan hujan"],
      correctAnswer: 0,
      explanation: "Kesan rumah hijau menyebabkan pemanasan global akibat peningkatan gas seperti karbon dioksida di atmosfera",
      category: "Alam Sekitar",
      difficulty: "medium"
    },
    {
      id: 49,
      question: "Apakah fungsi mitokondria dalam sel?",
      options: ["Menghasilkan tenaga (ATP)", "Menyimpan maklumat genetik", "Mensintesis protein", "Mengawal keluar masuk bahan"],
      correctAnswer: 0,
      explanation: "Mitokondria ialah 'kuasa sel' yang menghasilkan tenaga melalui proses respirasi sel",
      category: "Sains Sel",
      difficulty: "hard"
    },
    {
      id: 50,
      question: "Apakah sumber tenaga terbaharu yang paling banyak digunakan di dunia?",
      options: ["Tenaga suria", "Tenaga angin", "Tenaga hidro", "Tenaga geoterma"],
      correctAnswer: 0,
      explanation: "Tenaga suria merupakan sumber tenaga terbaharu yang paling banyak digunakan di seluruh dunia",
      category: "Tenaga",
      difficulty: "medium"
    },
    {
      id: 51,
      question: "Apakah yang menyebabkan pasang surut air laut?",
      options: ["Tarikan graviti Bulan", "Putaran Bumi", "Angin", "Hujan"],
      correctAnswer: 0,
      explanation: "Pasang surut air laut disebabkan terutamanya oleh tarikan graviti Bulan ke atas Bumi",
      category: "Sains Bumi",
      difficulty: "hard"
    },
    {
      id: 52,
      question: "Apakah kepentingan kepelbagaian biologi?",
      options: ["Mengekalkan keseimbangan ekosistem", "Meningkatkan suhu global", "Mengurangkan sumber air", "Meningkatkan pencemaran"],
      correctAnswer: 0,
      explanation: "Kepelbagaian biologi penting untuk mengekalkan keseimbangan ekosistem dan ketahanan alam sekitar",
      category: "Ekologi",
      difficulty: "medium"
    }
  ],
   
};
// Improved shuffle function using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Fungsi baru: mengacak opsi dan mengupdate correctAnswer
const shuffleQuestionOptions = (question) => {
  const options = [...question.options];
  const correctAnswerIndex = question.correctAnswer;

  // Simpan jawaban yang benar sebelum mengacak
  const correctAnswerValue = options[correctAnswerIndex];

  // Acak opsi
  const shuffledOptions = shuffleArray(options);

  // Cari indeks baru dari jawaban yang benar
  const newCorrectAnswerIndex = shuffledOptions.indexOf(correctAnswerValue);

  // Return pertanyaan dengan opsi yang diacak dan correctAnswer yang diperbarui
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswerIndex
  };
};

// Question rotation manager
class QuestionRotationManager {
  constructor() {
    this.usedQuestions = new Set(); // Track used question IDs
    this.currentSet = 0;
    this.maxSets = 0;
    this.initializeQuestionBank();
  }

  initializeQuestionBank() {
    // Add unique IDs to all questions if not present
    Object.keys(questionBank).forEach(category => {
      questionBank[category].forEach((question, index) => {
        if (!question.id) {
          question.id = `${category}_${index}`;
        }
      });
    });
    
    // Calculate maximum number of sets possible
    const totalQuestions = Object.values(questionBank).flat().length;
    this.maxSets = Math.floor(totalQuestions / 5);
  }

  // Get unique questions that haven't been used in current rotation
  getUniqueQuestions(questions, count = 5) {
    const availableQuestions = questions.filter(q => !this.usedQuestions.has(q.id));
    
    if (availableQuestions.length < count) {
      // Not enough unique questions, reset the used questions
      this.resetUsedQuestions();
      return this.getUniqueQuestions(questions, count);
    }
    
    const shuffled = shuffleArray(availableQuestions);
    const selected = shuffled.slice(0, count);
    
    // Mark these questions as used
    selected.forEach(q => this.usedQuestions.add(q.id));
    
    return selected.map(shuffleQuestionOptions);
  }

  resetUsedQuestions() {
    this.usedQuestions.clear();
    this.currentSet = 0;
  }

  // Helper function to get questions by category with rotation
  getQuestionsByCategory(category, count = 5) {
    const questions = questionBank[category] || [];
    
    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }
    
    const uniqueQuestions = this.getUniqueQuestions(questions, count);
    this.currentSet++;
    
    return uniqueQuestions;
  }

  // Helper function to get mixed questions from all categories with rotation
  getMixedQuestions(count = 5) {
    const allQuestions = Object.values(questionBank).flat();
    
    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }
    
    const uniqueQuestions = this.getUniqueQuestions(allQuestions, count);
    this.currentSet++;
    
    return uniqueQuestions;
  }

  // Helper function to get questions by difficulty with rotation
  getQuestionsByDifficulty(difficulty, count = 5) {
    const allQuestions = Object.values(questionBank).flat();
    const filtered = allQuestions.filter(q => q.difficulty === difficulty);
    
    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }
    
    const uniqueQuestions = this.getUniqueQuestions(filtered, count);
    this.currentSet++;
    
    return uniqueQuestions;
  }

  // Specific function to get exactly 5 random questions with rotation
  getRandomQuestions(count = 5) {
    return this.getMixedQuestions(count);
  }

  // Get current set number and total sets
  getSetInfo() {
    return {
      currentSet: this.currentSet,
      maxSets: this.maxSets,
      questionsRemaining: this.maxSets - this.currentSet
    };
  }

  // Manually reset the rotation
  resetRotation() {
    this.resetUsedQuestions();
  }
}

// Create a singleton instance
const questionManager = new QuestionRotationManager();

// Export the functions with rotation capability
export const getQuestionsByCategory = (category, count = 5) => {
  return questionManager.getQuestionsByCategory(category, count);
};

export const getMixedQuestions = (count = 5) => {
  return questionManager.getMixedQuestions(count);
};

export const getQuestionsByDifficulty = (difficulty, count = 5) => {
  return questionManager.getQuestionsByDifficulty(difficulty, count);
};

export const getRandomQuestions = (count = 5) => {
  return questionManager.getRandomQuestions(count);
};

export const getSetInfo = () => {
  return questionManager.getSetInfo();
};

export const resetQuestionRotation = () => {
  return questionManager.resetRotation();
};

export default questionBank;