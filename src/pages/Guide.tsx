import { BookOpen, ArrowLeft, Plus, PiggyBank, Target, BarChart3, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Plus,
    title: 'Tambah Transaksi',
    description: 'Catat setiap pengeluaran dan pemasukan dengan memilih kategori, nominal, dan metode pembayaran.',
    tips: [
      'Gunakan kategori yang sesuai untuk tracking yang akurat',
      'Tambahkan catatan untuk transaksi yang perlu diingat',
      'Catat transaksi segera setelah terjadi'
    ],
    color: 'from-neon-pink to-neon-purple'
  },
  {
    icon: PiggyBank,
    title: 'Atur Budget',
    description: 'Tetapkan batas pengeluaran bulanan untuk setiap kategori agar keuangan tetap terkontrol.',
    tips: [
      'Mulai dengan kategori pengeluaran terbesar',
      'Sesuaikan budget berdasarkan pendapatan',
      'Review dan sesuaikan budget setiap bulan'
    ],
    color: 'from-neon-purple to-neon-blue'
  },
  {
    icon: Target,
    title: 'Buat Goals',
    description: 'Tentukan target finansial seperti dana darurat, liburan, atau pembelian besar.',
    tips: [
      'Tetapkan target yang realistis dan terukur',
      'Bagi goal besar menjadi milestone kecil',
      'Tambahkan dana secara rutin ke setiap goal'
    ],
    color: 'from-neon-green to-neon-cyan'
  },
  {
    icon: BarChart3,
    title: 'Analisis Keuangan',
    description: 'Lihat grafik dan statistik untuk memahami pola pengeluaran dan mengambil keputusan lebih baik.',
    tips: [
      'Perhatikan kategori dengan pengeluaran tertinggi',
      'Bandingkan pengeluaran antar bulan',
      'Identifikasi pengeluaran yang bisa dikurangi'
    ],
    color: 'from-amber-400 to-orange-400'
  },
  {
    icon: CheckSquare,
    title: 'Todo List',
    description: 'Kelola tugas-tugas keuangan seperti membayar tagihan, cek saldo, atau review budget.',
    tips: [
      'Set reminder untuk tagihan rutin',
      'Prioritaskan tugas berdasarkan deadline',
      'Tandai selesai setelah menyelesaikan tugas'
    ],
    color: 'from-rose-400 to-pink-400'
  }
];

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panduan Penggunaan</h1>
          <p className="text-muted-foreground">Pelajari cara memaksimalkan Flowly</p>
        </div>
      </div>

      {/* Introduction */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Selamat Datang di Flowly!</h2>
            <p className="text-sm text-muted-foreground">Aplikasi keuangan pribadi untuk mahasiswa</p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Flowly membantu Anda mengelola keuangan dengan mudah. Ikuti panduan ini untuk memulai 
          perjalanan finansial Anda dengan lebih terorganisir.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div 
            key={step.title}
            className="glass-card-hover p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg font-bold text-primary">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    step.color
                  )}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Tips:</p>
                  <ul className="space-y-1">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="glass-card p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Siap Memulai?</h3>
        <p className="text-muted-foreground mb-4">
          Mulai catat transaksi pertama Anda dan rasakan kemudahan mengelola keuangan!
        </p>
        <Button variant="neon" onClick={() => navigate('/transactions')}>
          <Plus className="w-4 h-4" />
          Tambah Transaksi Pertama
        </Button>
      </div>
    </div>
  );
}