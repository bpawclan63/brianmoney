import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Syarat dan Ketentuan</h1>
              <p className="text-muted-foreground">Terakhir diperbarui: Januari 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Penerimaan Ketentuan</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dengan mengakses dan menggunakan aplikasi Flowly, Anda setuju untuk terikat oleh syarat dan ketentuan ini. 
              Jika Anda tidak setuju dengan salah satu ketentuan, harap jangan menggunakan layanan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Deskripsi Layanan</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Flowly adalah aplikasi manajemen keuangan pribadi yang membantu pengguna melacak pengeluaran, 
              membuat anggaran, dan mencapai tujuan finansial. Layanan ini disediakan "sebagaimana adanya" 
              dan dapat diubah sewaktu-waktu.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Akun Pengguna</h2>
            <ul className="text-muted-foreground text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi Anda.</li>
              <li>Anda harus memberikan informasi yang akurat saat mendaftar.</li>
              <li>Akun baru memerlukan aktivasi oleh admin sebelum dapat digunakan.</li>
              <li>Kami berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Privasi dan Keamanan Data</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kami berkomitmen melindungi privasi Anda. Data keuangan Anda dienkripsi dan disimpan dengan aman. 
              Kami tidak akan menjual atau membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Penggunaan yang Dilarang</h2>
            <ul className="text-muted-foreground text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Menggunakan layanan untuk tujuan ilegal.</li>
              <li>Mencoba mengakses akun pengguna lain.</li>
              <li>Mengganggu atau merusak infrastruktur layanan.</li>
              <li>Menyebarkan konten berbahaya atau spam.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Langganan dan Pembayaran</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Beberapa fitur mungkin memerlukan langganan berbayar. Pembayaran akan diproses sesuai dengan 
              metode yang Anda pilih. Kebijakan pengembalian dana akan berlaku sesuai ketentuan yang berlaku.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Batasan Tanggung Jawab</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Flowly tidak bertanggung jawab atas kerugian finansial yang timbul dari keputusan yang dibuat 
              berdasarkan informasi di aplikasi ini. Aplikasi ini hanya alat bantu dan bukan pengganti nasihat keuangan profesional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Perubahan Ketentuan</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah 
              dipublikasikan. Penggunaan layanan yang berkelanjutan berarti Anda menerima ketentuan yang diperbarui.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Kontak</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>Email: support@flowly.app</li>
              <li>WhatsApp: +62 812-3456-7890</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}