import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, CheckCircle, Menu, Github, Brain, Mail, Phone, MapPin, Twitter, Linkedin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from 'axios';

export default function Landing() {
  const navigate = useNavigate()
  const { data, error, isLoading, execute } = useApi();
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/test');
        setBackendMessage(response.data.message);
        console.log('Backend response:', response.data);
      } catch (error) {
        console.error('Connection error:', error);
        setBackendMessage('Connection failed');
      }
    };

    testConnection();
  }, []);

  // Add this function to handle smooth scrolling
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">FACERENDER</span>
              <span className="text-xs text-muted-foreground">AI Composite System</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('benefits')} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </button>
            <ModeToggle />
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-slate-100/[0.03]" />
          <div className="container relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="flex max-w-[64rem] flex-col items-center text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Next Generation{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Facial Composite System
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Advanced AI-powered facial composite creation tool for law enforcement.
                Create accurate, detailed facial composites in minutes with our state-of-the-art technology.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="min-w-[200px]" onClick={() => navigate("/auth")}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Watch Demo
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-5 w-5" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-5 w-5" />
                  <span>Lightning fast results</span>
                </div>
                <div className="mt-4 text-center text-muted-foreground">
                  {backendMessage && `Backend Status: ${backendMessage}`}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to create accurate facial composites
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI-Powered Alignment",
                  description: "Automatic feature alignment and proportion matching using advanced AI algorithms",
                  icon: <CheckCircle className="h-10 w-10 text-primary" />
                },
                {
                  title: "Real-time Collaboration",
                  description: "Work together with team members in real-time on composite creation",
                  icon: <Zap className="h-10 w-10 text-primary" />
                },
                {
                  title: "Secure Database",
                  description: "Centralized, secure storage of facial features and completed composites",
                  icon: <Shield className="h-10 w-10 text-primary" />
                },
                // Add more features as needed
              ].map((feature, i) => (
                <div key={i} className="rounded-lg border bg-card p-8">
                  {feature.icon}
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="bg-muted/50 py-24">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Why Choose FaceRender
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Transform your facial composite workflow
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Increased Accuracy",
                  description: "Create more accurate composites with AI-assisted feature matching and alignment"
                },
                {
                  title: "Time Savings",
                  description: "Reduce composite creation time by up to 60% with automated workflows"
                },
                {
                  title: "Better Collaboration",
                  description: "Work seamlessly with team members and stakeholders in real-time"
                },
                {
                  title: "Enhanced Security",
                  description: "Enterprise-grade security ensures your data remains protected"
                }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <div className="rounded-[2rem] bg-primary p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
                Join law enforcement agencies worldwide using FaceRender to create more accurate facial composites.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" variant="secondary">
                  Request Demo
                </Button>
                <Button size="lg" variant="outline" className="bg-primary-foreground">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Get in Touch
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions? Our team is here to help.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Email Contact */}
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Email Us</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Available 24/7 for your inquiries
              </p>
              <a 
                href="mailto:support@facerender.com" 
                className="text-primary hover:underline"
              >
                support@facerender.com
              </a>
            </div>

            {/* Phone Contact */}
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Call Us</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Mon-Fri from 9am to 5pm EST
              </p>
              <a 
                href="tel:+15551234567" 
                className="text-primary hover:underline"
              >
                +1 (555) 123-4567
              </a>
            </div>

            {/* Office Location */}
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Visit Us</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Our headquarters location
              </p>
              <span className="text-primary">
                123 Security Ave, Suite 100<br />
                Washington, DC 20001
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-12">
          {/* Main Footer Content */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">FACERENDER</span>
                  <span className="text-xs text-muted-foreground">AI Composite System</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Next generation facial composite system powered by artificial intelligence, trusted by law enforcement agencies worldwide.
              </p>
              <div className="mt-6 flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-4 space-y-3">
                {['Features', 'Benefits', 'Security', 'Pricing'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-4 space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-4 space-y-3">
                {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © 2024 FaceRender. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Button>
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Button>
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 