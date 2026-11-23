import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import FrequencySection from './components/FrequencySection';
import QuickServicesSection from './components/QuickServicesSection';
import ContactSection from './components/ContactSection';
import DeveloperCredit from './components/DeveloperCredit';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CertificateModal from './components/CertificateModal';
import MemberReceiptModal from './components/MemberReceiptModal';
import DENetworkModal from './components/DENetworkModal';
import CallsignPromptModal from './components/CallsignPromptModal';
import ManageFrequenciesModal from './components/ManageFrequenciesModal';
import AdminCustomizerModal from './components/AdminCustomizerModal';
import AddNewsModal from './components/AddNewsModal';
import AdminDashboard from './components/AdminDashboard';
import MemberDirectorySection from './components/MemberDirectorySection';
import DirectChatModal from './components/DirectChatModal';
import MessageInboxModal from './components/MessageInboxModal';
import MemberProfileModal from './components/MemberProfileModal';
import { 
  defaultSettings, 
  defaultSectionThemes,
  mockNews, 
  initialMembersList, 
  initialDeRequests,
  defaultDeQuestions,
  initialDirectMessages
} from './data/mockData';
import { fetchCentralMembers, saveNewMemberToCentral, syncMembersToCentral } from './utils/memberSyncUtils';
import { fetchCentralLayoutSettings } from './utils/layoutSyncUtils';
import { CheckCircle, Sliders, Edit3, Clock, AlertTriangle } from 'lucide-react';

