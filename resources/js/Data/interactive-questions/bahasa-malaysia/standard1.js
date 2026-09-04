// resources/js/data/interactive-questions/bahasa-malaysia/standard1.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../templates.js';

export const bahasaMalaysiaStandard1Questions = [
    // Method 1: Huruf Vokal
    {
        ...createMethod1Template(
            10,
            "bahasa-malaysia",
            "Standard 1",
            "Huruf Vokal",
            "Padankan huruf vokal",
            "type"
        ),
        data: {
            question: "Drag huruf vokal ke tempat yang betul.",
            answers: ["A", "E", "I", "O"],
            questions: [
                { text: "__yam", correctAnswer: "A" },
                { text: "__nak", correctAnswer: "E" },
                { text: "__kan", correctAnswer: "I" },
                { text: "__rang", correctAnswer: "O" }
            ]
        }
    },

    // Method 2: Kata Nama Am
    {
        ...createMethod2Template(
            11,
            "bahasa-malaysia",
            "Standard 1",
            "Kata Nama Am",
            "Pilih kata nama am yang betul",
            "book-open"
        ),
        data: {
            question: "Drag jawapan yang betul.",
            questions: [
                { 
                    text: "Tempat belajar", 
                    options: ["Sekolah", "Rumah"], 
                    correctAnswer: "Sekolah" 
                },
                { 
                    text: "Alat tulis", 
                    options: ["Pensel", "Kereta"], 
                    correctAnswer: "Pensel" 
                },
                { 
                    text: "Benda hidup", 
                    options: ["Pokok", "Batu"], 
                    correctAnswer: "Pokok" 
                },
                { 
                    text: "Kenderaan", 
                    options: ["Bas", "Meja"], 
                    correctAnswer: "Bas" 
                }
            ]
        }
    },

    // Method 3: Ayat Tunggal
    {
        ...createMethod3Template(
            12,
            "bahasa-malaysia",
            "Standard 1",
            "Ayat Tunggal",
            "Bina ayat tunggal",
            "message-circle"
        ),
        data: {
            question: "Pilih ayat yang betul.",
            questions: [
                {
                    text: "Pilih ayat yang betul.",
                    options: ["Ali makan.", "Makan Ali.", "Ali dan makan."],
                    correctAnswer: "Ali makan."
                }
            ]
        }
    }
];