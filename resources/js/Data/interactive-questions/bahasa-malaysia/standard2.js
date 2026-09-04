// resources/js/data/interactive-questions/bahasa-malaysia/standard2.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const bahasaMalaysiaStandard2Questions = [
    // Method 1: Kata Kerja
    {
        ...createMethod1Template(
            20,
            "Bahasa Malaysia",
            "Standard 2",
            "Kata Kerja",
            "Padankan kata kerja dengan gambar",
            "activity"
        ),
        data: {
            question: "Drag kata kerja ke tempat yang betul.",
            answers: ["Membaca", "Menulis", "Melukis", "Menyanyi"],
            questions: [
                { text: "Dia sedang _______ buku.", correctAnswer: "Membaca" },
                { text: "Ali _______ di papan tulis.", correctAnswer: "Menulis" },
                { text: "Siti _______ gambar bunga.", correctAnswer: "Melukis" },
                { text: "Mereka _______ lagu kebangsaan.", correctAnswer: "Menyanyi" }
            ]
        }
    },

    // Method 2: Kata Sifat
    {
        ...createMethod2Template(
            21,
            "Bahasa Malaysia",
            "Standard 2",
            "Kata Sifat",
            "Pilih kata sifat yang betul",
            "type"
        ),
        data: {
            question: "Drag jawapan yang betul.",
            questions: [
                { 
                    text: "Rumah itu _______.", 
                    options: ["Besar", "Kecil"], 
                    correctAnswer: "Besar" 
                },
                { 
                    text: "Kucing itu _______.", 
                    options: ["Laju", "Lambat"], 
                    correctAnswer: "Laju" 
                },
                { 
                    text: "Air ini _______.", 
                    options: ["Panas", "Sejuk"], 
                    correctAnswer: "Sejuk" 
                },
                { 
                    text: "Buku ini _______.", 
                    options: ["Baru", "Lama"], 
                    correctAnswer: "Baru" 
                }
            ]
        }
    },

    // Method 3: Kata Arah
    {
        ...createMethod3Template(
            22,
            "Bahasa Malaysia",
            "Standard 2",
            "Kata Arah",
            "Pilih kata arah yang betul",
            "navigation"
        ),
        data: {
            question: "Arah mana pergi ke perpustakaan?",
            questions: [
                {
                    text: "Arah mana pergi ke perpustakaan?",
                    options: ["Belok kiri", "Belok kanan", "Jalan terus"],
                    correctAnswer: "Belok kanan"
                }
            ]
        }
    },

    // Method 1: Kata Nama Khas
    {
        ...createMethod1Template(
            23,
            "Bahasa Malaysia",
            "Standard 2",
            "Kata Nama Khas",
            "Kenali kata nama khas",
            "map-pin"
        ),
        data: {
            question: "Drag nama khas ke tempat yang betul.",
            answers: ["Ali", "Kuala Lumpur", "Cikgu Aminah", "Sungai Pahang"],
            questions: [
                { text: "_______ sedang membaca buku.", correctAnswer: "Ali" },
                { text: "_______ adalah ibu negara Malaysia.", correctAnswer: "Kuala Lumpur" },
                { text: "_______ mengajar Bahasa Malaysia.", correctAnswer: "Cikgu Aminah" },
                { text: "_______ mengalir di negeri Pahang.", correctAnswer: "Sungai Pahang" }
            ]
        }
    },

    // Method 2: Kata Hubung
    {
        ...createMethod2Template(
            24,
            "Bahasa Malaysia",
            "Standard 2",
            "Kata Hubung",
            "Pilih kata hubung yang betul",
            "link"
        ),
        data: {
            question: "Drag kata hubung yang betul.",
            questions: [
                { 
                    text: "Ali _______ Ahmad pergi ke sekolah.", 
                    options: ["dan", "atau"], 
                    correctAnswer: "dan" 
                },
                { 
                    text: "Siti _______ tidak datang ke sekolah.", 
                    options: ["tetapi", "kerana"], 
                    correctAnswer: "kerana" 
                },
                { 
                    text: "Dia belajar bersungguh-sungguh _______ ingin berjaya.", 
                    options: ["kerana", "tetapi"], 
                    correctAnswer: "kerana" 
                },
                { 
                    text: "Mahukan teh _______ kopi?", 
                    options: ["atau", "dan"], 
                    correctAnswer: "atau" 
                }
            ]
        }
    }
];