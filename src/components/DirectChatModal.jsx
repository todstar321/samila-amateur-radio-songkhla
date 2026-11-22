import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Radio, 
  User, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Cpu,
  UserCheck,
  Info
} from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function DirectChatModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  recipient, 
  messages = [], 
  onSendMessage,
  onOpenLogin,
  onOpenProfile,
  onMarkAsRead
}) {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Auto mark messages from recipient as read
      if (currentUser && recipient && onMarkAsRead) {
        onMarkAsRead(recipient.callsign);
      }
    }
  }, [isOpen, messages, recipient]);

  if (!isOpen || !recipient) return null;

  // Filter full conversation history between currentUser and recipient (ประวัติยาวต่อเนื่อง)
  const conversation = messages.filter(m => {
    if (!currentUser) return false;
    return (
      (m.senderCallsign === currentUser.callsign && m.recipientCallsign === recipient.callsign) ||
      (m.senderCallsign === recipient.callsign && m.recipientCallsign === currentUser.callsign)
    );
  });

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderCallsign: currentUser.callsign || 'สมาชิก',
      senderName: currentUser.fullName || 'เพื่อนสมาชิก',
      senderAvatar: currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      recipientCallsign: recipient.callsign,
      recipientName: recipient.fullName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      isRead: false
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  const handleQuickGreeting = (text) => {
    setInputText(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-cyan-500/40 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Ocean Gradient with Recipient Details & Clickable Profile */}
        <div className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white p-3.5 sm:p-4 border-b border-cyan-400/50 relative">
          <div className="flex items-center justify-between">
            
            {/* Clickable Profile trigger */}
            <div 
              onClick={() => {
                if (onOpenProfile) onOpenProfile(recipient);
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group/prof"
              title="คลิกเพื่อดูโปรไฟล์เพื่อนสมาชิก (หากนึกไม่ออกว่าใคร)"
            >
              <div className="relative shrink-0">
                <img 
                  src={recipient.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                  alt={recipient.fullName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-300 shadow-md bg-slate-800 group-hover/prof:border-amber-300 group-hover/prof:scale-105 transition-all"
                />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#012a4a] absolute -bottom-0.5 -right-0.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-base text-amber-300 tracking-wider group-hover/prof:underline flex items-center gap-1">
                    <span>{recipient.callsign !== '-' ? recipient.callsign : 'รอ Callsign'}</span>
                  </span>
                  {recipient.nickname && (
                    <span className="px-2 py-0.2 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 text-[10.5px] font-semibold">
                      ({recipient.nickname})
                    </span>
                  )}
                  {recipient.deNetworkCode && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-400/20 text-amber-200 rounded border border-amber-400/40 flex items-center gap-0.5">
                      <Cpu className="w-2.5 h-2.5" />
                      <span>{recipient.deNetworkCode}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-slate-100 truncate group-hover/prof:text-amber-200" title={recipient.fullName}>
                    {recipient.fullName}
                  </p>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-medium inline-flex items-center gap-0.5">
                    <Info className="w-2.5 h-2.5" /> ดูโปรไฟล์
                  </span>
                </div>

                <p className="text-[10.5px] text-cyan-200/90 font-mono flex items-center gap-1 mt-0.5">
                  <Radio className="w-3 h-3 text-cyan-300 shrink-0" />
                  <span>สแตนด์บาย: {recipient.radioStandby || '145.6750 MHz'}</span>
                </p>
              </div>
            </div>

            {/* Right Buttons: Call & Close */}
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              {recipient.phone && (
                <a
                  href={`tel:${recipient.phone.replace(/\D/g, '')}`}
                  className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition cursor-pointer"
                  title="โทรออกหาเพื่อนสมาชิกทันที"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Guest Warning if not logged in */}
        {!currentUser && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 gap-2">
            <span>ท่านยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบเพื่อส่งข้อความหาเพื่อนสมาชิก</span>
            <button
              onClick={() => {
                onClose();
                if (onOpenLogin) onOpenLogin();
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shrink-0"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}

        {/* Message Thread Body (แสดงประวัติการสนทนายาวต่อเนื่อง) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/80 min-h-[260px] max-h-[380px]">
          {conversation.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                ยังไม่มีประวัติการส่งข้อความกับสถานี {recipient.callsign}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                พิมพ์ข้อความทักทาย หรือเลือกข้อความสำเร็จรูปด้านล่างเพื่อส่งข้อความหาเพื่อนสมาชิกได้ทันที
              </p>
            </div>
          ) : (
            conversation.map((msg) => {
              const isMe = currentUser && msg.senderCallsign === currentUser.callsign;
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isMe && (
                      <img 
                        src={recipient.avatar || msg.senderAvatar} 
                        alt="avatar" 
                        onClick={() => {
                          if (onOpenProfile) onOpenProfile(recipient);
                        }}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-300 cursor-pointer hover:border-cyan-400" 
                        title="คลิกเพื่อดูโปรไฟล์"
                      />
                    )}
                    <div 
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-r from-[#013a63] to-[#0077b6] text-white rounded-br-none shadow-md' 
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-2 font-mono flex items-center gap-1">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-cyan-600" />}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Greeting Shortcuts */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            <span>ข้อความทักทายสำเร็จรูปสไตล์นักวิทยุสมัครเล่น:</span>
          </p>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {[
              "สวัสดีครับ 73 ขอยืนยันความถี่สแตนด์บายครับ",
              "ว.16 ระดับ 5 สัญญาณชัดเจนดีครับ 73",
              "สะดวกประสานงานข่ายสมิหลา 145.6750 MHz ไหมครับ",
              "ขอ QRU 73 มีข่าวสารสมาคมฯ ประสานงานครับ"
            ].map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickGreeting(text)}
                className="px-2.5 py-1 bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 text-[10.5px] rounded-lg border border-slate-300 hover:border-cyan-400 transition cursor-pointer shrink-0"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={currentUser ? `พิมพ์ข้อความถึง ${recipient.callsign}...` : "กรุณาเข้าสู่ระบบก่อนส่งข้อความ"}
            disabled={!currentUser}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-cyan-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={!currentUser || !inputText.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">ส่ง</span>
          </button>
        </form>

        {/* Developer Credit Signature Line */}
        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
