import express from 'express';
import { createServer as createViteServer } from 'vite';
import pathLib from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

const __dirname = pathLib.dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists
const DATA_DIR = pathLib.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROFILE_FILE = pathLib.join(DATA_DIR, 'profile.json');
const TEACHERS_FILE = pathLib.join(DATA_DIR, 'teachers.json');
const NEWS_FILE = pathLib.join(DATA_DIR, 'news.json');

// Helper to read JSON safely with fallback
function readJsonFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Gagal membaca ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON safely
function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Gagal menulis ke ${filePath}:`, err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // Default initial databases with Dr. H. Hamzah as Principal and all 43 teachers/staf
  const defaultProfile = {
    schoolName: "MTsN 3 Jeneponto",
    accreditation: "Predikat A (Peringkat I Sul-Sel)",
    principalName: "Dr. H. HAMZAH, S.Ag, S.Pd, M.Pd",
    principalTitle: "Kepala Madrasah MTsN 3 Jeneponto",
    principalNip: "197109062007011025",
    principalWelcome: "Puji syukur kehadirat Allah SWT atas limpahan rahmat-Nya sehingga kita dapat terus mendampingi putra-putri terbaik daerah dalam menimba ilmu. MTsN 3 Jeneponto hadir sebagai solusi pendidikan berstandar nasional yang mengintegrasikan kecerdasan intelektual, emosional, spiritual, serta kesiapan teknologi digital masa kini.\n\nKami berkomitmen untuk mendidik generasi muda di Jeneponto agar tidak hanya mahir dalam sains dan teknologi, namun juga kokoh dalam akidah, mulia dalam akhlak, serta hafal Al-Qur'an (Tahfidz). Predikat Akreditasi A tingkat nasional dan peringkat pertama tingkat Sulawesi Selatan membuktikan dedikasi tinggi kami secara berkelanjutan.",
    principalPhoto: "/src/assets/images/mtsn3_principal_portrait_1791344788072.jpg",
    vision: "Terwujudnya madrasah yang Mandiri, Berprestasi, Unggul dalam IPTEK, Kokoh dalam IMTAK, berwawasan lingkungan, dan berkarakter Islami secara menyeluruh.",
    mission: [
      "Melaksanakan pembelajaran efektif & interaktif berbasis digital.",
      "Menanamkan akidah lurus, penguatan akhlakul karimah, dan kecintaan ibadah.",
      "Mengoptimalkan sarana TIK untuk kelancaran PAS Online & digitalisasi kelas.",
      "Menumbuhkan budaya cinta kebersihan, ramah anak, dan kelestarian lingkungan."
    ],
    facilities: [
      "Laboratorium Komputer Representatif khusus PAS Online.",
      "Perpustakaan dengan koleksi buku terpadu & nyaman.",
      "Musholla Al-Ikhlas sebagai episentrum pembinaan ibadah.",
      "Akses Hotspot Internet berkecepatan tinggi di area kampus.",
      "Lapangan Olahraga serbaguna rindang & aman."
    ]
  };

  const defaultTeachers = [
    { id: "1", name: "Dr. H. HAMZAH, S.Ag, S.Pd, M.Pd", role: "Kepala Madrasah", nip: "197109062007011025", status: "PNS", desc: "Memimpin MTsN 3 Jeneponto dengan dedikasi tinggi menuju madrasah digital berstandar nasional." },
    { id: "2", name: "MUH ILYAS, S.Pd.I", role: "Kepala Tata Usaha (KTU)", nip: "197112171998031001", status: "PNS", desc: "Mengoordinasi seluruh administrasi umum, kearsipan, dan operasional staf tata usaha madrasah." },
    { id: "3", name: "RACHMAWATI, S.Ag", role: "Wakamad Kurikulum", nip: "197208291999032001", status: "PNS", desc: "Mengembangkan rencana program pembelajaran terpadu Kurikulum Merdeka & K13." },
    { id: "4", name: "RABASIAH ANRIANI, S.Pd.I., MA", role: "Wakamad Kesiswaan", nip: "198305162009012002", status: "PNS", desc: "Membina kedisiplinan, prestasi, minat-bakat, serta organisasi kesiswaan (OSIM)." },
    { id: "5", name: "NURHAYATI, S.Pd.I., MA", role: "Wakamad Sarpras", nip: "198112212007102004", status: "PNS", desc: "Mengelola ketersediaan, pemeliharaan, dan kenyamanan fasilitas belajar mengajar kampus." },
    { id: "6", name: "MUHAMAD SAFIR, S.Pd.I", role: "Wakamad Humas", nip: "197609062007011008", status: "PNS", desc: "Menjembatani hubungan dan komunikasi harmonis antara madrasah, orang tua, dan masyarakat." },
    { id: "7", name: "SARBINI, S.Pd", role: "Guru BK", nip: "197608022006041006", status: "PNS", desc: "Membimbing perkembangan psikologis, moral, minat karir, dan bimbingan konseling siswa." },
    { id: "8", name: "MUSNIA, S.Ag", role: "Guru", nip: "196912252007012031", status: "PNS", desc: "Guru pengampu mata pelajaran keagamaan yang berfokus pada penguatan karakter religius siswa." },
    { id: "9", name: "SAINAL, S.Pd", role: "Guru", nip: "197412312007101007", status: "PNS", desc: "Pendidik berdedikasi tinggi dalam menumbuhkan kecakapan berpikir kritis siswa." },
    { id: "10", name: "RASNI, S.Pd.I", role: "Guru", nip: "197905162007102001", status: "PNS", desc: "Aktif mengajar dengan pendekatan interaktif dan bersahabat bagi peserta didik." },
    { id: "11", name: "BASMAWATI, S.Ag", role: "Guru", nip: "197809062014122002", status: "PNS", desc: "Berfokus pada pemahaman komprehensif keilmuan Islam dan akhlak siswa." },
    { id: "12", name: "ISHAK, S.Ag", role: "Guru", nip: "197508142014121005", status: "PNS", desc: "Membimbing pendalaman nilai keagamaan dan ibadah harian peserta didik." },
    { id: "13", name: "RIDWAN, S.Pd.I", role: "Guru", nip: "197208242014111002", status: "PNS", desc: "Mengajar bidang keagamaan dengan pendekatan metodis yang menyenangkan." },
    { id: "14", name: "NURFAN, S.Pd.I", role: "Guru", nip: "198304302014111001", status: "PNS", desc: "Aktif membina karakter mulia dan keteladanan harian di madrasah." },
    { id: "15", name: "ARINI ULFA MAWADDAH, S.Pd", role: "Guru", nip: "199403232020122022", status: "PNS", desc: "Menerapkan media visual modern dalam penyampaian materi ajar kelas VII-IX." },
    { id: "16", name: "MIFTAHUL KHAIR, S.Pd.", role: "Guru", nip: "199005172020121009", status: "PNS", desc: "Mengembangkan pembelajaran kreatif guna menstimulasi rasa ingin tahu siswa." },
    { id: "17", name: "RIZKI ISTITAH, S.H.", role: "Guru", nip: "199608052020122021", status: "PNS", desc: "Mendidik kepatuhan hukum, tata negara, dan nilai kewarganegaraan pancasila." },
    { id: "18", name: "SALMAWATI, S.Pd.I", role: "Staf Tata Usaha", nip: "196909092014112003", status: "PNS", desc: "Staf administrasi kependidikan terpadu untuk pelayanan siswa dan guru." },
    { id: "19", name: "A. MONIKA SANTI, S.Pd.", role: "Guru", nip: "199611182020122016", status: "PNS", desc: "Pendidik yang berfokus pada penguasaan kecakapan literasi digital siswa." },
    { id: "20", name: "SARTI RAHAYU, S.Pd.", role: "Guru", nip: "199911222025052009", status: "PNS", desc: "Guru muda berenergi positif dengan inovasi pengajaran interaktif kelas digital." },
    { id: "21", name: "IBNU MAKSUM, S.Pd", role: "Guru", nip: "199312312025051002", status: "PNS", desc: "Mendedikasikan pembelajaran ilmu pengetahuan alam dengan praktek seru." },
    { id: "22", name: "ALFIAH RAMADHANA, S.Pd.", role: "Guru", nip: "199112222023212030", status: "PNS", desc: "Menerapkan program pembelajaran inovatif berbasis pemecahan masalah." },
    { id: "23", name: "TILA INSANIYATI, S.Pd.I", role: "Guru", nip: "198006242022212025", status: "PNS", desc: "Aktif memandu kecerdasan linguistik dan pemahaman bahasa siswa." },
    { id: "24", name: "DUNIATI, SS", role: "Guru", nip: "198606092022212040", status: "PNS", desc: "Mendorong kecintaan siswa terhadap sastra dan apresiasi budaya." },
    { id: "25", name: "FITRIANI. N, S.Pd", role: "Guru", nip: "199005112023212033", status: "PNS", desc: "Melaksanakan bimbingan individu demi kenyamanan psikososial belajar siswa." },
    { id: "26", name: "HASNAWATI, S.Pd", role: "Guru", nip: "198103222022212015", status: "PNS", desc: "Mengampu materi pokok sains dengan eksplorasi lingkungan madrasah." },
    { id: "27", name: "NURJANNAH THAHIR, S.Pd", role: "Guru", nip: "199601012023212042", status: "PNS", desc: "Menanamkan nilai-nilai luhur kebangsaan dan keteladanan sosial." },
    { id: "28", name: "PANDRIS, S.Pd.I.", role: "Guru", nip: "197412072022211004", status: "PNS", desc: "Mengembangkan pembelajaran aqidah akhlak yang terukur dan aplikatif." },
    { id: "29", name: "HASNAWATI, S.Pd.", role: "Guru", nip: "199304052023212045", status: "PNS", desc: "Mengampu program kreativitas seni dan keterampilan lokal daerah." },
    { id: "30", name: "ROSDIANA, S.Ag.", role: "Guru", nip: "196704052022212003", status: "PNS", desc: "Berpengalaman tinggi membina pendalaman fiqih keseharian siswa." },
    { id: "31", name: "SUBAEDA, S.Pd.I.", role: "Guru", nip: "198607052025212005", status: "PNS", desc: "Membimbing pemahaman kajian Qur'an dengan tartil yang indah." },
    { id: "32", name: "JEMI, S.T.", role: "Staf Tata Usaha", nip: "197502192025211005", status: "PNS", desc: "Mengelola bagian IT madrasah, pangkalan data, dan kesiapan PAS Online." },
    { id: "33", name: "ARDI, S.Pd.", role: "Guru", nip: "199107022025211010", status: "PNS", desc: "Guru pembina bakat olahraga, kebugaran fisik, dan kesehatan jasmani." },
    { id: "34", name: "HERNI NENGSI, S.Pd.", role: "Guru", nip: "199412212025212010", status: "PNS", desc: "Pendidik yang berfokus pada penguasaan kecakapan numerasi matematis." },
    { id: "35", name: "HERSA, S.Pd.", role: "Guru", nip: "199405082025212008", status: "PNS", desc: "Melatih penguasaan kosa kata bahasa asing siswa secara aktif." },
    { id: "36", name: "HASMI, S.Pd.I", role: "Guru", nip: "198504272023212021", status: "PNS", desc: "Berkomitmen pada bimbingan akhlakul karimah seluruh siswa madrasah." },
    { id: "37", name: "FATIMA RESKY, S.Pd", role: "Guru", nip: "199712092023212012", status: "PNS", desc: "Melaksanakan pembelajaran aktif yang mendorong kolaborasi antar siswa." },
    { id: "38", name: "SRIYANTI, S.Pd.", role: "Guru", nip: "199407172025212008", status: "PNS", desc: "Pendidik pengampu rumpun sosial kemasyarakatan yang asyik." },
    { id: "39", name: "KASMA, S.Pd.I.", role: "Guru", nip: "198905252025212010", status: "PNS", desc: "Aktif mendampingi program keagamaan putri dan akhlak siswa." },
    { id: "40", name: "SUNARTI, S.E.", role: "Staf Administrasi", nip: "198601252025212011", status: "PNS", desc: "Mengatur laporan keuangan, operasional komite, dan administrasi umum." },
    { id: "41", name: "ADI UMAR PABETA MS, S.Pd.", role: "Guru", nip: "199008012025211006", status: "PNS", desc: "Membimbing kreativitas prakarya dan kewirausahaan siswa sejak dini." },
    { id: "42", name: "NURCAHYANA PATTAHUDDIN", role: "Guru Honorer", nip: "-", status: "Honorer", desc: "Turut berpartisipasi aktif dalam kegiatan belajar mengajar dan pembinaan kesiswaan." },
    { id: "43", name: "NURUL AULIA ROSTAM", role: "Guru Honorer", nip: "-", status: "Honorer", desc: "Mengajar dengan metode dinamis yang disukai kalangan remaja." }
  ];

  const defaultNews = [
    {
      id: "news-1",
      title: "MTsN 3 Jeneponto Sukses Selenggarakan PAS Online Berbasis Android 100% dari Ruang Kelas",
      author: "Syamsul Rijal, S.Si",
      date: "14 September 2026",
      category: "Kurikulum Digital",
      content: "Penilaian Akhir Semester (PAS) Gasal Tahun Pelajaran 2026/2027 terlaksana sepenuhnya secara digital. Melalui laboratorium komputer terintegrasi dan sistem hotspot khusus, 300 lebih siswa kelas VII hingga IX mengerjakan ujian menggunakan gawai Android masing-masing dengan sistem keamanan tinggi.",
      image: "/src/assets/images/mtsn3_students_classroom_1791344823640.jpg"
    },
    {
      id: "news-2",
      title: "MTsN 3 Jeneponto Raih Peringkat I Penyelenggara Akreditasi Nasional",
      author: "Waka Humas",
      date: "12 Juni 2026",
      category: "Prestasi Madrasah",
      content: "Berdasarkan penilaian Badan Akreditasi Nasional, MTsN 3 Jeneponto keluar sebagai sekolah bernilai tertinggi se-Sulawesi Selatan dengan predikat memuaskan.",
      image: "/src/assets/images/mtsn3_school_emblem_1791344811679.jpg"
    }
  ];

  // Initialize DB with fallback
  let profileDb = readJsonFile(PROFILE_FILE, defaultProfile);
  let teachersDb = readJsonFile(TEACHERS_FILE, defaultTeachers);
  let newsDb = readJsonFile(NEWS_FILE, defaultNews);

  // Profile APIs
  app.get('/api/profile', (req, res) => {
    res.json(profileDb);
  });

  app.post('/api/profile', (req, res) => {
    profileDb = { ...profileDb, ...req.body };
    writeJsonFile(PROFILE_FILE, profileDb);
    res.json({ success: true, profile: profileDb });
  });

  // Teachers APIs
  app.get('/api/teachers', (req, res) => {
    res.json(teachersDb);
  });

  app.post('/api/teachers', (req, res) => {
    const { name, role, nip, status, desc } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan Peran guru wajib diisi.' });
    }

    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name,
      role,
      nip: nip || '-',
      status: status || 'PNS',
      desc: desc || ''
    };

    teachersDb.push(newTeacher);
    writeJsonFile(TEACHERS_FILE, teachersDb);
    res.json({ success: true, teacher: newTeacher });
  });

  app.post('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    const { name, role, nip, status, desc } = req.body;
    const idx = teachersDb.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
      teachersDb[idx] = { ...teachersDb[idx], name, role, nip, status, desc };
      writeJsonFile(TEACHERS_FILE, teachersDb);
      return res.json({ success: true, teacher: teachersDb[idx] });
    }
    return res.status(404).json({ error: 'Guru tidak ditemukan.' });
  });

  app.delete('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    teachersDb = teachersDb.filter((t: any) => t.id !== id);
    writeJsonFile(TEACHERS_FILE, teachersDb);
    res.json({ success: true });
  });

  // News APIs
  app.get('/api/news', (req, res) => {
    res.json(newsDb);
  });

  app.post('/api/news', (req, res) => {
    const { title, author, date, category, content, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul berita dan isi konten wajib diisi.' });
    }

    const newArticle = {
      id: `news-${Date.now()}`,
      title,
      author: author || 'Admin Madrasah',
      date: date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      category: category || 'Pengumuman',
      content,
      image: image || '/src/assets/images/mtsn3_school_emblem_1791344811679.jpg'
    };

    newsDb.unshift(newArticle); // Show newer first
    writeJsonFile(NEWS_FILE, newsDb);
    res.json({ success: true, article: newArticle });
  });

  app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    newsDb = newsDb.filter((n: any) => n.id !== id);
    writeJsonFile(NEWS_FILE, newsDb);
    res.json({ success: true });
  });

  // Gemini Chat API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server. Silakan hubungi admin.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
Anda adalah "Asisten Pintar MTsN 3 Jeneponto", asisten virtual pintar dan ramah untuk Madrasah Tsanawiyah Negeri 3 Jeneponto, Sulawesi Selatan.
Kepribadian Anda: Sangat sopan, ramah, berwibawa, agamis, mendidik, dan selalu berorientasi membantu. Gunakan bahasa Indonesia yang baik, benar, santun, dan mudah dipahami. Anda juga bisa menyisipkan sapaan khas Sulawesi Selatan seperti "Tabe'" (permisi) dengan sopan.

Informasi Profil Madrasah Saat Ini (Dinamis):
Nama Sekolah: ${profileDb.schoolName}
Akreditasi: ${profileDb.accreditation}
Kepala Madrasah: ${profileDb.principalName} (NIP. ${profileDb.principalNip})
Sambutan Kepala: ${profileDb.principalWelcome}
Visi Madrasah: ${profileDb.vision}

Daftar Pengajar Saat Ini:
${teachersDb.map((t: any) => `- ${t.name} sebagai ${t.role}`).join('\n')}

Layanan Utama Aplikasi Ini:
- Cek Kelulusan Online: Siswa kelas IX dapat memasukkan NISN mereka untuk melihat status kelulusan, rincian nilai rapor akhir, dan mengunduh Surat Keterangan Lulus (SKL) digital secara instan.
- PPDB Online (Pendaftaran Siswa Baru): Calon siswa dapat mengisi formulir pendaftaran digital 4 tahap, mengunduh Bukti Pendaftaran, dan memantau status seleksi secara real-time.

Tugas Anda:
Jawab semua pertanyaan pengunjung, wali murid, atau calon siswa mengenai MTsN 3 Jeneponto dengan akurat berdasarkan profil di atas.
Jika ditanya tentang kelulusan atau pendaftaran, arahkan mereka dengan ramah ke menu "Cek Kelulusan" atau "PPDB Online" di aplikasi ini.
Jaga jawaban Anda agar tetap informatif, berstruktur baik (gunakan bullet points jika perlu), dan hindari jargon teknis yang membingungkan.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...history.map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ]
      });

      const responseText = response.text || "Maaf, saat ini saya tidak dapat memproses tanggapan Anda.";
      return res.json({ response: responseText });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada sistem kecerdasan buatan.' });
    }
  });

  // Mock student database for 'Cek Kelulusan'
  const studentsDb = [
    {
      nisn: "0098765432",
      name: "Andi Muhammad Yusuf",
      class: "IX-A",
      status: "LULUS",
      examNumber: "MTsN3-2026-001",
      grades: {
        "Al-Qur'an Hadits": 92,
        "Akidah Akhlak": 94,
        "Fiqih": 90,
        "Sejarah Kebudayaan Islam (SKI)": 89,
        "Pendidikan Pancasila & Kewarganegaraan": 91,
        "Bahasa Indonesia": 93,
        "Bahasa Arab": 88,
        "Matematika": 85,
        "Ilmu Pengetahuan Alam (IPA)": 87,
        "Ilmu Pengetahuan Sosial (IPS)": 89,
        "Bahasa Inggris": 90,
        "Seni Budaya": 92,
        "Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)": 94,
        "Prakarya": 91
      },
      average: 90.7
    },
    {
      nisn: "0091234567",
      name: "Siti Fatimah Azzahra",
      class: "IX-B",
      status: "LULUS",
      examNumber: "MTsN3-2026-002",
      grades: {
        "Al-Qur'an Hadits": 96,
        "Akidah Akhlak": 95,
        "Fiqih": 94,
        "Sejarah Kebudayaan Islam (SKI)": 92,
        "Pendidikan Pancasila & Kewarganegaraan": 95,
        "Bahasa Indonesia": 94,
        "Bahasa Arab": 91,
        "Matematika": 88,
        "Ilmu Pengetahuan Alam (IPA)": 90,
        "Ilmu Pengetahuan Sosial (IPS)": 93,
        "Bahasa Inggris": 95,
        "Seni Budaya": 96,
        "Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)": 92,
        "Prakarya": 95
      },
      average: 93.6
    },
    {
      nisn: "0097654321",
      name: "Rahmat Hidayat",
      class: "IX-A",
      status: "LULUS",
      examNumber: "MTsN3-2026-003",
      grades: {
        "Al-Qur'an Hadits": 88,
        "Akidah Akhlak": 90,
        "Fiqih": 89,
        "Sejarah Kebudayaan Islam (SKI)": 87,
        "Pendidikan Pancasila & Kewarganegaraan": 88,
        "Bahasa Indonesia": 90,
        "Bahasa Arab": 85,
        "Matematika": 80,
        "Ilmu Pengetahuan Alam (IPA)": 84,
        "Ilmu Pengetahuan Sosial (IPS)": 86,
        "Bahasa Inggris": 88,
        "Seni Budaya": 90,
        "Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)": 95,
        "Prakarya": 89
      },
      average: 87.8
    },
    {
      nisn: "0091122334",
      name: "Nurul Aini",
      class: "IX-C",
      status: "LULUS",
      examNumber: "MTsN3-2026-004",
      grades: {
        "Al-Qur'an Hadits": 94,
        "Akidah Akhlak": 93,
        "Fiqih": 92,
        "Sejarah Kebudayaan Islam (SKI)": 91,
        "Pendidikan Pancasila & Kewarganegaraan": 93,
        "Bahasa Indonesia": 95,
        "Bahasa Arab": 90,
        "Matematika": 89,
        "Ilmu Pengetahuan Alam (IPA)": 91,
        "Ilmu Pengetahuan Sosial (IPS)": 92,
        "Bahasa Inggris": 93,
        "Seni Budaya": 94,
        "Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)": 91,
        "Prakarya": 93
      },
      average: 92.2
    }
  ];

  app.get('/api/student/:nisn', (req, res) => {
    const { nisn } = req.params;
    const student = studentsDb.find(s => s.nisn === nisn);
    if (student) {
      return res.json(student);
    }
    return res.status(404).json({ error: 'Data siswa dengan NISN tersebut tidak ditemukan.' });
  });

  // PPDB Online local data
  let ppdbRegistrations: any[] = [
    {
      id: "PPDB-2026-001",
      fullName: "Fajar Pratama",
      nisn: "0104433221",
      originSchool: "SDN 1 Banrimanurung",
      email: "fajar@gmail.com",
      phone: "081234567890",
      gender: "Laki-laki",
      guardianName: "M. Yusuf",
      guardianPhone: "081234567891",
      status: "Diterima",
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: "PPDB-2026-002",
      fullName: "Putri Amanda",
      nisn: "0105566778",
      originSchool: "SDN 3 Bangkala Barat",
      email: "putri@gmail.com",
      phone: "082198765432",
      gender: "Perempuan",
      guardianName: "Ahmad Hambali",
      guardianPhone: "082198765433",
      status: "Menunggu Verifikasi",
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ];

  app.get('/api/ppdb', (req, res) => {
    return res.json(ppdbRegistrations);
  });

  app.post('/api/ppdb', (req, res) => {
    const { fullName, nisn, originSchool, email, phone, gender, guardianName, guardianPhone } = req.body;
    
    if (!fullName || !nisn || !originSchool || !phone || !gender) {
      return res.status(400).json({ error: 'Mohon lengkapi semua data wajib yang ditandai bintang (*).' });
    }

    const existing = ppdbRegistrations.find(r => r.nisn === nisn);
    if (existing) {
      return res.status(400).json({ error: `Siswa dengan NISN ${nisn} sudah terdaftar sebelumnya dengan ID ${existing.id}.` });
    }

    const newId = `PPDB-2026-0${ppdbRegistrations.length + 1}`;
    const newReg = {
      id: newId,
      fullName,
      nisn,
      originSchool,
      email: email || '-',
      phone,
      gender,
      guardianName: guardianName || '-',
      guardianPhone: guardianPhone || '-',
      status: "Menunggu Verifikasi",
      createdAt: new Date().toISOString()
    };

    ppdbRegistrations.push(newReg);
    return res.json({ success: true, registration: newReg });
  });

  app.delete('/api/ppdb/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = ppdbRegistrations.length;
    ppdbRegistrations = ppdbRegistrations.filter(r => r.id !== id);
    if (ppdbRegistrations.length < initialLen) {
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Data pendaftar tidak ditemukan.' });
  });

  // Integration with Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="id">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>MTsN 3 Jeneponto - Portal Digital Terintegrasi</title>
              <meta name="description" content="Portal Digital Resmi Madrasah Tsanawiyah Negeri 3 Jeneponto. Akses Cek Kelulusan Online, PPDB Digital, Profil Madrasah, dan Asisten Pintar AI." />
              <meta property="og:title" content="MTsN 3 Jeneponto - Portal Digital Terintegrasi" />
              <meta property="og:description" content="Portal Digital Resmi Madrasah Tsanawiyah Negeri 3 Jeneponto. Akses Cek Kelulusan Online, PPDB Digital, Profil Madrasah, dan Asisten Pintar AI." />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image" />
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
            </head>
            <body class="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(pathLib.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(pathLib.join(__dirname, 'dist/index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
