import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ImprovedSignupForm } from "@/components/auth/improved-signup-form";
import { ImprovedLoginForm } from "@/components/auth/improved-login-form";
import { SignupSuccessPopup } from "@/components/auth/signup-success-popup";
import { getQueryFn } from "@/lib/queryClient";
import logoPath   from "@assets/logo_1777237644041.png";
import imgTreasure from "@assets/hero-treasure.png";
import imgCash     from "@assets/prize-cash.png";
import imgPs5      from "@assets/prize-ps5.png";
import imgTv       from "@assets/prize-tv.png";
import imgVip      from "@assets/prize-vip.png";
import imgToken    from "@assets/prize-token.png";
import imgWheel    from "@assets/hero-wheel.png";
import { Trophy, Zap, Shield, CheckCircle, Star, Gift, Crown, Sparkles } from "lucide-react";

/* ─── Injected CSS ─────────────────────────────────────────────────────── */
const AUTH_CSS = `
/* Animations */
@keyframes af1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(3deg)}}
@keyframes af2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(-3deg)}}
@keyframes af3{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes aWheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes aShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes aFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes aPulseRing{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
@keyframes aBorderRotate{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes aCountUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes aGlowPulse{0%,100%{box-shadow:0 0 40px rgba(124,58,237,0.25)}50%{box-shadow:0 0 80px rgba(124,58,237,0.5),0 0 40px rgba(236,72,153,0.2)}}

/* Utility classes */
.af1{animation:af1 5s ease-in-out infinite}
.af2{animation:af2 6.5s ease-in-out infinite}
.af3{animation:af3 4s ease-in-out infinite}
.a-wheel{animation:aWheelSpin 22s linear infinite}
.a-shimmer-gold{background:linear-gradient(90deg,#f59e0b,#fbbf24,#f97316,#fbbf24,#f59e0b);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:aShimmer 3.5s linear infinite}
.a-shimmer-purple{background:linear-gradient(90deg,#a78bfa,#e879f9,#818cf8,#e879f9,#a78bfa);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:aShimmer 4s linear infinite}
.a-fade-up{animation:aFadeUp .65s ease forwards}
.a-glow-pulse{animation:aGlowPulse 3s ease-in-out infinite}

/* Rotating border on card */
.auth-card-wrap{position:relative;border-radius:1.5rem}
.auth-card-wrap::before{content:'';position:absolute;inset:-2px;border-radius:calc(1.5rem + 2px);background:linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b,#7c3aed);background-size:300% 300%;animation:aBorderRotate 5s ease infinite;z-index:0}
.auth-card-inner{position:relative;z-index:1;border-radius:1.5rem;overflow:hidden}

/* Input overrides */
.auth-form-area input{
  background:rgba(255,255,255,0.055) !important;
  border:1.5px solid rgba(139,92,246,0.35) !important;
  color:#fff !important;
  transition:all .2s ease !important;
}
.auth-form-area input:focus{
  background:rgba(255,255,255,0.09) !important;
  border-color:rgba(124,58,237,0.75) !important;
  box-shadow:0 0 0 3px rgba(124,58,237,0.18),0 0 18px rgba(124,58,237,0.2) !important;
  outline:none !important;
}
.auth-form-area input::placeholder{color:rgba(156,163,175,.5) !important}

/* Button overrides — signup CTA → gold */
.auth-form-area.is-signup button[type="submit"]{
  background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%) !important;
  box-shadow:0 0 35px rgba(245,158,11,.45),0 8px 25px rgba(249,115,22,.3) !important;
  color:#000 !important;
  font-weight:900 !important;
  border:none !important;
  transition:transform .15s ease,box-shadow .15s ease !important;
}
.auth-form-area.is-signup button[type="submit"]:hover:not(:disabled){
  transform:scale(1.03) !important;
  box-shadow:0 0 50px rgba(245,158,11,.6),0 10px 30px rgba(249,115,22,.4) !important;
}

/* Button overrides — login CTA → violet-to-pink */
.auth-form-area.is-login button[type="submit"]{
  background:linear-gradient(135deg,#7c3aed 0%,#ec4899 100%) !important;
  box-shadow:0 0 35px rgba(124,58,237,.45),0 8px 25px rgba(236,72,153,.25) !important;
  color:#fff !important;
  font-weight:900 !important;
  border:none !important;
  transition:transform .15s ease,box-shadow .15s ease !important;
}
.auth-form-area.is-login button[type="submit"]:hover:not(:disabled){
  transform:scale(1.03) !important;
  box-shadow:0 0 50px rgba(124,58,237,.6),0 10px 30px rgba(236,72,153,.35) !important;
}

/* Label color */
.auth-form-area label{color:rgba(209,213,219,.9) !important}

/* Age checkbox row */
.auth-form-area .p-4.bg-gradient-to-r{
  background:rgba(124,58,237,0.08) !important;
  border-color:rgba(139,92,246,0.3) !important;
}

/* Floating prize coin */
.prize-coin{
  position:absolute;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:3px;
  padding:8px 10px;
  border-radius:14px;
  backdrop-filter:blur(10px);
  font-weight:900;
  font-size:11px;
  pointer-events:none;
  z-index:4;
}
`;

