import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Brain, 
  PieChart, 
  Smartphone, 
  DollarSign, 
  Target, 
  BarChart3, 
  Star, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Lock, 
  RefreshCw 
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-primary animate-bounce-in">FinanceAI</div>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors hover:scale-105 duration-300">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors hover:scale-105 duration-300">About</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors hover:scale-105 duration-300">Reviews</a>
          </div>
          <Link to="/auth">
            <Button size="sm" className="font-medium hover:scale-105 transition-all duration-300">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6 animate-fade-in-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary animate-bounce-in">
                  <Sparkles className="w-4 h-4 animate-wiggle" />
                  AI-Powered Financial Intelligence
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Smarter
                  <span className="block bg-gradient-primary bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_100%]">Finance</span>
                  Decisions
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  Transform your financial future with AI-powered insights, intelligent budgeting, and personalized recommendations that adapt to your lifestyle.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-left" style={{ animationDelay: '0.6s' }}>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold group hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg hover:bg-muted transition-all duration-300 hover:scale-105">
                    View Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                <div className="text-center animate-scale-in" style={{ animationDelay: '1s' }}>
                  <div className="text-3xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '1.2s' }}>
                  <div className="text-3xl font-bold text-foreground">$2M+</div>
                  <div className="text-sm text-muted-foreground">Money Saved</div>
                </div>
                <div className="text-center animate-scale-in" style={{ animationDelay: '1.4s' }}>
                  <div className="text-3xl font-bold text-foreground">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>

            {/* Right Visual Elements */}
            <div className="relative lg:h-[600px] animate-fade-in-right">
              <div className="absolute inset-0">
                {/* Floating Cards */}
                <Card className="absolute top-0 right-0 w-64 shadow-floating animate-float bg-gradient-card border-0 hover:shadow-glow transition-all duration-500 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs text-muted-foreground">This Month</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">$2,847</div>
                    <div className="text-sm text-green-600">+12.5% from last month</div>
                  </CardContent>
                </Card>

                <Card className="absolute top-32 left-0 w-72 shadow-floating animate-float-slow bg-gradient-card border-0 hover:shadow-glow transition-all duration-500 group cursor-pointer" style={{ animationDelay: '1s' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">AI Recommendation</div>
                        <div className="text-xs text-muted-foreground">Smart Savings</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">You can save $320 this month by optimizing your subscriptions</p>
                  </CardContent>
                </Card>

                <Card className="absolute bottom-0 right-8 w-60 shadow-floating animate-float bg-gradient-card border-0 hover:shadow-glow transition-all duration-500 group cursor-pointer" style={{ animationDelay: '2s' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs text-muted-foreground">Goal Progress</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Emergency Fund</span>
                        <span className="font-medium group-hover:text-primary transition-colors">73%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-3/4 animate-breathe group-hover:bg-primary transition-colors"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Decorative Elements */}
                <div className="absolute top-20 left-20 w-20 h-20 bg-primary/10 rounded-full animate-morph"></div>
                <div className="absolute bottom-20 left-10 w-12 h-12 bg-accent/20 rounded-full animate-float animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-primary/30 rounded-full animate-zoom-in" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-10 left-1/3 w-8 h-8 bg-gradient-accent rounded-full animate-rotate-in" style={{ animationDelay: '2.5s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Animations */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary mb-6 animate-bounce-in">
              <Zap className="w-4 h-4 animate-wiggle" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial tools powered by artificial intelligence to help you make smarter money decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Smart Expense Tracking",
                description: "AI-powered categorization with real-time insights and spending pattern analysis for better financial awareness",
                gradient: "from-green-500 to-emerald-500",
                animation: "animate-flip-in"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Interactive dashboards with predictive forecasting and trend visualization to optimize your spending",
                gradient: "from-blue-500 to-cyan-500",
                animation: "animate-elastic"
              },
              {
                icon: Target,
                title: "Intelligent Budgeting",
                description: "Adaptive budgets that learn from your habits and send proactive alerts when you're off track",
                gradient: "from-purple-500 to-violet-500",
                animation: "animate-zoom-in"
              },
              {
                icon: Brain,
                title: "AI Recommendations",
                description: "Personalized financial advice and optimization strategies tailored to your unique spending patterns",
                gradient: "from-pink-500 to-rose-500",
                animation: "animate-rotate-in"
              },
              {
                icon: Lock,
                title: "Bank-Level Security",
                description: "Enterprise-grade encryption with multi-layer security protocols to protect your financial data",
                gradient: "from-red-500 to-orange-500",
                animation: "animate-bounce-in"
              },
              {
                icon: RefreshCw,
                title: "Cross-Platform Sync",
                description: "Seamless experience across all devices with real-time synchronization and cloud backup",
                gradient: "from-indigo-500 to-blue-500",
                animation: "animate-slide-up"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-floating transition-all duration-700 hover:-translate-y-4 border-0 shadow-card bg-gradient-card overflow-hidden relative cursor-pointer ${feature.animation}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-primary to-accent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardHeader className="text-center relative z-10">
                  <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-glow animate-breathe`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground text-center leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary animate-bounce-in">
                  <Brain className="w-4 h-4 animate-wiggle" />
                  AI-Powered Intelligence
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Why Choose Our
                  <span className="block bg-gradient-primary bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_100%]">AI Finance Platform?</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  We combine cutting-edge AI technology with intuitive design to create a financial management experience that's both powerful and effortless.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "99.9% Accuracy",
                    description: "Machine learning algorithms ensure precise categorization and forecasting for reliable insights"
                  },
                  {
                    icon: CheckCircle,
                    title: "Real-time Insights",
                    description: "Get instant analysis and recommendations as you spend and save throughout your day"
                  },
                  {
                    icon: CheckCircle,
                    title: "Personalized Experience",
                    description: "AI adapts to your unique financial patterns and goals for truly customized advice"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 animate-fade-in-left group cursor-pointer" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-125 transition-transform duration-300">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground group-hover:text-foreground transition-colors">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="relative">
                <Card className="shadow-floating bg-gradient-card border-0 p-8 hover:shadow-glow transition-all duration-500 group cursor-pointer animate-breathe">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Monthly Overview</h3>
                      <div className="text-sm text-green-600 font-medium animate-wiggle">+15.3%</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-muted-foreground">Income</span>
                        <span className="font-semibold">$8,420</span>
                      </div>
                      <div className="flex justify-between items-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="font-semibold">$5,680</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t group-hover:scale-105 transition-transform duration-300">
                        <span className="font-semibold">Net Savings</span>
                        <span className="font-bold text-green-600 animate-pulse-glow">$2,740</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Enhanced Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-morph"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent/20 rounded-full animate-float-slow animate-pulse-glow"></div>
                <div className="absolute top-1/2 -right-8 w-6 h-6 bg-gradient-primary rounded-full animate-bounce-in" style={{ animationDelay: '3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary mb-6 animate-bounce-in">
              <Users className="w-4 h-4 animate-wiggle" />
              Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Trusted by 10,000+ Users
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from people who transformed their financial lives with our AI-powered platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Marketing Manager",
                avatar: "SJ",
                content: "The AI recommendations helped me identify $500 in monthly savings I never noticed. In 6 months, I saved enough for my dream vacation!",
                rating: 5,
                savings: "$3,000 saved",
                animation: "animate-flip-in"
              },
              {
                name: "Michael Chen", 
                role: "Software Developer",
                avatar: "MC",
                content: "Finally, budgeting that actually works! The smart alerts prevented me from overspending during the holidays.",
                rating: 5,
                savings: "$1,200 saved",
                animation: "animate-elastic"
              },
              {
                name: "Emma Williams",
                role: "Small Business Owner", 
                avatar: "EW",
                content: "The analytics gave me insights I never had. It's like having a CFO for my personal finances. Absolutely game-changing!",
                rating: 5,
                savings: "$5,500 saved",
                animation: "animate-zoom-in"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index} 
                className={`group p-6 border-0 shadow-card bg-gradient-card hover:shadow-floating transition-all duration-700 hover:-translate-y-2 cursor-pointer ${testimonial.animation}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-primary to-accent rounded-lg"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-wiggle" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground transition-colors">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-700 group-hover:scale-105 transition-transform duration-300">
                    <Award className="w-4 h-4" />
                    {testimonial.savings}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Animation */}
      <section className="py-20 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-morph"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold animate-text-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white via-white to-white/80 bg-clip-text">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Join thousands of users who have already taken control of their financial future with AI-powered insights and personalized recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold group hover:scale-110 transition-all duration-300">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary hover:scale-110 transition-all duration-300">
                  Try Demo
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center gap-2 animate-bounce-in" style={{ animationDelay: '1s' }}>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 animate-bounce-in" style={{ animationDelay: '1.2s' }}>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">30-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2 animate-bounce-in" style={{ animationDelay: '1.4s' }}>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-up">
            <div className="font-bold text-xl mb-4">FinanceAI</div>
            <p className="text-background/70 mb-8">Intelligent financial management for the modern world</p>
            
            <div className="flex justify-center gap-8 text-sm">
              <a href="#" className="hover:text-primary transition-colors duration-300 hover:scale-105">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors duration-300 hover:scale-105">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors duration-300 hover:scale-105">Support</a>
              <a href="#" className="hover:text-primary transition-colors duration-300 hover:scale-105">Contact</a>
            </div>
            
            <div className="mt-8 pt-8 border-t border-background/20 text-background/50">
              © 2024 FinanceAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;