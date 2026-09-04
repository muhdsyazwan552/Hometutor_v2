// resources/js/data/interactive-questions/bahasa-malaysia/standard3.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const bahasaMalaysiaStandard3Questions = [
    // Method 1: Kata Majmuk
    {
        ...createMethod1Template(
            30,
            "Bahasa Malaysia",
            "Standard 3",
            "Kata Majmuk",
            "Padankan kata majmuk",
            "book-open"
        ),
        data: {
            question: "Drag kata majmuk ke tempat yang betul.",
            answers: ["Rumah terbuka", "Kereta api", "Tangan kanan", "Matahari"],
            questions: [
                { text: "_______ terbit di timur.", correctAnswer: "Matahari" },
                { text: "_______ berjalan di atas landasan.", correctAnswer: "Kereta api" },
                { text: "Dia menggunakan _______ untuk menulis.", correctAnswer: "Tangan kanan" },
                { text: "Kami mengadakan _______ pada hari raya.", correctAnswer: "Rumah terbuka" }
            ]
        }
    },

    // Method 2: Kata Ganda
    {
        ...createMethod2Template(
            31,
            "Bahasa Malaysia",
            "Standard 3",
            "Kata Ganda",
            "Pilih kata ganda yang betul",
            "repeat"
        ),
        data: {
            question: "Drag kata ganda yang betul.",
            questions: [
                { 
                    text: "Bunga-bunga _______ di taman.", 
                    options: ["berkembangan", "berkembang"], 
                    correctAnswer: "berkembangan" 
                },
                { 
                    text: "Anak-anak _______ di padang.", 
                    options: ["berlari-lari", "berlari"], 
                    correctAnswer: "berlari-lari" 
                },
                { 
                    text: "Mereka _______ cerita.", 
                    options: ["bercerita-bercerita", "bercerita"], 
                    correctAnswer: "bercerita-bercerita" 
                },
                { 
                    text: "Daun-daun _______ di udara.", 
                    options: ["berterbangan", "berterbang"], 
                    correctAnswer: "berterbangan" 
                }
            ]
        }
    },

    // Method 3: Peribahasa
    {
        ...createMethod3Template(
            32,
            "Bahasa Malaysia",
            "Standard 3",
            "Peribahasa",
            "Pilih maksud peribahasa",
            "message-circle"
        ),
        data: {
            question: "Apakah maksud 'bagai aur dengan tebing'?",
            questions: [
                {
                    text: "Apakah maksud 'bagai aur dengan tebing'?",
                    options: ["Saling membantu", "Saling bermusuhan", "Saling melengkapi"],
                    correctAnswer: "Saling membantu"
                }
            ]
        }
    },

    // Method 1: Kata Seru
    {
        ...createMethod1Template(
            33,
            "Bahasa Malaysia",
            "Standard 3",
            "Kata Seru",
            "Kenali kata seru",
            "alert-circle"
        ),
        data: {
            question: "Drag kata seru ke tempat yang betul.",
            answers: ["Aduh", "Wah", "Alamak", "Syabas"],
            questions: [
                { text: "_______! Sakitnya!", correctAnswer: "Aduh" },
                { text: "_______! Cantiknya bunga ini!", correctAnswer: "Wah" },
                { text: "_______! Saya terlupa!", correctAnswer: "Alamak" },
                { text: "_______! Kamu berjaya!", correctAnswer: "Syabas" }
            ]
        }
    },

    // Method 2: Ayat Majmuk
    {
        ...createMethod2Template(
            34,
            "Bahasa Malaysia",
            "Standard 3",
            "Ayat Majmuk",
            "Pilih ayat majmuk yang betul",
            "file-text"
        ),
        data: {
            question: "Drag ayat majmuk yang betul.",
            questions: [
                { 
                    text: "Pilih ayat majmuk:", 
                    options: ["Ali belajar dan Ahmad bermain.", "Ali belajar Ahmad bermain."], 
                    correctAnswer: "Ali belajar dan Ahmad bermain." 
                },
                { 
                    text: "Pilih ayat majmuk:", 
                    options: ["Dia pandai tetapi malas.", "Dia pandai malas."], 
                    correctAnswer: "Dia pandai tetapi malas." 
                },
                { 
                    text: "Pilih ayat majmuk:", 
                    options: ["Siti rajin kerana ingin berjaya.", "Siti rajin ingin berjaya."], 
                    correctAnswer: "Siti rajin kerana ingin berjaya." 
                },
                { 
                    text: "Pilih ayat majmuk:", 
                    options: ["Kami akan pergi atau tinggal di rumah.", "Kami akan pergi tinggal di rumah."], 
                    correctAnswer: "Kami akan pergi atau tinggal di rumah." 
                }
            ]
        }
    }
];