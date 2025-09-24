// src/Pages/WordGridGame.jsx
import React, { useState, useEffect } from "react";

export default function WordGridGame() {
  // Senarai soalan
  const questions = [
    {
      word: "SENANDUNG",
      hints: [
        "Satu jenis nyanyian",
        "Lazimnya berirama merdu",
        "Biasa dalam puisi / lagu rakyat",
      ],
    },
    {
      word: "MERDU",
      hints: [
        "Bunyi yang sedap didengar",
        "Lawannya sumbang",
        "Biasa digunakan untuk suara / muzik",
      ],
    },
    {
      word: "KAKIAYAM",
      hints: [
        "Simpulan bahasa",
        "Bermaksud tidak berkasut",
        "Kanak-kanak suka begitu",
      ],
    },
    {
      word: "BUNGA",
      hints: [
        "Cantik dan berwarna-warni",
        "Selalu dijadikan hiasan",
        "Ada kaitan dengan taman",
      ],
    },
    {
      word: "PANDUAN",
      hints: [
        "Memberi arah atau tunjuk ajar",
        "Boleh dalam bentuk buku atau nasihat",
        "Sama maksud dengan petunjuk",
      ],
    },
    {
      word: "HARAPAN",
      hints: [
        "Sesuatu yang diinginkan",
        "Berkaitan dengan cita-cita",
        "Kebalikan dari putus asa",
      ],
    },
    {
      word: "CINTA",
      hints: [
        "Perasaan kasih sayang",
        "Boleh antara keluarga, sahabat atau pasangan",
        "Simbolnya ❤️",
      ],
    },
    {
      word: "ILMU",
      hints: [
        "Sesuatu yang dipelajari",
        "Bekalan sepanjang hayat",
        "Diperoleh melalui pendidikan",
      ],
    },
  ];

  // Generate grid rawak + letak huruf jawapan
  function randomGridWithWord(word, size = 3) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        alphabet[Math.floor(Math.random() * alphabet.length)]
      )
    );

    // Flatten grid positions
    const flatPositions = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        flatPositions.push([r, c]);
      }
    }

    // Shuffle posisi
    for (let i = flatPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatPositions[i], flatPositions[j]] = [
        flatPositions[j],
        flatPositions[i],
      ];
    }

    // Masukkan huruf perkataan
    for (let i = 0; i < word.length && i < flatPositions.length; i++) {
      const [r, c] = flatPositions[i];
      grid[r][c] = word[i];
    }

    return grid;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState("");
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null
  const [showHint, setShowHint] = useState(false);
  const [grid, setGrid] = useState(
    randomGridWithWord(questions[0].word, 3)
  );

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setGrid(randomGridWithWord(currentQuestion.word, 3));
  }, [currentIndex]);

  const handleClick = (row, col) => {
    const index = `${row}-${col}`;
    if (usedIndexes.includes(index)) return;

    const newWord = selectedWord + grid[row][col];
    setSelectedWord(newWord);
    setUsedIndexes((prev) => [...prev, index]);

    if (newWord.length === currentQuestion.word.length) {
      if (newWord === currentQuestion.word) {
        setStatus("correct");
      } else {
        setStatus("wrong");
      }
    }
  };

  const handleReset = () => {
    setSelectedWord("");
    setUsedIndexes([]);
    setStatus(null);
    setShowHint(false);
    setGrid(randomGridWithWord(currentQuestion.word, 3));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedWord("");
      setUsedIndexes([]);
      setStatus(null);
      setShowHint(false);
    } else {
      alert("🎉 Semua soalan selesai!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-yellow-200 p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Permainan Teka Kata
        </h1>

        {/* Grid huruf */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const index = `${rIdx}-${cIdx}`;
              const isUsed = usedIndexes.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => handleClick(rIdx, cIdx)}
                  disabled={isUsed || status !== null}
                  className={`w-20 h-20 rounded-xl border text-3xl font-bold shadow-md transition
                    ${
                      isUsed
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-100"
                    }
                    ${status === "correct" ? "cursor-default" : ""}
                  `}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        {/* Jawapan */}
        <div className="text-lg font-semibold text-gray-700 mb-3">
          Jawapan:{" "}
          <span
            className={`px-2 py-1 rounded-md ${
              status === "correct"
                ? "bg-green-100 text-green-700"
                : status === "wrong"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {selectedWord || "..."}
          </span>
        </div>

        {/* Status */}
        {status === "correct" && (
          <div className="text-green-600 font-bold text-xl mb-3">
            ✅ Betul!
          </div>
        )}
        {status === "wrong" && (
          <div className="text-red-600 font-bold text-xl mb-3">
            ❌ Salah, cuba lagi
          </div>
        )}

        {/* Butang hint */}
        <button
          onClick={() => setShowHint(!showHint)}
          className="mb-4 text-sm text-blue-600 underline"
        >
          {showHint ? "Sembunyikan Petunjuk" : "Lihat Petunjuk"}
        </button>

        {/* Hints */}
        {showHint && (
          <ul className="mb-4 text-left list-disc list-inside text-gray-700 space-y-1">
            {currentQuestion.hints.map((h, idx) => (
              <li key={idx}>{h}</li>
            ))}
          </ul>
        )}

        {/* Butang kawalan */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reset
          </button>
          {status === "correct" && (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
