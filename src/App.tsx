import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Building, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  AlertCircle, 
  ChevronRight, 
  MessageSquare, 
  Send, 
  X, 
  Grid, 
  Calendar,
  FileText,
  Shield,
  Info,
  Menu,
  GraduationCap,
  Lock,
  Edit2,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
  Key
} from "lucide-react";

// Types
interface Student {
  nisn: string;
  name: string;
  class: string;
  status: string;
  examNumber: string;
  grades: { [subject: string]: number };
  average: number;
}

interface PPDBRegistration {
  id: string;
  fullName: string;
  nisn: string;
  originSchool: string;
  email: string;
  phone: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SchoolProfile {
  schoolName: string;
  accreditation: string;
  principalName: string;
  principalTitle: string;
  principalNip: string;
  principalWelcome: string;
  principalPhoto: string;
  schoolLogo?: string;
  vision: string;
  mission: string[];
  facilities: string[];
}

interface Teacher {
  id: string;
  name: string;
  role: string;
  nip: string;
  status: string;
  desc: string;
}

interface NewsArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  content: string;
  image: string;
}

export default function App() {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<"home" | "kelulusan" | "ppdb" | "guru" | "galeri">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default Profile Structure
  const INITIAL_DEFAULT_PROFILE: SchoolProfile = {
    schoolName: "MTsN 3 Jeneponto",
    accreditation: "Predikat A (Peringkat I Sul-Sel)",
    principalName: "Dr. H. HAMZAH, S.Ag, S.Pd, M.Pd",
    principalTitle: "Kepala Madrasah MTsN 3 Jeneponto",
    principalNip: "197109062007011025",
    principalWelcome: "Puji syukur kehadirat Allah SWT atas limpahan rahmat-Nya sehingga kita dapat terus mendampingi putra-putri terbaik daerah dalam menimba ilmu. MTsN 3 Jeneponto hadir sebagai solusi pendidikan berstandar nasional yang mengintegrasikan kecerdasan intelektual, emosional, spiritual, serta kesiapan teknologi digital masa kini.\n\nKami berkomitmen untuk mendidik generasi muda di Jeneponto agar tidak hanya mahir dalam sains dan teknologi, namun juga kokoh dalam akidah, mulia dalam akhlak, serta hafal Al-Qur'an (Tahfidz). Predikat Akreditasi A tingkat nasional dan peringkat pertama tingkat Sulawesi Selatan membuktikan dedikasi tinggi kami secara berkelanjutan.",
    principalPhoto: "/src/assets/images/mtsn3_principal_portrait_1791344788072.jpg",
    schoolLogo: "/src/assets/images/mtsn3_school_emblem_1791344811679.jpg",
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

  // Profile, Teachers, and News DB States (Initialized from localStorage with fallback)
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem("mtsn3_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Gagal load profile dari localStorage:", e);
    }
    return INITIAL_DEFAULT_PROFILE;
  });

  const [teachersList, setTeachersList] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem("mtsn3_teachers");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [newsList, setNewsList] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem("mtsn3_news");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // ADMIN STATE (CMS SYSTEM)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem("mtsn3_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DEFAULT_PROFILE;
  });

  // Add/Delete Teacher States
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    role: "",
    nip: "",
    status: "PNS",
    desc: ""
  });

  // Edit Teacher States
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({
    name: "",
    role: "",
    nip: "",
    status: "PNS",
    desc: ""
  });

  // Add/Delete News States
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    author: "Humas MTsN 3",
    category: "Kegiatan",
    content: "",
    image: "/src/assets/images/mtsn3_students_classroom_1791344823640.jpg" // default
  });

  // Modal states for new standard Kemenag menus
  const [showSejarahModal, setShowSejarahModal] = useState(false);
  const [showKurikulumModal, setShowKurikulumModal] = useState(false);
  const [showPtspModal, setShowPtspModal] = useState(false);
  const [showSakipModal, setShowSakipModal] = useState(false);
  const [showPpidModal, setShowPpidModal] = useState(false);
  const [showZiModal, setShowZiModal] = useState(false);

  // Active Dropdown Tracker
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // PTSP Interaction states
  const [ptspSubTab, setPtspSubTab] = useState<"legalisir" | "sk-aktif" | "rekomendasi">("legalisir");
  const [ptspSuccessId, setPtspSuccessId] = useState<string | null>(null);
  const [ptspForm, setPtspForm] = useState({
    studentName: "",
    nisn: "",
    class: "IX-A",
    alumniYear: "2026",
    needs: "Keperluan Beasiswa / Pendidikan Lanjutan",
  });

  // Cek Kelulusan State
  const [nisnSearch, setNisnSearch] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [kelulusanError, setKelulusanError] = useState("");
  const [kelulusanLoading, setKelulusanLoading] = useState(false);

  // PPDB State
  const [ppdbStep, setPpdbStep] = useState(1);
  const [ppdbSuccess, setPpdbSuccess] = useState<PPDBRegistration | null>(null);
  const [ppdbLoading, setPpdbLoading] = useState(false);
  const [ppdbError, setPpdbError] = useState("");
  const [ppdbList, setPpdbList] = useState<PPDBRegistration[]>(() => {
    try {
      const saved = localStorage.getItem("mtsn3_ppdb");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  
  // PPDB Form inputs
  const [ppdbForm, setPpdbForm] = useState({
    fullName: "",
    nisn: "",
    originSchool: "",
    email: "",
    phone: "",
    gender: "Laki-laki",
    guardianName: "",
    guardianPhone: "",
    declarationChecked: false
  });

  // AI Assistant Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Tabe' (Salam hormat)! Saya Asisten Pintar MTsN 3 Jeneponto. Ada yang bisa saya bantu terkait pendaftaran siswa baru (PPDB), cek kelulusan, profil madrasah, atau fasilitas belajar kami?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image assets
  const bannerImage = "/src/assets/images/mtsn3_hero_banner_1791344774310.jpg";
  const emblemImage = "/src/assets/images/mtsn3_school_emblem_1791344811679.jpg";

  // Preset images selection for news/profile
  const presetImages = [
    { name: "Siswa Belajar di Kelas", path: "/src/assets/images/mtsn3_students_classroom_1791344823640.jpg" },
    { name: "Gedung Kampus", path: "/src/assets/images/mtsn3_hero_banner_1791344774310.jpg" },
    { name: "Logo Kemenag / Symmetrical", path: "/src/assets/images/mtsn3_school_emblem_1791344811679.jpg" },
    { name: "Foto Kamad", path: "/src/assets/images/mtsn3_principal_portrait_1791344788072.jpg" }
  ];

  // Fetch & synchronize database between localStorage and Express Server
  const loadDatabase = async () => {
    try {
      // 1. Profile sync
      const pRes = await fetch("/api/profile");
      if (pRes.ok) {
        const pData = await pRes.json();
        const localProfileStr = localStorage.getItem("mtsn3_profile");
        const localModified = localStorage.getItem("mtsn3_profile_modified");
        
        if (localProfileStr && localModified === "true") {
          const parsedLocal = JSON.parse(localProfileStr);
          setProfile(parsedLocal);
          setProfileForm(parsedLocal);
          // Sync custom local changes to backend
          fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedLocal)
          }).catch(() => {});
        } else if (pData && pData.schoolName) {
          setProfile(pData);
          setProfileForm(pData);
          localStorage.setItem("mtsn3_profile", JSON.stringify(pData));
        }
      }

      // 2. Teachers sync
      const tRes = await fetch("/api/teachers");
      if (tRes.ok) {
        const tData = await tRes.json();
        const localTeachersStr = localStorage.getItem("mtsn3_teachers");
        const localTeachersMod = localStorage.getItem("mtsn3_teachers_modified");
        
        if (localTeachersStr && localTeachersMod === "true") {
          setTeachersList(JSON.parse(localTeachersStr));
        } else if (Array.isArray(tData) && tData.length > 0) {
          setTeachersList(tData);
          localStorage.setItem("mtsn3_teachers", JSON.stringify(tData));
        }
      }

      // 3. News sync
      const nRes = await fetch("/api/news");
      if (nRes.ok) {
        const nData = await nRes.json();
        const localNewsStr = localStorage.getItem("mtsn3_news");
        const localNewsMod = localStorage.getItem("mtsn3_news_modified");
        
        if (localNewsStr && localNewsMod === "true") {
          setNewsList(JSON.parse(localNewsStr));
        } else if (Array.isArray(nData) && nData.length > 0) {
          setNewsList(nData);
          localStorage.setItem("mtsn3_news", JSON.stringify(nData));
        }
      }

      // 4. PPDB sync
      const ppdbRes = await fetch("/api/ppdb");
      if (ppdbRes.ok) {
        const ppdbData = await ppdbRes.json();
        const localPpdbStr = localStorage.getItem("mtsn3_ppdb");
        if (localPpdbStr) {
          setPpdbList(JSON.parse(localPpdbStr));
        } else if (Array.isArray(ppdbData)) {
          setPpdbList(ppdbData);
          localStorage.setItem("mtsn3_ppdb", JSON.stringify(ppdbData));
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dari server:", err);
    }
  };

  useEffect(() => {
    loadDatabase();

    // Load PPDB list
    fetch("/api/ppdb")
      .then(res => res.json())
      .then(data => setPpdbList(data))
      .catch(err => console.error("Gagal memuat daftar PPDB:", err));
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Admin Verification
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === "admin3") {
      setIsAdminMode(true);
      setShowAdminLoginModal(false);
      setAdminLoginError("");
      setAdminPasswordInput("");
    } else {
      setAdminLoginError("Sandi Salah! Gunakan sandi: admin3");
    }
  };

  // File upload handler for Kamad Photo (.jpg/png direct base64)
  const handleKamadPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran berkas terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, principalPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // File upload handler for School Logo (.jpg/png direct base64)
  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran berkas terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, schoolLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // File upload handler for News Image (.jpg/png direct base64)
  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran berkas terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Update Handler (CMS)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save locally first so it is immediately persistent in browser
      setProfile(profileForm);
      localStorage.setItem("mtsn3_profile", JSON.stringify(profileForm));
      localStorage.setItem("mtsn3_profile_modified", "true");
      setShowEditProfileModal(false);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        localStorage.setItem("mtsn3_profile", JSON.stringify(data.profile));
      }
    } catch (err) {
      console.error("Gagal menyimpan profil ke server (tersimpan lokal):", err);
    }
  };

  // Add Teacher Handler (CMS)
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const localId = `teacher-${Date.now()}`;
      const newTeacherObj = { ...teacherForm, id: localId };
      const updated = [...teachersList, newTeacherObj];
      setTeachersList(updated);
      localStorage.setItem("mtsn3_teachers", JSON.stringify(updated));
      localStorage.setItem("mtsn3_teachers_modified", "true");
      setShowAddTeacherModal(false);
      setTeacherForm({ name: "", role: "", nip: "", status: "PNS", desc: "" });

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm)
      });
      if (res.ok) {
        const data = await res.json();
        const serverUpdated = [...teachersList.filter(t => t.id !== localId), data.teacher];
        setTeachersList(serverUpdated);
        localStorage.setItem("mtsn3_teachers", JSON.stringify(serverUpdated));
      }
    } catch (err) {
      console.error("Gagal menambah guru ke server (tersimpan lokal):", err);
    }
  };

  // Delete Teacher Handler (CMS)
  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data guru/staf ini dari direktori resmi?")) return;
    try {
      const updated = teachersList.filter(t => t.id !== id);
      setTeachersList(updated);
      localStorage.setItem("mtsn3_teachers", JSON.stringify(updated));
      localStorage.setItem("mtsn3_teachers_modified", "true");

      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.warn("Server delete sync failed, deleted locally.");
      }
    } catch (err) {
      console.error("Gagal menghapus guru di server (terhapus lokal):", err);
    }
  };

  // Open Edit Teacher Modal Helper (CMS)
  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setEditTeacherForm({
      name: t.name,
      role: t.role,
      nip: t.nip,
      status: t.status,
      desc: t.desc
    });
    setShowEditTeacherModal(true);
  };

  // Submit Edit Teacher Handler (CMS)
  const handleEditTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacherId) return;

    try {
      const updated = teachersList.map(teacher => 
        teacher.id === editingTeacherId ? { ...teacher, ...editTeacherForm } : teacher
      );
      setTeachersList(updated);
      localStorage.setItem("mtsn3_teachers", JSON.stringify(updated));
      localStorage.setItem("mtsn3_teachers_modified", "true");
      setShowEditTeacherModal(false);

      const res = await fetch(`/api/teachers/${editingTeacherId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTeacherForm)
      });
      if (res.ok) {
        const data = await res.json();
        const serverUpdated = teachersList.map(teacher => 
          teacher.id === editingTeacherId ? data.teacher : teacher
        );
        setTeachersList(serverUpdated);
        localStorage.setItem("mtsn3_teachers", JSON.stringify(serverUpdated));
      }
      setEditingTeacherId(null);
    } catch (err) {
      console.error("Gagal memperbarui data guru di server (diperbarui lokal):", err);
    }
  };

  // Add News Article Handler (CMS)
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const localArticle: NewsArticle = {
        id: `news-${Date.now()}`,
        title: newsForm.title,
        author: newsForm.author || "Humas MTsN 3",
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        category: newsForm.category || "Kegiatan",
        content: newsForm.content,
        image: newsForm.image || "/src/assets/images/mtsn3_students_classroom_1791344823640.jpg"
      };

      const updated = [localArticle, ...newsList];
      setNewsList(updated);
      localStorage.setItem("mtsn3_news", JSON.stringify(updated));
      localStorage.setItem("mtsn3_news_modified", "true");
      setShowAddNewsModal(false);
      setNewsForm({
        title: "",
        author: "Humas MTsN 3",
        category: "Kegiatan",
        content: "",
        image: "/src/assets/images/mtsn3_students_classroom_1791344823640.jpg"
      });

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsForm)
      });
      if (res.ok) {
        const data = await res.json();
        const serverUpdated = [data.article, ...newsList.filter(n => n.id !== localArticle.id)];
        setNewsList(serverUpdated);
        localStorage.setItem("mtsn3_news", JSON.stringify(serverUpdated));
      }
    } catch (err) {
      console.error("Gagal mengunggah berita ke server (tersimpan lokal):", err);
    }
  };

  // Delete News Article Handler (CMS)
  const handleDeleteNews = async (id: string) => {
    if (!confirm("Hapus artikel berita ini secara permanen?")) return;
    try {
      const updated = newsList.filter(n => n.id !== id);
      setNewsList(updated);
      localStorage.setItem("mtsn3_news", JSON.stringify(updated));
      localStorage.setItem("mtsn3_news_modified", "true");

      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.warn("Server delete sync failed, deleted locally.");
      }
    } catch (err) {
      console.error("Gagal menghapus berita:", err);
    }
  };

  // Delete PPDB Registrant Handler (CMS)
  const handleDeletePpdb = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas pendaftar PPDB ini secara permanen dari sistem sekolah?")) return;
    try {
      const updated = ppdbList.filter(item => item.id !== id);
      setPpdbList(updated);
      localStorage.setItem("mtsn3_ppdb", JSON.stringify(updated));

      const res = await fetch(`/api/ppdb/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.warn("Server delete PPDB failed, deleted locally.");
      }
    } catch (err) {
      console.error("Gagal menghapus berkas PPDB:", err);
    }
  };

  // Cek Kelulusan Handler
  const handleCheckKelulusan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisnSearch.trim()) return;

    setKelulusanLoading(true);
    setKelulusanError("");
    setSearchedStudent(null);

    try {
      const res = await fetch(`/api/student/${nisnSearch.trim()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Siswa tidak ditemukan.");
      }
      const data = await res.json();
      setSearchedStudent(data);
    } catch (err: any) {
      setKelulusanError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setKelulusanLoading(false);
    }
  };

  // PPDB Submission Handler
  const handlePpdbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ppdbStep < 4) {
      setPpdbStep(prev => prev + 1);
      return;
    }

    if (!ppdbForm.declarationChecked) {
      setPpdbError("Anda harus menyetujui pernyataan kebenaran data.");
      return;
    }

    setPpdbLoading(true);
    setPpdbError("");

    try {
      const localReg: PPDBRegistration = {
        id: `PPDB-2026-0${ppdbList.length + 1}`,
        fullName: ppdbForm.fullName,
        nisn: ppdbForm.nisn,
        originSchool: ppdbForm.originSchool,
        email: ppdbForm.email || "-",
        phone: ppdbForm.phone,
        gender: ppdbForm.gender,
        guardianName: ppdbForm.guardianName || "-",
        guardianPhone: ppdbForm.guardianPhone || "-",
        status: "Menunggu Verifikasi",
        createdAt: new Date().toISOString()
      };

      const updated = [localReg, ...ppdbList];
      setPpdbList(updated);
      localStorage.setItem("mtsn3_ppdb", JSON.stringify(updated));
      setPpdbSuccess(localReg);

      const res = await fetch("/api/ppdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ppdbForm)
      });

      if (res.ok) {
        const data = await res.json();
        setPpdbSuccess(data.registration);
        const serverUpdated = [data.registration, ...ppdbList.filter(r => r.id !== localReg.id)];
        setPpdbList(serverUpdated);
        localStorage.setItem("mtsn3_ppdb", JSON.stringify(serverUpdated));
      }
    } catch (err: any) {
      console.warn("PPDB offline fallback activated:", err);
    } finally {
      setPpdbLoading(false);
    }
  };

  // PTSP Submission handler (CMS/Interactive)
  const handlePtspSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ptspSubTab === "legalisir" && (!ptspForm.studentName || !ptspForm.alumniYear)) {
      alert("Mohon lengkapi nama alumni dan tahun kelulusan.");
      return;
    }
    if (ptspSubTab === "sk-aktif" && (!ptspForm.studentName || !ptspForm.nisn)) {
      alert("Mohon lengkapi nama siswa dan NISN aktif.");
      return;
    }

    const trackingId = `PTSP-3-${Date.now().toString().slice(-6)}`;
    setPtspSuccessId(trackingId);
  };

  // AI Chat Handler
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.slice(1)
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        { role: "assistant", content: "Maaf, sistem AI sedang sibuk. Silakan coba beberapa saat lagi atau hubungi admin madrasah." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const triggerQuickQuestion = (question: string) => {
    setChatInput(question);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetPpdbForm = () => {
    setPpdbForm({
      fullName: "",
      nisn: "",
      originSchool: "",
      email: "",
      phone: "",
      gender: "Laki-laki",
      guardianName: "",
      guardianPhone: "",
      declarationChecked: false
    });
    setPpdbStep(1);
    setPpdbSuccess(null);
    setPpdbError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-emerald-700 selection:text-white">
      
      {/* FLOATING ADMIN BAR */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            {isAdminMode ? (
              <span className="text-amber-400 font-bold">KONSOL ADMINISTRATOR AKTIF</span>
            ) : (
              <span>Fitur CMS Aktif: Edit Profil, Foto Kamad, Guru, & Berita</span>
            )}
          </span>
        </div>
        <div>
          {isAdminMode ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium">Mode Manajemen Aktif</span>
              <button 
                onClick={() => setIsAdminMode(false)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] transition-colors cursor-pointer"
              >
                Keluar Admin
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAdminLoginModal(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>Login Admin (🔑 admin3)</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION HEADER (KEMENAG STYLE WITH DROPDOWN MENUS) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 transition-shadow">
        
        {/* UPPER ROW: Branding & Action Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand wordmark with logo */}
          <div className="flex items-center gap-3">
            <img 
              src={profile.schoolLogo || emblemImage} 
              alt="Logo MTsN 3 Jeneponto" 
              className="h-10 w-10 object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-display font-black text-base sm:text-lg tracking-tight text-emerald-800 uppercase block leading-none">
                {profile.schoolName}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">
                Kementerian Agama Kabupaten Jeneponto
              </span>
            </div>
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("ppdb")}
              className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Daftar PPDB 2026
            </button>
            <button 
              onClick={() => setChatOpen(true)}
              className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200/50 transition-colors cursor-pointer"
              title="Tanya Asisten AI"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile triggers */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setChatOpen(true)}
              className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200/50 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LOWER ROW (DESKTOP ONLY): Silver-Gray Menu Bar (Matches user's screenshot exactly!) */}
        <div className="hidden md:block bg-slate-100 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 text-[13px] font-bold text-slate-700 h-11 py-1">
              
              {/* 1. Home */}
              <button 
                onClick={() => { setActiveTab("home"); }}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "home" ? "bg-white text-emerald-800 shadow-sm border border-slate-200" : "hover:bg-slate-200/60"}`}
              >
                <Building className="h-4 w-4" />
                <span>Home</span>
              </button>

              {/* 2. Profil (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>Profil</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setShowSejarahModal(true)} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Sejarah Madrasah</button>
                  <button onClick={() => { setActiveTab("home"); }} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Visi, Misi & Sarana</button>
                  <button onClick={() => setActiveTab("guru")} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Direktori Guru & Staf</button>
                </div>
              </div>

              {/* 3. Berita (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>Berita</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setActiveTab("galeri")} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Berita Utama</button>
                  <button onClick={() => setActiveTab("galeri")} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Pengumuman & Agenda</button>
                </div>
              </div>

              {/* 4. Informasi (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>Informasi</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setShowKurikulumModal(true)} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Kurikulum Merdeka</button>
                  <button onClick={() => setActiveTab("kelulusan")} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Cek Kelulusan Online</button>
                </div>
              </div>

              {/* 5. Galeri (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>Galeri</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setActiveTab("galeri")} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Galeri Foto Kegiatan</button>
                </div>
              </div>

              {/* 6. Layanan PTSP (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>Layanan PTSP</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => { setPtspSubTab("legalisir"); setShowPtspModal(true); }} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Legalisir Ijazah Online</button>
                  <button onClick={() => { setPtspSubTab("sk-aktif"); setShowPtspModal(true); }} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Surat Aktif Belajar</button>
                </div>
              </div>

              {/* 7. SAKIP (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>SAKIP</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setShowSakipModal(true)} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Laporan LAKIP & Renstra</button>
                </div>
              </div>

              {/* 8. PPID (Dropdown) */}
              <div className="relative group">
                <button className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer">
                  <span>PPID</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs">
                  <button onClick={() => setShowPpidModal(true)} className="block w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">Layanan Informasi Publik</button>
                </div>
              </div>

              {/* 9. Kontak */}
              <a 
                href="#footer-section" 
                className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                Kontak
              </a>

              {/* 10. ZI (Zona Integritas) */}
              <button 
                onClick={() => setShowZiModal(true)}
                className="flex items-center gap-1 py-2 px-3.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer text-emerald-800"
              >
                <span>ZI</span>
              </button>

              {/* 11. PMBM (Dropdown) */}
              <div className="relative group ml-auto">
                <button className="flex items-center gap-1 py-2 px-4 rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm">
                  <span>PMBM / PPDB</span>
                  <span className="text-[9px] text-emerald-300">▼</span>
                </button>
                <div className="absolute right-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 z-50 animate-fadeIn text-xs font-semibold text-slate-800">
                  <button onClick={() => setActiveTab("ppdb")} className="block w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer">Formulir PPDB Online</button>
                  <button onClick={() => setActiveTab("ppdb")} className="block w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer">Syarat & Alur Pendaftaran</button>
                </div>
              </div>

            </nav>
          </div>
        </div>

      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 flex flex-col gap-2 shadow-inner">
          <button 
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-md text-sm font-semibold ${activeTab === "home" ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}
          >
            Beranda & Profil
          </button>
          <button 
            onClick={() => { setActiveTab("kelulusan"); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-md text-sm font-semibold ${activeTab === "kelulusan" ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}
          >
            Cek Kelulusan
          </button>
          <button 
            onClick={() => { setActiveTab("ppdb"); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-md text-sm font-semibold ${activeTab === "ppdb" ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}
          >
            PPDB Online
          </button>
          <button 
            onClick={() => { setActiveTab("guru"); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-md text-sm font-semibold ${activeTab === "guru" ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}
          >
            Direktori Guru
          </button>
          <button 
            onClick={() => { setActiveTab("galeri"); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-md text-sm font-semibold ${activeTab === "galeri" ? "bg-emerald-50 text-emerald-800" : "text-slate-600"}`}
          >
            Berita & Galeri
          </button>
          <button 
            onClick={() => { setActiveTab("ppdb"); setMobileMenuOpen(false); }}
            className="mt-2 w-full text-center py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg"
          >
            Daftar PPDB 2026
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-grow">

        {/* 1. HOME TAB */}
        {activeTab === "home" && (
          <div className="animate-fadeIn">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
              <div className="absolute inset-0 z-0">
                <img 
                  src={bannerImage} 
                  alt="Kampus MTsN 3 Jeneponto" 
                  className="w-full h-full object-cover object-center scale-105 opacity-35"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-slate-900/85 mix-blend-multiply" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="max-w-3xl">
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-4">
                    <span>AKREDITASI A</span>
                    <span aria-hidden="true" className="text-emerald-500 font-bold">·</span>
                    <span>{profile.accreditation}</span>
                    <span aria-hidden="true" className="text-emerald-500 font-bold">·</span>
                    <span>MADRASAH DIGITAL</span>
                  </div>

                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none text-wrap:balance mb-6">
                    Portal Resmi <span className="text-amber-300">{profile.schoolName}</span>
                  </h1>
                  
                  <p className="text-lg text-slate-200 font-light leading-relaxed mb-8 max-w-2xl">
                    Sistem integrasi digital resmi Madrasah Tsanawiyah Negeri 3 Jeneponto, Sulawesi Selatan. Temukan kualifikasi pengajar unggulan, pendaftaran siswa baru secara online, asisten AI interaktif, dan peninjauan nilai kelulusan digital tercepat.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveTab("ppdb")}
                      className="px-6 py-3 text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <span>Pendaftaran PPDB 2026</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab("kelulusan")}
                      className="px-6 py-3 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Cek Kelulusan & Nilai</span>
                      <GraduationCap className="h-4 w-4 text-emerald-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS BAND */}
            <div className="bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  <div className="pt-4 md:pt-0">
                    <p className="text-2xl font-display font-bold text-emerald-800 tabular-nums">Predikat A</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Akreditasi Kemenag</p>
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-6">
                    <p className="text-2xl font-display font-bold text-emerald-800 tabular-nums">100% Online</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">PAS & Ujian Digital</p>
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-6">
                    <p className="text-2xl font-display font-bold text-emerald-800 tabular-nums">{teachersList.length}+ Staf</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Pendidik Berbakat</p>
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-6">
                    <p className="text-2xl font-display font-bold text-emerald-800 tabular-nums">Bebas Biaya</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Program BOS Kemenag</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PRINCIPAL WELCOME & PROFILE EDITOR CMS INTERACTION */}
            <div className="py-20 bg-white relative">
              
              {/* EDIT TRIGGER FOR GENERAL PROFILE */}
              {isAdminMode && (
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={() => {
                      setProfileForm({ ...profile });
                      setShowEditProfileModal(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profil & Foto Kamad</span>
                  </button>
                </div>
              )}

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Photo of Headmaster (Kamad) */}
                  <div className="lg:col-span-5 relative group">
                    <div className="absolute inset-0 bg-emerald-800 rounded-3xl rotate-3 scale-[0.98] -z-10 opacity-10" />
                    
                    <img 
                      src={profile.principalPhoto} 
                      alt={profile.principalName} 
                      className="w-full h-auto object-cover rounded-3xl shadow-xl border border-slate-200 transition-transform duration-350"
                      referrerPolicy="no-referrer"
                    />

                    {isAdminMode && (
                      <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setProfileForm({ ...profile });
                            setShowEditProfileModal(true);
                          }}
                          className="p-3 bg-white hover:bg-amber-400 rounded-full text-slate-900 shadow-lg cursor-pointer"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-lg">
                      <p className="font-display font-bold text-slate-900">{profile.principalName}</p>
                      <p className="text-[10px] text-emerald-800 font-semibold mt-0.5 uppercase tracking-wider">{profile.principalTitle}</p>
                    </div>
                  </div>

                  {/* Right Column: Statement & Information */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2">
                      <span>Sambutan Resmi Kepala Madrasah</span>
                    </div>
                    
                    <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight text-wrap:balance mb-6">
                      Mewujudkan Madrasah Mandiri Berprestasi Se-Sulawesi Selatan
                    </h2>
                    
                    <div className="space-y-4 text-slate-600 font-normal leading-relaxed text-sm whitespace-pre-line">
                      <p className="italic font-serif text-emerald-800">Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                      <p>{profile.principalWelcome}</p>
                      <p className="italic font-serif text-emerald-800">Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Kurikulum Merdeka Unggulan</p>
                          <p className="text-xs text-slate-500 mt-0.5">Berfokus pada kemandirian berpikir dan kecakapan moral.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">PAS & Ujian Online Terintegrasi</p>
                          <p className="text-xs text-slate-500 mt-0.5">Sistem andal, bebas kertas, & menggunakan teknologi mutakhir.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* VISION, MISSION & FACILITIES SECTION */}
            <div className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <p className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Pilar Utama Madrasah</p>
                  <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-2">Visi, Misi, & Fasilitas Kampus</h2>
                  <p className="text-sm text-slate-500 mt-3">Disusun demi melahirkan lulusan berilmu tinggi, tanggap IPTEK, dan kokoh dalam pengamalan agama.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Visi */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-6">
                        <Award className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900 mb-3">Visi Madrasah</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-light whitespace-pre-line">
                        "{profile.vision}"
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
                      <span>Visi Strategis Nasional</span>
                    </div>
                  </div>

                  {/* Misi */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-6">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900 mb-3">Misi Penguatan</h3>
                      <ul className="text-slate-600 text-xs leading-relaxed space-y-2.5 font-light">
                        {profile.mission && profile.mission.map((m, i) => (
                          <li key={i} className="flex gap-1">
                            <span className="font-bold text-emerald-800">{i + 1}.</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
                      <span>Misi Operasional Terarah</span>
                    </div>
                  </div>

                  {/* Sarana */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-6">
                        <Building className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900 mb-3">Sarana Prasarana</h3>
                      <ul className="text-slate-600 text-xs leading-relaxed space-y-2.5 font-light">
                        {profile.facilities && profile.facilities.map((f, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-700 font-bold">·</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
                      <span>Investasi mutu pendidikan</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. KELULUSAN TAB */}
        {activeTab === "kelulusan" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">Cek Kelulusan & Nilai Rapor Online</h2>
              <p className="text-sm text-slate-500 mt-2">
                Sistem Penilaian Ujian Akhir Madrasah MTsN 3 Jeneponto. Masukkan NISN Anda untuk melihat status kelulusan, rincian lembar nilai, serta mencetak SKL Resmi.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
              <form onSubmit={handleCheckKelulusan} className="space-y-4">
                <div>
                  <label htmlFor="nisn" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Masukkan NISN Siswa (10 Digit)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      id="nisn"
                      type="text" 
                      placeholder="Contoh: 0098765432" 
                      value={nisnSearch}
                      onChange={(e) => setNisnSearch(e.target.value)}
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-700 bg-slate-50"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={kelulusanLoading}
                  className="w-full py-3 px-4 text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:bg-slate-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  {kelulusanLoading ? "Mencari Data..." : "Periksa Status Kelulusan"}
                </button>
              </form>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200/40 text-xs text-amber-800 space-y-1.5 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                  <Info className="h-3.5 w-3.5" />
                  <span>Petunjuk Simulasi NISN Aktif:</span>
                </p>
                <p>Gunakan salah satu NISN siswa di bawah ini untuk melihat lembar SKL digital:</p>
                <ul className="list-disc pl-4 space-y-1 font-mono tracking-tight text-[11px]">
                  <li>0098765432 — Andi Muhammad Yusuf</li>
                  <li>0091234567 — Siti Fatimah Azzahra</li>
                  <li>0097654321 — Rahmat Hidayat</li>
                  <li>0091122334 — Nurul Aini</li>
                </ul>
              </div>

              {kelulusanError && (
                <div className="mt-6 p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200/30 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{kelulusanError}</span>
                </div>
              )}
            </div>

            {searchedStudent && (
              <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-3xl overflow-hidden shadow-xl animate-fadeIn">
                
                <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>SISTEM VERIFIKASI DIGITAL AKTIF · SURAT KETERANGAN LULUS</span>
                  </span>
                  <button 
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak SKL</span>
                  </button>
                </div>

                <div id="skl-printable-area" className="p-8 sm:p-12 text-slate-900 bg-white leading-relaxed">
                  
                  {/* Header */}
                  <div className="border-b-4 border-double border-slate-900 pb-6 mb-8 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                      <img 
                        src={emblemImage} 
                        alt="Kementerian Agama" 
                        className="h-16 w-16 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-display font-extrabold text-sm sm:text-base tracking-wide uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h4>
                        <h4 className="font-display font-bold text-xs sm:text-sm tracking-wide uppercase text-slate-800">KANTOR KEMENTERIAN AGAMA KABUPATEN JENEPONTO</h4>
                        <h3 className="font-display font-black text-lg sm:text-xl tracking-tight uppercase text-emerald-900 mt-1">{profile.schoolName}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Jl. Syamsuddin Kr Kuneng, Banrimanurung, Kec. Bangkala Barat, Kab. Jeneponto, Sulawesi Selatan · Kode Pos 92351</p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-8">
                    <h2 className="font-display font-extrabold text-base sm:text-lg underline uppercase">SURAT KETERANGAN LULUS</h2>
                    <p className="text-xs font-mono text-slate-500 mt-1">Nomor: B-432/MTs.21.14.3/PP.01.1/06/2026</p>
                  </div>

                  <p className="text-xs text-slate-700 mb-6">
                    Kepala {profile.schoolName} menerangkan bahwa berdasarkan kriteria kelulusan peserta didik yang diatur dalam rapat pleno dewan guru, siswa yang identitasnya tertera di bawah ini dinyatakan:
                  </p>

                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/60 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nama Siswa</span>
                        <span className="col-span-2 font-bold text-slate-900">: {searchedStudent.name}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">NISN</span>
                        <span className="col-span-2 font-mono font-bold text-slate-900">: {searchedStudent.nisn}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nomor Ujian</span>
                        <span className="col-span-2 font-mono text-slate-700">: {searchedStudent.examNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Asal Madrasah</span>
                        <span className="col-span-2 text-slate-950 font-medium">: {profile.schoolName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Tahun Ajaran</span>
                        <span className="col-span-2 text-slate-700">: 2025/2026</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Status</span>
                        <span className="col-span-2 text-emerald-800 font-extrabold flex items-center gap-1.5 uppercase">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{searchedStudent.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <h3 className="font-display font-extrabold text-xs tracking-wider uppercase text-slate-700 mb-3">DAFTAR NILAI TRANSKRIP KELULUSAN</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-8 text-xs">
                    <table className="w-full text-left divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 font-bold text-slate-600">No.</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600">Mata Pelajaran</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600 text-right">Nilai Angka</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600 text-center">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {Object.entries(searchedStudent.grades).map(([subject, score], i) => {
                          let pred = "C";
                          if (score >= 90) pred = "A";
                          else if (score >= 80) pred = "B";
                          else if (score >= 70) pred = "C";
                          else pred = "D";

                          return (
                            <tr key={subject} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-mono text-slate-400">{i + 1}.</td>
                              <td className="px-4 py-2 text-slate-800">{subject}</td>
                              <td className="px-4 py-2 text-right font-mono font-bold text-slate-900 tabular-nums">{score}</td>
                              <td className="px-4 py-2 text-center text-xs font-semibold">{pred}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-emerald-50/30 font-bold">
                          <td colSpan={2} className="px-4 py-3 text-emerald-900 text-right font-display uppercase tracking-wider">Rata-rata Nilai Akhir</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-900 text-sm tabular-nums underline decoration-double">{searchedStudent.average}</td>
                          <td className="px-4 py-3 text-center text-xs text-emerald-900">Sangat Memuaskan</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 items-end">
                    <div className="space-y-2 border border-slate-200 p-4 rounded-xl text-[10px] text-slate-500">
                      <p className="font-bold text-slate-700 flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-emerald-700" />
                        <span>VERIFIKASI KEASLIAN DIGITAL</span>
                      </p>
                      <p>Dokumen ini ditandatangani secara digital oleh Kepala Madrasah. Nomor ID transaksi terverifikasi: {searchedStudent.examNumber}-{searchedStudent.nisn}</p>
                    </div>

                    <div className="text-center sm:text-right text-xs">
                      <p className="text-slate-500">Jeneponto, 15 Juni 2026</p>
                      <p className="font-semibold text-slate-800 mt-1">Kepala Madrasah,</p>
                      <div className="relative h-16 my-2 flex items-center justify-center sm:justify-end">
                        <p className="font-serif italic text-xs text-slate-400 underline select-none pr-6">{profile.principalName}</p>
                      </div>
                      <p className="font-bold text-slate-900 underline">{profile.principalName}</p>
                      <p className="text-slate-500 font-mono text-[10px]">NIP. {profile.principalNip}</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. PPDB ONLINE TAB */}
        {activeTab === "ppdb" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">PPDB Digital MTsN 3 Jeneponto</h2>
              <p className="text-sm text-slate-500 mt-2">
                Penerimaan Peserta Didik Baru (PPDB) Tahun Pelajaran 2026/2027. Mengintegrasikan teknologi pendaftaran instan tanpa biaya seleksi.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h3 className="font-display font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Tahapan Pendaftaran</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${ppdbStep === 1 ? "bg-emerald-700 text-white" : ppdbStep > 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>1</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Biodata Siswa</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Identitas calon siswa baru.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${ppdbStep === 2 ? "bg-emerald-700 text-white" : ppdbStep > 2 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>2</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Orang Tua / Wali</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kontak penanggung jawab.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${ppdbStep === 3 ? "bg-emerald-700 text-white" : ppdbStep > 3 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>3</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Sekolah Asal</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">SD / MI Asal pendaftar.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${ppdbStep === 4 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>4</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Pernyataan Berkas</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Validitas data yang dimasukkan.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950 text-white p-6 rounded-2xl">
                  <h4 className="font-display font-bold text-emerald-300 text-sm uppercase tracking-wider mb-4">Informasi Penting</h4>
                  <div className="space-y-4 text-xs font-light">
                    <div>
                      <p className="font-semibold text-white">Gelombang I</p>
                      <p className="text-emerald-200 mt-0.5">01 Mei - 15 Juli 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Biaya Pendaftaran</p>
                      <p className="text-emerald-200 mt-0.5">Rp. 0 (Gratis 100% didanai BOS Kemenag)</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="lg:col-span-8">
                
                {!ppdbSuccess ? (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Langkah {ppdbStep} dari 4</span>
                      <span className="text-xs text-emerald-700 font-medium">T.P. 2026/2027</span>
                    </div>

                    <form onSubmit={handlePpdbSubmit} className="space-y-6 text-xs font-medium text-slate-700">
                      
                      {ppdbStep === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <label className="block mb-1.5 font-bold uppercase tracking-wider">Nama Lengkap Siswa *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Nama lengkap sesuai ijazah SD"
                              value={ppdbForm.fullName}
                              onChange={(e) => setPpdbForm({...ppdbForm, fullName: e.target.value})}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-1.5 font-bold uppercase tracking-wider">NISN (10 Digit) *</label>
                              <input 
                                type="text" 
                                required
                                maxLength={10}
                                placeholder="Masukkan 10 digit NISN"
                                value={ppdbForm.nisn}
                                onChange={(e) => setPpdbForm({...ppdbForm, nisn: e.target.value})}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 font-bold uppercase tracking-wider">Jenis Kelamin *</label>
                              <select 
                                value={ppdbForm.gender}
                                onChange={(e) => setPpdbForm({...ppdbForm, gender: e.target.value})}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50"
                              >
                                <option>Laki-laki</option>
                                <option>Perempuan</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-1.5 font-bold uppercase tracking-wider">No. HP / WhatsApp Siswa *</label>
                              <input 
                                type="tel" 
                                required
                                placeholder="Contoh: 08123456789"
                                value={ppdbForm.phone}
                                onChange={(e) => setPpdbForm({...ppdbForm, phone: e.target.value})}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                              />
                            </div>
                            <div>
                              <label className="block mb-1.5 font-bold uppercase tracking-wider">Email (Opsional)</label>
                              <input 
                                type="email" 
                                placeholder="nama@gmail.com"
                                value={ppdbForm.email}
                                onChange={(e) => setPpdbForm({...ppdbForm, email: e.target.value})}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {ppdbStep === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <label className="block mb-1.5 font-bold uppercase tracking-wider">Nama Orang Tua / Wali *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Nama lengkap bapak/ibu wali"
                              value={ppdbForm.guardianName}
                              onChange={(e) => setPpdbForm({...ppdbForm, guardianName: e.target.value})}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                            />
                          </div>
                          <div>
                            <label className="block mb-1.5 font-bold uppercase tracking-wider">No. HP Orang Tua / Wali *</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="Nomor telepon penanggung jawab"
                              value={ppdbForm.guardianPhone}
                              onChange={(e) => setPpdbForm({...ppdbForm, guardianPhone: e.target.value})}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                            />
                          </div>
                        </div>
                      )}

                      {ppdbStep === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <label className="block mb-1.5 font-bold uppercase tracking-wider">Nama Sekolah Asal (SD/MI) *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Contoh: MIS Al-Ikhlas Jeneponto"
                              value={ppdbForm.originSchool}
                              onChange={(e) => setPpdbForm({...ppdbForm, originSchool: e.target.value})}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-slate-50 font-normal"
                            />
                          </div>
                        </div>
                      )}

                      {ppdbStep === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-600 font-normal leading-relaxed space-y-3 text-[11px]">
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <Shield className="h-4 w-4 text-emerald-700" />
                              <span>Syarat Pemberkasan Calon Siswa</span>
                            </p>
                            <p>Setelah mengirimkan formulir ini, harap persiapkan berkas pendaftaran asli saat penyerahan dokumen fisik:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Ijazah / SKL SD/MI terverifikasi</li>
                              <li>Kartu Keluarga asli & fotokopi</li>
                              <li>Akte Kelahiran calon siswa</li>
                            </ul>
                          </div>

                          <div className="flex items-start gap-3 pt-2">
                            <input 
                              type="checkbox" 
                              id="declare"
                              checked={ppdbForm.declarationChecked}
                              onChange={(e) => setPpdbForm({...ppdbForm, declarationChecked: e.target.checked})}
                              className="h-4.5 w-4.5 text-emerald-700 border-slate-300 rounded focus:ring-emerald-700 mt-0.5 cursor-pointer"
                            />
                            <label htmlFor="declare" className="text-[11px] text-slate-600 font-normal cursor-pointer leading-relaxed">
                              Saya mengonfirmasi bahwa seluruh informasi dan berkas pendaftaran di atas diisi dengan kesadaran penuh dan sesuai kebenaran dokumen yang sah.
                            </label>
                          </div>

                          {ppdbError && (
                            <div className="p-3 bg-red-50 border border-red-200/50 text-red-800 rounded-xl text-[11px] flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>{ppdbError}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                        {ppdbStep > 1 && (
                          <button 
                            type="button"
                            onClick={() => setPpdbStep(prev => prev - 1)}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
                          >
                            Kembali
                          </button>
                        )}
                        <div className="ml-auto flex gap-2">
                          <button 
                            type="submit"
                            disabled={ppdbLoading}
                            className="px-6 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl transition-colors font-bold shadow-sm shadow-emerald-700/10 cursor-pointer"
                          >
                            {ppdbLoading ? "Memproses..." : ppdbStep === 4 ? "Kirim Pendaftaran" : "Lanjutkan"}
                          </button>
                        </div>
                      </div>

                    </form>
                  </div>
                ) : (
                  
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg animate-fadeIn">
                    <div className="bg-emerald-800 text-white p-6 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-200" />
                      <h3 className="font-display font-extrabold text-lg uppercase tracking-wider">Pendaftaran Berhasil Terkirim</h3>
                      <p className="text-xs text-emerald-100 font-light mt-1">Harap simpan bukti pendaftaran ini untuk proses verifikasi panitia.</p>
                    </div>

                    <div className="p-8 text-xs leading-relaxed text-slate-800">
                      
                      <div className="border-b border-slate-100 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">ID PENDAFTARAN</p>
                          <p className="text-lg font-mono font-bold text-slate-900 tracking-tight">{ppdbSuccess.id}</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] text-slate-400">TANGGAL SUBMIT</p>
                          <p className="font-medium text-slate-800">{new Date(ppdbSuccess.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-2 text-[11px] uppercase tracking-wider">Identitas Calon Siswa</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[11px]">
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">Nama Lengkap</span>
                            <span className="font-semibold text-slate-900">{ppdbSuccess.fullName}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">NISN</span>
                            <span className="font-mono font-semibold text-slate-900">{ppdbSuccess.nisn}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">Sekolah Asal</span>
                            <span className="font-semibold text-slate-900">{ppdbSuccess.originSchool}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">Jenis Kelamin</span>
                            <span className="font-semibold text-slate-900">{ppdbSuccess.gender}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">Nama Orang Tua</span>
                            <span className="font-semibold text-slate-900">{ppdbSuccess.guardianName}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-1.5">
                            <span className="text-slate-500">Status Seleksi</span>
                            <span className="font-extrabold text-amber-700 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{ppdbSuccess.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200/60 leading-relaxed text-[10px] text-slate-500">
                        <p className="font-bold text-slate-700 mb-1">Catatan Panitia PPDB:</p>
                        <p>1. Simpan salinan bukti pendaftaran digital ini.</p>
                        <p>2. Hubungi WhatsApp Humas ({ppdbSuccess.phone}) untuk konfirmasi waktu wawancara dan tes hafalan Juz 30.</p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                          onClick={resetPpdbForm}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 cursor-pointer"
                        >
                          Daftar Lagi
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Cetak Bukti</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* Simulated Registrants list */}
                <div className="mt-10 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs font-medium text-slate-700">
                  <h3 className="font-display font-bold text-slate-900 text-sm mb-4 uppercase tracking-wider">Pendaftar Terakhir (Real-time)</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 font-bold text-slate-600">ID</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600">Nama Calon Siswa</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600">Sekolah Asal</th>
                          <th className="px-4 py-2.5 font-bold text-slate-600 text-center">Status</th>
                          {isAdminMode && <th className="px-4 py-2.5 font-bold text-slate-600 text-center">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-normal">
                        {ppdbList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-mono text-emerald-800 font-semibold">{item.id}</td>
                            <td className="px-4 py-2 text-slate-900 font-medium">{item.fullName}</td>
                            <td className="px-4 py-2 text-slate-500">{item.originSchool}</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Diterima' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' : 'bg-amber-50 text-amber-800 border border-amber-200/50'}`}>
                                {item.status}
                              </span>
                            </td>
                            {isAdminMode && (
                              <td className="px-4 py-2 text-center">
                                <button 
                                  onClick={() => handleDeletePpdb(item.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Hapus Pendaftar"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 4. DIREKTORI GURU TAB */}
        {activeTab === "guru" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
              <div className="text-center md:text-left max-w-2xl">
                <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">Direktori Tenaga Pendidik & Staf</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Daftar guru pengampu, pembimbing akhlak, serta pendidik profesional berdedikasi tinggi di {profile.schoolName}.
                </p>
              </div>

              {/* ADMIN ACTION: ADD TEACHER */}
              {isAdminMode && (
                <button 
                  onClick={() => setShowAddTeacherModal(true)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Guru & Staf Baru</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachersList.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
                  
                  {/* ADMIN ACTIONS: EDIT / DELETE TEACHER */}
                  {isAdminMode && (
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEditTeacher(t)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(t.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                        title="Hapus Data Guru"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200/40">
                        {t.name[0]}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 leading-tight">{t.name}</h3>
                        <p className="text-[11px] text-emerald-800 font-medium mt-0.5">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 font-light text-xs leading-relaxed mt-4">
                      {t.desc}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>NIP: {t.nip}</span>
                    <span className="text-emerald-700 font-bold uppercase">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 5. NEWS & GALLERY TAB */}
        {activeTab === "galeri" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
              <div className="text-center md:text-left max-w-2xl">
                <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">Berita Utama & Galeri Kegiatan</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Temukan update berita, dokumentasi pembelajaran online, pengumuman rapat wali, dan prestasi akademik MTsN 3 Jeneponto.
                </p>
              </div>

              {/* ADMIN ACTION: ADD NEWS */}
              {isAdminMode && (
                <button 
                  onClick={() => setShowAddNewsModal(true)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Berita & Gambar</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* News Feed Grid */}
              <div className="lg:col-span-8 space-y-8">
                {newsList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border text-center text-slate-500 text-sm">
                    Belum ada artikel berita yang dipublikasikan.
                  </div>
                ) : (
                  newsList.map((article) => (
                    <div key={article.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all relative group flex flex-col md:flex-row">
                      
                      <div className="h-56 md:h-auto md:w-72 shrink-0 overflow-hidden relative">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          {/* Unboxed metadata standard separation check */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mb-2">
                            <span>{article.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>Oleh: {article.author}</span>
                          </div>

                          <h3 className="font-display font-bold text-lg text-slate-900 leading-tight mb-2 group-hover:text-emerald-800 transition-colors">
                            {article.title}
                          </h3>

                          <p className="text-slate-600 font-light text-xs leading-relaxed mb-4 whitespace-pre-line">
                            {article.content}
                          </p>
                        </div>

                        {/* ADMIN ACTION: DELETE NEWS */}
                        {isAdminMode && (
                          <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button 
                              onClick={() => handleDeleteNews(article.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus Artikel</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Sidebar with gallery activity images */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-emerald-950 text-white p-6 rounded-2xl">
                  <h4 className="font-display font-bold text-emerald-300 text-xs uppercase tracking-wider mb-4">Galeri Kampus Madrasah</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {newsList.map((n, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-emerald-800 relative group">
                        <img 
                          src={n.image} 
                          alt="Galeri" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[8px] text-emerald-100 truncate">{n.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FLOAT CHATBOT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="px-4 py-3.5 bg-emerald-700 text-white font-bold rounded-full shadow-2xl hover:bg-emerald-800 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <MessageSquare className="h-5 w-5 animate-bounce" />
            <span className="text-xs tracking-tight">Tanya Asisten AI</span>
          </button>
        )}
      </div>

      {/* CHATROOM MODAL */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-slideLeft">
            
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-700 p-1.5 flex items-center justify-center border border-emerald-600">
                  <img src={emblemImage} alt="Logo" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wide">Asisten Pintar MTsN 3</h3>
                  <p className="text-[10px] text-emerald-200">Kecerdasan Buatan Terintegrasi Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 hover:bg-emerald-700/80 rounded-lg text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold font-mono text-[11px] ${msg.role === 'user' ? 'bg-amber-100 text-amber-950' : 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm border leading-relaxed ${msg.role === 'user' ? 'bg-amber-50 border-amber-200/50 rounded-tr-none text-slate-800' : 'bg-white border-slate-200/60 rounded-tl-none text-slate-700 font-light whitespace-pre-line'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 border border-emerald-200/50 animate-pulse">AI</div>
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none text-slate-400 italic">Asisten sedang merangkum jawaban cerdas...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5 shrink-0">
              <button onClick={() => triggerQuickQuestion("Bagaimana pendaftaran PPDB?")} className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md cursor-pointer">Cara Daftar PPDB</button>
              <button onClick={() => triggerQuickQuestion("Siapa nama Kepala MTsN 3?")} className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md cursor-pointer">Kepala Sekolah</button>
              <button onClick={() => triggerQuickQuestion("Kapan gelombang pendaftaran ditutup?")} className="px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md cursor-pointer">Jadwal PPDB</button>
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
              <input 
                type="text"
                placeholder="Ketik pertanyaan untuk asisten..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs"
              />
              <button type="submit" className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl cursor-pointer">
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CMS MODAL WINDOWS                                              */}
      {/* ============================================================== */}

      {/* A. ADMIN LOGIN MODAL */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
                <Lock className="h-4 w-4 text-emerald-700" />
                <span>Login Konsol Admin</span>
              </h3>
              <button onClick={() => setShowAdminLoginModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-semibold text-slate-700">
              <p className="text-[11px] text-slate-500 font-normal">
                Gunakan sandi resmi administrator untuk mengaktifkan fitur manajemen/CMS madrasah.
              </p>
              <div>
                <label className="block mb-1 text-[10px] uppercase">Sandi Konsol Admin</label>
                <input 
                  type="password" 
                  required
                  placeholder="Ketik sandi: admin3" 
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              {adminLoginError && (
                <p className="text-red-600 text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{adminLoginError}</span>
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Aktifkan Hak Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
                <Edit2 className="h-4 w-4 text-emerald-700" />
                <span>Edit Profil Madrasah</span>
              </h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px]">Nama Sekolah</label>
                <input 
                  type="text" 
                  required
                  value={profileForm.schoolName}
                  onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Predikat Akreditasi</label>
                <input 
                  type="text" 
                  required
                  value={profileForm.accreditation}
                  onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px]">Nama Kepala Madrasah</label>
                  <input 
                    type="text" 
                    required
                    value={profileForm.principalName}
                    onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase text-[10px]">NIP Kepala Madrasah</label>
                  <input 
                    type="text" 
                    value={profileForm.principalNip}
                    onChange={(e) => setProfileForm({ ...profileForm, principalNip: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] text-slate-700 tracking-wider font-bold">Upload Foto Kamad Baru (.JPG / .PNG) *</label>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <div className="h-16 w-16 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={profileForm.principalPhoto || presetImages[3].path} 
                      alt="Preview Kamad" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleKamadPhotoUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Format gambar: JPG, JPEG, atau PNG (Maksimal 2MB)</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="block mb-1 uppercase text-[9px] text-slate-400">Atau Pilih dari Pilihan Preset AI</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetImages.map((img) => (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, principalPhoto: img.path })}
                        className={`relative aspect-square border rounded-lg overflow-hidden ${profileForm.principalPhoto === img.path ? 'ring-2 ring-emerald-700 border-transparent' : 'border-slate-200'}`}
                      >
                        <img src={img.path} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {profileForm.principalPhoto === img.path && (
                          <div className="absolute top-1 right-1 p-0.5 bg-emerald-700 text-white rounded-full"><Check className="h-2 w-2" /></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] text-slate-700 tracking-wider font-bold">Upload Logo Madrasah Baru (.JPG / .PNG) *</label>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="h-16 w-16 rounded-xl border border-slate-300 overflow-hidden bg-white p-2 shrink-0 flex items-center justify-center">
                    <img 
                      src={profileForm.schoolLogo || emblemImage} 
                      alt="Preview Logo" 
                      className="h-full w-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleSchoolLogoUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Logo diperbarui di seluruh website: Header, SKL, Chatbot, & Footer (Maksimal 2MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Pernyataan Sambutan Kamad</label>
                <textarea 
                  rows={4}
                  value={profileForm.principalWelcome}
                  onChange={(e) => setProfileForm({ ...profileForm, principalWelcome: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none leading-relaxed text-slate-600"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Visi Madrasah</label>
                <textarea 
                  rows={2}
                  value={profileForm.vision}
                  onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none leading-relaxed text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. TAMBAH GURU MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
                <Plus className="h-4 w-4 text-emerald-700" />
                <span>Tambah Guru & Staf</span>
              </h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px]">Nama Lengkap & Gelar *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Drs. H. Ahmad, M.Pd"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Jabatan / Bidang Studi *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Guru Matematika / Staf TU"
                  value={teacherForm.role}
                  onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px]">NIP (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NIP"
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase text-[10px]">Status Kepegawaian</label>
                  <select 
                    value={teacherForm.status}
                    onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  >
                    <option>PNS</option>
                    <option>Honorer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Motto / Deskripsi Karakter</label>
                <textarea 
                  rows={2}
                  placeholder="Deskripsi singkat kepribadian mendidik..."
                  value={teacherForm.desc}
                  onChange={(e) => setTeacherForm({ ...teacherForm, desc: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C2. EDIT GURU MODAL */}
      {showEditTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
                <Edit2 className="h-4 w-4 text-emerald-700" />
                <span>Edit Guru & Staf</span>
              </h3>
              <button onClick={() => { setShowEditTeacherModal(false); setEditingTeacherId(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditTeacherSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px]">Nama Lengkap & Gelar *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Drs. H. Ahmad, M.Pd"
                  value={editTeacherForm.name}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Jabatan / Bidang Studi *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Guru Matematika / Staf TU"
                  value={editTeacherForm.role}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, role: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px]">NIP (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NIP"
                    value={editTeacherForm.nip}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, nip: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase text-[10px]">Status Kepegawaian</label>
                  <select 
                    value={editTeacherForm.status}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  >
                    <option>PNS</option>
                    <option>Honorer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Motto / Deskripsi Karakter</label>
                <textarea 
                  rows={2}
                  placeholder="Deskripsi singkat kepribadian mendidik..."
                  value={editTeacherForm.desc}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, desc: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setShowEditTeacherModal(false); setEditingTeacherId(null); }}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. ADD NEWS MODAL */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleUp my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
                <Plus className="h-4 w-4 text-emerald-700" />
                <span>Upload Berita & Gambar</span>
              </h3>
              <button onClick={() => setShowAddNewsModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNews} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px]">Judul Berita Utama *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan judul berita yang menarik"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px]">Kategori Berita</label>
                  <select 
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  >
                    <option>Kegiatan</option>
                    <option>Pengumuman</option>
                    <option>Prestasi Madrasah</option>
                    <option>Akademik</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 uppercase text-[10px]">Penulis Berita</label>
                  <input 
                    type="text" 
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] text-slate-700 tracking-wider font-bold">Upload Gambar Berita (.JPG / .PNG) *</label>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <div className="h-16 w-16 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={newsForm.image || presetImages[0].path} 
                      alt="Preview Berita" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleNewsImageUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Pilih foto kegiatan siswa, piala, atau bangunan sekolah (Maksimal 2MB)</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="block mb-1 uppercase text-[9px] text-slate-400">Atau Pilih dari Ilustrasi Preset AI</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetImages.map((img) => (
                      <button
                        key={img.path}
                        type="button"
                        onClick={() => setNewsForm({ ...newsForm, image: img.path })}
                        className={`relative aspect-square border rounded-lg overflow-hidden ${newsForm.image === img.path ? 'ring-2 ring-emerald-700 border-transparent' : 'border-slate-200'}`}
                      >
                        <img src={img.path} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {newsForm.image === img.path && (
                          <div className="absolute top-1 right-1 p-0.5 bg-emerald-700 text-white rounded-full"><Check className="h-2 w-2" /></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px]">Isi Berita *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Tulis materi konten berita secara lengkap di sini..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-normal focus:ring-2 focus:ring-emerald-700/20 focus:outline-none leading-relaxed text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddNewsModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Terbitkan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-normal">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <img 
                src={profile.schoolLogo || emblemImage} 
                alt="Logo MTsN 3 Jeneponto" 
                className="h-8 w-8 object-contain rounded"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-extrabold tracking-wider uppercase text-emerald-400">{profile.schoolName}</span>
            </div>
            <p className="leading-relaxed">
              Portal CMS Web terintegrasi resmi MTsN 3 Jeneponto. Menyediakan informasi menyeluruh demi akselerasi mutu madrasah unggul berbasis teknologi masa kini.
            </p>
            <p className="text-[10px] text-slate-500">
              © 2026 {profile.schoolName}. Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">Tautan Layanan</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab("home")} className="hover:text-emerald-400 transition-colors cursor-pointer">Beranda & Profil</button></li>
              <li><button onClick={() => setActiveTab("kelulusan")} className="hover:text-emerald-400 transition-colors cursor-pointer">Cek Kelulusan Online</button></li>
              <li><button onClick={() => setActiveTab("ppdb")} className="hover:text-emerald-400 transition-colors cursor-pointer">PPDB Digital</button></li>
              <li><button onClick={() => setActiveTab("guru")} className="hover:text-emerald-400 transition-colors cursor-pointer">Direktori Guru & Staf</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h5 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">Hubungi Kami</h5>
            <ul className="space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Jl. Syamsuddin Kr Kuneng, Banrimanurung, Kec. Bangkala Barat, Kab. Jeneponto, Sulawesi Selatan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>+62 821-1234-5678 (Humas PPDB)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>mtsneg3jeneponto@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
