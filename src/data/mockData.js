export const defaultSectionThemes = {
  hero: {
    id: "hero",
    name: "หน้าแรก (Hero Banner & เข้าสู่ระบบ)",
    bgUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
    opacity: 85, // 85% opacity so the picture is vibrant and clear
    overlayType: "ocean-wave",
  },
  news: {
    id: "news",
    name: "ข่าวสารและประกาศ (News)",
    bgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
    opacity: 35,
    overlayType: "ocean-light",
  },
  repeaters: {
    id: "repeaters",
    name: "สถานีทวนสัญญาณ & ความถี่",
    bgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80",
    opacity: 40,
    overlayType: "ocean-deep",
  },
  services: {
    id: "services",
    name: "งานทะเบียนและบริการสมาชิก",
    bgUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80",
    opacity: 35,
    overlayType: "ocean-light",
  },
  contact: {
    id: "contact",
    name: "ติดต่อสมาคม & ท้ายเว็บ (Footer)",
    bgUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80",
    opacity: 55,
    overlayType: "ocean-footer",
  },
  directory: {
    id: "directory",
    name: "ทำเนียบ & ค้นหาเพื่อนสมาชิก (Member Directory)",
    bgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
    opacity: 30,
    overlayType: "ocean-light",
  },
  admin: {
    id: "admin",
    name: "แผงควบคุมแอดมิน (Admin Portal)",
    bgUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
    opacity: 20,
    overlayType: "ocean-admin",
  }
};

export const overlayThemes = [
  { 
    id: 'ocean-wave', 
    name: 'ประกายคลื่นสมิหลา (Samila Wave Cyan)', 
    description: 'สีฟ้าน้ำทะเลตัดน้ำเงินเข้ม ประกายคลื่นสีฟ้าครามสดชื่น',
    gradient: 'from-[#012038]/75 via-[#013a63]/50 to-[#012644]/75', 
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    accentColor: '#00b4d8'
  },
  { 
    id: 'ocean-deep', 
    name: 'ฟ้าน้ำทะเลลึก (Deep Ocean Blue)', 
    description: 'สีน้ำเงินเข้มลึกดั่งห้วงสมุทร ลวดลายเส้นตัดเงียบสงบ มั่นคง',
    gradient: 'from-[#011f38]/80 via-[#013b63]/55 to-[#012644]/80', 
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    accentColor: '#0284c7'
  },
  { 
    id: 'cyan-breeze', 
    name: 'สายลมสีฟ้าคราม (Cyan Breeze)', 
    description: 'สีฟ้าเทอร์ควอยซ์สว่าง สะท้อนเกลียวคลื่นและแสงแดดชายหาด',
    gradient: 'from-[#013554]/70 via-[#0077b6]/45 to-[#014066]/70', 
    badgeColor: 'bg-cyan-400/20 text-cyan-200 border-cyan-300/40',
    accentColor: '#38bdf8'
  },
  { 
    id: 'emerald-sea', 
    name: 'มรกตผิวน้ำทะเล (Emerald Sea Aqua)', 
    description: 'สีฟ้าน้ำทะเลเจือเขียวมรกต เหมือนน้ำทะเลฝั่งอันดามันและอ่าวไทย',
    gradient: 'from-[#012d38]/75 via-[#025b68]/50 to-[#013440]/75', 
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    accentColor: '#14b8a6'
  },
  { 
    id: 'midnight-marine', 
    name: 'น้ำเงินทะเลรัตติกาล (Midnight Marine)', 
    description: 'สีกรมท่าน้ำเงินลึก ตัดกับเส้นไฟสัญญาณวิทยุและประภาคาร',
    gradient: 'from-[#011424]/85 via-[#01233d]/60 to-[#01182b]/85', 
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    accentColor: '#6366f1'
  },
  { 
    id: 'ocean-light', 
    name: 'ฟ้าน้ำทะเลใสสว่าง (Crystal Light)', 
    description: 'โทนสว่างสำหรับเนื้อหาข่าวและบริการ โปร่งสบายตา อ่านง่าย',
    gradient: 'from-sky-50/85 via-cyan-50/75 to-sky-100/85', 
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    accentColor: '#0284c7'
  },
  { 
    id: 'ocean-footer', 
    name: 'ฟ้าน้ำเงินคลื่นยามค่ำ (Ocean Footer)', 
    description: 'สำหรับส่วนท้ายและข้อมูลติดต่อ มืดสุภาพและภูมิฐาน',
    gradient: 'from-[#012a4a]/85 via-[#011f38]/85 to-[#011424]/90', 
    badgeColor: 'bg-cyan-900/40 text-cyan-200 border-cyan-700/50',
    accentColor: '#00b4d8'
  },
];