export default function App() {
  // Current view: 'landing' or 'admin' (Persisted across browser refresh)
  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_current_view');
      if (saved === 'admin' || saved === 'landing') return saved;
    } catch (e) {}
    return 'landing';
  });

  // Active Landing Tab: 'home' | 'directory' | 'news' | 'repeaters' | 'services' | 'contact' (Persisted across browser refresh)
  const [activeLandingTab, setActiveLandingTab] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_active_landing_tab');
      if (saved) return saved;
    } catch (e) {}
    return 'home';
  });

  // Load settings from localStorage or fallback to default
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_radio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          sectionThemes: {
            ...defaultSectionThemes,
            ...(parsed.sectionThemes || {}),
            // Ensure hero theme has correct bgUrl fallback and vibrant opacity
            hero: {
              ...defaultSectionThemes.hero,
              ...(parsed.sectionThemes?.hero || {}),
              bgUrl: (parsed.sectionThemes?.hero?.bgUrl && parsed.sectionThemes.hero.bgUrl.trim()) || parsed.heroBgUrl || defaultSectionThemes.hero.bgUrl,
              opacity: typeof parsed.sectionThemes?.hero?.opacity === 'number' ? Math.max(parsed.sectionThemes.hero.opacity, 75) : 85,
            }
          }
        };
      }
      return defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Current logged in user (null = Guest, or default to demo account for rich preview)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('samila_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (
          parsed.callsign === 'E26ECG' || 
          parsed.phone === '093-792-5665' || 
          parsed.citizenId === '1969900105532' || 
          parsed.id === 'mem-01'
        ) {
          const mem01 = initialMembersList.find(im => im.id === 'mem-01') || initialMembersList[0];
          return {
            ...mem01,
            ...parsed,
            callsign: 'E26ECG',
            fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
            nickname: 'ผอ.โต๊ด',
            phone: '093-792-5665',
            citizenId: '1969900105532',
            deNetworkCode: 'DE 246',
            role: 'admin',
            isSuperAdmin: true,
            status: 'อนุมัติแล้ว',
            memberStatus: 'ปกติ (Active)'
          };
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Members list with role assignment & persistence
  const [membersList, setMembersList] = useState(() => {
    try {
      const savedMembers = localStorage.getItem('samila_members_list');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        
        // 1. Correct any legacy item where mem-01 had HS9ADM instead of E26ECG
        let cleaned = parsed.map(saved => {
          if (
            saved.phone === '093-792-5665' || 
            saved.citizenId === '1969900105532' || 
            saved.deNetworkCode === 'DE 246' ||
            (saved.id === 'mem-01' && (saved.callsign === 'HS9ADM' || saved.callsign === 'E26ECG'))
          ) {
            const mem01 = initialMembersList.find(im => im.id === 'mem-01') || initialMembersList[0];
            return {
              ...mem01,
              ...saved,
              id: 'mem-01',
              callsign: 'E26ECG',
              fullName: 'ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)',
              nickname: 'ผอ.โต๊ด',
              phone: '093-792-5665',
              citizenId: '1969900105532',
              last4Id: '5532',
              memberId: '369113',
              memberType: 'สมาชิกสามัญ 5 ปี',
              deNetworkCode: 'DE 246',
              district: 'หาดใหญ่',
              birthDate: saved.birthDate || mem01.birthDate || '16/09/2530',
              startDate: saved.startDate || mem01.startDate || '16-11-2569',
              endDate: saved.endDate || mem01.endDate || '15-11-2574',
              registeredAddress: saved.registeredAddress || mem01.registeredAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110',
              currentAddress: saved.currentAddress || mem01.currentAddress || '66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110',
              postalCode: saved.postalCode || mem01.postalCode || '90110',
              role: 'admin',
              isSuperAdmin: true,
              status: 'อนุมัติแล้ว',
              memberStatus: 'ปกติ (Active)',
              avatar: mem01.avatar
            };
          }

          // For other members, match by callsign
          const initial = initialMembersList.find(im => im.callsign === saved.callsign);
          return initial ? { ...initial, ...saved } : saved;
        });

        // 2. Remove duplicate IDs or Callsigns if any exist
        const seenIds = new Set();
        const seenCallsigns = new Set();
        cleaned = cleaned.filter(m => {
          if (m.id && seenIds.has(m.id)) return false;
          if (m.callsign && m.callsign !== '-' && seenCallsigns.has(m.callsign)) return false;
          if (m.id) seenIds.add(m.id);
          if (m.callsign && m.callsign !== '-') seenCallsigns.add(m.callsign);
          return true;
        });

        // 3. Ensure all initial members (e.g. E26ECG, HS9ADM, HS9XYZ, etc.) are included
        initialMembersList.forEach(im => {
          if (!cleaned.some(m => m.id === im.id || (im.callsign !== '-' && m.callsign === im.callsign))) {
            cleaned.push(im);
          }
        });

        // 4. Ensure E26ECG (ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ ผอ.โต๊ด) is at the top
        cleaned.sort((a, b) => {
          if (a.callsign === 'E26ECG') return -1;
          if (b.callsign === 'E26ECG') return 1;
          return 0;
        });

        localStorage.setItem('samila_members_list', JSON.stringify(cleaned));
        return cleaned;
      }
      return initialMembersList;
    } catch {
      return initialMembersList;
    }
  });

  // DE Network Requests with persistence
  const [deRequests, setDeRequests] = useState(() => {
    try {
      const savedDe = localStorage.getItem('samila_de_requests');
      return savedDe ? JSON.parse(savedDe) : initialDeRequests;
    } catch {
      return initialDeRequests;
    }
  });

  // DE Form Questions Configurable by Admin (ชุดคำถามขอรหัส DE)
  const [deQuestions, setDeQuestions] = useState(() => {
    try {
      const savedQuestions = localStorage.getItem('samila_de_questions');
      return savedQuestions ? JSON.parse(savedQuestions) : defaultDeQuestions;
    } catch {
      return defaultDeQuestions;
    }
  });

  const handleUpdateDeQuestions = (updated) => {
    setDeQuestions(updated);
    try {
      localStorage.setItem('samila_de_questions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast('บันทึกชุดคำถามแบบฟอร์ม DE เรียบร้อยแล้ว');
  };

  // News list with localStorage persistence
  const [newsList, setNewsList] = useState(() => {
    try {
      const savedNews = localStorage.getItem('samila_news_list');
      return savedNews ? JSON.parse(savedNews) : mockNews;
    } catch {
      return mockNews;
    }
  });

  // Central Cloud Members Sync across PC, Mobile, and Tablet (Single Source of Truth with auto-poll & focus sync)
  useEffect(() => {
    let isMounted = true;

    const syncCloud = () => {
      fetchCentralLayoutSettings().catch(() => {});
      fetchCentralMembers().then(cloudMembers => {
        if (!isMounted || !Array.isArray(cloudMembers) || cloudMembers.length === 0) return;
        setMembersList(prev => {
          const map = new Map();
          cloudMembers.forEach(m => {
            const key = m.id || m.citizenId;
            map.set(key, m);
          });
          prev.forEach(m => {
            const key = m.id || m.citizenId;
            if (!map.has(key)) {
              map.set(key, m);
            }
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('samila_members_list', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }).catch(() => {});
    };

    syncCloud();
    const interval = setInterval(syncCloud, 25000);
    window.addEventListener('focus', syncCloud);

    return () => { 
      isMounted = false; 
      clearInterval(interval);
      window.removeEventListener('focus', syncCloud);
    };
  }, []);

  // Track read news IDs per logged-in member (เพื่อกระตุ้นเฉพาะสมาชิก)
  const [readNewsIds, setReadNewsIds] = useState(() => {
    try {
      const userKey = currentUser ? `samila_read_news_${currentUser.memberId || currentUser.callsign || 'user'}` : null;
      if (!userKey) return [];
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (currentUser) {
      try {
        const userKey = `samila_read_news_${currentUser.memberId || currentUser.callsign || 'user'}`;
        const saved = localStorage.getItem(userKey);
        setReadNewsIds(saved ? JSON.parse(saved) : []);
      } catch {
        setReadNewsIds([]);
      }
    } else {
      setReadNewsIds([]);
    }
  }, [currentUser?.memberId, currentUser?.callsign]);

  // Unread news count: แสดงจำนวนข่าวสารใหม่ที่ยังไม่เปิดดู เฉพาะสมาชิกเท่านั้น
  const unreadNewsCount = currentUser 
    ? newsList.filter(article => !readNewsIds.includes(article.id)).length 
    : 0;

  const handleMarkNewsAsRead = (articleId) => {
    if (!currentUser) return;
    setReadNewsIds(prev => {
      if (prev.includes(articleId)) return prev;
      const updated = [...prev, articleId];
      try {
        const userKey = `samila_read_news_${currentUser.memberId || currentUser.callsign || 'user'}`;
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleMarkAllNewsAsRead = () => {
    if (!currentUser) return;
    const allIds = newsList.map(n => n.id);
    setReadNewsIds(allIds);
    try {
      const userKey = `samila_read_news_${currentUser.memberId || currentUser.callsign || 'user'}`;
      localStorage.setItem(userKey, JSON.stringify(allIds));
    } catch (e) {
      console.error(e);
    }
    showToast('ทำเครื่องหมายอ่านข่าวสารทั้งหมดเรียบร้อยแล้ว');
  };

  // Direct Messages between members with localStorage persistence
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('samila_direct_messages');
      return saved ? JSON.parse(saved) : initialDirectMessages;
    } catch {
      return initialDirectMessages;
    }
  });

  const handleSendMessage = (newMsg) => {
    setMessages(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem('samila_direct_messages', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast(`ส่งข้อความหา ${newMsg.recipientCallsign} (${newMsg.recipientName}) เรียบร้อยแล้ว`);
  };

  // Modal Visibility States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptMember, setReceiptMember] = useState(null);
  const [isDeModalOpen, setIsDeModalOpen] = useState(false);
  const [isCallsignPromptOpen, setIsCallsignPromptOpen] = useState(false);
  const [isManageFreqOpen, setIsManageFreqOpen] = useState(false);
  const [isAdminCustomizerOpen, setIsAdminCustomizerOpen] = useState(false);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);

  // Profile Modal for viewing member details (เมื่อนึกไม่ออกว่าใคร)
  const [profileMember, setProfileMember] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenProfileModal = (member) => {
    // If only callsign was passed or shallow info, find full member
    const full = membersList.find(m => m.callsign === member.callsign || m.id === member.id) || member;
    setProfileMember(full);
    setIsProfileModalOpen(true);
  };

  // Persistence of active tab & view
  useEffect(() => {
    try {
      localStorage.setItem('samila_current_view', currentView);
    } catch (e) {}
  }, [currentView]);

  useEffect(() => {
    try {
      localStorage.setItem('samila_active_landing_tab', activeLandingTab);
    } catch (e) {}
  }, [activeLandingTab]);

  const [pendingCertAlert, setPendingCertAlert] = useState(false);
  const [pendingCertUser, setPendingCertUser] = useState(null);

  // Certificate gate: Only approved members or admin can view/download
  const handleOpenCertificate = (memberToView = currentUser) => {
    const mem = memberToView || currentUser;
    if (!mem) return;

    const isAdmin = currentUser?.role === 'admin' || currentUser?.isSuperAdmin;
    const isApproved = mem.status === 'อนุมัติแล้ว';

    if (!isAdmin && !isApproved) {
      setPendingCertUser(mem);
      setPendingCertAlert(true);
      return;
    }

    setReceiptMember(mem);
    setIsCertificateOpen(true);
  };

  const handleOpenReceiptModal = (member) => {
    const target = member ? (membersList.find(m => m.callsign === member.callsign || m.id === member.id) || member) : currentUser;
    setReceiptMember(target || currentUser || membersList[0]);
    setIsReceiptOpen(true);
  };

  // Mark all messages from a specific sender as read
  const handleMarkSenderAsRead = (senderCallsign) => {
    if (!currentUser || !senderCallsign) return;
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.recipientCallsign === currentUser.callsign && m.senderCallsign === senderCallsign) {
          return { ...m, isRead: true };
        }
        return m;
      });
      try {
        localStorage.setItem('samila_direct_messages', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Unread messages count for current logged-in user
  const unreadMessagesCount = messages.filter(
    m => currentUser && m.recipientCallsign === currentUser.callsign && !m.isRead
  ).length;

  const handleStartChatWithMember = (member) => {
    const full = membersList.find(m => m.callsign === member.callsign) || member;
    setChatRecipient(full);
    setIsChatModalOpen(true);
    handleMarkSenderAsRead(member.callsign);
  };

  // Status Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('samila_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    showToast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${user.callsign !== '-' ? user.callsign : ''} (${user.fullName})`);

    // If member has no callsign yet (pending กสทช.), show prompt to update callsign!
    if (!user.callsign || user.callsign === '-' || user.callsign === 'รอรับ Callsign') {
      setTimeout(() => {
        setIsCallsignPromptOpen(true);
      }, 700);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    try {
      localStorage.removeItem('samila_current_user');
    } catch (e) {
      console.error(e);
    }
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  // Save admin customizations
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('samila_radio_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
    showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว");
  };

  // Update members list
  const handleUpdateMembersList = (updated) => {
    setMembersList(updated);
    try {
      localStorage.setItem('samila_members_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    syncMembersToCentral(updated).catch(() => {});
  };

  // Update DE requests list
  const handleUpdateDeRequests = (updated) => {
    setDeRequests(updated);
    try {
      localStorage.setItem('samila_de_requests', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Submit new DE request from member
  const handleSubmitDeRequest = (newRequest) => {
    const updated = [newRequest, ...deRequests];
    handleUpdateDeRequests(updated);
    showToast("ยื่นคำขอรหัสเครือข่าย DE เรียบร้อยแล้ว แอดมินจะดำเนินการออกรหัสให้ท่าน");
  };

  // Save Callsign update for member
  const handleSaveCallsign = (newCallsign) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, callsign: newCallsign };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('samila_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }

    // Update in membersList
    const updatedList = membersList.map(m => {
      if (m.id === currentUser.id || m.citizenId === currentUser.citizenId) {
        return { ...m, callsign: newCallsign };
      }
      return m;
    });
    handleUpdateMembersList(updatedList);
    showToast(`อัปเดตนามเรียกขาน ${newCallsign} เรียบร้อยแล้ว`);
  };

  // Save Frequencies (3 Radios: เครื่องดำ, POC Radio, เครื่องแดง)
  const handleSaveFrequencies = (updatedData) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      blackRadios: updatedData.blackRadios,
      pocRadios: updatedData.pocRadios,
      redRadios: updatedData.redRadios,
      radioStandby: updatedData.blackRadios?.[0]?.freq || currentUser.radioStandby
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('samila_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }

    // Update in membersList
    const updatedList = membersList.map(m => {
      if (m.id === currentUser.id || m.citizenId === currentUser.citizenId) {
        return { ...m, ...updatedUser };
      }
      return m;
    });
    handleUpdateMembersList(updatedList);
    showToast("บันทึกข้อมูลช่องความถี่สแตนด์บาย 3 อุปกรณ์เรียบร้อยแล้ว");
  };

  // Register success handler
  const handleRegisterSuccess = (newMember) => {
    const updated = [newMember, ...membersList];
    handleUpdateMembersList(updated);
    saveNewMemberToCentral(newMember).catch(() => {});
    handleLoginSuccess(newMember);
  };

  // Update news list
  const handleUpdateNewsList = (updated) => {
    setNewsList(updated);
    try {
      localStorage.setItem('samila_news_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Add new announcement
  const handleAddNews = (newArticle) => {
    const updated = [newArticle, ...newsList];
    handleUpdateNewsList(updated);
    showToast(`เผยแพร่ประกาศ "${newArticle.title.substring(0, 25)}..." เรียบร้อยแล้ว`);
  };

  // Switch to admin view handler
  const handleOpenAdminView = () => {
    // If not logged in as admin, auto-login with admin for smooth workflow
    if (currentUser?.role !== 'admin') {
      const adminAcc = membersList.find(m => m.role === 'admin') || initialMembersList[0];
      handleLoginSuccess(adminAcc);
    }
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= RENDER ADMIN VIEW (สไตล์ Vercel Minimalist) =================
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        membersList={membersList}
        onUpdateMembersList={handleUpdateMembersList}
        newsList={newsList}
        onUpdateNewsList={handleUpdateNewsList}
        deRequests={deRequests}
        onUpdateDeRequests={handleUpdateDeRequests}
        deQuestions={deQuestions}
        onUpdateDeQuestions={handleUpdateDeQuestions}
        onBackToWebsite={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ================= RENDER PUBLIC / MEMBER LANDING PAGE =================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-700 selection:text-white">
      
      {/* 1. Official Header & Navigation (2-Tier Layout) */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onLogout={handleLogout}
        onOpenCustomizer={() => setIsAdminCustomizerOpen(true)}
        onNavigateToAdmin={handleOpenAdminView}
        onOpenCertificate={() => handleOpenCertificate(currentUser)}
        onOpenReceipt={() => handleOpenReceiptModal(currentUser)}
        onOpenDeModal={() => setIsDeModalOpen(true)}
        onOpenInbox={() => setIsInboxModalOpen(true)}
        unreadCount={unreadMessagesCount}
        unreadNewsCount={unreadNewsCount}
        activeTab={activeLandingTab}
        onSelectTab={setActiveLandingTab}
      />

      {/* 2. Main Page Content (แสดงทีละหน้าตามแถบนำทาง ไม่ซ้อนทุกหน้าให้อึดอัด เพื่อความสวยงาม) */}
      <main className="flex-grow">
        {/* หน้า 1: หน้าแรก (Hero Section) */}
        {activeLandingTab === 'home' && (
          <HeroSection
            settings={settings}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onNavigateToAdmin={handleOpenAdminView}
            onOpenCertificate={() => handleOpenCertificate(currentUser)}
            onOpenReceipt={() => handleOpenReceiptModal(currentUser)}
            onOpenDeModal={() => setIsDeModalOpen(true)}
            onOpenManageFrequencies={() => setIsManageFreqOpen(true)}
            onOpenCustomizer={() => setIsAdminCustomizerOpen(true)}
          />
        )}

        {/* หน้า 2: ค้นหาเพื่อนสมาชิก (Member Directory) - เฉพาะเมื่อเข้าสู่ระบบตามเงื่อนไขข้อ 2 */}
        {activeLandingTab === 'directory' && (
          currentUser ? (
            <MemberDirectorySection
              settings={settings}
              membersList={membersList}
              currentUser={currentUser}
              onChatWithMember={handleStartChatWithMember}
              onOpenDeModal={() => setIsDeModalOpen(true)}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenProfile={handleOpenProfileModal}
              onOpenReceipt={() => handleOpenReceiptModal(currentUser)}
              onSelectTab={setActiveLandingTab}
            />
          ) : (
            <div className="py-20 px-4 bg-slate-900 text-center min-h-[60vh] flex flex-col items-center justify-center">
              <div className="max-w-md bg-slate-800/95 border border-cyan-500/50 rounded-2xl p-8 shadow-2xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-900/60 border border-sky-400/50 flex items-center justify-center mx-auto text-sky-300">
                  <CheckCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">ระบบทำเนียบเพื่อนสมาชิก</h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  เพื่อรักษาความเป็นส่วนตัวและความปลอดภัยของข้อมูลสมาชิกสมาคมฯ กรุณาเข้าสู่ระบบก่อนเข้าดูทำเนียบเพื่อนสมาชิก
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
                  >
                    เข้าสู่ระบบสมาชิก
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(true)}
                    className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
                  >
                    สมัครสมาชิกใหม่
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* หน้า 3: ข่าวและประกาศ (News) */}
        {activeLandingTab === 'news' && (
          <NewsSection
            settings={settings}
            newsList={newsList}
            currentUser={currentUser}
            unreadNewsCount={unreadNewsCount}
            readNewsIds={readNewsIds}
            onReadArticle={handleMarkNewsAsRead}
            onMarkAllAsRead={handleMarkAllNewsAsRead}
            onAddNewNews={() => setIsAddNewsOpen(true)}
          />
        )}

        {/* หน้า 4: สถานีทวนสัญญาณ & ความถี่ (Radio Repeaters & Frequencies) */}
        {activeLandingTab === 'repeaters' && (
          <FrequencySection settings={settings} />
        )}

        {/* หน้า 5: บริการสมาชิก (Quick Member Services Grid) */}
        {activeLandingTab === 'services' && (
          <QuickServicesSection
            settings={settings}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onCheckMemberClick={() => {
              if (currentUser) {
                setActiveLandingTab('directory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsLoginOpen(true);
              }
            }}
          />
        )}

        {/* หน้า 6: ติดต่อสมาคม (Contact Section - มีข้อมูลติดต่อทั้งหมดและเครดิตผู้พัฒนาเฉพาะหน้านี้) */}
        {activeLandingTab === 'contact' && (
          <ContactSection
            settings={settings}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        )}
      </main>

      {/* Discreet Developer Credit Bar across every page (ขอแบบเนียนๆ ไม่ต้องโดดเด่นมาก) */}
      <DeveloperCredit variant="dark" />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        defaultSettings={settings}
        onOpenReceipt={handleOpenReceiptModal}
      />

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        member={currentUser || membersList[0]}
        settings={settings}
      />

      {/* Official Member Receipt Modal (e-Receipt & Scanned Receipt) */}
      <MemberReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        member={receiptMember || currentUser || membersList[0]}
        currentUser={currentUser}
      />

      {/* DE Network Modal */}
      <DENetworkModal
        isOpen={isDeModalOpen}
        onClose={() => setIsDeModalOpen(false)}
        currentUser={currentUser}
        onSubmitDeRequest={handleSubmitDeRequest}
        deQuestions={deQuestions}
        deRequests={deRequests}
      />

      {/* Callsign Prompt Modal for members awaiting Callsign */}
      <CallsignPromptModal
        isOpen={isCallsignPromptOpen}
        onClose={() => setIsCallsignPromptOpen(false)}
        member={currentUser}
        onSaveCallsign={handleSaveCallsign}
      />

      {/* Standby Frequencies Manager Modal (3 Radios: เครื่องดำ, POC, เครื่องแดง) */}
      <ManageFrequenciesModal
        isOpen={isManageFreqOpen}
        onClose={() => setIsManageFreqOpen(false)}
        currentUser={currentUser}
        onSaveFrequencies={handleSaveFrequencies}
      />

      <AdminCustomizerModal
        isOpen={isAdminCustomizerOpen}
        onClose={() => setIsAdminCustomizerOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <AddNewsModal
        isOpen={isAddNewsOpen}
        onClose={() => setIsAddNewsOpen(false)}
        onAddNews={handleAddNews}
      />

      {/* Direct Chat Modal */}
      <DirectChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setChatRecipient(null);
        }}
        currentUser={currentUser}
        recipient={chatRecipient}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenProfile={handleOpenProfileModal}
        onMarkAsRead={handleMarkSenderAsRead}
      />

      {/* Message Inbox Modal (สไตล์ LINE / Messenger) */}
      <MessageInboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        currentUser={currentUser}
        messages={messages}
        membersList={membersList}
        onReplyMember={(replyTarget) => handleStartChatWithMember(replyTarget)}
        onMarkAsRead={handleMarkSenderAsRead}
        onOpenProfile={handleOpenProfileModal}
      />

      {/* Member Profile Modal (สำหรับดูโปรไฟล์เพื่อนสมาชิกเมื่อนึกไม่ออกว่าใคร) */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setProfileMember(null);
        }}
        member={profileMember}
        currentUser={currentUser}
        onChatWithMember={(targetMember) => {
          setIsProfileModalOpen(false);
          handleStartChatWithMember(targetMember);
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenDeModal={() => setIsDeModalOpen(true)}
        onOpenReceipt={handleOpenReceiptModal}
        onOpenCertificate={(targetMem) => handleOpenCertificate(targetMem || currentUser)}
      />

      {/* Modal แจ้งเตือนสถานะรออนุมัติหนังสือรับรอง สำหรับสมาชิกใหม่หรือยังไม่ได้รับการอนุมัติ */}
      {pendingCertAlert && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPendingCertAlert(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                สถานะ: รอเจ้าหน้าที่สมาคมตรวจสอบและอนุมัติ ต่อไป
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2.5">
                รอเจ้าหน้าที่สมาคมตรวจสอบและอนุมัติ ต่อไป
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                ใบสมัครและเอกสารหลักฐานของท่านอยู่ระหว่างการตรวจสอบโดยนายทะเบียนสมาคมฯ 
                เมื่อเจ้าหน้าที่อนุมัติสถานะการเป็นสมาชิกเรียบร้อยแล้ว ท่านจึงจะสามารถดาวน์โหลดหนังสือรับรองสมาชิกฉบับสมบูรณ์ได้
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้สมัคร / สมาชิก:</span>
                <span className="font-bold text-slate-800">{pendingCertUser?.fullName || currentUser?.fullName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สถานะสมาชิก:</span>
                <span className="font-semibold text-amber-700">{pendingCertUser?.status || currentUser?.status || 'รอตรวจสอบ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">หมายเหตุ:</span>
                <span className="text-slate-600">สามารถดาวน์โหลดใบเสร็จรับเงิน (e-Receipt) ได้ทันที</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPendingCertAlert(false);
                  handleOpenReceiptModal(pendingCertUser || currentUser);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow"
              >
                ดูใบเสร็จรับเงิน
              </button>
              <button
                type="button"
                onClick={() => setPendingCertAlert(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-sky-500/50 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
