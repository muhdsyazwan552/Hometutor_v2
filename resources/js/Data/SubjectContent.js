// resources/js/Data/SubjectContent.js

export const SubjectContent = {
  'bahasa-melayu': {
    'Form 4': {
      id: 1,
      sections: [
        {
          id: "1",
          title: "Keperihalan",
          practiceType: "Objective",
          videos: [
            { title: "Pengenalan Karangan Keperihalan", duration: "18:30" },
            { title: "Teknik Menulis Keperihalan Berkesan", duration: "22:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Pengenalan Keperihalan",
              practiceType: "Objective",
              videos: [
                { title: "Definisi dan Ciri-ciri Keperihalan", duration: "15:20" },
                { title: "Jenis-jenis Karangan Keperihalan", duration: "19:45" }
              ]
            },
            {
              id: "1.2",
              title: "Teknik Penulisan Keperihalan",
              practiceType: "Subjective",
              videos: [
                { title: "Penggunaan Deria dalam Keperihalan", duration: "17:30" },
                { title: "Membina Ayat Deskriptif", duration: "21:10" }
              ]
            },
            
          ]
        },
        {
          id: "2",
          title: "Rencana",
          practiceType: "Subjective",
          videos: [
            { title: "Struktur Penulisan Rencana", duration: "20:25" },
            { title: "Teknik Membina Hujah", duration: "25:40" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Format Rencana",
              practiceType: "Objective",
              videos: [
                { title: "Bahagian-bahagian Rencana", duration: "16:15" },
                { title: "Contoh Rencana yang Baik", duration: "18:50" }
              ]
            },
            {
              id: "2.2",
              title: "Bahasa dan Gaya Rencana",
              practiceType: "Subjective",
              videos: [
                { title: "Penggunaan Bahasa Persuasif", duration: "19:20" },
                { title: "Teknik Mengukuhkan Hujah", duration: "23:35" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 2,
      sections: [
        {
          id: "1",
          title: "Laporan",
          practiceType: "Subjective",
          videos: [
            { title: "Format Penulisan Laporan", duration: "19:45" },
            { title: "Teknik Menulis Laporan Berkesan", duration: "24:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Jenis-jenis Laporan",
              practiceType: "Objective",
              videos: [
                { title: "Laporan Formal dan Tidak Formal", duration: "14:30" },
                { title: "Laporan Akademik", duration: "17:55" }
              ]
            },
            {
              id: "1.2",
              title: "Struktur Laporan",
              practiceType: "Subjective",
              videos: [
                { title: "Bahagian Pengenalan Laporan", duration: "16:40" },
                { title: "Penulisan Isi dan Kesimpulan", duration: "20:25" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Ucapan",
          practiceType: "Subjective",
          videos: [
            { title: "Teknik Berucap di Khalayak", duration: "21:15" },
            { title: "Struktur Ucapan yang Berkesan", duration: "26:30" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Persediaan Ucapan",
              practiceType: "Objective",
              videos: [
                { title: "Menganalisis Audiens", duration: "15:50" },
                { title: "Menyusun Isi Kandungan", duration: "18:25" }
              ]
            },
            {
              id: "2.2",
              title: "Teknik Penyampaian",
              practiceType: "Subjective",
              videos: [
                { title: "Penggunaan Bahasa Badan", duration: "17:10" },
                { title: "Pengawalan Suara dan Intonasi", duration: "19:45" }
              ]
            }
          ]
        }
      ]
    }
  },

  'matematik': {
    'Form 4': {
      id: 3,
      sections: [
        {
          id: "1",
          title: "Algebra",
          practiceType: "Objective",
          videos: [
            { title: "Pengenalan kepada Algebra", duration: "22:30" },
            { title: "Penyelesaian Persamaan Linear", duration: "25:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Asas Algebra",
              practiceType: "Objective",
              videos: [
                { title: "Pembolehubah dan Ungkapan", duration: "18:20" },
                { title: "Operasi Algebra Asas", duration: "20:45" }
              ]
            },
            {
              id: "1.2",
              title: "Persamaan Linear",
              practiceType: "Objective",
              videos: [
                { title: "Menyelesaikan Persamaan Linear", duration: "19:30" },
                { title: "Aplikasi Persamaan Linear", duration: "23:15" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Geometri",
          practiceType: "Objective",
          videos: [
            { title: "Konsep Asas Geometri", duration: "24:40" },
            { title: "Pengiraan Luas dan Isipadu", duration: "28:25" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Bentuk 2D",
              practiceType: "Objective",
              videos: [
                { title: "Segi Tiga dan Segi Empat", duration: "20:15" },
                { title: "Bulatan dan Sektor", duration: "22:50" }
              ]
            },
            {
              id: "2.2",
              title: "Bentuk 3D",
              practiceType: "Objective",
              videos: [
                { title: "Kubus dan Kuboid", duration: "21:30" },
                { title: "Silinder dan Kon", duration: "25:10" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 4,
      sections: [
        {
          id: "1",
          title: "Kalkulus",
          practiceType: "Objective",
          videos: [
            { title: "Pengenalan kepada Kalkulus", duration: "26:45" },
            { title: "Konsep Had dan Terbitan", duration: "29:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Pembezaan",
              practiceType: "Objective",
              videos: [
                { title: "Terbitan Fungsi Polinomial", duration: "22:15" },
                { title: "Peraturan Pembezaan", duration: "24:40" }
              ]
            },
            {
              id: "1.2",
              title: "Pengamiran",
              practiceType: "Objective",
              videos: [
                { title: "Kamiran Tak Tentu", duration: "23:25" },
                { title: "Kamiran Tentu", duration: "26:50" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Geometri Koordinat",
          practiceType: "Objective",
          videos: [
            { title: "Sistem Koordinat Cartes", duration: "21:35" },
            { title: "Persamaan Garis Lurus", duration: "24:10" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Titik dan Jarak",
              practiceType: "Objective",
              videos: [
                { title: "Mencari Titik Tengah", duration: "18:45" },
                { title: "Rumus Jarak", duration: "20:20" }
              ]
            },
            {
              id: "2.2",
              title: "Kecerunan dan Persamaan",
              practiceType: "Objective",
              videos: [
                { title: "Konsep Kecerunan", duration: "19:30" },
                { title: "Membentuk Persamaan Garis", duration: "22:55" }
              ]
            }
          ]
        }
      ]
    }
  },

  'matematik-tambahan': {
    'Form 4': {
      id: 5,
      sections: [
        {
          id: "1",
          title: "Fungsi",
          practiceType: "Objective",
          videos: [
            { title: "Konsep Fungsi dalam Matematik", duration: "28:30" },
            { title: "Jenis-jenis Fungsi", duration: "31:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Fungsi dan Domain",
              practiceType: "Objective",
              videos: [
                { title: "Definisi Fungsi", duration: "24:20" },
                { title: "Menentukan Domain dan Julat", duration: "26:45" }
              ]
            },
            {
              id: "1.2",
              title: "Fungsi Gubahan dan Songsang",
              practiceType: "Objective",
              videos: [
                { title: "Fungsi Gubahan f(g(x))", duration: "25:30" },
                { title: "Mencari Fungsi Songsang", duration: "28:15" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Persamaan Kuadratik",
          practiceType: "Objective",
          videos: [
            { title: "Penyelesaian Kuadratik", duration: "29:40" },
            { title: "Aplikasi Persamaan Kuadratik", duration: "32:25" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Bentuk Kuadratik",
              practiceType: "Objective",
              videos: [
                { title: "Bentuk Am Kuadratik", duration: "25:15" },
                { title: "Pemfaktoran Kuadratik", duration: "27:50" }
              ]
            },
            {
              id: "2.2",
              title: "Rumus Kuadratik",
              practiceType: "Objective",
              videos: [
                { title: "Terbitan Rumus Kuadratik", duration: "26:30" },
                { title: "Aplikasi Rumus Kuadratik", duration: "29:10" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 6,
      sections: [
        {
          id: "1",
          title: "Kalkulus Pembezaan",
          practiceType: "Objective",
          videos: [
            { title: "Pembezaan Lanjutan", duration: "32:45" },
            { title: "Aplikasi Pembezaan", duration: "35:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Peraturan Rantai",
              practiceType: "Objective",
              videos: [
                { title: "Konsep Peraturan Rantai", duration: "28:15" },
                { title: "Aplikasi Peraturan Rantai", duration: "30:40" }
              ]
            },
            {
              id: "1.2",
              title: "Pembezaan Fungsi Trigonometri",
              practiceType: "Objective",
              videos: [
                { title: "Terbitan sin, cos, tan", duration: "29:25" },
                { title: "Aplikasi Trigonometri", duration: "32:50" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Kalkulus Pengamiran",
          practiceType: "Objective",
          videos: [
            { title: "Pengamiran Fungsi", duration: "31:35" },
            { title: "Teknik Pengamiran", duration: "34:10" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Kamiran Tak Tentu",
              practiceType: "Objective",
              videos: [
                { title: "Konsep Kamiran", duration: "27:45" },
                { title: "Teknik Pengamiran Asas", duration: "29:20" }
              ]
            },
            {
              id: "2.2",
              title: "Kamiran Tentu",
              practiceType: "Objective",
              videos: [
                { title: "Had dan Kamiran Tentu", duration: "28:30" },
                { title: "Aplikasi Kamiran Tentu", duration: "31:55" }
              ]
            }
          ]
        }
      ]
    }
  },

  'sains': {
    'Form 4': {
      id: 7,
      sections: [
        {
          id: "1",
          title: "Biologi Sel",
          practiceType: "Objective",
          videos: [
            { title: "Struktur dan Fungsi Sel", duration: "25:30" },
            { title: "Proses dalam Sel", duration: "28:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Struktur Sel",
              practiceType: "Objective",
              videos: [
                { title: "Organel Sel Haiwan dan Tumbuhan", duration: "21:20" },
                { title: "Fungsi Mitokondria dan Kloroplas", duration: "23:45" }
              ]
            },
            {
              id: "1.2",
              title: "Pembahagian Sel",
              practiceType: "Objective",
              videos: [
                { title: "Proses Mitosis", duration: "22:30" },
                { title: "Proses Meiosis", duration: "25:15" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Kimia Asas",
          practiceType: "Objective",
          videos: [
            { title: "Unsur, Sebatian dan Campuran", duration: "26:40" },
            { title: "Jadual Berkala Unsur", duration: "29:25" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Struktur Atom",
              practiceType: "Objective",
              videos: [
                { title: "Proton, Neutron, Elektron", duration: "22:15" },
                { title: "Konfigurasi Elektron", duration: "24:50" }
              ]
            },
            {
              id: "2.2",
              title: "Ikatan Kimia",
              practiceType: "Objective",
              videos: [
                { title: "Ikatan Ionik dan Kovalen", duration: "23:30" },
                { title: "Sifat Sebatian Kimia", duration: "26:10" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 8,
      sections: [
        {
          id: "1",
          title: "Fizik Moden",
          practiceType: "Objective",
          videos: [
            { title: "Gelombang dan Cahaya", duration: "27:45" },
            { title: "Elektrik dan Magnet", duration: "30:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Gelombang",
              practiceType: "Objective",
              videos: [
                { title: "Jenis-jenis Gelombang", duration: "23:15" },
                { title: "Sifat Gelombang", duration: "25:40" }
              ]
            },
            {
              id: "1.2",
              title: "Elektromagnet",
              practiceType: "Objective",
              videos: [
                { title: "Medan Elektrik dan Magnet", duration: "24:25" },
                { title: "Aplikasi Elektromagnet", duration: "27:50" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Biologi Tingkatan 5",
          practiceType: "Objective",
          videos: [
            { title: "Sistem Badan Manusia", duration: "28:35" },
            { title: "Genetik dan Pewarisan", duration: "31:10" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Sistem Pencernaan",
              practiceType: "Objective",
              videos: [
                { title: "Organ Pencernaan", duration: "24:45" },
                { title: "Proses Pencernaan", duration: "26:20" }
              ]
            },
            {
              id: "2.2",
              title: "Genetik Asas",
              practiceType: "Objective",
              videos: [
                { title: "DNA dan Kromosom", duration: "25:30" },
                { title: "Pewarisan Sifat", duration: "28:55" }
              ]
            }
          ]
        }
      ]
    }
  },

  'english': {
    'Form 4': {
      id: 9,
      sections: [
        {
          id: "1",
          title: "Language Awareness",
          practiceType: "Objective",
          videos: [
            { title: "Introduction to English Grammar", duration: "20:30" },
            { title: "Parts of Speech Mastery", duration: "23:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Parts of Speech",
              practiceType: "Objective",
              videos: [
                { title: "Nouns, Verbs, and Adjectives", duration: "16:20" },
                { title: "Adverbs and Prepositions", duration: "18:45" }
              ]
            },
            {
              id: "1.2",
              title: "Tenses and Agreement",
              practiceType: "Objective",
              videos: [
                { title: "Present and Past Tenses", duration: "17:30" },
                { title: "Subject-Verb Agreement", duration: "20:15" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Writing Skills",
          practiceType: "Subjective",
          videos: [
            { title: "Essay Writing Techniques", duration: "25:40" },
            { title: "Creative Writing", duration: "28:25" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Essay Structure",
              practiceType: "Subjective",
              videos: [
                { title: "Introduction and Thesis", duration: "21:15" },
                { title: "Body Paragraphs Development", duration: "23:50" }
              ]
            },
            {
              id: "2.2",
              title: "Writing Style",
              practiceType: "Subjective",
              videos: [
                { title: "Formal vs Informal Writing", duration: "22:30" },
                { title: "Vocabulary Enhancement", duration: "25:10" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 10,
      sections: [
        {
          id: "1",
          title: "Advanced Grammar",
          practiceType: "Objective",
          videos: [
            { title: "Complex Sentence Structures", duration: "26:45" },
            { title: "Advanced Tenses", duration: "29:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Conditional Sentences",
              practiceType: "Objective",
              videos: [
                { title: "If-clauses Types 1,2,3", duration: "22:15" },
                { title: "Mixed Conditionals", duration: "24:40" }
              ]
            },
            {
              id: "1.2",
              title: "Reported Speech",
              practiceType: "Objective",
              videos: [
                { title: "Direct to Indirect Speech", duration: "23:25" },
                { title: "Reporting Verbs", duration: "26:50" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Comprehension and Analysis",
          practiceType: "Subjective",
          videos: [
            { title: "Reading Comprehension", duration: "27:35" },
            { title: "Text Analysis", duration: "30:10" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Reading Strategies",
              practiceType: "Subjective",
              videos: [
                { title: "Skimming and Scanning", duration: "23:45" },
                { title: "Inference Skills", duration: "25:20" }
              ]
            },
            {
              id: "2.2",
              title: "Literary Analysis",
              practiceType: "Subjective",
              videos: [
                { title: "Theme and Character Analysis", duration: "24:30" },
                { title: "Poetry Analysis", duration: "27:55" }
              ]
            }
          ]
        }
      ]
    }
  },

  'sejarah': {
    'Form 4': {
      id: 11,
      sections: [
        {
          id: "1",
          title: "Warisan Negara Bangsa",
          practiceType: "Objective",
          videos: [
            { title: "Sejarah Awal Negara Kita", duration: "28:30" },
            { title: "Pembentukan Negara Bangsa", duration: "31:15" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Kebangkitan Nasionalisme",
              practiceType: "Objective",
              videos: [
                { title: "Gerakan Nasionalisme Awal", duration: "24:20" },
                { title: "Tokoh-tokoh Nasionalisme", duration: "26:45" }
              ]
            },
            {
              id: "1.2",
              title: "Konflik dan Pendudukan",
              practiceType: "Objective",
              videos: [
                { title: "Pendudukan Jepun", duration: "25:30" },
                { title: "Kesan Perang Dunia", duration: "28:15" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Era Peralihan Kuasa",
          practiceType: "Objective",
          videos: [
            { title: "British di Negara Kita", duration: "29:40" },
            { title: "Perjuangan Kemerdekaan", duration: "32:25" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Dasar British",
              practiceType: "Objective",
              videos: [
                { title: "Sistem Residen", duration: "25:15" },
                { title: "Malayan Union", duration: "27:50" }
              ]
            },
            {
              id: "2.2",
              title: "Reaksi Penduduk",
              practiceType: "Objective",
              videos: [
                { title: "Penentangan Terhadap British", duration: "26:30" },
                { title: "Peranan Golongan Elite", duration: "29:10" }
              ]
            }
          ]
        }
      ]
    },
    'Form 5': {
      id: 12,
      sections: [
        {
          id: "1",
          title: "Pembentukan Malaysia",
          practiceType: "Objective",
          videos: [
            { title: "Gagasan Malaysia", duration: "30:45" },
            { title: "Proses Pembentukan", duration: "33:20" }
          ],
          subSections: [
            {
              id: "1.1",
              title: "Cadangan dan Reaksi",
              practiceType: "Objective",
              videos: [
                { title: "Tunku Abdul Rahman", duration: "26:15" },
                { title: "Reaksi Negeri-negeri", duration: "28:40" }
              ]
            },
            {
              id: "1.2",
              title: "Cabaran Awal",
              practiceType: "Objective",
              videos: [
                { title: "Konfrontasi Indonesia", duration: "27:25" },
                { title: "Pengunduran Singapura", duration: "30:50" }
              ]
            }
          ]
        },
        {
          id: "2",
          title: "Dasar Luar Negara",
          practiceType: "Objective",
          videos: [
            { title: "Hubungan Antarabangsa", duration: "31:35" },
            { title: "Dasar-dasar Luar", duration: "34:10" }
          ],
          subSections: [
            {
              id: "2.1",
              title: "Dasar Pro-Barat",
              practiceType: "Objective",
              videos: [
                { title: "Zaman Tunku Abdul Rahman", duration: "27:45" },
                { title: "Pertubuhan Komanwel", duration: "29:20" }
              ]
            },
            {
              id: "2.2",
              title: "Dasar Berkecuali",
              practiceType: "Objective",
              videos: [
                { title: "Zaman Tun Abdul Razak", duration: "28:30" },
                { title: "Pergerakan Negara-negara Berkecuali", duration: "31:55" }
              ]
            }
          ]
        }
      ]
    }
  }
};

// Helper functions
export const getContentBySubjectForm = (subject, form) => {
  return SubjectContent[subject]?.[form] || null;
};

export const getAvailableSubjects = () => {
  return Object.keys(SubjectContent);
};

export const getFormsBySubject = (subject) => {
  return Object.keys(SubjectContent[subject] || {});
};

export const getSectionsBySubjectForm = (subject, form) => {
  return SubjectContent[subject]?.[form]?.sections || [];
};

export default SubjectContent;