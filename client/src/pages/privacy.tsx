import { ArrowLeft, Shield, Eye, Lock, Database, Users, Globe, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoPath from "@assets/logo_1751918412862.png";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Privacy shield icons floating */}
        <div className="absolute top-36 right-24 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg animate-bounce shadow-lg shadow-green-500/50"></div>
        <div className="absolute bottom-36 left-20 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg animate-bounce delay-600 shadow-lg shadow-blue-500/50"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-gradient-to-r from-teal-400 to-green-500 rounded-lg animate-bounce delay-1100 shadow-lg shadow-teal-500/50"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-green-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-green-300 hover:bg-green-900/30">
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/40 mb-6 shadow-lg shadow-green-500/25">
            <Shield className="h-5 w-5 text-green-300 animate-pulse" />
            <span className="text-green-200 font-medium">Privacy Protection</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Privacy Policy
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="mt-4 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Information We Collect */}
        <Card className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border-blue-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-400" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Full name and email address</li>
                  <li>• Payment information (securely processed)</li>
                  <li>• Account preferences and settings</li>
                  <li>• Communication history with support</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Usage Information</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Game activity and spin history</li>
                  <li>• Device and browser information</li>
                  <li>• IP address and location data</li>
                  <li>• Session duration and interactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-xl border-green-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Eye className="h-6 w-6 mr-2 text-green-400" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Essential Services</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Process payments and transactions</li>
                  <li>• Maintain your account and preferences</li>
                  <li>• Provide customer support assistance</li>
                  <li>• Ensure platform security and safety</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Improvements & Communication</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Improve game features and user experience</li>
                  <li>• Send important account notifications</li>
                  <li>• Analyze usage patterns for optimization</li>
                  <li>• Comply with legal and regulatory requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Lock className="h-6 w-6 mr-2 text-purple-400" />
              Data Protection & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-300 mb-4">Security Measures</h3>
              <ul className="space-y-2 text-green-200">
                <li>• Industry-standard SSL encryption for all data transmission</li>
                <li>• Secure payment processing through trusted third-party providers</li>
                <li>• Regular security audits and vulnerability assessments</li>
                <li>• Access controls and employee training on data protection</li>
                <li>• Automatic session timeouts and secure authentication</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="bg-gradient-to-r from-orange-900/40 to-red-900/40 backdrop-blur-xl border-orange-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Users className="h-6 w-6 mr-2 text-orange-400" />
              Data Sharing & Third Parties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300 mb-1">We Do Not Sell Your Data</h4>
                  <p className="text-sm text-red-200">
                    We never sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Limited Sharing Only For:</h3>
              <ul className="space-y-2 text-white/90">
                <li>• Payment processing (with encrypted data only)</li>
                <li>• Legal compliance when required by law</li>
                <li>• Service providers who help operate our platform (under strict confidentiality)</li>
                <li>• Protection against fraud and security threats</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 backdrop-blur-xl border-teal-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <FileText className="h-6 w-6 mr-2 text-teal-400" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Access & Control</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Request a copy of your personal data</li>
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt out of marketing communications</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Data Portability</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• Export your game history and data</li>
                  <li>• Transfer data to another service</li>
                  <li>• Restrict processing of your information</li>
                  <li>• Object to automated decision-making</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies & Tracking */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Globe className="h-6 w-6 mr-2 text-blue-400" />
              Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90">
              We use cookies and similar technologies to enhance your experience, remember your preferences, 
              and analyze how our platform is used.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-2">Essential Cookies</h4>
                <p className="text-sm text-green-200">Required for basic functionality and security</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">Functional Cookies</h4>
                <p className="text-sm text-blue-200">Remember your preferences and settings</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-300 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-purple-200">Help us improve the platform (optional)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold text-white mb-4">Questions About Your Privacy?</h3>
            <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your data, 
              please don't hesitate to contact our privacy team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Contact Privacy Team
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20">
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