/* ─── Jackpot counter (animates up) ──────────────────────────────────── */
function JackpotCounter() {
  const [val, setVal] = useState(127450);
  useEffect(() => {
    const id = setInterval(() => setVal(v => v + Math.floor(Math.random() * 12 + 3)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-2xl px-5 py-3 flex items-center gap-4"
      style={{background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.08))",
              border:"1px solid rgba(245,158,11,0.3)"}}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 0 20px rgba(245,158,11,0.5)"}}>
        <Trophy className="h-5 w-5 text-black" />
      </div>
      <div>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Paid Out</p>
        <p className="font-black text-xl leading-none"
          style={{color:"#fbbf24",textShadow:"0 0 20px rgba(245,158,11,0.6)"}}>
          ${val.toLocaleString()}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 text-xs font-bold">LIVE</span>
      </div>
    </div>
  );
}


/* ─── Main Page ───────────────────────────────────────────────────────── */
export default function AuthLandingPage() {
  const refFromUrl = new URLSearchParams(window.location.search).get("ref") || "";
  const [activeTab, setActiveTab]             = useState<"signup"|"login">(refFromUrl ? "signup" : "signup");
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupUserName, setSignupUserName]   = useState("");
  const [, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  React.useEffect(() => {
    if (user && typeof user === "object") setLocation("/games");
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{background:"linear-gradient(135deg,#1a0533,#0f0628)"}}>
        <div className="relative">
          <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 rounded-full" style={{boxShadow:"0 0 30px rgba(124,58,237,0.6)"}} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: AUTH_CSS}} />

      <div className="min-h-screen relative overflow-hidden"
        style={{background:"linear-gradient(135deg,#180430 0%,#0e0626 40%,#1c0b42 70%,#110426 100%)"}}>

        {/* ── BACKGROUND ──────────────────────────────────────────── */}
        {/* Strong glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full af1" style={{width:800,height:800,top:-250,left:-250,background:"radial-gradient(circle,rgba(124,58,237,0.52) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full af2" style={{width:650,height:650,top:"5%",right:-200,background:"radial-gradient(circle,rgba(236,72,153,0.38) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full af3" style={{width:550,height:550,bottom:-130,left:"25%",background:"radial-gradient(circle,rgba(245,158,11,0.2) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full" style={{width:400,height:400,top:"40%",left:"18%",background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)"}} />
        </div>

        {/* Spinning wheel — decorative background element */}
        <div className="absolute pointer-events-none" style={{top:"-8%",right:"-10%",width:"55vw",maxWidth:700,opacity:.07}}>
          <img src={imgWheel} alt="" className="w-full h-full object-contain a-wheel"
            style={{filter:"saturate(2) hue-rotate(270deg)"}} />
        </div>

        {/* Neon grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(139,92,246,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.1) 1px,transparent 1px)",backgroundSize:"75px 75px"}} />

        {/* Top rainbow bar */}
        <div className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
          style={{background:"linear-gradient(90deg,transparent,#7c3aed 20%,#ec4899 50%,#f59e0b 80%,transparent)"}} />

        {/* Floating neon dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            {s:8, top:"10%",left:"5%",   c:"#a78bfa",a:"af1"},
            {s:5, top:"60%",left:"2%",   c:"#f472b6",a:"af2"},
            {s:7, top:"82%",left:"8%",   c:"#fbbf24",a:"af3"},
            {s:4, top:"28%",left:"42%",  c:"#34d399",a:"af1"},
            {s:8, top:"72%",left:"55%",  c:"#818cf8",a:"af2"},
            {s:5, top:"6%", left:"80%",  c:"#fb923c",a:"af3"},
            {s:6, top:"55%",left:"94%",  c:"#c084fc",a:"af1"},
            {s:4, top:"38%",left:"88%",  c:"#f472b6",a:"af2"},
          ].map((p,i) => (
            <div key={i} className={`absolute rounded-full ${p.a}`}
              style={{width:p.s,height:p.s,top:p.top,left:p.left,background:p.c,
                      boxShadow:`0 0 ${p.s*5}px ${p.c}`,opacity:.8}} />
          ))}
        </div>

        {/* ── LAYOUT ──────────────────────────────────────────────── */}
        <div className="relative z-10 min-h-screen flex flex-col">

          {/* Top nav */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4">
            <img src={logoPath} alt="Prize Plugz" className="h-9 sm:h-11 w-auto drop-shadow-lg" />
          </div>

          {/* Main body */}
          <div className="flex-1 flex items-center px-4 sm:px-8 py-4 sm:py-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-14 items-center">

              {/* ── LEFT ─────────────────────────────────────────── */}
              <div className="hidden lg:flex flex-col gap-5 a-fade-up">

                {/* Headline */}
                <div>
                  <p className="text-violet-400 text-xs font-black tracking-[0.4em] uppercase mb-2 flex items-center gap-2">
                    <span className="w-6 h-px bg-violet-400" />PRIZE PLUGZ<span className="w-6 h-px bg-violet-400" />
                  </p>
                  <h1 className="font-black leading-[0.86] tracking-tighter"
                    style={{fontSize:"clamp(3rem,4.5vw,5rem)"}}>
                    <span className="text-white block">YOUR NEXT</span>
                    <span className="a-shimmer-gold block">BIG WIN</span>
                    <span className="text-white block">STARTS HERE.</span>
                  </h1>
                  <p className="text-gray-500 text-base mt-4 max-w-md leading-relaxed">
                    Buy tokens, watch the jackpot fill live, and walk away with{" "}
                    <span className="text-gray-200 font-semibold">real cash & amazing prizes</span>.
                    100% transparent — auto winner every time.
                  </p>
                </div>

                {/* Live jackpot counter */}
                <JackpotCounter />

                {/* Treasure showcase card */}
                <div className="relative rounded-2xl overflow-hidden"
                  style={{background:"linear-gradient(145deg,rgba(16,12,40,0.95),rgba(22,14,55,0.95))",
                          border:"1px solid rgba(139,92,246,0.4)",
                          boxShadow:"0 0 50px rgba(109,40,217,0.2),0 20px 60px rgba(0,0,0,0.5)"}}>

                  {/* Floating prize coins over the image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={imgTreasure} alt="" className="w-full h-full object-cover af3"
                      style={{filter:"saturate(1.5) brightness(1.1)"}} />
                    <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 35%,rgba(16,12,40,1) 100%)"}} />

                    {/* Floating $ badges */}
                    {[
                      {val:"$500", top:"12%", left:"5%",  bg:"rgba(34,197,94,0.2)",  bd:"rgba(34,197,94,0.5)",  c:"#86efac"},
                      {val:"$1K",  top:"8%",  left:"38%", bg:"rgba(245,158,11,0.2)", bd:"rgba(245,158,11,0.5)", c:"#fde68a"},
                      {val:"PS5",  top:"14%", right:"8%", bg:"rgba(129,140,248,0.2)",bd:"rgba(129,140,248,0.5)",c:"#c7d2fe"},
                    ].map((b,i)=>(
                      <div key={i} className={`prize-coin af${(i%3)+1}`}
                        style={{top:b.top,left:b.left,right:b.right,
                                background:b.bg,border:`1px solid ${b.bd}`,
                                boxShadow:`0 0 15px ${b.bd}`,color:b.c}}>
                        {b.val}
                      </div>
                    ))}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{background:"rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.5)"}}>
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 text-[10px] font-black tracking-wider">LIVE JACKPOT</span>
                    </div>
                  </div>

                  {/* Prize chips */}
                  <div className="p-3.5 grid grid-cols-4 gap-2.5">
                    {[
                      {img:imgCash, label:"$500 Cash", color:"#22c55e"},
                      {img:imgPs5,  label:"PS5",        color:"#818cf8"},
                      {img:imgTv,   label:"65\" TV",    color:"#a855f7"},
                      {img:imgVip,  label:"VIP Pack",  color:"#f97316"},
                    ].map(({img,label,color},ci)=>(
                      <div key={ci} className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-transform hover:scale-105 cursor-pointer"
                        style={{background:`${color}15`,border:`1px solid ${color}35`}}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                          <img src={img} alt={label} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-black text-center leading-tight" style={{color}}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Big prize feature cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {img:imgCash, label:"$500 Cash Prize",  sub:"Instant transfer",   color:"#22c55e", glow:"rgba(34,197,94,0.25)"},
                    {img:imgPs5,  label:"PlayStation 5",    sub:"Brand new console",  color:"#818cf8", glow:"rgba(129,140,248,0.25)"},
                    {img:imgTv,   label:"65\" Smart TV",    sub:"4K Ultra HD",        color:"#a855f7", glow:"rgba(168,85,247,0.25)"},
                    {img:imgVip,  label:"VIP Pack",         sub:"Exclusive rewards",  color:"#f97316", glow:"rgba(249,115,22,0.25)"},
                  ].map(({img,label,sub,color,glow},ci)=>(
                    <div key={ci} className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                      style={{background:`linear-gradient(145deg,rgba(16,12,40,0.9),rgba(22,14,55,0.9))`,
                              border:`1px solid ${color}35`,
                              boxShadow:`0 0 20px ${glow}`}}>
                      <div className="h-28 overflow-hidden">
                        <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{filter:"saturate(1.3) brightness(1.05)"}} />
                        <div className="absolute inset-0" style={{background:`linear-gradient(to bottom,transparent 40%,rgba(16,12,40,0.95) 100%)`}} />
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="font-black text-sm leading-tight" style={{color}}>{label}</p>
                        <p className="text-gray-600 text-[10px] mt-0.5">{sub}</p>
                      </div>
                      {/* Corner glow */}
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{background:color,boxShadow:`0 0 8px ${color}`}} />
                    </div>
                  ))}
                </div>

                {/* Feature badges row */}
                <div className="flex flex-wrap gap-2">
                  {[
                    {icon:Zap,         t:"Instant Results",     c:"#10b981"},
                    {icon:Shield,      t:"100% Transparent",    c:"#818cf8"},
                    {icon:CheckCircle, t:"Auto Winner",         c:"#f59e0b"},
                    {icon:Gift,        t:"Free Welcome Tokens", c:"#ec4899"},
                  ].map(({icon:Icon,t,c})=>(
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#9ca3af"}}>
                      <Icon className="h-3 w-3" style={{color:c}} />{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── RIGHT — Auth card ─────────────────────────────── */}
              <div className="w-full a-fade-up" style={{animationDelay:".1s"}}>

                {/* Mobile header */}
                <div className="lg:hidden text-center mb-5">
                  <h1 className="font-black text-3xl a-shimmer-gold mb-1">PRIZE PLUGZ</h1>
                  <p className="text-gray-500 text-sm">Spin. Win. Repeat.</p>
                </div>

                {/* Rotating border wrapper */}
                <div className="auth-card-wrap a-glow-pulse">
                  <div className="auth-card-inner"
                    style={{background:"linear-gradient(145deg,#0f0c22,#180f38)"}}>

                    {/* Inner top shimmer line */}
                    <div className="h-px w-full"
                      style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.8),rgba(236,72,153,0.6),rgba(245,158,11,0.5),transparent)"}} />

                    <div className="p-6 sm:p-8">

                      {/* Card header */}
                      <div className="text-center mb-6">
                        <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                          style={{background:"linear-gradient(135deg,#7c3aed,#ec4899)",
                                  boxShadow:"0 0 30px rgba(124,58,237,0.55),0 0 60px rgba(236,72,153,0.2)"}}>
                          <Sparkles className="h-7 w-7 text-white" />
                          <span className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-25" />
                        </div>
                        <h2 className="text-white font-black text-2xl sm:text-3xl">Join the Game</h2>
                        <p className="text-gray-600 text-sm mt-1">Create your account or sign in to start winning!</p>
                        {/* Free tokens pill */}
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full"
                          style={{background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.08))",
                                  border:"1px solid rgba(245,158,11,0.35)",
                                  boxShadow:"0 0 20px rgba(245,158,11,0.15)"}}>
                          <img src={imgToken} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-yellow-300 text-xs font-black tracking-wide">✨ Get 10 FREE Tokens on signup!</span>
                        </div>
                      </div>

                      {/* Tab switcher */}
                      <div className="flex p-1 rounded-2xl mb-5"
                        style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.07)"}}>
                        {(["signup","login"] as const).map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2"
                            style={activeTab === tab
                              ? {background:tab==="signup"
                                  ? "linear-gradient(135deg,#f59e0b,#f97316)"
                                  : "linear-gradient(135deg,#7c3aed,#ec4899)",
                                 color: tab==="signup" ? "#000" : "#fff",
                                 boxShadow: tab==="signup"
                                   ? "0 0 25px rgba(245,158,11,0.45)"
                                   : "0 0 25px rgba(124,58,237,0.45)"}
                              : {color:"#4b5563"}}>
                            {tab === "signup"
                              ? <><Sparkles className="h-3.5 w-3.5" />Sign Up</>
                              : <><Zap className="h-3.5 w-3.5" />Login</>}
                          </button>
                        ))}
                      </div>

                      {/* Forms */}
                      <div className={`auth-form-area ${activeTab === "signup" ? "is-signup" : "is-login"}`}>
                        {activeTab === "signup"
                          ? <ImprovedSignupForm
                              onSuccess={name => { setSignupUserName(name); setShowSignupPopup(true); }}
                              onSwitchToLogin={() => setActiveTab("login")}
                              initialReferralCode={refFromUrl} />
                          : <ImprovedLoginForm
                              onSuccess={() => { refetch(); setTimeout(() => refetch(), 100); }} />
                        }
                      </div>

                      {/* Switch link */}
                      <p className="text-center text-gray-700 text-xs mt-4">
                        {activeTab === "signup"
                          ? <>Already have an account?{" "}
                              <button onClick={() => setActiveTab("login")}
                                className="font-black transition-colors"
                                style={{color:"#a78bfa"}}>Login →</button>
                            </>
                          : <>New here?{" "}
                              <button onClick={() => setActiveTab("signup")}
                                className="font-black transition-colors"
                                style={{color:"#fb923c"}}>Create free account →</button>
                            </>
                        }
                      </p>
                    </div>

                    {/* Bottom bar */}
                    <div className="px-6 py-3 flex justify-center gap-4 flex-wrap"
                      style={{borderTop:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.2)"}}>
                      {[
                        {icon:Shield,      t:"Secure",  c:"#8b5cf6"},
                        {icon:Zap,         t:"Instant", c:"#10b981"},
                        {icon:Trophy,      t:"Real Prizes",c:"#f59e0b"},
                        {icon:CheckCircle, t:"Auto Win",c:"#ec4899"},
                      ].map(({icon:Icon,t,c}) => (
                        <span key={t} className="flex items-center gap-1 text-[10px] font-semibold" style={{color:"#4b5563"}}>
                          <Icon className="h-2.5 w-2.5" style={{color:c}} />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile prize chips */}
                <div className="lg:hidden mt-4 grid grid-cols-4 gap-2">
                  {[
                    {img:imgCash, label:"$500",  color:"#22c55e"},
                    {img:imgPs5,  label:"PS5",   color:"#818cf8"},
                    {img:imgTv,   label:"TV",    color:"#a855f7"},
                    {img:imgVip,  label:"VIP",   color:"#f97316"},
                  ].map(({img,label,color},ci) => (
                    <div key={ci} className="flex flex-col items-center gap-1 p-2 rounded-xl"
                      style={{background:`${color}12`,border:`1px solid ${color}30`}}>
                      <div className="w-9 h-9 rounded-lg overflow-hidden">
                        <img src={img} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-black" style={{color}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <SignupSuccessPopup
        isOpen={showSignupPopup}
        onClose={() => setShowSignupPopup(false)}
        onLoginNow={() => { setShowSignupPopup(false); setActiveTab("login"); }}
        userName={signupUserName}
      />
    </>
  );
}
