import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: 'marketplace' | 'bookings' | 'feed' | 'telegram' | 'contact' }[];
}

const TEGAGN_SYSTEM_INSTRUCTION = `
You are the official Tegagn AI Assistant — the intelligent, friendly, and expert customer guide for the Tegagn Home Repair Marketplace in Addis Ababa, Ethiopia.

### ABOUT TEGAGN:
- Tegagn is an open, direct home repair marketplace connecting homeowners, tenants, and property managers directly with verified independent local trade professionals across Addis Ababa.
- There are NO middleman broker fees and NO hidden markups.
- Official Founder / Developer: Mati Israel (Email: matiisrael63@gmail.com, Phone: +251 91 764 3789, Telegram: @CocaCola_factory).
- Headquarters: Addis Ababa, Ethiopia.

### CORE TRADES & TYPICAL RATES (in Ethiopian Birr - ETB):
1. **Plumbing Specialization**: 350 ETB/hr (High-pressure PPR piping, booster pumps, drain clearing, sanitary fixtures).
2. **Electrical Systems**: 400 ETB/hr (Circuit breakers, European/US standard wiring, generator switches, surge protectors).
3. **Custom Carpentry**: 300 ETB/hr (Wanza wood furniture, soft-close kitchen cabinets, door framing, lock repairs).
4. **Painting & Finishing**: 280 ETB/hr (Interior/exterior emulsions, water-repellent coatings, drywall patch).
5. **Masonry & Construction**: 320 ETB/hr (Tile leveling, structural masonry, concrete screeds, perimeter walls).
6. **Cleaning Services**: 200 ETB/hr (Deep post-construction cleaning, residential sanitization).

### STEP-BY-STEP CUSTOMER INSTRUCTIONS:
1. **How to Find & Choose a Professional**:
   - Go to the **Marketplace** tab in the Customer Dashboard.
   - Filter by trade category pills (Plumbing, Electrical, Carpentry, etc.) or search by neighborhood (Bole, Kazanchis, CMC, Sarbet, Ayat).
   - Check pro ratings, completed jobs count, and verification badges.

2. **How to Book an Appointment**:
   - Click **Book Appointment** on any professional's card.
   - Select your preferred date and time slot.
   - Enter your Addis Ababa address or click the **Detect GPS** button to automatically pinpoint your coordinates.
   - Click **Upload Photos** to attach photos of the broken appliance, leak, or electrical box so the pro brings the exact right spare parts.
   - Click **Confirm Booking**.

3. **How to Track Active Requests & Cart**:
   - Click the **My Requests (Cart)** tab in the dashboard.
   - View pending, confirmed, in-progress, and completed requests.
   - See transparent order cost summaries.

4. **How to Leave Reviews & Ratings**:
   - After a job is completed, click **Rate Pros** or **Leave Review**.
   - Select 1 to 5 stars and write your honest feedback to build trust in the community.

5. **Customer Support**:
   - Contact Mati Israel directly: +251 91 764 3789
   - Official Telegram: @CocaCola_factory
   - Email: matiisrael63@gmail.com

### TONE & GUIDELINES:
- Always be polite, warm, and helpful.
- When answering questions about how to use the app or book, provide clear numbered steps.
- If relevant, recommend the user click the Marketplace or My Requests tab.
- You can converse in English, Amharic (አማርኛ), or Afaan Oromoo depending on the user's language.
`;

const LOCAL_STORAGE_KEY = 'tegagn_gemini_api_key';