export const defaultSettings = {
  associationNameTh: "สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา",
  associationNameEn: "Samila Amateur Radio Association of Songkhla Province",
  tagline: "มิตรภาพไร้พรมแดน สื่อสารเพื่อสาธารณประโยชน์ ข่ายสำรองฉุกเฉินยามภัยพิบัติ",
  officialCallsign: "HS9AS",
  logoUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=150&q=80",
  // High quality Unsplash photo of Songkhla coastal sea / transmission radio atmosphere
  heroBgUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
  overlayColor: "ocean-wave", // 'ocean-wave', 'ocean-deep', 'cyan-breeze', 'emerald-sea', 'midnight-marine'
  contactPhone: "093-792-5665, 074-xxx-xxx",
  contactEmail: "samila.radio.songkhla@gmail.com",
  address: "เลขที่ 5 ซอย 5 ถ.รามวิถี ต.บ่อยาง อ.เมืองสงขลา จ.สงขลา 90000",
  radioFrequencyCalling: "145.000 MHz",
  radioFrequencyRepeater: "145.6750 MHz (Dup -600 kHz / Tone 123.0 Hz)",
  radioFrequencyEmergency: "144.9000 MHz (ศูนย์ประสานงานสมิหลา)",
  // Bank Account Information for Membership Payment
  bankName: "ธนาคารกรุงไทย",
  bankAccountName: "สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา",
  bankAccountNumber: "9013394310",
  // Association President / Signee Information for Certificates
  presidentName: "นายธานี รายศิริ",
  presidentCallsign: "HS9...",
  presidentTitle: "นายกสมาคม / ผู้มีอำนาจลงนามแทน",
  // Section Themes Configurable by Admin
  sectionThemes: defaultSectionThemes,
};

export const sampleBackgrounds = [
  {
    id: "sea-samila",
    title: "หาดสมิหลา สงขลา (วิวทะเลและเกาะหนูเกาะแมว)",
    category: "ชายหาดสมิหลา",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "sea-waves-shore",
    title: "คลื่นน้ำทะเลสีฟ้าครามซัดชายหาดสมิหลา",
    category: "คลื่นทะเล",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "deep-ocean-surface",
    title: "ผิวน้ำทะเลลึกสีน้ำเงินประกายคลื่น (Deep Ocean)",
    category: "ผิวน้ำทะเล",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "emerald-sea-water",
    title: "ผิวน้ำทะเลสีมรกตใส แสงแดดระยิบระยับ",
    category: "ผิวน้ำทะเล",
    url: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "antenna-tower",
    title: "เสาสื่อสารและสายอากาศวิทยุสื่อสาร ชายฝั่งยามเย็น",
    category: "เสาวิทยุสื่อสาร",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "technology-grid",
    title: "คลื่นวิทยุและเครือข่ายดิจิทัลสีฟ้าน้ำทะเล",
    category: "ดิจิทัลเรดิโอ",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "mountain-station",
    title: "ยอดเขาคอหงส์/สถานีทวนสัญญาณสงขลา วิวอ่าวไทย",
    category: "สถานีเขาคอหงส์",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "blue-ocean-aerial",
    title: "มุมมองผืนน้ำทะเลสีฟ้าครามเวิ้งว้าง",
    category: "ผืนน้ำทะเล",
    url: "https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=2000&q=80",
  },
];

