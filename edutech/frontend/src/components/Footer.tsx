import { GraduationCap, Heart, Github, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-theme-page border-t border-theme-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                EduAI
              </span>
            </div>
            <p className="text-theme-text-muted text-sm leading-relaxed">
              {t.footer_desc}
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-theme-card-hover text-theme-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-theme-text font-semibold mb-4">{t.footer_platform}</h3>
            <ul className="space-y-2">
              {[
                { label: 'Courses', to: '/courses' },
                { label: 'Quiz', to: '/quiz' },
                { label: 'Leaderboard', to: '/leaderboard' },
                { label: 'AI Tutor', to: '/courses' },
                { label: 'Pricing', to: '/' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-theme-text-muted hover:text-indigo-400 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-theme-text font-semibold mb-4">{t.footer_support}</h3>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-theme-text-muted hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-theme-text font-semibold mb-4">{t.footer_resources}</h3>
            <ul className="space-y-2">
              {['Blog', 'Tutorials', 'Syllabus', 'Study Material', 'Community'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-theme-text-muted hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-theme-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-theme-text-muted text-sm">
            {t.footer_copyright}
          </p>
          <p className="text-theme-text-muted text-sm flex items-center gap-1">
            {t.footer_made_in} <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" />
          </p>
        </div>
      </div>
    </footer>
  );
}
