import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Zap, 
  Play, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Wifi, 
  Clock, 
  Shield, 
  CheckCircle,
  Star,
  Rocket
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function InstantPlay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating lightning bolts */}
        <div className="absolute top-40 left-20 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-60 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-purple-700/20 hover:text-purple-200">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
              <img src={logoPath} alt="Hit The Road Jackpot" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Hit The Road Jackpot</h1>
                <p className="text-sm text-purple-200">Win Big, Play Smart</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-500/30 mb-6">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span className="text-yellow-200 font-medium">Instant Gaming</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            Play Instantly
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            No downloads, no waiting, no hassle. Jump straight into the action with our instant play technology.
          </p>
        </div>

        {/* Key Benefits */}
        <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Rocket className="h-6 w-6 mr-2 text-purple-400" />
              Why Instant Play?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">No Downloads Required</h3>
                  <p className="text-white/70">Play directly in your browser without installing any software or apps.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Lightning Fast</h3>
                  <p className="text-white/70">Games load in seconds with our optimized web technology.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Cross-Platform</h3>
                  <p className="text-white/70">Works perfectly on desktop, mobile, and tablet devices.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Always Updated</h3>
                  <p className="text-white/70">Get the latest features and improvements automatically.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Compatibility */}
        <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-xl border-blue-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Monitor className="h-6 w-6 mr-2 text-blue-400" />
              Play on Any Device
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Desktop</h3>
                <p className="text-white/70">Full-screen gaming experience with keyboard shortcuts and precision controls.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mobile</h3>
                <p className="text-white/70">Touch-optimized interface perfect for gaming on the go.</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Tablet className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tablet</h3>
                <p className="text-white/70">Perfect balance of screen size and portability for comfortable gaming.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Requirements */}
        <Card className="bg-gradient-to-r from-green-900/40 to-teal-900/40 backdrop-blur-xl border-green-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-400" />
              Technical Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Minimum Requirements</h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Stable internet connection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>JavaScript enabled</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>1GB RAM or higher</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recommended</h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Latest browser version</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>High-speed broadband</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Hardware acceleration enabled</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>4GB RAM or higher</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Play?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              It's that simple! Just click the button below and start spinning. No registration, no downloads, 
              no waiting - just instant fun and real prizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg">
                  <Zap className="h-5 w-5 mr-2" />
                  Play Now
                </Button>
              </Link>
              <Link href="/how-to-play">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 py-3 px-8 rounded-xl text-lg">
                  Learn How to Play
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}