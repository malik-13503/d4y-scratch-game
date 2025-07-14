import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  HeadphonesIcon,
  Globe,
  Facebook,
  Twitter,
  Instagram
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Communication icons floating */}
        <div className="absolute top-40 right-20 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce shadow-lg shadow-green-500/50 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-40 left-16 w-6 h-6 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full animate-bounce delay-800 shadow-lg shadow-teal-500/50"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce delay-1400 shadow-lg shadow-cyan-500/50"></div>
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Contact Us</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-emerald-400/40 mb-6 shadow-lg shadow-emerald-500/25">
            <MessageSquare className="h-5 w-5 text-emerald-300 animate-pulse" />
            <span className="text-emerald-200 font-medium">Get in Touch</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            We're Here to Help
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have questions about our games, need technical support, or want to provide feedback? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Send className="h-6 w-6 mr-2 text-purple-400" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/90">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 bg-black/20 border-white/20 text-white placeholder-white/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/90">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 bg-black/20 border-white/20 text-white placeholder-white/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white/90">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 bg-black/20 border-white/20 text-white placeholder-white/50"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white/90">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="mt-1 bg-black/20 border-white/20 text-white placeholder-white/50 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <HeadphonesIcon className="h-6 w-6 mr-2 text-blue-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Email</h3>
                      <p className="text-blue-300">support@hitthejackpot.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Phone</h3>
                      <p className="text-green-300">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Address</h3>
                      <p className="text-purple-300">123 Game Street, Digital City, DC 12345</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-slate-700/80 border border-slate-500/30 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Business Hours</h3>
                      <p className="text-orange-300">Mon-Fri: 9 AM - 6 PM EST</p>
                      <p className="text-orange-300">Sat-Sun: 10 AM - 4 PM EST</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-pink-400" />
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-4">
                  Stay updated with our latest games and announcements on social media!
                </p>
                <div className="flex space-x-4">
                  <Button variant="ghost" className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30">
                    <Facebook className="h-5 w-5 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="ghost" className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-300 border border-blue-400/30">
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="ghost" className="bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30">
                    <Instagram className="h-5 w-5 mr-2" />
                    Instagram
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-xl border-green-500/30 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Need Quick Answers?</h3>
                <p className="text-white/80 mb-4">
                  Check out our frequently asked questions or game rules for instant help.
                </p>
                <div className="flex space-x-3">
                  <Link href="/how-to-play">
                    <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20">
                      How to Play
                    </Button>
                  </Link>
                  <Link href="/prize-rules">
                    <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/20">
                      Prize Rules
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}