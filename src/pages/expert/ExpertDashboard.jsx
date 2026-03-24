import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Navigation, Clock, Loader2, User, CheckCircle, Wrench, Wallet, IndianRupee, LogOut, Volume2, Globe, Plus, X } from 'lucide-react';
import { buildCustomerLocationMapsUrl } from '../../utils/customerLocationMapsUrl.js';

// 🇮🇳 18 NATIONAL LANGUAGES DICTIONARY (PAN-INDIA SUPPORT)
const dict = {
  hi: { name: "हिंदी (Hindi)", langCode: 'hi-IN', wallet: "वॉलेट बैलेंस", withdraw: "पैसे निकालें", addMoney: "पैसे जोड़ें", online: "ऑनलाइन", offline: "ऑफ़लाइन", jobs: "असाइनमेंट्स", noJobs: "कोई काम नहीं है।", accept: "काम स्वीकार करें", navigate: "रास्ता देखें", start: "काम शुरू करें", complete: "काम पूरा हुआ 🏆", logout: "लॉग आउट", v_newJob: "नया काम आया है।", v_checkApp: "कृपया ऐप चेक करें।", v_accepted: "काम स्वीकार कर लिया गया है।", v_completed: "काम पूरा हो गया, पैसा वॉलेट में जुड़ गया है।", v_offline: "आप अब ऑफ़लाइन हैं।", v_online: "आप अब ऑनलाइन हैं।", v_withdraw: "रिक्वेस्ट भेज दी गई है।" },
  en: { name: "English", langCode: 'en-IN', wallet: "Wallet Balance", withdraw: "Withdraw", addMoney: "Add Money", online: "Online", offline: "Offline", jobs: "Assignments", noJobs: "No active jobs.", accept: "Accept Job", navigate: "Navigate", start: "Start Work", complete: "Mark Completed 🏆", logout: "Log Out", v_newJob: "New job arrived.", v_checkApp: "Please check the app.", v_accepted: "Job accepted.", v_completed: "Job completed, money added.", v_offline: "You are offline.", v_online: "You are online.", v_withdraw: "Request sent." },
  mr: { name: "मराठी (Marathi)", langCode: 'mr-IN', wallet: "पाकीट शिल्लक", withdraw: "पैसे काढा", online: "ऑनलाइन", offline: "ऑफलाइन", jobs: "काम (Jobs)", noJobs: "कोणतेही काम नाही.", accept: "काम स्वीकारा", navigate: "रस्ता पहा", start: "काम सुरू करा", complete: "काम पूर्ण झाले 🏆", logout: "बाहेर पडा", v_newJob: "नवीन काम आले आहे.", v_checkApp: "कृपया ॲप तपासा.", v_accepted: "काम स्वीकारले आहे.", v_completed: "काम पूर्ण झाले, पैसे जमा झाले.", v_offline: "तुम्ही ऑफलाइन आहात.", v_online: "तुम्ही ऑनलाइन आहात.", v_withdraw: "विनंती पाठवली आहे." },
  gu: { name: "ગુજરાતી (Gujarati)", langCode: 'gu-IN', wallet: "વોલેટ બેલેન્સ", withdraw: "ઉપાડ", online: "ઓનલાઇન", offline: "ઓફલાઇન", jobs: "કામ (Jobs)", noJobs: "કોઈ કામ નથી.", accept: "કામ સ્વીકારો", navigate: "રસ્તો જુઓ", start: "કામ શરૂ કરો", complete: "કામ પૂર્ણ 🏆", logout: "લોગ આઉટ", v_newJob: "નવું કામ આવ્યું છે.", v_checkApp: "કૃપા કરીને એપ ચેક કરો.", v_accepted: "કામ સ્વીકાર્યું છે.", v_completed: "કામ પૂરું થયું, પૈસા ઉમેરાઈ ગયા.", v_offline: "તમે ઓફલાઇન છો.", v_online: "તમે ઓનલાઇન છો.", v_withdraw: "વિનંતી મોકલવામાં આવી છે." },
  bn: { name: "বাংলা (Bengali)", langCode: 'bn-IN', wallet: "ওয়ালেট ব্যালেন্স", withdraw: "টাকা তুলুন", online: "অনলাইন", offline: "অফলাইন", jobs: "কাজ", noJobs: "কোনো কাজ নেই।", accept: "কাজ গ্রহণ করুন", navigate: "রাস্তা দেখুন", start: "কাজ শুরু করুন", complete: "কাজ সম্পন্ন 🏆", logout: "লগ আউট", v_newJob: "নতুন কাজ এসেছে।", v_checkApp: "অ্যাপ চেক করুন।", v_accepted: "কাজ গ্রহণ করা হয়েছে।", v_completed: "কাজ শেষ, টাকা যোগ হয়েছে।", v_offline: "আপনি অফলাইনে আছেন।", v_online: "আপনি অনলাইনে আছেন।", v_withdraw: "অনুরোধ পাঠানো হয়েছে।" },
  ta: { name: "தமிழ் (Tamil)", langCode: 'ta-IN', wallet: "வாலட் இருப்பு", withdraw: "பணம் எடு", online: "ஆன்லைன்", offline: "ஆஃப்லைன்", jobs: "பணிகள்", noJobs: "வேலைகள் இல்லை.", accept: "ஏற்றுக்கொள்", navigate: "வழிசெலுத்து", start: "தொடங்கு", complete: "முடிந்தது 🏆", logout: "வெளியேறு", v_newJob: "புதிய வேலை வந்துள்ளது.", v_checkApp: "செயலியைப் பார்க்கவும்.", v_accepted: "வேலை ஏற்கப்பட்டது.", v_completed: "வேலை முடிந்தது, பணம் சேர்க்கப்பட்டது.", v_offline: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்.", v_online: "நீங்கள் ஆன்லைனில் உள்ளீர்கள்.", v_withdraw: "கோரிக்கை அனுப்பப்பட்டது." },
  te: { name: "తెలుగు (Telugu)", langCode: 'te-IN', wallet: "వాలెట్ బ్యాలెన్స్", withdraw: "ఉపసంహరించు", online: "ఆన్‌లైన్", offline: "ఆఫ్‌లైన్", jobs: "పనులు", noJobs: "పనులు లేవు.", accept: "అంగీకరించు", navigate: "దారి చూపించు", start: "ప్రారంభించు", complete: "పూర్తయింది 🏆", logout: "లాగ్ అవుట్", v_newJob: "కొత్త పని వచ్చింది.", v_checkApp: "యాప్ తనిఖీ చేయండి.", v_accepted: "పని అంగీకరించబడింది.", v_completed: "పని పూర్తయింది, డబ్బు జోడించబడింది.", v_offline: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు.", v_online: "మీరు ఆన్‌లైన్‌లో ఉన్నారు.", v_withdraw: "అభ్యర్థన పంపబడింది." },
  kn: { name: "ಕನ್ನಡ (Kannada)", langCode: 'kn-IN', wallet: "ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್", withdraw: "ಹಿಂಪಡೆಯಿರಿ", online: "ಆನ್‌ಲೈನ್", offline: "ಆಫ್‌ಲೈನ್", jobs: "ಕೆಲಸಗಳು", noJobs: "ಯಾವುದೇ ಕೆಲಸವಿಲ್ಲ.", accept: "ಒಪ್ಪಿಕೊಳ್ಳಿ", navigate: "ನ್ಯಾವಿಗೇಟ್", start: "ಪ್ರಾರಂಭಿಸಿ", complete: "ಪೂರ್ಣಗೊಂಡಿದೆ 🏆", logout: "ಲಾಗ್ ಔಟ್", v_newJob: "ಹೊಸ ಕೆಲಸ ಬಂದಿದೆ.", v_checkApp: "ಅಪ್ಲಿಕೇಶನ್ ಪರಿಶೀಲಿಸಿ.", v_accepted: "ಕೆಲಸ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.", v_completed: "ಕೆಲಸ ಮುಗಿದಿದೆ, ಹಣ ಸೇರಿಸಲಾಗಿದೆ.", v_offline: "ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ.", v_online: "ನೀವು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ.", v_withdraw: "ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ." },
  ml: { name: "മലയാളം (Malayalam)", langCode: 'ml-IN', wallet: "വാലറ്റ് ബാലൻസ്", withdraw: "പിൻവലിക്കുക", online: "ഓൺലൈൻ", offline: "ഓഫ്‌ലൈൻ", jobs: "ജോലികൾ", noJobs: "ജോലികളില്ല.", accept: "സ്വീകരിക്കുക", navigate: "വഴി കാണുക", start: "തുടങ്ങുക", complete: "പൂർത്തിയായി 🏆", logout: "ലോഗൗട്ട്", v_newJob: "പുതിയ ജോലി വന്നിട്ടുണ്ട്.", v_checkApp: "ആപ്പ് പരിശോധിക്കുക.", v_accepted: "ജോലി സ്വീകരിച്ചു.", v_completed: "ജോലി കഴിഞ്ഞു, പണം ചേർത്തു.", v_offline: "നിങ്ങൾ ഓഫ്‌ലൈനാണ്.", v_online: "നിങ്ങൾ ഓൺലൈനിലാണ്.", v_withdraw: "അഭ്യർത്ഥന അയച്ചു." },
  pa: { name: "ਪੰਜਾਬੀ (Punjabi)", langCode: 'pa-IN', wallet: "ਵਾਲਿਟ ਬੈਲੰਸ", withdraw: "ਕਢਵਾਉਣਾ", online: "ਆਨਲਾਈਨ", offline: "ਆਫਲਾਈਨ", jobs: "ਕੰਮ", noJobs: "ਕੋਈ ਕੰਮ ਨਹੀਂ ਹੈ।", accept: "ਸਵੀਕਾਰ ਕਰੋ", navigate: "ਰਸਤਾ ਦੇਖੋ", start: "ਸ਼ੁਰੂ ਕਰੋ", complete: "ਪੂਰਾ ਹੋਇਆ 🏆", logout: "ਲਾਗ ਆਉਟ", v_newJob: "ਨਵਾਂ ਕੰਮ ਆਇਆ ਹੈ।", v_checkApp: "ਕਿਰਪਾ ਕਰਕੇ ਐਪ ਚੈੱਕ ਕਰੋ।", v_accepted: "ਕੰਮ ਸਵੀਕਾਰ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।", v_completed: "ਕੰਮ ਪੂਰਾ ਹੋ ਗਿਆ, ਪੈਸੇ ਜੁੜ ਗਏ।", v_offline: "ਤੁਸੀਂ ਆਫਲਾਈਨ ਹੋ।", v_online: "ਤੁਸੀਂ ਆਨਲਾਈਨ ਹੋ।", v_withdraw: "ਬੇਨਤੀ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।" },
  ur: { name: "اردو (Urdu)", langCode: 'ur-IN', wallet: "والٹ بیلنس", withdraw: "رقم نکالیں", online: "آن لائن", offline: "آف لائن", jobs: "کام", noJobs: "کوئی کام نہیں ہے۔", accept: "قبول کریں", navigate: "راستہ دیکھیں", start: "شروع کریں", complete: "مکمل ہوا 🏆", logout: "لاگ آؤٹ", v_newJob: "نیا کام آیا ہے۔", v_checkApp: "براہ کرم ایپ چیک کریں۔", v_accepted: "کام قبول کر لیا گیا ہے۔", v_completed: "کام مکمل، رقم شامل ہو گئی۔", v_offline: "آپ آف لائن ہیں۔", v_online: "آپ آن لائن ہیں۔", v_withdraw: "درخواست بھیج دی گئی۔" },
  or: { name: "ଓଡ଼ିଆ (Odia)", langCode: 'or-IN', wallet: "ୱାଲେଟ୍ ବାଲାନ୍ସ", withdraw: "ଟଙ୍କା ଉଠାନ୍ତୁ", online: "ଅନଲାଇନ୍", offline: "ଅଫଲାଇନ୍", jobs: "କାମ", noJobs: "କୌଣସି କାମ ନାହିଁ।", accept: "ଗ୍ରହଣ କରନ୍ତୁ", navigate: "ରାସ୍ତା ଦେଖନ୍ତୁ", start: "ଆରମ୍ଭ କରନ୍ତୁ", complete: "ସମ୍ପୂର୍ଣ୍ଣ 🏆", logout: "ଲଗ୍ ଆଉଟ୍", v_newJob: "ନୂଆ କାମ ଆସିଛି।", v_checkApp: "ଆପ୍ ଚେକ୍ କରନ୍ତୁ।", v_accepted: "କାମ ଗ୍ରହଣ କରାଯାଇଛି।", v_completed: "କାମ ଶେଷ, ଟଙ୍କା ଯୋଗ ହେଲା।", v_offline: "ଆପଣ ଅଫଲାଇନ୍ ଅଛନ୍ତି।", v_online: "ଆପଣ ଅନଲାଇନ୍ ଅଛନ୍ତି।", v_withdraw: "ଅନୁରୋଧ ପଠାଯାଇଛି।" },
  as: { name: "অসমীয়া (Assamese)", langCode: 'as-IN', wallet: "ৱালেট বেলেঞ্চ", withdraw: "ধন উলিয়াওক", online: "অনলাইন", offline: "অফলাইন", jobs: "কাম", noJobs: "কোনো কাম নাই।", accept: "গ্ৰহণ কৰক", navigate: "ৰাস্তা চাওক", start: "আৰম্ভ কৰক", complete: "সম্পূৰ্ণ 🏆", logout: "লগ আউট", v_newJob: "নতুন কাম আহিছে।", v_checkApp: "এপ চেক কৰক।", v_accepted: "কাম গ্ৰহণ কৰা হৈছে।", v_completed: "কাম শেষ, ধন যোগ কৰা হৈছে।", v_offline: "আপুনি অফলাইন আছে।", v_online: "আপুনি অনলাইন আছে।", v_withdraw: "অনুৰোধ পঠিওৱা হৈছে।" },
  ne: { name: "नेपाली (Nepali)", langCode: 'ne-NP', wallet: "वालेट ब्यालेन्स", withdraw: "पैसा निकाल्नुहोस्", online: "अनलाइन", offline: "अफलाइन", jobs: "कामहरू", noJobs: "कुनै काम छैन।", accept: "स्वीकार गर्नुहोस्", navigate: "बाटो हेर्नुहोस्", start: "सुरु गर्नुहोस्", complete: "पूरा भयो 🏆", logout: "लग आउट", v_newJob: "नयाँ काम आएको छ।", v_checkApp: "कृपया एप जाँच गर्नुहोस्।", v_accepted: "काम स्वीकार गरियो।", v_completed: "काम पूरा भयो, पैसा थपियो।", v_offline: "तपाईं अफलाइन हुनुहुन्छ।", v_online: "तपाईं अनलाइन हुनुहुन्छ।", v_withdraw: "अनुरोध पठाइयो।" },
  sd: { name: "سنڌي (Sindhi)", langCode: 'sd-IN', wallet: "والٽ بيلنس", withdraw: "رقم ڪڍو", online: "آن لائن", offline: "آف لائن", jobs: "ڪم", noJobs: "ڪوبه ڪم ناهي.", accept: "قبول ڪريو", navigate: "رستو ڏسو", start: "شروع ڪريو", complete: "مڪمل ٿيو 🏆", logout: "لاگ آئوٽ", v_newJob: "نئون ڪم آيو آهي.", v_checkApp: "مهرباني ڪري ايپ چيڪ ڪريو.", v_accepted: "ڪم قبول ڪيو ويو آهي.", v_completed: "ڪم مڪمل ٿيو، رقم شامل ڪئي وئي.", v_offline: "توهان آف لائن آهيو.", v_online: "توهان آن لائن آهيو.", v_withdraw: "درخواست موڪلي وئي." },
  mai: { name: "मैथिली (Maithili)", langCode: 'hi-IN', wallet: "वालेट बैलेंस", withdraw: "पैसा निकालू", online: "ऑनलाइन", offline: "ऑफलाइन", jobs: "काज", noJobs: "कोनो काज नहि अछि।", accept: "स्वीकार करू", navigate: "रास्ता देखू", start: "शुरू करू", complete: "पूरा भेल 🏆", logout: "लॉग आउट", v_newJob: "नबका काज आयल अछि।", v_checkApp: "कृपा कए एप चेक करू।", v_accepted: "काज स्वीकार कएल गेल।", v_completed: "काज पूरा भेल, पैसा जुड़ि गेल।", v_offline: "अहाँ ऑफलाइन छी।", v_online: "अहाँ ऑनलाइन छी।", v_withdraw: "निवेदन पठाउल गेल।" },
  ks: { name: "کأشُر (Kashmiri)", langCode: 'ur-IN', wallet: "وٲلِٹ بیلنس", withdraw: "پیسہ کڈو", online: "آن لائن", offline: "آف لائن", jobs: "کأم", noJobs: "کانہہ کأم چھنہٕ۔", accept: "منظور کریو", navigate: "وٹھ وچھو", start: "شروع کریو", complete: "مکمل 🏆", logout: "لاگ آؤٹ", v_newJob: "نٔو کأم چھےٚ آمٕژ۔", v_checkApp: "ایپ چیک کریو۔", v_accepted: "کأم چھےٚ منظور کرنہٕ آمٕژ۔", v_completed: "کأم مکمل، پیسہ آو جمع کرنہٕ۔", v_offline: "تُہؠ چھِ آف لائن۔", v_online: "تُہؠ چھِ آن لائن۔", v_withdraw: "درخواست گیہ روانہٕ۔" },
  kok: { name: "कोंकणी (Konkani)", langCode: 'mr-IN', wallet: "वालेट बॅलन्स", withdraw: "पैसे काडात", online: "ऑनलायन", offline: "ऑफलायन", jobs: "काम", noJobs: "कांयच काम ना.", accept: "काम घेयात", navigate: "वाट पळयात", start: "काम सुरू करात", complete: "काम जाले 🏆", logout: "लॉग आउट", v_newJob: "नवे काम आयला.", v_checkApp: "अॅप पळयात.", v_accepted: "काम घेतला.", v_completed: "काम जाले, पैसे जमा जाले.", v_offline: "तुमी ऑफलायन आसात.", v_online: "तुमी ऑनलायन आसात.", v_withdraw: "विनंती धाडल्या." }
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve(false); return; }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState('');
  
  // 🌍 Language State (Local Storage)
  const [lang, setLang] = useState(localStorage.getItem('kshatr_lang') || 'hi');
  const t = dict[lang] || dict['hi']; 

  const watchIdRef = useRef(null);
  const prevJobsLength = useRef(0); 

  // 🗣️ Smart Voice Assistant
  const speakVoice = (text) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); 
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = t.langCode; 
          utterance.rate = 1; 
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleLanguageChange = (e) => {
      const newLang = e.target.value;
      setLang(newLang);
      localStorage.setItem('kshatr_lang', newLang); 
  };

  useEffect(() => {
    checkExpertLogin();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 🔔 New Job Alert Logic
  useEffect(() => {
      if (jobs.length > prevJobsLength.current) {
          const newJob = jobs[0];
          if (newJob && newJob.status === 'assigned') {
              speakVoice(`${t.v_newJob} ${newJob.service_name}. ${t.v_checkApp}`);
          }
      }
      prevJobsLength.current = jobs.length;
  }, [jobs, lang]);

  const checkExpertLogin = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      navigate('/expert/login');
      return;
    }

    // maybeSingle() avoids 406 when no row found (e.g. Google login but not in experts table)
    const { data: expData, error: expError } = await supabase
      .from('experts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (expError) {
      console.error('Expert fetch error:', expError);
      setLoading(false);
      navigate('/expert/login');
      return;
    }

    if (expData) {
      setExpert(expData);
      fetchMyJobs(expData.id);
      if (expData.is_active) {
        startLiveTracking(expData.id);
      }
    } else {
      // Signed in (e.g. Google) but not registered as expert → send to registration, keep session
      navigate('/register-expert', { state: { fromExpertLogin: true, message: 'Google se sign-in ho chuka. Ab Expert registration complete karein.' } });
    }
    setLoading(false);
  };

  const fetchMyJobs = async (expertId) => {
    const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('expert_id', expertId)
        .in('status', ['assigned', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });
    
    if (data) setJobs(data);
  };

  const updateJobStatus = async (jobId, newStatus) => {
    setProcessingId(jobId);
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);
      if (error) throw error;
      setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      
      if(newStatus === 'accepted') speakVoice(t.v_accepted);
    } catch (err) {
      alert("Status update fail ho gaya!");
    } finally {
      setProcessingId(null);
    }
  };

  const markJobCompleted = async (job) => {
      if (!window.confirm("Confirm completion?")) return;

      setProcessingId(job.id);
      try {
          const { error } = await supabase.rpc('process_job_payout', {
              p_booking_id: job.id
          });
          
          if (error) throw error;

          setJobs(jobs.filter(j => j.id !== job.id));
          speakVoice(t.v_completed); 
          alert(`🎉 ${t.v_completed}`);
          
          checkExpertLogin(); 
      } catch (error) {
          console.error("Payout Error:", error);
          alert("Payment Error: " + error.message);
      } finally {
          setProcessingId(null);
      }
  };

  const startLiveTracking = (expId) => {
      if (!navigator.geolocation) return;
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              await supabase.from('experts').update({ latitude, longitude }).eq('id', expId);
              setExpert(prev => prev ? { ...prev, latitude, longitude } : prev);
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
  };

  const toggleDutyStatus = async () => {
    if (!expert) return;
    setLocationLoading(true);
    if (expert.is_active) {
        await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
        setExpert({ ...expert, is_active: false });
        speakVoice(t.v_offline);
        if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    } else {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            await supabase.from('experts').update({ is_active: true, latitude, longitude }).eq('id', expert.id);
            setExpert({ ...expert, is_active: true, latitude, longitude });
            startLiveTracking(expert.id);
            speakVoice(t.v_online);
        }, () => alert("Location access allow कीजिये!"));
    }
    setLocationLoading(false);
  };

  const handleLogout = async () => {
      if (!window.confirm("Logout?")) return;
      if (expert?.is_active) await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
      await supabase.auth.signOut();
      navigate('/expert/login'); 
  };

  /** Phase 1: Google Maps — coords → directions; else address → search. */
  const openCustomerLocationInMaps = (job) => {
    const url = buildCustomerLocationMapsUrl(job);
    if (url) window.open(url, '_blank');
  };

  const PRESET_AMOUNTS = [500, 1000, 2000];
  const getRechargeAmountRupees = () => {
    if (rechargeAmount !== null) return rechargeAmount;
    const n = Number(customAmount);
    return Number.isFinite(n) && n >= 1 && n <= 100000 ? n : null;
  };
  const handleProceedToPay = async () => {
    const amountRupees = getRechargeAmountRupees();
    if (amountRupees === null || amountRupees < 1) {
      setRechargeError('Please select or enter a valid amount (₹1 – ₹1,00,000).');
      return;
    }
    setRechargeError('');
    setRechargeLoading(true);
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      const session = refreshData?.session ?? (await supabase.auth.getSession()).data?.session;
      if (!session?.access_token) {
        setRechargeError(refreshError?.message || 'Session expired. Please sign in again.');
        setRechargeLoading(false);
        return;
      }
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${baseUrl}/functions/v1/create-wallet-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
          'apikey': anonKey,
        },
        body: JSON.stringify({ amount: amountRupees }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.details || body?.error || body?.message || res.statusText || 'Could not create payment order.');
      const { order_id, amount_paise, currency, key_id } = body;
      if (!order_id || !amount_paise) throw new Error(body?.error || 'Could not create payment order.');
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) throw new Error('Unable to load Razorpay.');
      const options = {
        key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount_paise,
        currency: currency || 'INR',
        order_id,
        name: 'Kshatr Partner Wallet',
        description: 'Wallet Recharge',
        handler: async function (response) {
          try {
            const { data: refData } = await supabase.auth.refreshSession();
            const confirmSession = refData?.session ?? (await supabase.auth.getSession()).data?.session;
            if (!confirmSession?.access_token) {
              alert('Session expired. Please sign in again and retry.');
              return;
            }
            const baseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const confirmRes = await fetch(`${baseUrl}/functions/v1/confirm-wallet-recharge`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + confirmSession.access_token,
                'apikey': anonKey,
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              }),
            });
            const result = await confirmRes.json().catch(() => ({}));
            if (!confirmRes.ok || result?.error) {
              alert('Recharge failed: ' + (result?.details || result?.error || confirmRes.statusText || 'Unknown error'));
              return;
            }
            setExpert((e) => (e ? { ...e, wallet_balance: result?.new_balance ?? e.wallet_balance } : e));
            setShowRecharge(false);
            setRechargeAmount(null);
            setCustomAmount('');
            alert('Wallet recharged! New balance: ₹' + (result?.new_balance ?? 0));
          } catch (e) {
            alert('Recharge confirmation failed: ' + (e?.message || e));
          } finally {
            setRechargeLoading(false);
          }
        },
        prefill: { name: expert?.name || expert?.full_name || 'Expert', email: (await supabase.auth.getUser()).data?.user?.email || '' },
        theme: { color: '#0f766e' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setRechargeLoading(false); setRechargeError('Payment failed. Try again.'); });
      rzp.open();
    } catch (err) {
      setRechargeError(err?.message || 'Something went wrong.');
    } finally {
      setRechargeLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-teal-500" size={40}/></div>;

  const expertName = expert?.name || expert?.full_name || 'Expert';

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans text-white">
      
      <div className="bg-slate-900 p-6 rounded-b-[2.5rem] shadow-2xl border-b border-slate-800">
          
          {/* 🌍 18 Languages Dynamic Switcher */}
          <div className="flex justify-end mb-4">
              <div className="bg-slate-800 rounded-full px-3 py-1 flex items-center gap-2 border border-slate-700 max-w-[180px]">
                  <Globe size={12} className="text-teal-400 shrink-0"/>
                  <select value={lang} onChange={handleLanguageChange} className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer uppercase tracking-wider appearance-none w-full truncate">
                      {Object.keys(dict).map((langKey) => (
                          <option key={langKey} value={langKey} className="bg-slate-900 text-white">
                              {dict[langKey].name}
                          </option>
                      ))}
                  </select>
              </div>
          </div>

          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center font-black text-xl relative">
                      {expertName[0]}
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1">
                          <Volume2 size={12} className="text-teal-400"/>
                      </div>
                  </div>
                  <div>
                      <h2 className="text-xl font-black">{expertName}</h2>
                      <p className="text-teal-500 text-[10px] font-black uppercase tracking-widest">{expert?.service_category} Expert</p>
                      <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-1 transition-colors hover:text-red-400">
                          <LogOut size={12}/> {t.logout}
                      </button>
                  </div>
              </div>

              <div className="text-right bg-slate-950 p-3 rounded-2xl border border-slate-800 min-w-[140px]">
                  <p className="text-[9px] text-slate-500 uppercase font-black">{t.wallet}</p>
                  <p className="text-2xl font-black text-green-400 mb-3">₹{expert?.wallet_balance?.toFixed(2) || 0}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowRecharge(true); setRechargeError(''); setRechargeAmount(null); setCustomAmount(''); }}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-400 text-slate-900 font-black py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Plus size={10}/> {t.addMoney || 'Add Money'}
                    </button>
                    <button 
                      onClick={async () => {
                        const upiId = prompt("UPI ID / Bank Details:");
                        if (!upiId) return;
                        const amountStr = prompt(`${t.withdraw} (Max: ₹${expert.wallet_balance}):`, expert.wallet_balance);
                        if (!amountStr) return;
                        const amount = parseFloat(amountStr);
                        if (isNaN(amount) || amount <= 0) return alert("Invalid amount!");
                        try {
                          const { error } = await supabase.rpc('request_wallet_withdrawal', {
                            p_user_id: expert.user_id,
                            p_user_type: 'expert',
                            p_user_name: expertName,
                            p_amount: amount,
                            p_payment_method: 'UPI/Bank',
                            p_payment_details: upiId
                          });
                          if (error) throw error;
                          speakVoice(t.v_withdraw);
                          alert("✅ Request Sent!");
                          checkExpertLogin(); 
                        } catch(err) { alert("Failed: " + err.message); }
                      }}
                      disabled={!expert?.wallet_balance || expert.wallet_balance <= 0}
                      className="flex-1 flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <IndianRupee size={10} className="inline"/> {t.withdraw}
                    </button>
                  </div>
              </div>
          </div>

          {/* Wallet Recharge Modal */}
          {showRecharge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !rechargeLoading && setShowRecharge(false)}>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-white">Add Money to Wallet</h3>
                  <button type="button" onClick={() => !rechargeLoading && setShowRecharge(false)} className="p-1 text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <p className="text-xs text-slate-400 mb-4">Choose amount or enter custom (₹1 – ₹1,00,000). Secure payment via Razorpay.</p>
                <div className="flex gap-2 mb-4">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setRechargeAmount(amt); setCustomAmount(''); setRechargeError(''); }}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${rechargeAmount === amt ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹) — preset or custom</label>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    placeholder="e.g. 500 or 5000"
                    value={rechargeAmount !== null ? String(rechargeAmount) : customAmount}
                    onChange={(e) => { setRechargeAmount(null); setCustomAmount(e.target.value); setRechargeError(''); }}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 text-white rounded-xl py-3 px-4 font-medium placeholder-slate-500"
                  />
                </div>
                {rechargeError && <p className="text-xs text-red-400 font-medium mb-3">{rechargeError}</p>}
                <button
                  type="button"
                  disabled={rechargeLoading}
                  onClick={handleProceedToPay}
                  className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {rechargeLoading ? <><Loader2 size={18} className="animate-spin"/> Proceeding…</> : 'Proceed to Pay'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
              <button 
                  onClick={toggleDutyStatus} disabled={locationLoading}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all border-4 ${
                      expert?.is_active ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
              >
                  {locationLoading ? <Loader2 size={32} className="animate-spin"/> : <Power size={32} />}
              </button>
              <h3 className={`text-lg font-black uppercase tracking-widest ${expert?.is_active ? 'text-green-500' : 'text-slate-500'}`}>
                  {expert?.is_active ? t.online : t.offline}
              </h3>
          </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">{t.jobs} ({jobs.length})</h3>
          <div className="space-y-4">
              {jobs.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 font-bold">{t.noJobs}</div>
              ) : jobs.map((job) => {
                const customerMapsUrl = buildCustomerLocationMapsUrl(job);
                return (
                  <div key={job.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl border-l-4 border-l-teal-500">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-teal-400 uppercase">{job.status}</span>
                          <span className="text-lg font-black">₹{job.total_amount}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{job.service_name}</h4>
                      <p className="text-sm text-slate-400 flex items-start gap-2 mb-4"><MapPin size={16}/> {job.address}</p>
                      
                      <div className="flex flex-col gap-2">
                          {/*
                            OLD: Navigate only when status === 'accepted', and only coords-based URL:
                            {job.status === 'assigned' && (
                              <button onClick={() => updateJobStatus(job.id, 'accepted')} ...>{t.accept}</button>
                            )}
                            {job.status === 'accepted' && (
                              <div className="flex gap-2">
                                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank')} ...>{t.navigate}</button>
                                <button onClick={() => updateJobStatus(job.id, 'in_progress')} ...>{t.start}</button>
                              </div>
                            )}
                          */}
                          {job.status === 'assigned' && (
                              <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openCustomerLocationInMaps(job)}
                                    disabled={!customerMapsUrl}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-1"
                                    title={!customerMapsUrl ? 'No address or map location' : undefined}
                                  >
                                    <Navigation size={14}/> {t.navigate}
                                  </button>
                                  <button type="button" onClick={() => updateJobStatus(job.id, 'accepted')} className="flex-1 bg-teal-500 text-slate-900 py-3 rounded-xl font-black uppercase text-xs">{t.accept}</button>
                              </div>
                          )}
                          {job.status === 'accepted' && (
                              <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openCustomerLocationInMaps(job)}
                                    disabled={!customerMapsUrl}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-1"
                                    title={!customerMapsUrl ? 'No address or map location' : undefined}
                                  >
                                    <Navigation size={14}/> {t.navigate}
                                  </button>
                                  <button type="button" onClick={() => updateJobStatus(job.id, 'in_progress')} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-black uppercase text-xs">{t.start}</button>
                              </div>
                          )}
                          {job.status === 'in_progress' && (
                              <div className="flex flex-col gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openCustomerLocationInMaps(job)}
                                    disabled={!customerMapsUrl}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-1"
                                    title={!customerMapsUrl ? 'No address or map location' : undefined}
                                  >
                                    <Navigation size={14}/> {t.navigate}
                                  </button>
                                  <button type="button" onClick={() => markJobCompleted(job)} disabled={processingId === job.id} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-xl font-black uppercase text-xs">
                                      {processingId === job.id ? <Loader2 className="animate-spin mx-auto" size={18}/> : t.complete}
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
                );
              })}
          </div>
      </div>
    </div>
  );
}