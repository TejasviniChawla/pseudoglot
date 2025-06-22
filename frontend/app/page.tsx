import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Brain,
  Volume2,
  BookOpen,
  Zap,
  Target,
  Star,
  Download,
  Play,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* World Map Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <img
          src="/images/world-hello-map.png"
          alt="World map with hello in different languages"
          className="w-full h-full object-contain max-w-6xl"
        />
      </div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-teal-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-cyan-300 rounded-full animate-ping opacity-25 animation-delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-30 animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-emerald-300 rounded-full animate-ping opacity-25 animation-delay-3000"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">LinguaFlow</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-teal-600 transition-colors">
              Pricing
            </a>
            <Button variant="outline" className="bg-white text-gray-900 hover:bg-teal-50 border-teal-200">
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center relative z-10">
        <Badge className="mb-4 bg-teal-100 text-teal-800 hover:bg-teal-100 border-2 border-teal-200">
          🌍 AI-Powered Language Learning
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Learn Languages While
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
            {" "}
            Browsing
          </span>
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
          Transform any webpage into your personal language classroom. Our AI-powered extension intelligently translates
          select words based on your skill level, helping you learn naturally as you browse.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="mr-2 h-5 w-5" />
            Add to Chrome - Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-teal-700 hover:bg-teal-50 border-teal-200 px-8 py-3"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
          <Link href="/flashcards">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-teal-700 hover:bg-teal-50 border-teal-200 px-8 py-3"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Try Flashcards
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-center">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <Users className="h-5 w-5 text-teal-600" />
            <span className="text-gray-700 font-medium">50K+ Active Learners</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-gray-700 font-medium">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-gray-700 font-medium">95% Success Rate</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Effective Learning</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Our AI-driven approach makes language learning seamless and personalized to your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="text-gray-900">Smart Word Selection</CardTitle>
              <CardDescription className="text-gray-600">
                AI intelligently chooses which words to translate based on your current skill level and learning
                progress.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle className="text-gray-900">Adjustable Difficulty</CardTitle>
              <CardDescription className="text-gray-600">
                Control how many words get translated. Start with more translations and gradually reduce as you improve.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-gray-900">Audio Pronunciation</CardTitle>
              <CardDescription className="text-gray-600">
                Click any translated word to hear native pronunciation and improve your speaking skills.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-gray-900">Contextual Learning</CardTitle>
              <CardDescription className="text-gray-600">
                Get detailed explanations about phrases, their usage, and cultural context for deeper understanding.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="text-gray-900">Smart Flashcards</CardTitle>
              <CardDescription className="text-gray-600">
                Automatically generate flashcards from words you've encountered for spaced repetition learning.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">Progress Tracking</CardTitle>
              <CardDescription className="text-gray-600">
                AI evaluates your progress and suggests personalized next steps to accelerate your learning journey.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white/70 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How LinguaFlow Works</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Simple, effective, and powered by cutting-edge AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Install & Browse</h3>
              <p className="text-gray-700">
                Add LinguaFlow to your browser and continue browsing your favorite websites as usual.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analyzes & Translates</h3>
              <p className="text-gray-700">
                Our AI reads the page content and intelligently translates select words based on your skill level.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Learn & Progress</h3>
              <p className="text-gray-700">
                Interact with translated words, hear pronunciations, and watch your language skills improve naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose LinguaFlow?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Learn in Context</h3>
                  <p className="text-gray-700">
                    Understand words in real-world situations, not isolated vocabulary lists.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Experience</h3>
                  <p className="text-gray-700">AI adapts to your learning pace and suggests optimal next steps.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Effortless Integration</h3>
                  <p className="text-gray-700">
                    No separate apps or courses - learn while doing what you already do online.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Proven Results</h3>
                  <p className="text-gray-700">
                    Users report 3x faster vocabulary acquisition compared to traditional methods.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Globe className="h-12 w-12 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-700 mb-6">
              Join thousands of learners who are mastering new languages effortlessly.
            </p>
            <Link href="/flashcards">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 py-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Transform Your Browsing Into Learning</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Start your language learning journey today. Install LinguaFlow and see the difference AI-powered learning
            can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="mr-2 h-5 w-5" />
              Install Chrome Extension
            </Button>
            <Link href="/flashcards">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-3"
              >
                Try Flashcards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-6 w-6 text-teal-400" />
                <span className="text-xl font-bold">LinguaFlow</span>
              </div>
              <p className="text-gray-400">Making language learning accessible and enjoyable for everyone.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-teal-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-teal-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Languages
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LinguaFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
