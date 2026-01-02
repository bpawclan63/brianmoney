import { Sparkles, BarChart3, CheckSquare, PiggyBank, Heart, Shield, Zap, Instagram, MessageCircle, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sparkles,
    title: 'Transaction Tracking',
    description: 'Track all your income and expenses with detailed categorization and payment methods.',
    color: 'from-neon-pink to-neon-purple',
  },
  {
    icon: PiggyBank,
    title: 'Smart Budgeting',
    description: 'Set monthly budgets for each category and get alerts when spending approaches limits.',
    color: 'from-neon-purple to-neon-blue',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Beautiful charts and insights to understand your spending patterns and savings rate.',
    color: 'from-neon-green to-neon-cyan',
  },
  {
    icon: CheckSquare,
    title: 'Todo Integration',
    description: 'Built-in task manager to track financial tasks, bills, and reminders.',
    color: 'from-amber-400 to-orange-400',
  },
];

const stats = [
  { label: 'Categories', value: '13+' },
  { label: 'Charts', value: '5+' },
  { label: 'Export Options', value: '2' },
  { label: 'Payment Methods', value: '3' },
];

export default function About() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <div className="relative text-center py-16 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple mb-6 glow-cyan animate-bounce-subtle">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">Flowly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aplikasi keuangan pribadi yang cantik dan mudah digunakan untuk mahasiswa.
            Kelola pengeluaran, budget, dan capai tujuan finansialmu! ✨
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              'glass-card p-6 text-center opacity-0 animate-fade-in-up',
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-3xl font-bold text-gradient">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Fitur Utama ✨</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                'glass-card-hover p-6 opacity-0 animate-fade-in-up',
              )}
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <div
                className={cn(
                  'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br',
                  feature.color
                )}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Kenapa Flowly? 💕</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-pink/20 mb-4">
              <Heart className="w-6 h-6 text-neon-pink" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Desain Cantik</h3>
            <p className="text-sm text-muted-foreground">
              UI modern dengan animasi halus dan efek glassmorphism yang aesthetic.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-purple/20 mb-4">
              <Shield className="w-6 h-6 text-neon-purple" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Privasi Terjaga</h3>
            <p className="text-sm text-muted-foreground">
              Data keuanganmu aman dan terenkripsi. Tidak ada yang bisa mengakses datamu.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-green/20 mb-4">
              <Zap className="w-6 h-6 text-neon-green" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Cepat & Responsif</h3>
            <p className="text-sm text-muted-foreground">
              Performa optimal dengan update instan dan desain responsif.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Link Cepat 🔗</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/guide" className="glass-card-hover p-4 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Panduan Penggunaan</h3>
              <p className="text-sm text-muted-foreground">Pelajari cara menggunakan Flowly</p>
            </div>
          </Link>
          <Link to="/terms" className="glass-card-hover p-4 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Syarat & Ketentuan</h3>
              <p className="text-sm text-muted-foreground">Baca syarat penggunaan aplikasi</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Hubungi Kami 📱</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a 
            href="https://instagram.com/flowly.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card-hover p-6 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Instagram</h3>
              <p className="text-sm text-muted-foreground">@flowly.app</p>
            </div>
          </a>
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card-hover p-6 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Customer Service</h3>
              <p className="text-sm text-muted-foreground">+62 812-3456-7890</p>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-sm">
        <p>Dibuat dengan 💕 menggunakan React, TypeScript & Tailwind CSS</p>
        <p className="mt-2">Version 1.0.0</p>
      </div>
    </div>
  );
}