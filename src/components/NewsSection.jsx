import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  User, 
  ArrowRight, 
  Tag, 
  Pin, 
  PlusCircle, 
  Radio,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import NewsDetailModal from './NewsDetailModal';
import { getSectionTheme, getOverlayGradient } from '../utils/themeUtils';

export default function NewsSection({ 
  settings,
  newsList, 
  currentUser, 
  unreadNewsCount = 0,
  readNewsIds = [],
  onReadArticle,
  onMarkAllAsRead,
  onAddNewNews 
}) {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['ทั้งหมด', 'ประกาศสำคัญ', 'ข่ายฉุกเฉิน', 'อบรมและสอบ', 'กิจกรรมสมาคม'];

  const handleOpenArticle = (article) => {
    if (onReadArticle) {
      onReadArticle(article.id);
    }
    setSelectedArticle(article);
  };

  const filteredNews = selectedCategory === 'ทั้งหมด'
    ? newsList
    : newsList.filter(item => item.category === selectedCategory);

  const theme = getSectionTheme(settings, 'news');
  const bgOpacity = (theme.opacity ?? 20) / 100;
  const overlayClass = getOverlayGradient(theme.overlayType, 'ocean-light');

  return (
    <section id="news" className="py-12 sm:py-20 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Dynamic Background Image with Opacity */}
      {theme.bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{ 
            backgroundImage: `url('${theme.bgUrl}')`,
            opacity: bgOpacity,
          }}
        />
      )}
      {/* Oceanic Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlayClass} pointer-events-none`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sky-700 text-xs font-bold tracking-wider uppercase mb-1.5">
              <Bell className="w-4 h-4 text-sky-600" />
              <span>Official Announcements & News</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ประกาศและข่าวสารประชาสัมพันธ์
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              ข่าวสาร กิจกรรมเพื่อสังคม และประกาศอย่างเป็นทางการของสมาคมวิทยุสมัครเล่นสมิหลา
            </p>
          </div>

          {/* Admin Action: Add News */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onAddNewNews}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow transition cursor-pointer self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เขียนประกาศใหม่ (สำหรับแอดมิน)</span>
            </button>
          )}
        </div>

        {/* Member Unread News Alert Banner (กระตุ้นเตือนเฉพาะสมาชิก) */}
        {currentUser && unreadNewsCount > 0 && (
          <div className="mb-8 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-sky-500/15 border-2 border-amber-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold font-mono text-sm shadow-md animate-pulse shrink-0 ring-2 ring-white/50">
                {unreadNewsCount}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>คุณมีประกาศ & ข่าวสารใหม่ที่ยังไม่ได้เปิดดู {unreadNewsCount} เรื่อง</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-2xs">ใหม่</span>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                  ขอเชิญเพื่อนสมาชิกคลิกเปิดอ่านรายละเอียด เพื่อไม่พลาดข่าวสาร กิจกรรม และข้อความแจ้งเตือนสำคัญของสมาคมฯ
                </p>
              </div>
            </div>
            {onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                title="คลิกเมื่ออ่านครบทุกเรื่องแล้ว"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>อ่านแล้วทั้งหมด</span>
              </button>
            )}
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-800 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Cards Grid: บนมือถือแสดง 2 ป้ายข้อความต่อแถว (grid-cols-2) บนคอมพิวเตอร์แสดง 3 คอลัมน์ตามเดิม */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredNews.map((news) => {
            const isUnread = currentUser && !readNewsIds.includes(news.id);
            return (
              <article 
                key={news.id}
                onClick={() => handleOpenArticle(news)}
                className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer ${
                  isUnread ? 'border-rose-300 ring-2 ring-rose-400/40' : news.isPinned ? 'border-slate-200 ring-2 ring-sky-500/30' : 'border-slate-200'
                }`}
              >
                {/* Card Image */}
                <div className="relative h-28 sm:h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-1.5 flex-wrap">
                    <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded-md bg-sky-900/85 text-sky-100 backdrop-blur-sm shadow truncate max-w-[100px] sm:max-w-none">
                      {news.category}
                    </span>
                    {news.isPinned && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 sm:gap-1 shadow">
                        <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                        <span className="hidden sm:inline">ปักหมุด</span>
                      </span>
                    )}
                    {isUnread && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-md bg-rose-600 text-white flex items-center gap-0.5 sm:gap-1 shadow animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>ยังไม่อ่าน</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-2.5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-slate-400 mb-1.5 sm:mb-2.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                        <span>{news.date}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:flex items-center gap-1 truncate">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        {news.author}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-base lg:text-lg leading-snug group-hover:text-sky-700 transition line-clamp-2">
                      {news.title}
                    </h3>

                    <p className="hidden sm:block mt-2.5 text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {news.excerpt}
                    </p>
                  </div>

                  {/* Read Details Button */}
                  <div className="mt-2.5 sm:mt-5 pt-2 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-light">
                      {news.readTime || '3 นาที'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenArticle(news);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-sky-700 hover:text-sky-900 group-hover:translate-x-1 transition cursor-pointer"
                    >
                      <span>อ่านรายละเอียด</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state if filtered news is 0 */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">ยังไม่มีข้อมูลในหมวดหมู่นี้</p>
            <p className="text-xs text-slate-400 mt-1">สามารถเลือกหมวดหมู่อื่นเพื่อดูประกาศสมาคม</p>
          </div>
        )}

      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
        <NewsDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </section>
  );
}
