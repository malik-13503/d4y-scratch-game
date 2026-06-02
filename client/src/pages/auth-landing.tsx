import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ImprovedSignupForm } from "@/components/auth/improved-signup-form";
import { ImprovedLoginForm } from "@/components/auth/improved-login-form";
import { SignupSuccessPopup } from "@/components/auth/signup-success-popup";
import { getQueryFn } from "@/lib/queryClient";
import logoPath from "@assets/logo_1777237644041.png";
import imgTreasure from "@assets/hero-treasure.png";
import imgCash    from "@assets/prize-cash.png";
import imgPs5     from "@assets/prize-ps5.png";
import imgTv      from "@assets/prize-tv.png";
import imgVip     from "@assets/prize-vip.png";
import imgToken   from "@assets/prize-token.png";
import imgWheel   from "@assets/hero-wheel.png";
import {
  Trophy, Zap, Crown, Shield, CheckCircle,
  Star, Users, Gift, Sparkles, ArrowRight,
} from "lucide-react";

/* ─── tiny CSS injected once ─────────────────────────────────── */
const AUTH_CSS = `
@keyframes authFloat1{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-14px) rotate(2deg)}}
@keyframes authFloat2{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-10px) rotate(-2deg)}}
@keyframes authFloat3{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
@keyframes authSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes authPulseRing{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.2);opacity:0}}
@keyframes authShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes authFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes authBorderGlow{0%,100%{opacity:0.6}50%{opacity:1}}
.auth-float-1{animation:authFloat1 5s ease-in-out infinite}
.auth-float-2{animation:authFloat2 6.5s ease-in-out infinite}
.auth-float-3{animation:authFloat3 4s ease-in-out infinite}
.auth-spin-slow{animation:authSpin 18s linear infinite}
.auth-pulse-ring::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid currentColor;animation:authPulseRing 2s ease-out infinite}
.auth-shimmer-gold{background:linear-gradient(90deg,#f59e0b,#fbbf24,#f97316,#f59e0b);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:authShimmer 3s linear infinite}
.auth-fade-up{animation:authFadeUp 0.7s ease forwards}
.auth-card-border{position:relative}
.auth-card-border::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,rgba(124,58,237,0.7),rgba(236,72,153,0.5),rgba(245,158,11,0.4),rgba(124,58,237,0.7));background-size:300% 300%;animation:authBorderGlow 3s ease-in-out infinite alternate;z-index:0;pointer-events:none}
.auth-input-glow:focus-within{box-shadow:0 0 0 2px rgba(124,58,237,0.5)}
`;

