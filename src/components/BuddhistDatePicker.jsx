import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

// Determine days in a month for Buddhist year
function getDaysInMonthBe(month1Based, yearBe) {
  const gregorianYear = yearBe - 543;
  return new Date(gregorianYear, month1Based, 0).getDate();
}

// Determine first day of week for a month (0 = Sunday, 1 = Monday, ...)
function getFirstDayOfWeekBe(month1Based, yearBe) {
  const gregorianYear = yearBe - 543;
  return new Date(gregorianYear, month1Based - 1, 1).getDay();
}

// Parse Thai/Buddhist date string into { day, month, yearBe }
function parseBuddhistDate(val) {
  if (!val || typeof val !== 'string') return null;
  const str = val.trim();

  // Pattern 1: DD/MM/YYYY (e.g. 10/05/2569, 10-05-2569)
  const numMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (numMatch) {
    const d = parseInt(numMatch[1], 10);
    const m = parseInt(numMatch[2], 10);
    let y = parseInt(numMatch[3], 10);
    if (y < 2400) y += 543; // Auto convert CE to BE if entered in CE
    return { day: d, month: m, yearBe: y };
  }

  // Pattern 2: DD ThaiMonth YYYY (e.g. 10 พ.ค. 2569, 10 พฤษภาคม 2569)
  const thaiMatch = str.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})/);
  if (thaiMatch) {
    const d = parseInt(thaiMatch[1], 10);
    const mStr = thaiMatch[2];
    let y = parseInt(thaiMatch[3], 10);
    if (y < 2400) y += 543;

    let mIdx = THAI_MONTHS_SHORT.findIndex(s => mStr.includes(s.replace('.', '')));
    if (mIdx === -1) {
      mIdx = THAI_MONTHS_FULL.findIndex(f => mStr.includes(f));
    }
    const m = mIdx !== -1 ? mIdx + 1 : 1;
    return { day: d, month: m, yearBe: y };
  }

  return null;
}

export default function BuddhistDatePicker({
  value,
  onChange,
  placeholder = 'วว/ดด/ปปปป (พ.ศ.)',
  minYearBe = 2470,
  maxYearBe = 2590,
  className = '',
  required = false,
  id,
  name,
  disabled = false,
  showTodayBtn = true
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentYearBe = new Date().getFullYear() + 543;
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  // Selected date parts
  const parsed = parseBuddhistDate(value);
  const selectedDay = parsed?.day || null;
  const selectedMonth = parsed?.month || null;
  const selectedYearBe = parsed?.yearBe || null;

  // View state for calendar (current month/year being viewed)
  const [viewMonth, setViewMonth] = useState(selectedMonth || currentMonth);
  const [viewYearBe, setViewYearBe] = useState(selectedYearBe || currentYearBe);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewMonth(parsed.month);
      setViewYearBe(parsed.yearBe);
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYearBe(prev => Math.max(minYearBe, prev - 1));
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYearBe(prev => Math.min(maxYearBe, prev + 1));
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Select day
  const handleSelectDay = (day) => {
    const formatted = `${String(day).padStart(2, '0')}/${String(viewMonth).padStart(2, '0')}/${viewYearBe}`;
    const age = Math.max(0, currentYearBe - viewYearBe);
    if (onChange) {
      onChange(formatted, {
        day,
        month: viewMonth,
        yearBe: viewYearBe,
        age,
        formatted
      });
    }
    setIsOpen(false);
  };

  // Today button
  const handleSelectToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMonth(currentMonth);
    setViewYearBe(currentYearBe);
    handleSelectDay(currentDay);
  };

  // Days calculations for grid
  const daysInMonth = getDaysInMonthBe(viewMonth, viewYearBe);
  const firstDayOfWeek = getFirstDayOfWeekBe(viewMonth, viewYearBe);

  // Year options for select
  const yearsList = [];
  for (let y = maxYearBe; y >= minYearBe; y--) {
    yearsList.push(y);
  }

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {/* Input Box */}
      <div 
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm flex items-center justify-between cursor-pointer select-none transition hover:bg-white hover:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/30 ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
        }`}
      >
        <span className={`font-mono ${value ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 text-sky-700">
          <CalendarIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-1.5 left-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: '280px' }}
        >
          {/* Header Controls (Month & Year Selectors) */}
          <div className="flex items-center justify-between gap-1.5 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {THAI_MONTHS_FULL.map((name, idx) => (
                  <option key={name} value={idx + 1}>{name}</option>
                ))}
              </select>

              {/* Buddhist Year Selector (พ.ศ.) */}
              <select
                value={viewYearBe}
                onChange={(e) => setViewYearBe(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-sky-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {yearsList.map(y => (
                  <option key={y} value={y}>พ.ศ. {y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels (อา - ส) */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[11px] font-bold text-slate-400">
            {THAI_DAYS_SHORT.map((day, idx) => (
              <div 
                key={day} 
                className={idx === 0 ? 'text-rose-500' : (idx === 6 ? 'text-sky-600' : '')}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank padding cells before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day && selectedMonth === viewMonth && selectedYearBe === viewYearBe;
              const isToday = currentDay === day && currentMonth === viewMonth && currentYearBe === viewYearBe;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isSelected 
                      ? 'bg-sky-600 text-white font-bold shadow-sm ring-2 ring-sky-300' 
                      : (isToday 
                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 hover:bg-amber-200' 
                          : 'text-slate-700 hover:bg-slate-100 hover:text-sky-700')
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom Footer (Quick Today button & Selected preview) */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {showTodayBtn && (
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>📅 วันนี้ ({currentDay} {THAI_MONTHS_SHORT[currentMonth - 1]} {currentYearBe})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer ml-auto"
            >
              ปิด
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
