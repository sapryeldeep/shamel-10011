// Authentic Audio Chimes and Arabic Speech Synthesis for Hospital & Clinic Queue & Doctor Call Systems

// Cache loaded voices
let cachedArabicVoice: SpeechSynthesisVoice | null = null;

export const getArabicVoice = (): SpeechSynthesisVoice | null => {
  if (cachedArabicVoice) return cachedArabicVoice;
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize high-quality Arabic voices
  const prioritized = voices.find(v => 
    v.lang === 'ar-SA' || 
    v.lang === 'ar-EG' || 
    v.lang === 'ar-AE' || 
    v.lang.startsWith('ar') || 
    v.lang.includes('ara') ||
    v.name.toLowerCase().includes('arabic') ||
    v.name.includes('عربي') ||
    v.name.toLowerCase().includes('maged') ||
    v.name.toLowerCase().includes('tarik') ||
    v.name.toLowerCase().includes('laila') ||
    v.name.toLowerCase().includes('hoda') ||
    v.name.toLowerCase().includes('salma') ||
    v.name.toLowerCase().includes('zeina')
  );

  if (prioritized) {
    cachedArabicVoice = prioritized;
    return prioritized;
  }

  return null;
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedArabicVoice = null;
    getArabicVoice();
  };
}

/**
 * Generates an authentic medical hospital / airport chime using Web Audio API
 */
export const playHospitalChime = (type: 'standard' | 'emergency' = 'standard'): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        resolve();
        return;
      }

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playTone = (freq: number, startTime: number, duration: number, vol = 0.35) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;

      if (type === 'emergency') {
        // Urgent 4-tone ascending alert for Code Blue / Emergency Doctor Call
        playTone(440.0, now, 0.25, 0.4); // A4
        playTone(554.37, now + 0.2, 0.25, 0.4); // C#5
        playTone(659.25, now + 0.4, 0.25, 0.45); // E5
        playTone(880.0, now + 0.6, 0.5, 0.5); // A5
        setTimeout(resolve, 1100);
      } else {
        // Authentic medical center / clinic 3-tone chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
        playTone(523.25, now, 0.3, 0.35);
        playTone(659.25, now + 0.28, 0.3, 0.35);
        playTone(783.99, now + 0.56, 0.55, 0.4);
        setTimeout(resolve, 950);
      }
    } catch (e) {
      console.warn('Audio chime error:', e);
      resolve();
    }
  });
};

/**
 * Text-to-Speech in Arabic
 */
export const speakArabic = (text: string, rate = 0.88, pitch = 1.0) => {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = rate; // Clear, dignified announcement speed
    utterance.pitch = pitch;

    const arabicVoice = getArabicVoice();
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
  }
};

export interface AudioCallOptions {
  chimeType?: 'standard' | 'emergency' | 'digital' | 'none';
  repeatCount?: number;
  speechRate?: number;
  callPhraseTemplate?: string;
  volume?: number;
}

/**
 * Patient calling announcement in clear Arabic with customizable settings
 */
export const announcePatientCall = async (
  patientName: string, 
  roomOrClinic?: string,
  options?: AudioCallOptions
) => {
  if (!patientName || !patientName.trim()) return;

  const chimeType = options?.chimeType || 'standard';
  const repeats = options?.repeatCount || 1;
  const rate = options?.speechRate || 0.88;
  const template = options?.callPhraseTemplate || "المريض {patient}، تفضل بالدخول إلى {clinic}";
  
  const clinicText = roomOrClinic ? roomOrClinic.trim() : 'غرفة الكشف';
  
  // Format announcement phrase
  let phrase = template
    .replace('{patient}', patientName.trim())
    .replace('{clinic}', clinicText);

  if (!template.includes('{patient}')) {
    phrase = `المريض ${patientName.trim()}، تفضل بالدخول إلى ${clinicText}`;
  }

  for (let i = 0; i < repeats; i++) {
    if (chimeType !== 'none') {
      await playHospitalChime(chimeType === 'emergency' ? 'emergency' : 'standard');
    }
    
    speakArabic(phrase, rate);

    if (i < repeats - 1) {
      await new Promise(r => setTimeout(r, 3200));
    }
  }
};

/**
 * Doctor / Medical Consultant Calling announcement in clear Arabic
 */
export const announceDoctorCall = async (
  doctorName: string, 
  locationOrDept: string, 
  urgency: 'normal' | 'urgent' | 'emergency' = 'normal'
) => {
  if (!doctorName || !doctorName.trim()) return;

  await playHospitalChime(urgency === 'emergency' ? 'emergency' : 'standard');

  let text = '';
  if (urgency === 'emergency') {
    text = `نداء عاجل وهام! دكتور ${doctorName.trim()}، يرجى التوجه فوراً وبأقصى سرعة إلى ${locationOrDept.trim()}`;
  } else if (urgency === 'urgent') {
    text = `نداء هام، الدكتور ${doctorName.trim()}، مطلوب فوراً في ${locationOrDept.trim()}`;
  } else {
    text = `نداء إلى الدكتور ${doctorName.trim()}، يرجى التوجه إلى ${locationOrDept.trim()}`;
  }

  speakArabic(text, urgency === 'emergency' ? 0.95 : 0.88, urgency === 'emergency' ? 1.05 : 1.0);
};

/**
 * General Staff Announcement
 */
export const announceStaffCall = async (staffName: string, location: string) => {
  if (!staffName || !staffName.trim()) return;

  await playHospitalChime('standard');
  const text = `نداء إلى ${staffName.trim()}، يرجى التوجه إلى ${location.trim()}`;
  speakArabic(text, 0.88);
};
