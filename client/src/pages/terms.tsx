import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Scale, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Lock,
  Globe,
  UserCheck
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-indigo-800 to-blue-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Legal document icons floating */}
        <div className="absolute top-36 right-24 w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg animate-bounce shadow-lg shadow-violet-500/50"></div>
        <div className="absolute bottom-36 left-20 w-6 h-6 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-lg animate-bounce delay-600 shadow-lg shadow-indigo-500/50"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg animate-bounce delay-1100 shadow-lg shadow-blue-500/50"></div>
        <div className="absolute bottom-1/3 left-1/4 w-5 h-5 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg animate-bounce delay-1600 shadow-lg shadow-purple-500/50"></div>
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-violet-400/40 mb-6 shadow-lg shadow-violet-500/25">
            <Scale className="h-5 w-5 text-violet-300 animate-pulse" />
            <span className="text-violet-200 font-medium">Legal Information</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Terms & Conditions
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Please read these terms carefully before using our spinning wheel game platform.
          </p>
          <div className="mt-4 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Agreement */}
        <Card className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 backdrop-blur-xl border-violet-400/40 shadow-2xl shadow-violet-500/25 mb-8 hover:shadow-violet-500/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-400" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/90">
            <p className="text-lg">
              By accessing and using Hit The Road Jackpot ("the Service"), you accept and agree to be bound by 
              the terms and provision of this agreement.
            </p>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-300 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-200">
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 backdrop-blur-xl border-indigo-400/40 shadow-2xl shadow-indigo-500/25 mb-8 hover:shadow-indigo-500/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <UserCheck className="h-6 w-6 mr-2 text-green-400" />
              User Accounts & Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Age Requirement</h4>
                      <p className="text-sm text-white/80">Must be 18 years or older</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Valid Information</h4>
                      <p className="text-sm text-white/80">Provide accurate personal details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Account Security</h4>
                      <p className="text-sm text-white/80">Maintain password confidentiality</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Prohibited Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Multiple Accounts</h4>
                      <p className="text-sm text-white/80">One account per person only</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Account Sharing</h4>
                      <p className="text-sm text-white/80">Do not share login credentials</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Automated Systems</h4>
                      <p className="text-sm text-white/80">No bots or automated gameplay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-purple-400" />
              Game Rules & Fair Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-white mb-4">Game Integrity</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>All game outcomes are determined by certified random number generators</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>No manipulation of game results by players or administrators</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>All spins are final and cannot be reversed or replayed</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Technical issues will be resolved fairly and transparently</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">Fair Play Guarantee</h4>
              <p className="text-blue-200 text-sm">
                We are committed to providing a fair and transparent gaming experience. 
                All game mechanics are audited regularly to ensure compliance with fair play standards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="bg-gradient-to-r from-orange-900/40 to-red-900/40 backdrop-blur-xl border-orange-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Lock className="h-6 w-6 mr-2 text-orange-400" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Payment Processing</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Charges are processed immediately upon spin completion</li>
                  <li>• All transactions are secured with industry-standard encryption</li>
                  <li>• Payment receipts are sent via email automatically</li>
                  <li>• Multiple payment methods accepted for your convenience</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Refund Policy</h3>
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-300 mb-2">No Refunds</h4>
                  <p className="text-red-200 text-sm">
                    All game purchases are final. Refunds are not provided except in cases of 
                    technical errors that prevent proper game completion.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 backdrop-blur-xl border-teal-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Globe className="h-6 w-6 mr-2 text-teal-400" />
              Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-white mb-4">Data Collection</h3>
              <p className="text-white/90 mb-4">
                We collect and process personal information necessary for providing our services, including:
              </p>
              <ul className="space-y-2 text-white/90 mb-6">
                <li>• Account information (name, email, age verification)</li>
                <li>• Payment information (processed securely by third-party providers)</li>
                <li>• Game activity and transaction history</li>
                <li>• Technical data for security and optimization purposes</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-white mb-4">Data Protection</h3>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  Your privacy is important to us. We implement industry-standard security measures 
                  to protect your personal information and never sell your data to third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="bg-gradient-to-r from-gray-900/40 to-slate-900/40 backdrop-blur-xl border-gray-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Scale className="h-6 w-6 mr-2 text-gray-400" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/90 mb-4">
                Hit The Road Jackpot and its affiliates shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses.
              </p>
              
              <h3 className="text-lg font-semibold text-white mb-4">Service Availability</h3>
              <ul className="space-y-2 text-white/90">
                <li>• We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>• Scheduled maintenance may temporarily affect service availability</li>
                <li>• Technical issues beyond our control may impact gameplay</li>
                <li>• We reserve the right to modify or discontinue services with notice</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border-indigo-500/30 shadow-2xl">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms & Conditions, please contact our legal team. 
              We're here to help clarify any concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Contact Legal Team
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}