export const mockNews = [
  {
    id: "news-1",
    isPinned: true,
    category: "ประกาศสำคัญ",
    title: "ประกาศเปิดรับสมัครและต่ออายุสมาชิกสมาคมวิทยุสมัครเล่นสมิหลา ประจำปี 2568",
    excerpt: "ขอเชิญชวนเพื่อนนักวิทยุสมัครเล่นในจังหวัดสงขลาและพื้นที่ใกล้เคียง ร่วมสมัครสมาชิกสามัญและสมาชิกตลอดชีพ เพื่อสนับสนุนกิจการวิทยุสมัครเล่นและการสื่อสารเพื่อสังคม...",
    date: "18 พ.ย. 2568",
    author: "นายทะเบียนสมาคมฯ",
    readTime: "3 นาที",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    content: `สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา ขอประกาศเปิดรับสมัครสมาชิกใหม่และต่ออายุบัตรสมาชิกประจำปี 2568 เพื่อร่วมเป็นส่วนหนึ่งของเครือข่ายนักวิทยุสมัครเล่นที่เข้มแข็งในภาคใต้ตอนล่าง

สิทธิประโยชน์ของสมาชิก:
1. ได้รับบัตรประจำตัวสมาชิกสมาคมฯ พร้อมเลขทะเบียนสมาชิก และหนังสือรับรองสถานะการเป็นสมาชิก
2. สิทธิเข้าร่วมโครงข่ายสื่อสารฉุกเฉินและการซ้อมแผนภัยพิบัติ
3. บริการประสานงานยื่นคำขอใบอนุญาต กสทช. ต่างๆ โดยศูนย์บริการสมาคมฯ
4. สิทธิเข้าร่วมการอบรมเชิงปฏิบัติการทางเทคนิคสายอากาศและระบบวิทยุดิจิทัลฟรี

เอกสารที่ต้องใช้:
- สำเนาบัตรประจำตัวประชาชน
- สำเนาทะเบียนบ้าน
- รูปถ่ายหน้าตรงขนาด 1 นิ้ว จำนวน 1 รูป
- สำเนาบัตรพนักงานวิทยุสมัครเล่น หรือใบประกาศนียบัตร (ถ้ามี)
ผู้สนใจสามารถลงทะเบียนออนไลน์ผ่านระบบหน้าเว็บไซต์ หรือติดต่อ ณ ที่ทำการสมาคมฯ`
  },
  {
    id: "news-2",
    isPinned: false,
    category: "ข่ายฉุกเฉิน",
    title: "สมาคมฯ เตรียมความพร้อมข่ายสื่อสารสำรอง รับมือสถานการณ์อุทกภัยฤดูมรสุมภาคใต้",
    excerpt: "จัดตั้งศูนย์บัญชาการสื่อสารสำรอง ณ แหลมสมิหลา พร้อมทดสอบรีพีทเตอร์เขาคอหงส์และระบบวิทยุเคลื่อนที่เร็ว สแตนด์บายความถี่ 144.900 MHz ตลอด 24 ชม.",
    date: "15 พ.ย. 2568",
    author: "ฝ่ายกู้ภัยและสื่อสารฉุกเฉิน",
    readTime: "4 นาที",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    content: `ตามที่กรมอุตุนิยมวิทยาได้แจ้งเตือนมรสุมตะวันออกเฉียงเหนือพัดผ่านอ่าวไทยและภาคใต้ตอนล่าง สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา จึงได้เปิดศูนย์ปฏิบัติการข่ายสื่อสารสำรองยามฉุกเฉินขึ้นเพื่อประสานงานกับ ปภ.จังหวัดสงขลา และหน่วยงานกู้ชีพกู้ภัยในพื้นที่

ความถี่หลักที่ใช้ในการสแตนด์บาย:
- ความถี่ข่ายฉุกเฉินสมิหลา: 144.900 MHz (Simplex)
- สถานีทวนสัญญาณ HS9AS: 145.6750 MHz (Dup -600 kHz)
- ระบบวิทยุข่ายดิจิทัล DMR / EchoLink: ห้อง THAILAND

ขอความร่วมมือนักวิทยุสมัครเล่นทุกสถานีงดเว้นการทดลองออกอากาศสัญญาณรบกวนในความถี่ดังกล่าว`
  },
  {
    id: "news-3",
    isPinned: false,
    category: "อบรมและสอบ",
    title: "กสทช. ร่วมกับสมาคมฯ กำหนดจัดการอบรมและสอบเพื่อรับประกาศนียบัตรพนักงานวิทยุสมัครเล่นขั้นต้น จ.สงขลา",
    excerpt: "เปิดรับสมัครจำนวนจำกัด 300 ที่นั่ง สำหรับบุคคลทั่วไปที่สนใจเข้าสู่วงการวิทยุสมัครเล่น พร้อมอบรมกฎหมาย ระเบียบ และมารยาทการใช้วิทยุสื่อสารอย่างถูกต้อง",
    date: "10 พ.ย. 2568",
    author: "ฝ่ายวิชาการและอบรม",
    readTime: "2 นาที",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    content: `โอกาสดีสำหรับผู้ที่สนใจการติดต่อสื่อสารทางวิทยุ สมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา ได้รับมอบหมายจากสำนักงาน กสทช. จัดการอบรมและสอบเพื่อรับประกาศนียบัตรพนักงานวิทยุสมัครเล่นขั้นต้นประจำปี 2568 ณ หอประชุมเทศบาลนครสงขลา

กำหนดการ:
- เปิดรับสมัคร: ตั้งแต่วันนี้ - 15 ธันวาคม 2568
- วันอบรมและสอบ: วันเสาร์ที่ 10 มกราคม 2569
- ค่าสมัครสอบและอบรม: เป็นไปตามระเบียบ กสทช.

ผู้สอบผ่านจะได้รับประกาศนียบัตรเพื่อขอรับสัญญาณเรียกขาน (Callsign) สากลถูกต้องตามกฎหมาย`
  },
  {
    id: "news-4",
    isPinned: false,
    category: "กิจกรรมสมาคม",
    title: "สรุปภาพบรรยากาศ สมาคมฯ ร่วมสนับสนุนข่ายสื่อสารขบวนแห่ผ้าขึ้นธาตุและงานลากพระสงขลา",
    excerpt: "สมาชิกจิตอาสาประจำจุดประสานงานตลอดเส้นทาง เพื่อดูแลความปลอดภัยและการจราจรร่วมกับเจ้าหน้าที่ตำรวจและเทศบาลนครสงขลา สำเร็จลุล่วงด้วยดี",
    date: "5 พ.ย. 2568",
    author: "ฝ่ายประชาสัมพันธ์",
    readTime: "3 นาที",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    content: `เมื่อวันที่ 2-4 พฤศจิกายน ที่ผ่านมา คณะกรรมการและสมาชิกสมาคมวิทยุสมัครเล่นสมิหลาจังหวัดสงขลา กว่า 40 สถานี ได้ร่วมสนับสนุนการประสานงานวิทยุสื่อสารในงานประเพณีลากพระและตักบาตรเทโวประจำปีของจังหวัดสงขลา

การปฏิบัติการครั้งนี้ช่วยให้การประสานงานรถพยาบาล การจัดขบวนเรือพระ และการรายงานสภาพการจราจรเป็นไปด้วยความรวดเร็ว สมาคมฯ ขอขอบคุณสมาชิกทุกท่านที่สละเวลาและอุปกรณ์วิทยุด้วยจิตสาธารณะ`
  }
];

