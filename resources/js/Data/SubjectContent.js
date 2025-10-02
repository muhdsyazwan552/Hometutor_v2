// Content structure with IDs for each subject and standard combination
export const SubjectContent = {
  'bahasa-melayu': {
    'Form 4': {
      id: 1,
      sections: [
        {
          id: 1,
          title: 'Keperihalan',
          practiceType: 'Subjective',
          videos: [
            { title: 'BM Form 4 - Ayat Permulaan Karangan', duration: '05:30', thumbnail: '' },
            { title: 'Teknik Menulis Form 4', duration: '03:20', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Rencana',
          practiceType: 'Objective',
          videos: [
            { title: 'Menulis Karangan Form 4', duration: '03:45', thumbnail: '' },
            { title: 'Struktur Ayat Form 4', duration: '04:10', thumbnail: '' },
          ],
        },
        {
          id: 3,
          title: 'Perbincangan',
          practiceType: 'Subjective',
          videos: [
            { title: 'Menyatakan Pendapat Form 4', duration: '04:50', thumbnail: '' },
          ],
        },
      ]
    },
    'Form 5': {
      id: 2,
      sections: [
        {
          id: 1,
          title: 'Laporan',
          practiceType: 'Subjective',
          videos: [
            { title: 'BM Form 5 - Teknik Laporan', duration: '06:10', thumbnail: '' },
            { title: 'Format Laporan Form 5', duration: '04:05', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Ulasan',
          practiceType: 'Objective',
          videos: [
            { title: 'Teknik Mengulas Form 5', duration: '04:30', thumbnail: '' },
            { title: 'Contoh Ulasan Form 5', duration: '05:15', thumbnail: '' },
          ],
        },
        {
          id: 3,
          title: 'Ceramah',
          practiceType: 'Subjective',
          videos: [
            { title: 'Persediaan Ceramah Form 5', duration: '05:25', thumbnail: '' },
          ],
        },
      ]
    }
  },
  'bahasa-inggeris': {
    'Form 4': {
      id: 3,
      sections: [
        {
          id: 1,
          title: 'Descriptive Essay',
          practiceType: 'Subjective',
          videos: [
            { title: 'English Form 4 - Descriptive Writing', duration: '05:30', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Narrative Writing',
          practiceType: 'Objective',
          videos: [
            { title: 'Narrative Techniques Form 4', duration: '04:10', thumbnail: '' },
          ],
        },
      ]
    },
    'Form 5': {
      id: 4,
      sections: [
        {
          id: 1,
          title: 'Argumentative Essay',
          practiceType: 'Subjective',
          videos: [
            { title: 'Argumentative Writing Form 5', duration: '06:10', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Report Writing',
          practiceType: 'Objective',
          videos: [
            { title: 'Formal Report Writing Form 5', duration: '05:15', thumbnail: '' },
          ],
        },
      ]
    }
  },
  'matematik': {
    'Form 4': {
      id: 5,
      sections: [
        {
          id: 1,
          title: 'Algebra',
          practiceType: 'Objective',
          videos: [
            { title: 'Algebra Basics Form 4', duration: '05:30', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Geometry',
          practiceType: 'Objective',
          videos: [
            { title: 'Geometry Form 4', duration: '04:10', thumbnail: '' },
          ],
        },
      ]
    },
    'Form 5': {
      id: 6,
      sections: [
        {
          id: 1,
          title: 'Calculus',
          practiceType: 'Objective',
          videos: [
            { title: 'Calculus Introduction Form 5', duration: '06:10', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Statistics',
          practiceType: 'Objective',
          videos: [
            { title: 'Statistics Form 5', duration: '05:15', thumbnail: '' },
          ],
        },
      ]
    }
  },
  'matematik-tambahan': {
    'Form 4': {
      id: 9,
      sections: [
        {
          id: 1,
          title: 'Fungsi',
          practiceType: 'Objective',
          videos: [
            { title: 'Pengenalan Fungsi Form 4', duration: '06:20', thumbnail: '' },
            { title: 'Jenis-jenis Fungsi', duration: '07:15', thumbnail: '' },
            { title: 'Fungsi Komposit', duration: '08:30', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Persamaan Kuadratik',
          practiceType: 'Objective',
          videos: [
            { title: 'Asas Persamaan Kuadratik', duration: '05:45', thumbnail: '' },
            { title: 'Pemfaktoran Kuadratik', duration: '06:50', thumbnail: '' },
            { title: 'Rumus Kuadratik', duration: '07:25', thumbnail: '' },
          ],
        },
        {
          id: 3,
          title: 'Indeks dan Logaritma',
          practiceType: 'Objective',
          videos: [
            { title: 'Hukum Indeks Form 4', duration: '05:10', thumbnail: '' },
            { title: 'Pengenalan Logaritma', duration: '06:40', thumbnail: '' },
            { title: 'Hukum Logaritma', duration: '07:15', thumbnail: '' },
          ],
        },
        {
          id: 4,
          title: 'Geometri Koordinat',
          practiceType: 'Objective',
          videos: [
            { title: 'Garis Lurus dan Kecerunan', duration: '06:20', thumbnail: '' },
            { title: 'Persamaan Garis Lurus', duration: '05:45', thumbnail: '' },
            { title: 'Jarak dan Titik Tengah', duration: '04:50', thumbnail: '' },
          ],
        }
      ]
    },
    'Form 5': {
      id: 10,
      sections: [
        {
          id: 1,
          title: 'Kalkulus Pembezaan',
          practiceType: 'Objective',
          videos: [
            { title: 'Had dan Terbitan Form 5', duration: '08:10', thumbnail: '' },
            { title: 'Pembezaan Fungsi Polinomial', duration: '07:25', thumbnail: '' },
            { title: 'Aplikasi Pembezaan', duration: '09:15', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Kalkulus Pengamiran',
          practiceType: 'Objective',
          videos: [
            { title: 'Pengenalan Pengamiran', duration: '07:40', thumbnail: '' },
            { title: 'Kaedah Pengamiran', duration: '08:20', thumbnail: '' },
            { title: 'Aplikasi Pengamiran', duration: '09:05', thumbnail: '' },
          ],
        },
        {
          id: 3,
          title: 'Trigonometri',
          practiceType: 'Objective',
          videos: [
            { title: 'Fungsi Trigonometri Form 5', duration: '06:50', thumbnail: '' },
            { title: 'Graf Fungsi Trigonometri', duration: '07:35', thumbnail: '' },
            { title: 'Identiti Trigonometri', duration: '08:15', thumbnail: '' },
          ],
        },
        {
          id: 4,
          title: 'Vektor',
          practiceType: 'Objective',
          videos: [
            { title: 'Pengenalan Vektor Form 5', duration: '06:10', thumbnail: '' },
            { title: 'Operasi Vektor', duration: '07:20', thumbnail: '' },
            { title: 'Vektor dalam 3D', duration: '08:40', thumbnail: '' },
          ],
        },
        {
          id: 5,
          title: 'Kebarangkalian',
          practiceType: 'Objective',
          videos: [
            { title: 'Kebarangkalian Peristiwa', duration: '06:30', thumbnail: '' },
            { title: 'Taburan Kebarangkalian', duration: '07:45', thumbnail: '' },
            { title: 'Taburan Normal', duration: '08:25', thumbnail: '' },
          ],
        }
      ]
    }
  },
  'sains': {
    'Form 4': {
      id: 7,
      sections: [
        {
          id: 1,
          title: 'Biology',
          practiceType: 'Objective',
          videos: [
            { title: 'Biology Basics Form 4', duration: '05:30', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Chemistry',
          practiceType: 'Objective',
          videos: [
            { title: 'Chemistry Form 4', duration: '04:10', thumbnail: '' },
          ],
        },
      ]
    },
    'Form 5': {
      id: 8,
      sections: [
        {
          id: 1,
          title: 'Physics',
          practiceType: 'Objective',
          videos: [
            { title: 'Physics Form 5', duration: '06:10', thumbnail: '' },
          ],
        },
        {
          id: 2,
          title: 'Environmental Science',
          practiceType: 'Objective',
          videos: [
            { title: 'Environmental Science Form 5', duration: '05:15', thumbnail: '' },
          ],
        },
      ]
    }
  }
};

export default SubjectContent;