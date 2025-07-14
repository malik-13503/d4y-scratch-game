import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Trophy, 
  DollarSign, 
  Gift, 
  AlertCircle, 
  CheckCircle,
  Crown,
  Star,
  Shield,
  Clock
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function PrizeRules() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating coins animation */}
        <div className="absolute top-32 left-24 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-bounce shadow-lg shadow-yellow-500/50"></div>
        <div className="absolute top-48 right-32 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-bounce delay-700 shadow-lg shadow-orange-500/50"></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-bounce delay-1200 shadow-lg shadow-red-500/50"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-purple-900/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Hit The Road Jackpot" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Prize Rules</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600/30 to-orange-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-amber-400/40 mb-6 shadow-lg shadow-amber-500/25">
            <Trophy className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="text-amber-200 font-medium">Prize Information</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Prize Rules & Policies
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Everything you need to know about our prizes, payment system, and game policies.
          </p>
        </div>

        {/* Pricing Structure */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-400" />
              Pricing Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/80 rounded-xl p-6 border border-slate-500/30">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-8 w-8 text-blue-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Regular Numbers</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Number Range:</span>
                    <Badge variant="secondary">1 - 150</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Cost:</span>
                    <span className="text-blue-300 font-semibold">$Number Value</span>
                  </div>
                  <div className="bg-slate-700/80 border border-slate-500/30 rounded-lg p-3 mt-4">
                    <p className="text-sm text-gray-200 mb-2">Examples:</p>
                    <ul className="text-sm text-gray-200 space-y-1">
                      <li>• Number 25 = $25.00</li>
                      <li>• Number 75 = $75.00</li>
                      <li>• Number 150 = $150.00</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/80 rounded-xl p-6 border border-slate-500/30">
                <div className="flex items-center mb-4">
                  <Gift className="h-8 w-8 text-green-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Free Play Zone</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Number Range:</span>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300">151 - 200</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Cost:</span>
                    <span className="text-green-300 font-semibold">$0.00 - FREE!</span>
                  </div>
                  <div className="bg-slate-700/80 border border-slate-500/30 rounded-lg p-3 mt-4">
                    <p className="text-sm text-gray-200 mb-2">Benefits:</p>
                    <ul className="text-sm text-gray-200 space-y-1">
                      <li>• No charge for any spin</li>
                      <li>• Perfect for practice</li>
                      <li>• Still win the same prizes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-purple-400" />
              Game Rules & Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Fair Play Guarantee",
                  description: "All spins are completely random using secure algorithms. No manipulation possible.",
                  icon: <CheckCircle className="h-6 w-6 text-green-400" />,
                  type: "success"
                },
                {
                  title: "One Spin = One Number",
                  description: "Each spin gives you exactly one number. You pay only for what you land on.",
                  icon: <Star className="h-6 w-6 text-blue-400" />,
                  type: "info"
                },
                {
                  title: "Instant Results",
                  description: "Results are processed immediately. No waiting periods or delays.",
                  icon: <Clock className="h-6 w-6 text-yellow-400" />,
                  type: "warning"
                },
                {
                  title: "Prize Delivery",
                  description: "Physical prizes are shipped within 5-7 business days after winning.",
                  icon: <Trophy className="h-6 w-6 text-orange-400" />,
                  type: "info"
                }
              ].map((rule, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {rule.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{rule.title}</h3>
                      <p className="text-sm text-white/80">{rule.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Crown className="h-6 w-6 mr-2 text-emerald-400" />
              Payment & Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-200">Credit & Debit Cards</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-200">PayPal</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-200">Apple Pay & Google Pay</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-200">Bank Transfer</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Refund Policy</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-300 mb-1">No Refunds</h4>
                        <p className="text-sm text-red-200">
                          All spins are final. No refunds are provided once a spin is completed.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-300 mb-1">Technical Issues</h4>
                        <p className="text-sm text-yellow-200">
                          If technical problems prevent proper gameplay, contact support for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-red-400" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Age Requirement",
                  description: "Must be 18 or older to participate in paid games.",
                  icon: <Shield className="h-5 w-5 text-red-400" />
                },
                {
                  title: "Responsible Gaming",
                  description: "Play responsibly. Set limits and know when to stop.",
                  icon: <AlertCircle className="h-5 w-5 text-yellow-400" />
                },
                {
                  title: "Account Security",
                  description: "Keep your account secure. Don't share login credentials.",
                  icon: <Shield className="h-5 w-5 text-blue-400" />
                },
                {
                  title: "Prize Availability",
                  description: "Prizes are subject to availability. Alternative prizes may be offered.",
                  icon: <Trophy className="h-5 w-5 text-purple-400" />
                }
              ].map((note, index) => (
                <div key={index} className="bg-slate-700/80 border border-slate-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {note.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{note.title}</h3>
                      <p className="text-sm text-gray-200">{note.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-700/80 rounded-lg p-6 border border-slate-500/30 mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Questions?</h3>
              <p className="text-gray-200 mb-4">
                If you have any questions about our prize rules or need clarification on any policy, 
                please don't hesitate to contact our support team.
              </p>
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}