export const geminiService = {
  getApiKey(): string {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
    const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';
    return envKey;
  },

  setApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    if (!key || !key.trim()) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
    }
  },

  isLiveApiConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 10 && !key.includes('MY_GEMINI_API_KEY'));
  },

  async askAgent(userPrompt: string, history: ChatMessage[] = []): Promise<string> {
    const apiKey = this.getApiKey();

    if (this.isLiveApiConfigured()) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Attempt using gemini-2.5-flash with fallback to gemini-2.0-flash
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
              systemInstruction: TEGAGN_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            }
          });
          if (response.text) {
            return response.text;
          }
        } catch {
          // Fallback to gemini-2.0-flash
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: userPrompt,
            config: {
              systemInstruction: TEGAGN_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            }
          });
          if (response.text) {
            return response.text;
          }
        }
      } catch (err: any) {
        console.warn('Gemini Live API call error, falling back to built-in knowledge agent:', err);
      }
    }

    // High-quality smart on-device knowledge fallback
    return this.generateSmartFallbackResponse(userPrompt);
  },

  generateSmartFallbackResponse(prompt: string): string {
    const q = prompt.toLowerCase();

    if (q.includes('how to book') || q.includes('how do i book') || q.includes('appointment') || q.includes('hire') || q.includes('booking')) {
      return `### 🛠️ How to Book a Home Repair Professional on Tegagn:

Booking a verified pro is fast and straightforward:

1. **Browse Marketplace**: Click the **Marketplace** tab to see trade categories (Plumbing, Electrical, Carpentry, Painting, Masonry, Cleaning).
2. **Select a Specialist**: Tap on any verified pro card (e.g., *Abebe Tadesse - Master Plumber* or *Marta Bekele - Certified Electrician*).
3. **Click Book Appointment**:
   - Choose your preferred **Date** and **Time Slot**.
   - Enter your neighborhood address (e.g., *Bole Atlas, Kazanchis, CMC*) or click **"Detect GPS"** to pinpoint your location automatically.
   - **Upload Problem Photos**: Attach photos of the broken pipe, wire, or fixture so the technician brings the exact replacement parts.
4. **Confirm**: Submit your request. You can monitor its progress in real-time under **My Requests (Cart)**!`;
    }

    if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('how much') || q.includes('birr') || q.includes('etb')) {
      return `### 💰 Transparent Hourly Rates on Tegagn:

Tegagn has zero middleman markups! Direct hourly rates for certified professionals in Addis Ababa:

- **Plumbing Specialist**: ~350 ETB/hr (PPR pipes, booster pumps, drain snaking, bathroom fixtures)
- **Certified Electrician**: ~400 ETB/hr (Circuit panels, wiring, breaker trips, generator switches)
- **Custom Woodworker / Carpenter**: ~300 ETB/hr (Wanza wood, kitchen cabinets, door hinges)
- **Masonry & General Builder**: ~320 ETB/hr (Tiles, wall plastering, screed repairs)
- **Painter & Decorator**: ~280 ETB/hr (Interior/exterior walls, water sealant)
- **Deep Home Cleaning**: ~200 ETB/hr (Post-construction & residential sanitization)

*Pro tip: The final estimate will be based on the technician's inspection and spare parts needed.*`;
    }

    if (q.includes('gps') || q.includes('location') || q.includes('photo') || q.includes('camera') || q.includes('upload')) {
      return `### 📍 GPS Location & Photo Upload:

- **Detect GPS**: When filling out a booking, tap the **"Detect GPS"** button. The app automatically detects your coordinates (Latitude & Longitude) in Addis Ababa so the technician finds your doorstep without getting lost.
- **Problem Photos**: You can upload up to multiple images from your phone or PC (leaks, burnt outlets, damaged doors). This helps the pro diagnose the issue before arriving and bring the proper tools and parts.`;
    }

    if (q.includes('track') || q.includes('order') || q.includes('cart') || q.includes('status') || q.includes('my request')) {
      return `### 📦 Tracking Your Repair Requests & Cart:

- Navigate to the **"My Requests (Cart)"** tab at the top of your Customer Dashboard.
- Here you can see:
  - **Status Badge**: *Pending Review*, *Confirmed*, *Technician Dispatched*, or *Completed*.
  - **Scheduled Date & Time**: The exact appointment window.
  - **Technician Details**: Name, phone number, and trade craft.
  - **Total Order Estimate**: Calculated based on the hourly rates.`;
    }

    if (q.includes('review') || q.includes('rate') || q.includes('rating') || q.includes('feedback')) {
      return `### ⭐ How to Review & Rate a Professional:

1. Once the repair work is completed, head to the **"Rate Pros"** section in your dashboard.
2. Select your rating from **1 to 5 Stars**.
3. Write your honest review of their punctuality, cleanliness, and quality of work.
4. Your rating helps maintain the highest standards of safety and skill across the Tegagn marketplace!`;
    }

    if (q.includes('contact') || q.includes('support') || q.includes('telegram') || q.includes('phone') || q.includes('help') || q.includes('admin') || q.includes('mati')) {
      return `### 📞 Contact Customer Support & Telegram:

You can reach the Tegagn team directly anytime:

- **Founder & Administrator**: Mati Israel
- **Phone**: [+251 91 764 3789](tel:+251917643789)
- **Email**: [matiisrael63@gmail.com](mailto:matiisrael63@gmail.com)
- **Official Telegram Channel**: [@CocaCola_factory](https://t.me/CocaCola_factory)
- **Location**: Addis Ababa, Ethiopia`;
    }

    if (q.includes('safe') || q.includes('verified') || q.includes('trust') || q.includes('guarantee')) {
      return `### 🛡️ Verified Professionals & Trust:

- All trade professionals on Tegagn undergo identity and trade certification verification.
- Every technician has a public profile displaying their experience years, completed jobs, license numbers, and past customer reviews.
- You can message or call the technician directly with zero broker interference.`;
    }

    return `Hello! I am your **Tegagn AI Assistant** (Powered by Google Gemini). 

I am here to help you navigate the marketplace, find reliable trade professionals in Addis Ababa, and guide you through booking:

- 🛠️ **How to book** a plumber, electrician, carpenter, or painter.
- 💰 **Transparent pricing & hourly rates** in ETB.
- 📍 **How GPS location detection & photo uploads** work.
- 📦 **How to track active repair requests** in your Cart.
- ⭐ **How to rate and review** technicians after service.
- 📞 **Contact support** or join our official Telegram channel (@CocaCola_factory).

What can I assist you with today?`;
  }
};
