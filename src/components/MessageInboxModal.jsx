import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Reply, 
  CheckCheck, 
  Clock, 
  User, 
  Sparkles,
  Inbox,
  ExternalLink,
  ChevronRight,
  Radio,
  Cpu,
  Eye,
  Check
} from 'lucide-react';
import DeveloperCredit from './DeveloperCredit';

export default function MessageInboxModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  messages = [], 
  membersList = [],
  onReplyMember,
  onMarkAsRead,
  onOpenProfile
}) {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'unread', 'read'

  if (!isOpen) return null;

  // Filter messages involving currentUser (received or sent)
  // Group messages by conversation partner (เหมือนใน LINE / Messenger)
  const conversationMap = new Map();

  messages.forEach(msg => {
    let partnerCallsign = null;
    let partnerName = null;
    let partnerAvatar = null;

    if (currentUser && msg.recipientCallsign === currentUser.callsign) {
      partnerCallsign = msg.senderCallsign;
      partnerName = msg.senderName;
      partnerAvatar = msg.senderAvatar;
    } else if (currentUser && msg.senderCallsign === currentUser.callsign) {
      partnerCallsign = msg.recipientCallsign;
      partnerName = msg.recipientName;
      partnerAvatar = msg.recipientAvatar;
    }

    if (!partnerCallsign) return;

    if (!conversationMap.has(partnerCallsign)) {
      conversationMap.set(partnerCallsign, {
        partnerCallsign,
        partnerName,
        partnerAvatar,
        messages: [],
        unreadCount: 0,
        lastMessage: null,
      });
    }

    const conv = conversationMap.get(partnerCallsign);
    conv.messages.push(msg);

    // If currentUser is the recipient and it's unread
    if (currentUser && msg.recipientCallsign === currentUser.callsign && !msg.isRead) {
      conv.unreadCount += 1;
    }

    // Keep the most recent message as lastMessage
    if (!conv.lastMessage || new Date(msg.id.replace('msg-', '')) > new Date(conv.lastMessage.id.replace('msg-', ''))) {
      conv.lastMessage = msg;
    }
  });

  const conversationList = Array.from(conversationMap.values()).map(conv => {
    // Find matching member object from membersList for complete profile details
    const memberObj = membersList.find(m => m.callsign === conv.partnerCallsign) || {
      callsign: conv.partnerCallsign,
      fullName: conv.partnerName,
      avatar: conv.partnerAvatar
    };
    return {
      ...conv,
      member: memberObj
    };
  });

  // Sort conversations: unread first, then by last message timestamp
  conversationList.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return 0;
  });

  // Total unread count
  const totalUnread = conversationList.reduce((acc, c) => acc + c.unreadCount, 0);

  // Filtered by tab
  const filteredConversations = conversationList.filter(conv => {
    if (selectedFilter === 'unread') return conv.unreadCount > 0;
    if (selectedFilter === 'read') return conv.unreadCount === 0;
    return true;
  });

  const handleOpenConversation = (conv) => {
    // Mark as read
    if (onMarkAsRead) {
      onMarkAsRead(conv.partnerCallsign);
    }
    onClose();
    if (onReplyMember) {
      onReplyMember(conv.member);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-cyan-500/40 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Ocean Wave Gradient) */}
        <div className="bg-gradient-to-r from-[#012a4a] via-[#01497c] to-[#013a63] text-white p-4 sm:p-5 border-b border-cyan-400/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-200 shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">กล่องข้อความทักหาเพื่อนสมาชิก</h3>
                {totalUnread > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold font-mono animate-pulse shadow">
                    {totalUnread} ข้อความใหม่
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium font-mono">
                    อ่านครบแล้ว
                  </span>
                )}
              </div>
              <p className="text-xs text-cyan-200 mt-0.5">
                สถานี: <strong className="font-mono text-amber-300">{currentUser?.callsign || 'ไม่ระบุ'}</strong> ({currentUser?.fullName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs (All / Unread / Read) */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#012a4a] text-cyan-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white/70'
              }`}
            >
              ทั้งหมด ({conversationList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('unread')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedFilter === 'unread'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white/70'
              }`}
            >
              <span>ยังไม่อ่าน</span>
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9.5px] font-mono font-bold">
                  {totalUnread}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('read')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedFilter === 'read'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white/70'
              }`}
            >
              อ่านแล้ว
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            สไตล์ LINE / Messenger
          </span>
        </div>

        {/* Conversation List (สไตล์ LINE / Messenger: แสดงข้อความย่อๆ 1 บรรทัด) */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 bg-slate-50 min-h-[320px] max-h-[480px]">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 mx-auto flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {selectedFilter === 'unread' ? 'ไม่มีข้อความใหม่ที่ยังไม่อ่าน' : 'ยังไม่มีบทสนทนาในขณะนี้'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เมื่อเพื่อนสมาชิกทักหาคุณจากหน้าทำเนียบสมาชิก ข้อความจะปรากฏเป็นห้องสนทนาเพื่อให้คุณเปิดอ่านและตอบกลับได้ทันที
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isUnread = conv.unreadCount > 0;
              const member = conv.member;

              return (
                <div 
                  key={conv.partnerCallsign}
                  onClick={() => handleOpenConversation(conv)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group relative ${
                    isUnread
                      ? 'bg-gradient-to-r from-sky-50 via-cyan-50/70 to-white border-cyan-400 shadow-md hover:border-cyan-500 hover:shadow-lg'
                      : 'bg-white/80 hover:bg-slate-100/90 border-slate-200/90 text-slate-500 shadow-2xs'
                  }`}
                >
                  {/* Left: Avatar with Profile Click & Online/Unread Dot */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="relative shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenProfile) onOpenProfile(member);
                      }}
                      title="คลิกเพื่อดูโปรไฟล์เพื่อนสมาชิก"
                    >
                      <img 
                        src={member.avatar || conv.partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                        alt={conv.partnerName}
                        className={`w-12 h-12 rounded-xl object-cover border-2 shadow-xs transition transform hover:scale-105 ${
                          isUnread ? 'border-cyan-500' : 'border-slate-300'
                        }`}
                      />
                      {/* Unread Blinking Dot (กระพริบสีฟ้า) */}
                      {isUnread ? (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-600 border-2 border-white"></span>
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>

                    {/* Middle: Callsign, Name, Snippet */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Click name to view profile */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenProfile) onOpenProfile(member);
                            }}
                            className={`font-mono font-bold text-sm tracking-wider hover:underline text-left truncate flex items-center gap-1 ${
                              isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                            }`}
                            title="คลิกเพื่อดูโปรไฟล์เพื่อนสมาชิก"
                          >
                            <span>{conv.partnerCallsign}</span>
                            {member.nickname && (
                              <span className="text-xs font-sans text-cyan-700 font-semibold">
                                ({member.nickname})
                              </span>
                            )}
                          </button>

                          {member.deNetworkCode && (
                            <span className="hidden sm:inline-block text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 shrink-0">
                              {member.deNetworkCode}
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{conv.lastMessage.timestamp}</span>
                          </span>
                        )}
                      </div>

                      {/* Full Name & Standby hint */}
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {conv.partnerName} {member.district ? `• อ.${member.district}` : ''}
                      </p>

                      {/* Message Snippet (ข้อความย่อๆ 1 บรรทัด) */}
                      <div className="mt-1 flex items-center gap-1.5">
                        {isUnread ? (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 animate-ping"></span>
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <p className={`text-xs truncate ${
                          isUnread ? 'text-cyan-950 font-semibold' : 'text-slate-400 font-normal'
                        }`}>
                          {conv.lastMessage ? conv.lastMessage.text : 'ข้อความสนทนา'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Unread Counter Badge & Action Button */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                    {/* Unread Badge (ตัวเลขจำนวนข้อความที่ยังไม่อ่าน สีฟ้ากระพริบ) */}
                    {isUnread ? (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-white font-mono font-bold text-[10px] shadow-sm animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        <span>{conv.unreadCount} ใหม่</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-slate-400" />
                        <span>อ่านแล้ว</span>
                      </span>
                    )}

                    {/* Open/Reply Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConversation(conv);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                        isUnread
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title="เปิดห้องแชตดูประวัติทั้งหมดและตอบกลับ"
                    >
                      <Reply className="w-3 h-3" />
                      <span>{isUnread ? 'เปิดอ่าน' : 'ตอบกลับ'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Close */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px] font-mono">
            💡 คลิกที่ชื่อหรือรูปเพื่อดูโปรไฟล์เพื่อนสมาชิก • คลิกรายการเพื่อดูประวัติแชตทั้งหมด
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer shrink-0"
          >
            ปิดหน้าต่าง
          </button>
        </div>

        {/* Developer Credit Signature Line */}
        <DeveloperCredit variant="light" />
      </div>
    </div>
  );
}