export const repeaterList = [
  {
    name: "สถานีทวนสัญญาณสงขลา (HS9AS)",
    location: "ยอดเขาคอหงส์ อ.หาดใหญ่ จ.สงขลา",
    tx: "145.6750 MHz",
    shift: "Dup -0.600 MHz (Rx 145.0750 MHz)",
    tone: "Tone 123.0 Hz",
    status: "ปกติ (Active 24/7)",
    coverage: "ครอบคลุมพื้นที่ อ.เมืองสงขลา, หาดใหญ่, จะนะ, นาทวี, สิงหนคร, สทิงพระ และพื้นที่อ่าวไทยตอนล่าง"
  },
  {
    name: "ข่ายสื่อสารฉุกเฉินและสาธารณภัยสมิหลา",
    location: "ศูนย์ประสานงานสมาคมฯ แหลมสมิหลา",
    tx: "144.9000 MHz",
    shift: "Simplex (ส่งตรง)",
    tone: "CSQ (ไม่มีโทน)",
    status: "สแตนด์บายพร้อมข่ายกู้ภัย",
    coverage: "ความถี่ประสานงานหลักกรณีเกิดภัยพิบัติ อุทกภัย หรือวาตภัยในเขตจังหวัดสงขลา"
  },
  {
    name: "ความถี่เรียกขานและแจ้งเหตุสากล",
    location: "ช่องประสานงานกลางประเทศไทย",
    tx: "145.0000 MHz",
    shift: "Simplex",
    tone: "CSQ",
    status: "ช่องสแตนด์บายกลาง",
    coverage: "สำหรับเรียกขานเริ่มต้นก่อนเปลี่ยนไปใช้ช่องทำงาน หรือแจ้งเหตุด่วนเหตุร้าย"
  }
];

