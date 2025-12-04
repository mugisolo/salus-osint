import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Globe, 
  Lock, 
  Activity, 
  Fingerprint, 
  Scale, 
  Users, 
  ChevronRight, 
  ArrowRight,
  CheckCircle,
  FileText,
  CreditCard,
  Landmark,
  Database,
  MapPin,
  Mail,
  Clock,
  Phone,
  X,
  Copy
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
}

type PageView = 'HOME' | 'SERVICES' | 'ABOUT' | 'CONTACT';

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard }) => {
  const [activePage, setActivePage] = useState<PageView>('HOME');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavItem = ({ page, label }: { page: PageView; label: string }) => (
    <button 
      onClick={() => { setActivePage(page); window.scrollTo(0,0); }}
      className={`text-base font-medium transition-colors ${
        activePage === page ? 'text-blue-400' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setActivePage('HOME')}
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-white leading-none">SALUS <span className="text-blue-500 font-light">INTERNATIONAL</span></h1>
              <p className="text-xs text-slate-500 tracking-widest uppercase mt-1">Veritas Per Scientiam</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <NavItem page="HOME" label="Home" />
            <NavItem page="SERVICES" label="Services" />
            <NavItem page="ABOUT" label="About Us" />
            <NavItem page="CONTACT" label="Subscribe" />
            <button 
              onClick={onLaunchDashboard}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-medium transition-all flex items-center gap-2 border border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              <Activity size={20} />
              Access SALUS Dashboard
            </button>
          </div>

          {/* Mobile Menu Button (Simplified) */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={onLaunchDashboard}
              className="text-blue-400"
             >
                <Activity size={28} />
             </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-grow pt-24">
        {activePage === 'HOME' && <HomeView onNavigate={setActivePage} onLaunchDashboard={onLaunchDashboard} />}
        {activePage === 'SERVICES' && <ServicesView />}
        {activePage === 'ABOUT' && <AboutView />}
        {activePage === 'CONTACT' && <ContactView />}
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-blue-600" size={24} />
                <span className="font-bold text-xl text-white">SALUS INTERNATIONAL</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">Veritas Per Scientiam — Truth Through Science</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We are the only consultancy that applies criminal investigation standards to electoral violence documentation, ensuring evidence survives both courtrooms and history.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4 text-base text-slate-500">
                <li className="flex items-start gap-3">
                  <MapPin className="text-blue-500 mt-1 shrink-0" size={18} />
                  <span>
                     House 42.<br/>
                    Plot 54, Kanjokya Street, Kampala, Uganda.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="text-blue-500 shrink-0" size={18} />
                  <a href="mailto:info@salusinternational.com" className="hover:text-blue-400 transition-colors">
                    info@salusinternational.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                   <Clock className="text-blue-500 mt-1 shrink-0" size={18} />
                   <span>
                     Mon - Fri<br/>
                     8:00am - 5:00pm
                   </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="text-blue-500 shrink-0" size={18} />
                  <span>+256 (0) 200 946 458</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Who We Serve</h4>
              <ul className="space-y-4 text-base text-slate-500">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">International Election Observer Missions</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Human Rights Legal NGOs</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Investigative Journalism Networks</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Corporate Security Teams</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Our Commitment</h4>
              <ul className="space-y-4 text-base text-slate-500">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Impartial Analysis</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Scientific Rigor</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Court-Admissible Evidence</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Global Operations</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-sm">© 2025 Salus International Limited. Encrypted. Always.</p>
            <p className="text-slate-700 text-sm font-mono flex items-center gap-2">
              <Lock size={14} /> All communications are PGP encrypted.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-VIEWS ---

const HomeView = ({ onNavigate, onLaunchDashboard }: { onNavigate: (p: PageView) => void, onLaunchDashboard: () => void }) => (
  <>
    {/* Hero Section */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-900/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-900/10 rounded-full blur-[128px]"></div>
        {/* Removed external texture URL to prevent load error */}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-900/10 border border-blue-500/20 text-blue-400 text-sm font-mono mb-10 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          SYSTEM SECURE // CONNECTION ESTABLISHED
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-10 leading-tight tracking-tight">
          When Democracy is Under <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-pulse-slow">Digital Attack</span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-slate-400 mb-10 max-w-4xl mx-auto font-light leading-relaxed">
          Digital Forensics • Electoral Integrity • Human Rights
          <br/>
          <span className="text-white font-medium">We Preserve the Evidence.</span>
        </p>
        
        <p className="text-lg text-slate-500 mb-16 max-w-3xl mx-auto leading-relaxed">
          Salus International provides AI-powered digital forensics for international observers, human rights organizations, and justice mechanisms operating in contested political environments.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => onNavigate('CONTACT')}
            className="group bg-white text-slate-950 hover:bg-slate-100 px-10 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Request Secure Briefing
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigate('SERVICES')}
            className="bg-slate-900/50 text-white border border-slate-700 hover:border-blue-500 hover:text-blue-400 px-10 py-5 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
          >
            View Forensic Services
          </button>
        </div>
      </div>
    </section>

    {/* Trust Strip */}
    <div className="border-y border-slate-800 bg-slate-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-sm md:text-base text-slate-500 uppercase tracking-[0.2em] font-semibold">
          Your Trusted Evidence Partner For International Observers & Human Rights Bodies
        </p>
      </div>
    </div>

    {/* Philosophy Section */}
    <section className="py-32 bg-slate-950 relative">
       <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white mb-14 leading-tight">
            "While others politicize, <span className="text-blue-500">we digitize.</span><br/>
            While others speculate, <span className="text-blue-500">we investigate.</span>"
          </h2>
          <div className="w-32 h-1.5 bg-blue-600 mx-auto mb-16 rounded-full"></div>
          <p className="text-2xl text-slate-400 font-light max-w-4xl mx-auto leading-relaxed">
            In environments where facts are weaponized, we weaponize forensics for justice. 
            We provide truth verification, not political consulting.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-24">
            <div className="p-10 border border-slate-800 hover:border-slate-600 transition-colors rounded-3xl bg-slate-900/20">
              <div className="text-6xl font-bold text-white mb-4 font-mono">24/7</div>
              <div className="text-sm text-blue-400 uppercase tracking-wider font-bold mb-3">Crisis Response</div>
              <div className="text-base text-slate-500">Real-time evidence preservation in conflict zones</div>
            </div>
            <div className="p-10 border border-slate-800 hover:border-slate-600 transition-colors rounded-3xl bg-slate-900/20">
              <div className="text-6xl font-bold text-white mb-4 font-mono">100%</div>
              <div className="text-sm text-blue-400 uppercase tracking-wider font-bold mb-3">Impartiality</div>
              <div className="text-base text-slate-500">We serve data, not ideologies or parties</div>
            </div>
            <div className="p-10 border border-slate-800 hover:border-slate-600 transition-colors rounded-3xl bg-slate-900/20">
              <div className="text-6xl font-bold text-white mb-4 font-mono">Zero</div>
              <div className="text-sm text-blue-400 uppercase tracking-wider font-bold mb-3">Compromise</div>
              <div className="text-base text-slate-500">Court-admissible standards for every file</div>
            </div>
          </div>
       </div>
    </section>

    {/* Quick Service Preview */}
    <section className="py-32 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16">
           <div className="md:w-1/2">
              <h2 className="text-4xl font-bold text-white mb-8">Forensics at Human Rights Speed</h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                 From deepfake detection to reconstructing electoral violence timelines using cellular metadata, our labs operate 24/7 to provide clarity in the fog of political unrest.
              </p>
              <button 
                onClick={() => onNavigate('SERVICES')}
                className="text-blue-400 font-medium text-lg flex items-center gap-3 hover:text-blue-300 transition-colors"
              >
                 Explore All Services <ArrowRight size={20} />
              </button>
           </div>
           <div className="md:w-1/2 grid grid-cols-2 gap-6">
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                 <Fingerprint size={40} className="text-blue-500 mb-4" />
                 <span className="text-base font-bold text-slate-300">Biometric Verification</span>
              </div>
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                 <Globe size={40} className="text-purple-500 mb-4" />
                 <span className="text-base font-bold text-slate-300">Network Forensics</span>
              </div>
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                 <Database size={40} className="text-green-500 mb-4" />
                 <span className="text-base font-bold text-slate-300">Data Recovery</span>
              </div>
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                 <Activity size={40} className="text-orange-500 mb-4" />
                 <span className="text-base font-bold text-slate-300">Crisis Tracking</span>
              </div>
           </div>
        </div>
    </section>
  </>
);

const ServicesView = () => (
  <div className="animate-fade-in">
    <div className="bg-slate-900/50 border-b border-slate-800 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">Forensic Services</h1>
        <p className="text-2xl text-slate-400 max-w-4xl leading-relaxed">
          We provide truth verification. Our methodologies apply strict criminal investigation standards to political violence documentation.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          {
            icon: Activity,
            title: "Electoral Violence Digital Reconstruction",
            desc: "GPS, cellular, and social media evidence preservation with 3D timeline reconstruction to map incidents against official narratives."
          },
          {
            icon: Fingerprint,
            title: "Disinformation Forensics",
            desc: "Deepfake detection, bot network analysis, and metadata verification using proprietary AI-powered analysis tools."
          },
          {
            icon: Lock,
            title: "Cyber-Physical Threat Assessment",
            desc: "Political digital infrastructure security auditing and incident response for high-risk organizations."
          },
          {
            icon: Globe,
            title: "Open-Source Intelligence (OSINT)",
            desc: "AI-powered monitoring of political unrest indicators with real-time crisis tracking across surface and dark web."
          },
          {
            icon: Scale,
            title: "Evidence Chain-of-Custody",
            desc: "Court-admissible documentation for international tribunals with blockchain verification to ensure data integrity."
          },
          {
            icon: Shield,
            title: "Opposition Security",
            desc: "Secure communication platforms, device hardening, and operational security training for activist networks."
          }
        ].map((service, index) => (
          <div key={index} className="bg-slate-900 p-10 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group hover:-translate-y-2 duration-300">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors shadow-xl">
              <service.icon className="text-blue-400 group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
            <p className="text-slate-400 text-base leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AboutView = () => (
  <div className="animate-fade-in">
    <div className="bg-slate-900/50 border-b border-slate-800 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">About Salus</h1>
        <p className="text-2xl text-slate-400 max-w-4xl">
           Veritas Per Scientiam — Truth Through Science.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
        <div>
          <h2 className="text-4xl font-bold text-white mb-10 flex items-center gap-4">
            <CheckCircle className="text-blue-500" size={32} /> Our Guiding Principles
          </h2>
          <div className="space-y-8">
            {[
              { title: "Impartiality", desc: "We serve data, not ideologies. Our loyalty is to the evidence." },
              { title: "Scientific Rigor", desc: "Every conclusion must be replicable and peer-reviewable." },
              { title: "Courage", desc: "We operate in high-risk environments where truth is contested." },
              { title: "Discretion", desc: "Security through operational silence. We protect our sources." },
              { title: "Innovation", desc: "AI-enabled forensics at human rights speed." },
              { title: "Global Reach", desc: "Operations in risk countries across East Africa and beyond." }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-5 p-6 rounded-xl hover:bg-slate-900 transition-colors">
                <div className="mt-2 w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <h4 className="text-white font-bold text-xl">{item.title}</h4>
                  <p className="text-slate-400 text-base mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
           <div className="sticky top-32">
              <h2 className="text-4xl font-bold text-white mb-10 flex items-center gap-4">
                <Users className="text-purple-500" size={32} /> Team Expertise
              </h2>
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-10 shadow-2xl">
                <p className="text-slate-400 mb-10 italic border-l-4 border-blue-500 pl-6 text-lg">
                  "Cross-functional excellence in high-stakes environments."
                </p>
                <div className="space-y-8">
                  {[
                    { title: "Digital Forensics Examiners", sub: "EnCE, CCE certified professionals with criminal investigation backgrounds" },
                    { title: "AI/ML Engineers", sub: "Computer vision and NLP specialists developing next-gen detection systems" },
                    { title: "International Human Rights Lawyers", sub: "Legal experts ensuring evidence meets international tribunal standards" },
                    { title: "Former Intelligence Analysts", sub: "5-Eyes partners with deep operational security experience" },
                    { title: "Field Security Advisors", sub: "Experienced in high-risk countries, from conflict zones to authoritarian states" },
                    { title: "Open-Source Intelligence Specialists", sub: "Expert OSINT practitioners skilled in real-time crisis monitoring" }
                  ].map((role, i) => (
                    <div key={i} className="pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                      <h4 className="text-white font-bold text-lg flex items-center gap-3">
                        <Users size={20} className="text-slate-500" />
                        {role.title}
                      </h4>
                      <p className="text-slate-500 text-sm mt-2 pl-8">{role.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-24">
         <h2 className="text-4xl font-bold text-white mb-12 text-center">Who We Serve</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
               <Globe className="mx-auto text-blue-500 mb-6" size={40} />
               <h3 className="font-bold text-white text-xl mb-3">Election Observers</h3>
               <p className="text-sm text-slate-500">International missions requiring data verification.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
               <Scale className="mx-auto text-purple-500 mb-6" size={40} />
               <h3 className="font-bold text-white text-xl mb-3">Legal NGOs</h3>
               <p className="text-sm text-slate-500">Human rights organizations building legal cases.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
               <FileText className="mx-auto text-green-500 mb-6" size={40} />
               <h3 className="font-bold text-white text-xl mb-3">Investigative Journalists</h3>
               <p className="text-sm text-slate-500">Networks requiring deep-dive forensic support.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
               <Shield className="mx-auto text-red-500 mb-6" size={40} />
               <h3 className="font-bold text-white text-xl mb-3">Corporate Security</h3>
               <p className="text-sm text-slate-500">Teams analyzing nation-state level threats.</p>
            </div>
         </div>
      </div>
    </div>
  </div>
);

const ContactView = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showBankInstructions, setShowBankInstructions] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const tiers = [
    {
        name: "Investigative Network",
        price: 1500, // 500 * 3
        displayPrice: "$1,500",
        period: "/qtr",
        target: "Journalists & Researchers",
        desc: "Essential digital forensics tools for independent reporting and monitoring. Billed quarterly.",
        features: ["Real-time Violence Map", "Basic Incident Verification", "Weekly Intelligence Brief", "1 Encrypted User Seat"]
    },
    {
        name: "Legal & Human Rights",
        price: 7500, // 2500 * 3
        displayPrice: "$7,500",
        period: "/qtr",
        target: "NGOs & Legal Aid",
        desc: "Forensic-grade evidence preservation for tribunals and legal action. Billed quarterly.",
        features: ["Everything in Investigative", "Chain-of-Custody Exports", "Deepfake Analysis Tools", "Priority Analyst Access", "5 Encrypted User Seats"],
        highlight: true
    },
    {
        name: "Observer Mission",
        price: 15000, // 5000 * 3
        displayPrice: "$15,000",
        period: "/qtr",
        target: "Election Observers",
        desc: "Operational security and situational awareness for deployed field teams. Billed quarterly.",
        features: ["Everything in Legal", "Real-time Crisis Alerts (SMS/Sat)", "Deployment Security Briefings", "Constituency Risk Profiling", "20 Encrypted User Seats"]
    },
    {
        name: "Corporate Risk",
        price: 30000, // 10000 * 3
        displayPrice: "$30,000",
        period: "/qtr",
        target: "Corporate Security",
        desc: "Full-spectrum intelligence for asset protection and business continuity. Billed quarterly.",
        features: ["Everything in Observer", "Dedicated Intelligence Officer", "Custom API Access", "Cyber-Physical Threat Audits", "Unlimited Seats"]
    }
  ];

  const initiatePayment = () => {
      if (!email || !name || !phone) {
          alert("Please fill in all details to proceed.");
          return;
      }
      
      const newOrderId = `APP-${Date.now().toString().slice(-8)}`;
      setOrderId(newOrderId);

      // Simulate sending email to admin
      console.log(`[SIMULATION] Email sent to info@salusinternational.net. Order: ${newOrderId}, Plan: ${selectedPlan}`);
      
      // Simulate sending email to applicant
      console.log(`[SIMULATION] Email sent to ${email}. Subject: Bank Details for Order ${newOrderId}`);

      setShowBankInstructions(true);
  };

  const handleSelectPlan = (tier: any) => {
    setSelectedPlan(tier.name);
    setSelectedPrice(tier.price);
    setPaymentSuccess(false);
    setShowBankInstructions(false);
  };

  if (paymentSuccess) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center py-20">
        <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center max-w-2xl mx-6 shadow-2xl">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Secure Channel Initiated</h2>
          <p className="text-slate-400 text-lg mb-2">
            Subscription to <span className="text-white font-bold">{selectedPlan}</span> Confirmed.
          </p>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 my-8 text-left">
             <p className="text-sm text-slate-400 font-mono mb-2">APPLICATION NO: <span className="text-white">{orderId}</span></p>
             <p className="text-sm text-slate-400 font-mono">STATUS: <span className="text-green-400">PENDING PAYMENT VERIFICATION</span></p>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            An encrypted onboarding dossier has been generated. A case officer will contact you via your provided secure email ({email}) within 1 hour to finalize operational clearance once payment is verified.
          </p>
          <button 
            onClick={() => { setSelectedPlan(null); setPaymentSuccess(false); setEmail(''); setName(''); setPhone(''); }}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ChevronRight className="rotate-180" size={16} /> Return to packages
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
        <div className="animate-fade-in min-h-[80vh] flex items-center justify-center py-12">
            <div className="max-w-4xl w-full mx-6 grid grid-cols-1 md:grid-cols-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Summary Panel */}
                <div className="p-8 md:p-12 bg-slate-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
                    <div>
                        <button 
                            onClick={() => setSelectedPlan(null)}
                            className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <ChevronRight className="rotate-180" size={16} /> Back to Plans
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2">Order Summary</h2>
                        <p className="text-slate-400 text-sm mb-8">Review your subscription details</p>
                        
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-1">{selectedPlan}</h3>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">Quarterly Subscription (3 Months Upfront)</p>
                            <div className="flex justify-between items-center text-slate-300 text-sm mb-2">
                                <span>Subtotal (Quarterly)</span>
                                <span>${selectedPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300 text-sm border-b border-slate-700 pb-4 mb-4">
                                <span>Encryption Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-white font-bold text-lg">
                                <span>Total Due</span>
                                <span>${selectedPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-xs text-slate-600">
                        <p className="mb-2 flex items-center gap-2"><Lock size={12}/> 256-bit AES SSL Secure Checkout</p>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="p-8 md:p-12 bg-slate-950/50 relative">
                    <h2 className="text-2xl font-bold text-white mb-6">Subscriber Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name / Entity Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. John Doe / Salus Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secure Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="name@protonmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="+256 772 123456"
                            />
                        </div>

                        <div className="pt-6">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Accepted Payment Methods</p>
                            <div className="flex gap-3 mb-6">
                                {/* Visa */}
                                <div className="h-10 w-16 bg-white rounded flex items-center justify-center border border-slate-200" title="Visa">
                                   <span className="font-bold text-[#1a1f71] italic text-xl tracking-tighter font-serif">VISA</span>
                                </div>
                                {/* Mastercard */}
                                <div className="h-10 w-16 bg-slate-800 rounded flex items-center justify-center border border-slate-700 overflow-hidden relative" title="Mastercard">
                                     <div className="flex items-center justify-center">
                                         <div className="w-4 h-4 rounded-full bg-[#eb001b]"></div>
                                         <div className="w-4 h-4 rounded-full bg-[#f79e1b] -ml-2"></div>
                                     </div>
                                </div>
                                {/* Bank Transfer */}
                                <div className="h-10 w-16 bg-slate-700 rounded flex items-center justify-center text-white border border-slate-600 hover:bg-slate-600 transition-colors cursor-pointer" title="Bank Transfer">
                                   <Landmark size={20} />
                                </div>
                            </div>

                            <button 
                                onClick={initiatePayment}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Lock size={18} />
                                Pay ${selectedPrice.toLocaleString()} Securely
                            </button>
                        </div>
                    </div>

                    {/* Bank Instructions Modal */}
                    {showBankInstructions && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                           <button 
                              onClick={() => {setShowBankInstructions(false)}} 
                              className="absolute top-4 right-4 text-slate-500 hover:text-white"
                           >
                              <X size={24} />
                           </button>
                           
                           <div className="text-center mb-6">
                              <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Landmark className="text-blue-500" size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-white">Payment Instructions</h3>
                              <p className="text-sm text-slate-400 mt-2">Please complete your transfer to:</p>
                           </div>
                           
                           <div className="bg-slate-800 rounded-xl p-5 mb-6 space-y-3 border border-slate-700">
                              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span className="text-xs text-slate-500 uppercase font-bold">Bank</span>
                                <span className="text-sm font-medium text-white">Stanbic Bank</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span className="text-xs text-slate-500 uppercase font-bold">Account Name</span>
                                <span className="text-sm font-medium text-white">Salus International</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span className="text-xs text-slate-500 uppercase font-bold">Account Number</span>
                                <span className="text-sm font-medium text-white font-mono">123123</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 uppercase font-bold">Branch</span>
                                <span className="text-sm font-medium text-white">Accacia Branch</span>
                              </div>
                           </div>

                           <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Application Number</p>
                              <div className="flex items-center justify-between">
                                 <span className="text-xl font-mono text-white font-bold tracking-wider">{orderId}</span>
                                 <Copy size={16} className="text-blue-400 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(orderId)} />
                              </div>
                              <p className="text-[10px] text-blue-300 mt-2">
                                 * Include this number in your transfer reference.
                              </p>
                           </div>

                           <div className="text-sm text-slate-400 leading-relaxed mb-6">
                              After payment, share receipt on email to <strong className="text-white">info@salusinternational.net</strong> with your application number and receipt or call our contact desk on <strong className="text-white">+256 (0) 200 946 458</strong>.
                           </div>

                           <button 
                              onClick={() => { setShowBankInstructions(false); setPaymentSuccess(true); }}
                              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-colors"
                           >
                              I Have Completed The Transfer
                           </button>
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="animate-fade-in py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 mb-6">
              <Lock className="text-blue-500" size={32} />
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Subscription Packages</h1>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
             Select the intelligence tier that matches your operational requirements. Access is restricted to vetted entities. 
             <br/><span className="text-blue-400 font-bold mt-2 block">All plans are billed quarterly upfront (3 months).</span>
           </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {tiers.map((tier, idx) => (
                <div key={idx} className={`relative bg-slate-900 rounded-2xl border flex flex-col p-8 transition-all hover:-translate-y-2 duration-300 ${tier.highlight ? 'border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/50' : 'border-slate-800 hover:border-slate-600'}`}>
                    {tier.highlight && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                            Most Popular
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">{tier.target}</p>
                    <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-800">
                        <span className="text-4xl font-bold text-white">{tier.displayPrice}</span>
                        <span className="text-slate-500 font-medium">{tier.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed min-h-[60px]">
                        {tier.desc}
                    </p>
                    
                    <div className="space-y-4 mb-10 flex-grow">
                        {tier.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-3">
                                <CheckCircle size={16} className={`shrink-0 mt-0.5 ${tier.highlight ? 'text-blue-400' : 'text-slate-600'}`} />
                                <span className="text-sm text-slate-300">{feat}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => handleSelectPlan(tier)}
                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                            tier.highlight 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        Subscribe (Quarterly)
                    </button>
                </div>
            ))}
        </div>

        <div className="mt-20 text-center border-t border-slate-900 pt-10">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                <Lock size={14} /> 
                Secure Payment Gateway • 256-bit AES Encryption • Offshore Clearance Available
            </p>
        </div>
      </div>
    </div>
  );
};