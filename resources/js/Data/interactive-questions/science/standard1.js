// resources/js/data/interactive-questions/science/standard1.js
import { 
    createMethod1Template, 
    createMethod2Template, 
    createMethod3Template 
} from '../interactive-questions/templates.js';

export const scienceStandard1Questions = [
    // Method 1: Animal Groups
    {
        ...createMethod1Template(
            50,
            "Sains",
            "Standard 1",
            "Animal Groups",
            "Classify animals into groups",
            "droplet"
        ),
        data: {
            question: "Drag the correct animal group.",
            answers: ["Mamalia", "Burung", "Ikan", "Reptilia"],
            questions: [
                { text: "Kucing adalah _______", correctAnswer: "Mamalia" },
                { text: "Helang adalah _______", correctAnswer: "Burung" },
                { text: "Ikan Koi adalah _______", correctAnswer: "Ikan" },
                { text: "Ular adalah _______", correctAnswer: "Reptilia" }
            ]
        }
    }
];