// Initial Members List with complete attributes matching user specifications & certificate
export const initialMembersList = [
  {
    id: "mem-01",
    callsign: "E26ECG",
    username: "e26ecg",
    fullName: "ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)",
    nickname: "ผอ.โต๊ด",
    district: "หาดใหญ่",
    nameEnglish: "Acting Sub-Lt. Theepchalit Thongjun",
    citizenId: "1969900105532",
    last4Id: "5532",
    phone: "093-792-5665",
    email: "theepchalit@email.com",
    birthDate: "16/09/2530",
    memberId: "369113",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "16-11-2569",
    endDate: "15-11-2574",
    registeredAddress: "66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110",
    currentAddress: "66 ถนนเลียบคลองชลประทาน ต.ควนลัง อ.หาดใหญ่ จ.สงขลา 90110",
    postalCode: "90110",
    deNetworkCode: "DE 246",
    deImei: "867543029182745",
    deDeviceModel: "Spender Network Radio TC-751G",
    dePurchaseShop: "ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ (ตัวแทนจำหน่าย Spender)",
    deSerialNumber: "SN-8823901",
    deApprovedDate: "16 พ.ย. 2569 เวลา 10:30 น.",
    deApprovedBy: "HS9ADM นายเกียรติศักดิ์ สมิหลาเวหา (แอดมินสมาคมฯ)",
    deAnswers: [
      { id: 'deviceModel', label: 'ยี่ห้อและรุ่นเครื่องวิทยุ', value: 'Spender Network Radio TC-751G' },
      { id: 'purchaseShop', label: 'ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง - ซื้อจากร้าน / ตัวแทนใด', value: 'ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ (ตัวแทนจำหน่าย Spender)' },
      { id: 'serialNumber', label: 'หมายเลขประจำเครื่อง (Serial Number / S/N)', value: 'SN-8823901' },
      { id: 'intendedUse', label: 'วัตถุประสงค์การใช้งานในโครงข่าย', value: 'ข่ายฉุกเฉินและสาธารณภัยสมาคมฯ' }
    ],
    radioStandby: "145.6750 MHz",
    // 3 Types of Radios Monitored
    blackRadios: [
      { id: 'br-1', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true },
      { id: 'br-2', name: 'ความถี่เรียกขานกลางสมาคมฯ', freq: '145.0000 MHz', isRepeater: false }
    ],
    pocRadios: [
      { id: 'poc-1', name: 'ห้องสมาคมวิทยุสมัครเล่นสมิหลา', talkgroup: 'TG-901', approvedByAssoc: true },
      { id: 'poc-2', name: 'ข่ายฉุกเฉินและสาธารณภัยภาค 9', talkgroup: 'TG-191', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-1', name: 'ช่อง 01 ข่ายเรียกขานทั่วไป', freq: '245.0000 MHz (CH 01)' },
      { id: 'rr-2', name: 'ช่อง 25 ข่ายประสานงานกู้ภัย', freq: '245.3000 MHz (CH 25)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "admin",
    isSuperAdmin: true,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    registeredDate: "16 พ.ย. 2569",
    expiryAlert: "ปกติ" // 'ปกติ', 'expiring-6m', 'expiring-1m', 'expired'
  },
  {
    id: "mem-02",
    callsign: "HS9ADM",
    username: "hs9adm",
    fullName: "นายเกียรติศักดิ์ สมิหลาเวหา",
    nickname: "แอดมินเกียรติ",
    district: "เมืองสงขลา",
    nameEnglish: "Kiattisak Samilaweha",
    citizenId: "1909900123451",
    last4Id: "9999",
    phone: "089-888-9999",
    email: "hs9adm@samila.radio",
    birthDate: "10/05/2528",
    memberId: "369101",
    memberType: "สมาชิกตลอดชีพ",
    startDate: "01-01-2558",
    endDate: "ตลอดชีพ",
    registeredAddress: "เลขที่ 99/9 ถ.ชลาทัศน์ ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    currentAddress: "เลขที่ 99/9 ถ.ชลาทัศน์ ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    deNetworkCode: "DE 101",
    deImei: "867543029100101",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-3', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [
      { id: 'poc-3', name: 'ห้องศูนย์ควบคุมข่ายกลาง', talkgroup: 'TG-100', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-3', name: 'ช่อง 01 เรียกขาน', freq: '245.0000 MHz (CH 01)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "admin",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    registeredDate: "1 ม.ค. 2558",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-03",
    callsign: "HS9XYZ",
    username: "hs9xyz",
    fullName: "นายวิเชียร สมิหลาภิวัฒน์",
    nickname: "พี่เชียร",
    district: "เมืองสงขลา",
    nameEnglish: "Wichian Samilapiwat",
    citizenId: "1900200789234",
    last4Id: "5678",
    phone: "084-555-7890",
    email: "wichian@songkhla.org",
    birthDate: "05/08/2520",
    memberId: "369110",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "05-08-2564",
    endDate: "05-08-2569",
    registeredAddress: "เลขที่ 12/4 ต.เขารูปช้าง อ.เมือง จ.สงขลา 90000",
    currentAddress: "เลขที่ 12/4 ต.เขารูปช้าง อ.เมือง จ.สงขลา 90000",
    deNetworkCode: "DE 150",
    deImei: "867543029199150",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-4', name: 'ช่องสแตนด์บายส่วนตัว', freq: '144.5000 MHz', isRepeater: false }
    ],
    pocRadios: [],
    redRadios: [
      { id: 'rr-4', name: 'ช่อง 15 กู้ภัยสงขลา', freq: '245.1750 MHz (CH 15)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    registeredDate: "5 ส.ค. 2564",
    expiryAlert: "expiring-6m" // หมดอายุภายใน 6 เดือน
  },
  {
    id: "mem-04",
    callsign: "E24ABC",
    username: "e24abc",
    fullName: "นางสาวศิริพร หาดใหญ่",
    nickname: "ครูศิริ",
    district: "หาดใหญ่",
    nameEnglish: "Siriporn Hatyai",
    citizenId: "3900500112345",
    last4Id: "3344",
    phone: "086-123-4567",
    email: "siriporn.hdy@yahoo.com",
    birthDate: "20/12/2535",
    memberId: "369112",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "20-12-2563",
    endDate: "20-12-2568",
    registeredAddress: "เลขที่ 45 ถ.นิพัทธ์อุทิศ 1 ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
    currentAddress: "เลขที่ 45 ถ.นิพัทธ์อุทิศ 1 ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
    postalCode: "90110",
    deNetworkCode: null, // ยังไม่มีรหัส DE
    deImei: null,
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-5', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [],
    redRadios: [],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    registeredDate: "20 ธ.ค. 2563",
    expiryAlert: "expiring-1m" // หมดอายุภายใน 1 เดือน
  },
  {
    id: "mem-05",
    callsign: "E29SAM",
    username: "0873456789",
    fullName: "นายกิตติศักดิ์ เกาะหนูเกาะแมว",
    nameEnglish: "Mr. Kittisak Kohnoo",
    citizenId: "1900400998876",
    last4Id: "7788",
    phone: "087-345-6789",
    email: "kittisak.samila@gmail.com",
    lineId: "kittisak.sml",
    birthDate: "12/04/2538",
    age: "31",
    gender: "ชาย",
    maritalStatus: "โสด",
    formerCallsign: "-",
    postalCode: "90000",
    memberId: "369115",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "19-11-2569",
    endDate: "18-11-2574",
    registeredAddress: "เลขที่ 88 ถ.ไทรบุรี ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    currentAddress: "เลขที่ 88 ถ.ไทรบุรี ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    nickname: "กิตติ",
    district: "เมืองสงขลา",
    deNetworkCode: "DE 288",
    deImei: "867543029100288",
    radioStandby: "145.0000 MHz",
    blackRadios: [
      { id: 'br-55', name: 'ความถี่เรียกขานกลางสมาคมฯ', freq: '145.0000 MHz', isRepeater: false }
    ],
    pocRadios: [],
    redRadios: [
      { id: 'rr-55', name: 'ช่อง 01 ข่ายเรียกขานทั่วไป', freq: '245.0000 MHz (CH 01)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    registeredDate: "19 พ.ย. 2569",
    appliedDate: "19/11/2569",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-06",
    callsign: "HS9OBA",
    username: "hs9oba",
    fullName: "พ.ต.ท.อนุรักษ์ สมิหลาพิทักษ์",
    nickname: "สารวัตรนุ",
    district: "สิงหนคร",
    nameEnglish: "Pol.Lt.Col. Anurak Samilapitak",
    citizenId: "1900300456123",
    last4Id: "6123",
    phone: "081-999-1234",
    email: "anurak.hs9@police.go.th",
    birthDate: "10/02/2525",
    memberId: "369116",
    memberType: "สมาชิกตลอดชีพ",
    startDate: "10-02-2559",
    endDate: "ตลอดชีพ",
    registeredAddress: "เลขที่ 119 ต.สทิงหม้อ อ.สิงหนคร จ.สงขลา 90280",
    currentAddress: "เลขที่ 119 ต.สทิงหม้อ อ.สิงหนคร จ.สงขลา 90280",
    deNetworkCode: "DE 312",
    deImei: "867543029100312",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-6', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [
      { id: 'poc-4', name: 'ข่ายประสานงาน บก.ภ.จว.สงขลา', talkgroup: 'TG-191', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-6', name: 'ช่อง 25 กู้ชีพสิงหนคร', freq: '245.3000 MHz (CH 25)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    registeredDate: "10 ก.พ. 2559",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-07",
    callsign: "E24QWE",
    username: "e24qwe",
    fullName: "นางพิมพา สทิงพระการค้า",
    nickname: "เจ๊พิม",
    district: "สทิงพระ",
    nameEnglish: "Mrs. Pimpa Satingpra",
    citizenId: "3900600789012",
    last4Id: "9012",
    phone: "082-345-6780",
    email: "pimpa.trade@gmail.com",
    birthDate: "01/05/2533",
    memberId: "369117",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "01-05-2565",
    endDate: "01-05-2570",
    registeredAddress: "เลขที่ 55 ม.2 ต.จะทิ้งพระ อ.สทิงพระ จ.สงขลา 90190",
    currentAddress: "เลขที่ 55 ม.2 ต.จะทิ้งพระ อ.สทิงพระ จ.สงขลา 90190",
    deNetworkCode: null,
    deImei: null,
    radioStandby: "145.0000 MHz",
    blackRadios: [
      { id: 'br-7', name: 'ช่องเรียกขานกลางสมาคมฯ', freq: '145.0000 MHz', isRepeater: false }
    ],
    pocRadios: [],
    redRadios: [
      { id: 'rr-7', name: 'ช่อง 01 ข่ายเรียกขานทั่วไป', freq: '245.0000 MHz (CH 01)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    registeredDate: "1 พ.ค. 2565",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-08",
    callsign: "HS9SONG",
    username: "hs9song",
    fullName: "นายธนภัทร สงขลาสมุทร",
    nickname: "ช่างภัทร",
    district: "จะนะ",
    nameEnglish: "Mr. Thanapat Songkhlasamut",
    citizenId: "1900700543210",
    last4Id: "3210",
    phone: "085-789-0123",
    email: "thanapat.radio@engineer.com",
    birthDate: "15/08/2529",
    memberId: "369118",
    memberType: "สมาชิกสามัญ 5 ปี",
    startDate: "15-08-2566",
    endDate: "15-08-2571",
    registeredAddress: "เลขที่ 78 ต.บ้านนา อ.จะนะ จ.สงขลา 90130",
    currentAddress: "เลขที่ 78 ต.บ้านนา อ.จะนะ จ.สงขลา 90130",
    deNetworkCode: "DE 305",
    deImei: "867543029100305",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-8', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [
      { id: 'poc-5', name: 'ห้องข่ายสื่อสารภาคใต้ตอนล่าง', talkgroup: 'TG-981', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-8', name: 'ช่อง 68 ข่ายประสานงานภัยพิบัติ', freq: '245.8375 MHz (CH 68)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    registeredDate: "15 ส.ค. 2566",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-09",
    callsign: "HS9HON",
    username: "hs9hon",
    fullName: "พล.ต.ต.สมศักดิ์ สมิหลาเกียรติ",
    nickname: "ท่านสมศักดิ์",
    district: "เมืองสงขลา",
    nameEnglish: "Pol.Maj.Gen. Somsak Samilakiat",
    citizenId: "1909900011223",
    last4Id: "1223",
    phone: "081-111-2233",
    email: "somsak.hon@samila.radio",
    birthDate: "05/12/2515",
    memberId: "369119",
    memberType: "สมาชิกกิตติมศักดิ์",
    startDate: "01-01-2555",
    endDate: "กิตติมศักดิ์",
    registeredAddress: "เลขที่ 1 ถนนราชดำเนิน ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    currentAddress: "เลขที่ 1 ถนนราชดำเนิน ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    deNetworkCode: "DE 009",
    deImei: "867543029100009",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-9', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [
      { id: 'poc-6', name: 'ห้องผู้ทรงคุณวุฒิและที่ปรึกษา', talkgroup: 'TG-909', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-9', name: 'ช่อง 01 เรียกขาน', freq: '245.0000 MHz (CH 01)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    registeredDate: "1 ม.ค. 2555",
    expiryAlert: "ปกติ"
  },
  {
    id: "mem-10",
    callsign: "HS9ORG",
    username: "hs9org",
    fullName: "ศูนย์ประสานงานวิทยุสื่อสารกู้ภัยสมิหลา",
    nickname: "กู้ภัยสมิหลา",
    district: "เมืองสงขลา",
    nameEnglish: "Samila Rescue Radio Coordination Center",
    citizenId: "0993000149408",
    last4Id: "9408",
    phone: "074-311-999",
    email: "rescue.org@samila.radio",
    birthDate: "12/08/2560",
    memberId: "369120",
    memberType: "รูปแบบขององค์กรวิทยุสมัครเล่น",
    startDate: "12-08-2560",
    endDate: "ตลอดการดำเนินงาน",
    registeredAddress: "เลขที่ 55/1 ถนนชลาทัศน์ ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    currentAddress: "เลขที่ 55/1 ถนนชลาทัศน์ ต.บ่อยาง อ.เมือง จ.สงขลา 90000",
    deNetworkCode: "DE 999",
    deImei: "867543029100999",
    radioStandby: "145.6750 MHz",
    blackRadios: [
      { id: 'br-10', name: 'รีพีทเตอร์ เขาคอหงส์ HS9AS', freq: '145.6750 MHz', isRepeater: true }
    ],
    pocRadios: [
      { id: 'poc-7', name: 'ห้องประสานงานกู้ภัยฉุกเฉิน', talkgroup: 'TG-191', approvedByAssoc: true }
    ],
    redRadios: [
      { id: 'rr-10', name: 'ช่อง 25 กู้ภัยสงขลา', freq: '245.3000 MHz (CH 25)' }
    ],
    memberStatus: "ปกติ (Active)",
    role: "member",
    isSuperAdmin: false,
    status: "อนุมัติแล้ว",
    avatar: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=300&q=80",
    registeredDate: "12 ส.ค. 2560",
    expiryAlert: "ปกติ"
  }
];

export const demoAccounts = initialMembersList;

// Initial Direct Messages between Ham Radio Friends
export const initialDirectMessages = [
  {
    id: "msg-01",
    senderCallsign: "HS9ADM",
    senderName: "นายเกียรติศักดิ์ สมิหลาเวหา",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    recipientCallsign: "E26ECG",
    recipientName: "ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)",
    text: "สวัสดีครับ ผอ.โต๊ด 73 ช่วงเย็นนี้ประมาณ 19.30 น. จะมีการทดสอบสัญญาณข่ายรีพีทเตอร์เขาคอหงส์ 145.6750 MHz ฝากสแตนด์บายร่วมทดสอบด้วยนะครับ",
    timestamp: "21 พ.ย. 2569 เวลา 08:15 น.",
    isRead: false
  },
  {
    id: "msg-02",
    senderCallsign: "HS9XYZ",
    senderName: "นายวิเชียร สมิหลาภิวัฒน์",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    recipientCallsign: "E26ECG",
    recipientName: "ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)",
    text: "ผอ.โต๊ด ครับ เครื่อง Spender TC-751G เชื่อมต่อระบบเครือข่าย DE 246 เสียงคมชัดระดับ ว.16-5 มากครับ ขอบคุณคำแนะนำครับ 73",
    timestamp: "21 พ.ย. 2569 เวลา 07:45 น.",
    isRead: false
  }
];

// Default DE Form Questions Configurable by Admin
export const defaultDeQuestions = [
  {
    id: "deviceModel",
    label: "ยี่ห้อและรุ่นเครื่องวิทยุ",
    placeholder: "เช่น Spender Network Radio TC-751G, TC-1H",
    type: "text",
    required: true,
    active: true
  },
  {
    id: "purchaseShop",
    label: "ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง - ซื้อจากร้าน / ตัวแทนใด (ข้อมูลที่ทาง Spender ขอมา)",
    placeholder: "เช่น ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ, ศูนย์ Spender หาดใหญ่",
    type: "text",
    required: true,
    active: true
  },
  {
    id: "serialNumber",
    label: "หมายเลขประจำเครื่อง (Serial Number / S/N)",
    placeholder: "เช่น SN-8823901 (ดูหลังเครื่องหรือใบเสร็จ)",
    type: "text",
    required: false,
    active: true
  },
  {
    id: "intendedUse",
    label: "วัตถุประสงค์การใช้งานในโครงข่าย DE",
    placeholder: "เช่น ข่ายกู้ภัยฉุกเฉิน, ประสานงานสมาคมฯ, ช่วยเหลือประชาชน",
    type: "text",
    required: false,
    active: true
  }
];

// Mock list of initial DE Network Requests
export const initialDeRequests = [
  {
    id: "de-req-01",
    callsign: "E26ECG",
    fullName: "ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (ผอ.โต๊ด)",
    imei: "867543029182745",
    deviceModel: "Spender Network Radio TC-751G",
    purchaseShop: "ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ (ตัวแทน Spender)",
    serialNumber: "SN-8823901",
    phone: "093-792-5665",
    email: "theepchalit@email.com",
    qthProvince: "สงขลา",
    assignedDeCode: "DE 246",
    status: "อนุมัติแล้ว",
    approvedDate: "16 พ.ย. 2569 เวลา 10:30 น.",
    approvedBy: "HS9ADM นายเกียรติศักดิ์ สมิหลาเวหา (แอดมินสมาคมฯ)",
    requestedDate: "16 พ.ย. 2569 10:30 น.",
    questionSnapshots: [
      { id: "deviceModel", label: "ยี่ห้อและรุ่นเครื่องวิทยุ", value: "Spender Network Radio TC-751G" },
      { id: "purchaseShop", label: "ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง - ซื้อจากร้าน / ตัวแทนใด (ข้อมูลที่ทาง Spender ขอมา)", value: "ร้านสงขลาคอมมิวนิเคชั่น แอนด์ เรดิโอ (ตัวแทน Spender)" },
      { id: "serialNumber", label: "หมายเลขประจำเครื่อง (Serial Number / S/N)", value: "SN-8823901" },
      { id: "intendedUse", label: "วัตถุประสงค์การใช้งานในโครงข่าย DE", value: "ข่ายกู้ภัยและประสานงานสมาคมฯ" }
    ]
  },
  {
    id: "de-req-02",
    callsign: "HS9XYZ",
    fullName: "นายวิเชียร สมิหลาภิวัฒน์",
    imei: "867543029199150",
    deviceModel: "Spender TC-1H POC",
    purchaseShop: "ศูนย์ Spender สาขาหาดใหญ่",
    serialNumber: "SN-7721092",
    phone: "084-555-7890",
    email: "wichian@songkhla.org",
    qthProvince: "สงขลา",
    assignedDeCode: "DE 150",
    status: "อนุมัติแล้ว",
    approvedDate: "18 พ.ย. 2569 เวลา 14:15 น.",
    approvedBy: "E26ECG ว่าที่ ร.ต.ทีป์ชลิต ทองจันทร์ (แอดมินหลัก)",
    requestedDate: "18 พ.ย. 2569 14:15 น.",
    questionSnapshots: [
      { id: "deviceModel", label: "ยี่ห้อและรุ่นเครื่องวิทยุ", value: "Spender TC-1H POC" },
      { id: "purchaseShop", label: "ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง - ซื้อจากร้าน / ตัวแทนใด (ข้อมูลที่ทาง Spender ขอมา)", value: "ศูนย์ Spender สาขาหาดใหญ่" }
    ]
  },
  {
    id: "de-req-03",
    callsign: "E24ABC",
    fullName: "นางสาวศิริพร หาดใหญ่",
    imei: "867543029177341",
    deviceModel: "Spender Network Radio TC-751G",
    purchaseShop: "ร้านสมิหลา สื่อสารโทรคมนาคม อ.เมืองสงขลา",
    serialNumber: "SN-9912044",
    phone: "086-123-4567",
    email: "siriporn.hdy@yahoo.com",
    qthProvince: "สงขลา (อ.หาดใหญ่)",
    assignedDeCode: "",
    status: "รอตรวจสอบ",
    requestedDate: "19 พ.ย. 2569 09:20 น.",
    questionSnapshots: [
      { id: "deviceModel", label: "ยี่ห้อและรุ่นเครื่องวิทยุ", value: "Spender Network Radio TC-751G" },
      { id: "purchaseShop", label: "ข้อมูลแจ้งเปิดระบบใช้งานเครื่อง - ซื้อจากร้าน / ตัวแทนใด (ข้อมูลที่ทาง Spender ขอมา)", value: "ร้านสมิหลา สื่อสารโทรคมนาคม อ.เมืองสงขลา" },
      { id: "serialNumber", label: "หมายเลขประจำเครื่อง (Serial Number / S/N)", value: "SN-9912044" },
      { id: "intendedUse", label: "วัตถุประสงค์การใช้งานในโครงข่าย DE", value: "ประสานงานช่วยเหลือน้ำท่วมภาคใต้" }
    ]
  }
];
