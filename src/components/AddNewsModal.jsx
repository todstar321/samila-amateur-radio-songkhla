import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function AddNewsModal({ isOpen, onClose, onAddNews }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ข่าวสาร');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newArticle = {
      id: `news-${Date.now()}`,
      title: title.trim(),
      category: category,
      excerpt: excerpt.trim() || content.substring(0, 120) + '...',
      content: content.trim(),
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: 'เจ้าหน้าที่สมาคมฯ',
      readTime: '3 นาที',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      isPinned: isPinned
    };

    onAddNews(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-sky-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-sm sm:text-base">เพิ่มประกาศ / ข่าวสารใหม่ (ระบบแอดมิน)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หัวข้อข่าวสาร / ประกาศ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ระบุหัวข้อข่าวที่ชัดเจน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่ประกาศ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                <option value="ข่ายฉุกเฉิน">ข่ายฉุกเฉิน</option>
                <option value="อบรมและสอบ">อบรมและสอบ</option>
                <option value="กิจกรรมสมาคม">กิจกรรมสมาคม</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>📌 ปักหมุดประกาศนี้ไว้ด้านบน</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำโปรยสั้น (Excerpt)
            </label>
            <input
              type="text"
              placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยคสำหรับแสดงบนการ์ด"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เนื้อหาประกาศฉบับเต็ม <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="กรอกรายละเอียดประกาศ กำหนดการ สถานที่ หรือช่องทางติดต่อ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ลิงก์รูปภาพประกอบ (Image URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>เผยแพร่ประกาศ</span>
            </button>
          </div>
        </form>

        {/* Developer Credit Signature Bar */}
        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
