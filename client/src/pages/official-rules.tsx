import {
  ArrowLeft,
  Scale,
  AlertTriangle,
  Clock,
  Trophy,
  MapPin,
  Shield,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo_1777237644041.png";

export default function OfficialRules() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-spin-slow"></div>

        {/* Legal gavel icons floating */}
        <div className="absolute top-36 right-24 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg animate-bounce shadow-lg shadow-amber-500/50"></div>
        <div className="absolute bottom-36 left-20 w-6 h-6 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg animate-bounce delay-600 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg animate-bounce delay-1100 shadow-lg shadow-purple-500/50"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-amber-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:text-amber-300 hover:bg-amber-900/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <img
                src={logoPath}
                alt="Prize Plugz"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Official Rules
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-amber-400/40 mb-6 shadow-lg shadow-amber-500/25">
            <Scale className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="text-amber-200 font-medium">
              Legal Documentation
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Official Rules
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Prize Plugz™ Giveaway
          </h3>
          <div className="bg-black-500/20 border border-red-500/30 rounded-lg p-4 max-w-3xl mx-auto mb-6">
            <p className="text-red-200 font-semibold text-lg">
              NO PURCHASE NECESSARY TO ENTER OR WIN.
            </p>
            <p className="text-red-200 text-sm mt-2">
              A PURCHASE WILL NOT IMPROVE YOUR CHANCES OF WINNING. THIS
              PROMOTION IS NOT AFFILIATED WITH, SPONSORED BY, OR ENDORSED BY
              META, INSTAGRAM, TIKTOK, GOOGLE, X (FORMERLY TWITTER), OR ANY
              OTHER SOCIAL MEDIA PLATFORM.
            </p>
          </div>
        </div>

        {/* Eligibility */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-blue-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-blue-400" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90 text-lg">
              This Giveaway is open only to legal residents of the 48 contiguous
              U.S. states and D.C., aged 18 or older, with a valid
              government-issued ID. Void where prohibited or restricted by law.
            </p>
          </CardContent>
        </Card>

        {/* Giveaway Period */}
        <Card className="bg-gradient-to-r from-pistagreen-500/40 to-emerald-200/40 backdrop-blur-xl border-green-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Clock className="h-6 w-6 mr-2 text-green-400" />
              Giveaway Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90">
              Each Giveaway (the "Game") runs for a limited period of 1 to 7
              days as displayed on the official game listing at
              www.HitTheRoadJackpot.com. The start and end times are listed on
              each individual game page and governed by Eastern Time (ET).
              Winners are drawn shortly after each game closes.
            </p>
          </CardContent>
        </Card>

        {/* How to Enter */}
        <Card className="bg-gradient-to-r from-black-900/40 to-violet-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-400" />
              How to Enter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">
                    1. Paid Entry
                  </h3>
                  <p className="text-blue-200 text-sm">
                    Players can enter by participating in a game on
                    www.HitTheRoadJackpot.com. Entry is based on the number
                    drawn by our automated spinner. Each number pulled equals
                    the amount in dollars for that entry.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">
                    2. No Purchase Necessary Entry (NPN)
                  </h3>
                  <p className="text-green-200 text-sm">
                    To enter without making a purchase, visit the game page and
                    click the "No Purchase Entry" button. You may submit one (1)
                    no-purchase entry per game.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Winner Selection */}
        <Card className="bg-gradient-to-r from-black-900/40 to-red-900/40 backdrop-blur-xl border-orange-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-orange-400" />
              Winner Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90">
              Winners are selected via a randomized draw using a secure
              third-party system. Odds of winning depend on the number of total
              eligible entries per game. Each prize must be claimed within 72
              hours of notification.
            </p>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card className="bg-slate-800/90 from-yellow-900/40 to-amber-900/40 backdrop-blur-xl border-yellow-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
              Prizes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90">
              Prizes vary per game and are visible on the game page. Winners are
              responsible for all taxes, title, registration, and shipping costs
              (if applicable).
            </p>
          </CardContent>
        </Card>

        {/* State Exclusions */}
        <Card className="bg-gradient-to-r from-black-900/40 to-pink-900/40 backdrop-blur-xl border-red-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-red-400" />
              State Exclusions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300 mb-3">
                    Excluded States
                  </h4>
                  <p className="text-red-200 text-sm mb-4">
                    Participation is void in jurisdictions that require
                    registration or bonding for sweepstakes exceeding certain
                    prize values. To maintain compliance and operate without
                    bonding requirements, the following states are excluded from
                    participating:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Badge
                      variant="destructive"
                      className="bg-red-600/30 text-red-200"
                    >
                      New York (prizes over $5,000)
                    </Badge>
                    <Badge
                      variant="destructive"
                      className="bg-red-600/30 text-red-200"
                    >
                      Florida (prizes over $5,000)
                    </Badge>
                    <Badge
                      variant="destructive"
                      className="bg-red-600/30 text-red-200"
                    >
                      Rhode Island (retail over $500)
                    </Badge>
                    <Badge
                      variant="destructive"
                      className="bg-red-600/30 text-red-200"
                    >
                      Hawaii (fully excluded)
                    </Badge>
                  </div>
                  <p className="text-red-200 text-sm mt-4">
                    Residents of these states are not eligible to enter or win
                    any Giveaway or prize offered by Prize Plugz™.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Conditions */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-400" />
              General Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-white/90">
              <li>
                • Prize Plugz™ may cancel or modify any game due to
                fraud or issues affecting fairness
              </li>
              <li>• Tampering or bot usage leads to disqualification</li>
              <li>
                • Entrants release Prize Plugz™ from any liability
                arising from participation or prize acceptance
              </li>
              <li>
                • By entering, you agree to the use of your information for game
                administration and winner contact as outlined in our Privacy
                Policy
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <Card className="bg-gradient-to-r from-black-900/40 to-cyan-900/40 backdrop-blur-xl border-teal-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Scale className="h-6 w-6 mr-2 text-teal-400" />
              Legal Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 font-semibold">
                This is a legal promotional game of chance, not gambling. Every
                game includes a free entry method. Excludes states requiring
                bonding or registration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Winner Announcement */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-amber-400" />
              Winner Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90">
              Winners are posted within 24-48 hours of each game's end on
              www.HitTheRoadJackpot.com.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Questions About These Rules?
            </h3>
            <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Official Rules or any of our
              giveaways, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Contact Support
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-amber-500/30 text-black-300 hover:bg-white-500/20"
                >
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