export default function AuthLandingPage() {
  const [activeTab, setActiveTab]           = useState<"signup"|"login">("signup");
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupUserName, setSignupUserName]   = useState("");
  const [, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const handleSignupSuccess = (userName: string) => {
    setSignupUserName(userName);
    setShowSignupPopup(true);
  };

  const handleLoginFromPopup = () => {
    setShowSignupPopup(false);
    setActiveTab("login");
  };

  React.useEffect(() => {
    if (user && typeof user === "object") setLocation("/games");
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{background:"linear-gradient(135deg,#1a0533,#0f0628)"}}>
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: AUTH_CSS}} />

      <div className="min-h-screen relative overflow-hidden"
        style={{background:"linear-gradient(135deg,#1a0533 0%,#0f0628 40%,#1b0a40 70%,#120528 100%)"}}>

        {/* ── BG EFFECTS ─────────────────────────────────────── */}
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full auth-float-1"
            style={{width:700,height:700,top:-200,left:-220,background:"radial-gradient(circle,rgba(124,58,237,0.5) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full auth-float-2"
            style={{width:600,height:600,top:"10%",right:-180,background:"radial-gradient(circle,rgba(236,72,153,0.35) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full auth-float-3"
            style={{width:500,height:500,bottom:-120,left:"30%",background:"radial-gradient(circle,rgba(245,158,11,0.22) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full"
            style={{width:400,height:400,top:"40%",left:"15%",background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)"}} />
        </div>

        {/* Neon grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(139,92,246,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.12) 1px,transparent 1px)",backgroundSize:"80px 80px"}} />

        {/* Top rainbow line */}
        <div className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
          style={{background:"linear-gradient(90deg,transparent,#7c3aed 25%,#ec4899 50%,#f59e0b 75%,transparent)"}} />

        {/* Floating neon dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            {s:7,top:"12%",left:"6%",  c:"#a78bfa",a:"auth-float-1"},
            {s:5,top:"55%",left:"2%",  c:"#f472b6",a:"auth-float-2"},
            {s:6,top:"80%",left:"10%", c:"#fbbf24",a:"auth-float-3"},
            {s:4,top:"30%",left:"48%", c:"#34d399",a:"auth-float-1"},
            {s:7,top:"75%",left:"58%", c:"#818cf8",a:"auth-float-2"},
            {s:5,top:"8%", left:"78%", c:"#fb923c",a:"auth-float-3"},
            {s:6,top:"65%",left:"92%", c:"#c084fc",a:"auth-float-1"},
          ].map((p,i)=>(
            <div key={i} className={`absolute rounded-full ${p.a}`}
              style={{width:p.s,height:p.s,top:p.top,left:p.left,background:p.c,
                boxShadow:`0 0 ${p.s*5}px ${p.c}`,opacity:0.75}} />
          ))}
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <div className="relative z-10 min-h-screen flex flex-col">

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <img src={logoPath} alt="Prize Plugz" className="h-10 w-auto drop-shadow-lg" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)"}}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-xs font-bold tracking-wide">12,458 LIVE</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex items-center px-4 sm:px-6 py-6">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

              {/* ── LEFT — Cinematic showcase ────────────── */}
              <div className="hidden lg:flex flex-col gap-6 auth-fade-up">

                {/* Big headline */}
                <div>
                  <p className="text-violet-400 text-sm font-bold tracking-[0.35em] uppercase mb-2">Prize Plugz</p>
                  <h1 className="font-black leading-[0.88] tracking-tight"
                    style={{fontSize:"clamp(3rem,5vw,4.8rem)"}}>
                    <span className="text-white">YOUR NEXT</span><br/>
                    <span className="auth-shimmer-gold">BIG WIN</span><br/>
                    <span className="text-white">STARTS HERE.</span>
                  </h1>
                  <p className="text-gray-400 text-base mt-4 max-w-sm leading-relaxed">
                    Spend tokens, watch the jackpot fill live, and walk away with
                    <span className="text-white font-semibold"> real cash & amazing prizes</span>.
                  </p>
                </div>

                {/* Prize image showcase */}
                <div className="relative">
                  {/* Glow behind card */}
                  <div className="absolute inset-[-16px] rounded-3xl pointer-events-none"
                    style={{background:"radial-gradient(ellipse at center,rgba(124,58,237,0.35) 0%,transparent 70%)",filter:"blur(20px)"}} />

                  <div className="relative rounded-3xl overflow-hidden"
                    style={{background:"linear-gradient(145deg,rgba(17,14,42,0.9),rgba(26,16,64,0.9))",
                      border:"1px solid rgba(139,92,246,0.4)",
                      boxShadow:"0 0 60px rgba(109,40,217,0.25),0 30px 80px rgba(0,0,0,0.5)"}}>

                    {/* Treasure image */}
                    <div className="relative h-48 overflow-hidden">
                      <img src={imgTreasure} alt="Prizes" className="w-full h-full object-cover auth-float-3"
                        style={{filter:"saturate(1.4) brightness(1.1)"}} />
                      <div className="absolute inset-0"
                        style={{background:"linear-gradient(to bottom,transparent 40%,rgba(17,14,42,1) 100%)"}} />
                      {/* Overlay badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
                        style={{background:"rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.5)"}}>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-300 text-xs font-black tracking-wide">LIVE JACKPOT</span>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md"
                        style={{background:"rgba(245,158,11,0.2)",border:"1px solid rgba(245,158,11,0.5)"}}>
                        <span className="text-yellow-300 text-xs font-black">🏆 WIN BIG</span>
                      </div>
                    </div>

                    {/* Prize chips row */}
                    <div className="p-4 grid grid-cols-4 gap-3">
                      {[
                        {img:imgCash, label:"$500 Cash",  color:"#22c55e"},
                        {img:imgPs5,  label:"PS5",         color:"#818cf8"},
                        {img:imgTv,   label:"65\" TV",     color:"#a855f7"},
                        {img:imgVip,  label:"VIP Pack",   color:"#f97316"},
                      ].map(({img,label,color},ci)=>(
                        <div key={ci} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-transform hover:scale-105 cursor-pointer"
                          style={{background:`${color}15`,border:`1px solid ${color}35`}}>
                          <div className="w-11 h-11 rounded-xl overflow-hidden">
                            <img src={img} alt={label} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-black text-center leading-tight" style={{color}}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {val:"12,458", lbl:"Players Online",  color:"#10b981", icon:Users},
                    {val:"$127K+", lbl:"Total Paid Out",  color:"#f59e0b", icon:Trophy},
                    {val:"583",    lbl:"Winners Today",   color:"#8b5cf6", icon:Crown},
                  ].map(({val,lbl,color,icon:Icon})=>(
                    <div key={lbl} className="flex flex-col items-center p-3 rounded-2xl text-center"
                      style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <Icon className="h-4 w-4 mb-1.5 opacity-70" style={{color}} />
                      <p className="font-black text-lg leading-none" style={{color}}>{val}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5 font-medium">{lbl}</p>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2">
                  {[
                    {icon:Zap,      t:"Instant Results",    c:"#10b981"},
                    {icon:Shield,   t:"Secure Payments",    c:"#818cf8"},
                    {icon:CheckCircle, t:"Auto Winner",     c:"#f59e0b"},
                    {icon:Gift,     t:"Free Welcome Tokens",c:"#ec4899"},
                  ].map(({icon:Icon,t,c},bi)=>(
                    <span key={bi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#9ca3af"}}>
                      <Icon className="h-3 w-3" style={{color:c}} />{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── RIGHT — Auth card ─────────────────────── */}
              <div className="w-full max-w-md mx-auto lg:mx-0 auth-fade-up" style={{animationDelay:"0.1s"}}>

                {/* Mobile logo */}
                <div className="lg:hidden text-center mb-6">
                  <h1 className="font-black text-4xl auth-shimmer-gold mb-1">PRIZE PLUGZ</h1>
                  <p className="text-gray-400 text-sm">Spin. Win. Repeat.</p>
                </div>

                {/* Outer glow */}
                <div className="absolute pointer-events-none"
                  style={{inset:"-30px",background:"radial-gradient(ellipse at center,rgba(124,58,237,0.28) 0%,transparent 65%)",filter:"blur(24px)",borderRadius:"2rem",position:"absolute"}} />

                {/* Card */}
                <div className="relative rounded-3xl overflow-hidden"
                  style={{background:"linear-gradient(145deg,rgba(15,12,34,0.97),rgba(22,15,50,0.97))",
                    border:"1px solid rgba(139,92,246,0.45)",
                    boxShadow:"0 0 0 1px rgba(236,72,153,0.15),0 40px 100px rgba(0,0,0,0.6),0 0 80px rgba(109,40,217,0.2)"}}>

                  {/* Animated shimmer top border */}
                  <div className="h-0.5 w-full"
                    style={{background:"linear-gradient(90deg,transparent,#7c3aed,#ec4899,#f59e0b,transparent)",
                      animation:"authBorderGlow 2s ease-in-out infinite alternate"}} />

                  <div className="p-7 sm:p-9">

                    {/* Card header */}
                    <div className="text-center mb-7">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
                        style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)",
                          boxShadow:"0 0 30px rgba(124,58,237,0.5)"}}>
                        <Sparkles className="h-8 w-8 text-white" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-30" />
                      </div>
                      <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight">
                        Join the Game
                      </h2>
                      <p className="text-gray-500 text-sm mt-1.5">
                        Create your account or sign in to start winning!
                      </p>
                      {/* Free tokens badge */}
                      <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full"
                        style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)"}}>
                        <img src={imgToken} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-yellow-300 text-xs font-black">Get 3 FREE Tokens on signup!</span>
                      </div>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex p-1 rounded-2xl mb-6"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                      {(["signup","login"] as const).map(tab=>(
                        <button key={tab} onClick={()=>setActiveTab(tab)}
                          className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-200"
                          style={activeTab===tab
                            ? {background:"linear-gradient(135deg,#7c3aed,#9333ea)",color:"#fff",
                               boxShadow:"0 0 20px rgba(124,58,237,0.4)"}
                            : {color:"#6b7280"}}>
                          {tab==="signup" ? "✨ Sign Up" : "🔑 Login"}
                        </button>
                      ))}
                    </div>

                    {/* Forms */}
                    <div style={{minHeight:"340px"}}>
                      {activeTab==="signup"
                        ? <ImprovedSignupForm
                            onSuccess={handleSignupSuccess}
                            onSwitchToLogin={()=>setActiveTab("login")} />
                        : <ImprovedLoginForm
                            onSuccess={()=>{ refetch(); setTimeout(()=>refetch(),100); }} />
                      }
                    </div>

                    {/* Switch link */}
                    <p className="text-center text-gray-600 text-sm mt-5">
                      {activeTab==="signup"
                        ? <>Already have an account?{" "}
                            <button onClick={()=>setActiveTab("login")} className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
                              Login here →
                            </button>
                          </>
                        : <>New here?{" "}
                            <button onClick={()=>setActiveTab("signup")} className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
                              Create a free account →
                            </button>
                          </>
                      }
                    </p>
                  </div>
                </div>

                {/* Bottom mobile prize chips */}
                <div className="lg:hidden mt-6 grid grid-cols-4 gap-2">
                  {[
                    {img:imgCash, label:"$500 Cash",  color:"#22c55e"},
                    {img:imgPs5,  label:"PS5",         color:"#818cf8"},
                    {img:imgTv,   label:"65\" TV",     color:"#a855f7"},
                    {img:imgVip,  label:"VIP",         color:"#f97316"},
                  ].map(({img,label,color},ci)=>(
                    <div key={ci} className="flex flex-col items-center gap-1 p-2 rounded-xl"
                      style={{background:`${color}12`,border:`1px solid ${color}30`}}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <img src={img} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-black text-center leading-tight" style={{color}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer strip */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
            style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            {[
              {icon:Zap,    t:"Instant Play",     c:"#10b981"},
              {icon:Trophy, t:"Real Prizes",      c:"#f59e0b"},
              {icon:Shield, t:"Safe & Secure",    c:"#8b5cf6"},
              {icon:Star,   t:"Auto Winner",      c:"#ec4899"},
            ].map(({icon:Icon,t,c})=>(
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                <Icon className="h-3 w-3" style={{color:c}} />{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <SignupSuccessPopup
        isOpen={showSignupPopup}
        onClose={()=>setShowSignupPopup(false)}
        onLoginNow={handleLoginFromPopup}
        userName={signupUserName}
      />
    </>
  );
}
