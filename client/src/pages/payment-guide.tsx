import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star,
  AlertCircle,
  Zap,
  Globe,
  Award,
  TrendingUp
} from "lucide-react";

export default function PaymentGuide() {
  const paymentMethods = [
    {
      name: "Credit & Debit Cards",
      icon: <CreditCard className="h-6 w-6" />,
      rating: 5,
      speed: "Instant",
      security: "High",
      fees: "None",
      recommended: true,
      pros: [
        "Instant processing for immediate gameplay",
        "Highest security with fraud protection",
        "No additional fees",
        "Universal acceptance",
        "Easy refund process if needed"
      ],
      cons: [
        "Requires card details entry",
        "May have daily spending limits"
      ],
      bestFor: "Most players - ideal for regular gameplay",
      color: "from-blue-600 to-blue-800"
    },
    {
      name: "PayPal",
      icon: <Shield className="h-6 w-6" />,
      rating: 5,
      speed: "Instant",
      security: "High",
      fees: "None",
      recommended: true,
      pros: [
        "No need to share card details",
        "Instant payment processing",
        "Strong buyer protection",
        "One-click payments",
        "Mobile-friendly"
      ],
      cons: [
        "Requires PayPal account",
        "May have PayPal limits"
      ],
      bestFor: "Players who prefer not to share card details",
      color: "from-indigo-600 to-purple-600"
    },
    {
      name: "Apple Pay & Google Pay",
      icon: <Smartphone className="h-6 w-6" />,
      rating: 4,
      speed: "Instant",
      security: "Very High",
      fees: "None",
      recommended: true,
      pros: [
        "Biometric authentication",
        "Fastest checkout process",
        "No card details stored",
        "Works on mobile devices",
        "Extremely secure"
      ],
      cons: [
        "Limited to supported devices",
        "Requires setup"
      ],
      bestFor: "Mobile players who value speed and security",
      color: "from-green-600 to-emerald-600"
    },
    {
      name: "Bank Transfer",
      icon: <DollarSign className="h-6 w-6" />,
      rating: 3,
      speed: "1-3 days",
      security: "High",
      fees: "None",
      recommended: false,
      pros: [
        "Direct from bank account",
        "No third-party involvement",
        "Good for large amounts",
        "No card limits"
      ],
      cons: [
        "Slower processing time",
        "May require manual verification",
        "Not ideal for instant gameplay"
      ],
      bestFor: "Players making large deposits who can wait",
      color: "from-orange-600 to-red-600"
    }
  ];

  const recommendations = [
    {
      title: "New Players",
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      method: "Credit/Debit Card",
      reason: "Most familiar and widely accepted payment method with instant processing"
    },
    {
      title: "Mobile Players",
      icon: <Smartphone className="h-5 w-5 text-green-400" />,
      method: "Apple Pay / Google Pay",
      reason: "Fastest and most secure option for mobile gaming with biometric authentication"
    },
    {
      title: "Privacy-Conscious Players",
      icon: <Shield className="h-5 w-5 text-blue-400" />,
      method: "PayPal",
      reason: "Keeps your card details private while providing instant payments"
    },
    {
      title: "High-Volume Players",
      icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
      method: "Credit Card or PayPal",
      reason: "Best for frequent gameplay with instant processing and good limits"
    }
  ];

  return (
    <div className="informational-page min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Payment Method Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect payment method for your gaming experience. Compare features, 
            security, and processing times to find what works best for you.
          </p>
        </div>

        {/* Quick Recommendations */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-400" />
              Quick Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-slate-700/80 border border-slate-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {rec.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                      <p className="text-sm text-emerald-300 font-medium mb-1">
                        Recommended: {rec.method}
                      </p>
                      <p className="text-sm text-gray-300">{rec.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Comparison */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
              Payment Methods Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-slate-700/80 border border-slate-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${method.color} rounded-lg`}>
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center">
                          {method.name}
                          {method.recommended && (
                            <Badge className="ml-2 bg-green-600/20 text-green-300 border-green-500/30">
                              Recommended
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < method.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                                fill={i < method.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">({method.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Speed: {method.speed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Security: {method.security}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Fees: {method.fees}</span>
                    </div>
                  </div>

                  <div className="bg-slate-600/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-300 font-medium mb-2">Best For:</p>
                    <p className="text-sm text-gray-200">{method.bestFor}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-green-300 mb-2">Advantages</h4>
                      <ul className="space-y-1">
                        {method.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-300 mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {method.cons.map((con, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start">
                            <AlertCircle className="h-3 w-3 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-400" />
              Payment Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Before You Pay</h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Always check the website URL is secure (https://)</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Never share your payment details via email or chat</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Use secure networks, avoid public WiFi for payments</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">After Payment</h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Keep payment confirmations for your records</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Monitor your statements for unauthorized charges</span>
                  </li>
                  <li className="flex items-start text-gray-200">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <span className="text-sm">Contact support immediately if you notice issues</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Playing?</h3>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
              Choose your preferred payment method and start spinning the wheel. All methods are 
              secure and designed for the best gaming experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-200">
                  <Globe className="h-5 w-5 mr-2" />
                  Play Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-slate-500/50 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3 px-8 rounded-xl text-lg transition-all duration-200">
                  Need Help?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}