import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Mail, Phone, MapPin, Image as ImageIcon, ChevronDown, Shield, Lock, FileCheck, Database, Users, Clock, Fingerprint, ScrollText, LayoutDashboard, Search, FileText, AlertCircle, PhoneCall, GraduationCap, Headset, UserSquare2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from 'axios';
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, TrendingUp, TrendingDown } from "lucide-react"
import { LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Add placeholder component
const ImagePlaceholder = ({ className }: { className?: string }) => (
  <div className={cn(
    "flex items-center justify-center bg-muted/50 rounded-lg animate-pulse",
    className
  )}>
    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
  </div>
)

// Add this component at the top
const ScrollIndicator = () => (
  <motion.div 
    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
  >
    <span className="text-sm text-muted-foreground">Scroll for more</span>
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <ChevronDown className="h-5 w-5 text-muted-foreground" />
    </motion.div>
  </motion.div>
)

// Add this for mouse follow effect
const MouseFollowGradient = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary-rgb), 0.1) 0%, transparent 50%)`
      }}
    />
  )
}

// Add interface for FeatureCard props
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Update FeatureCard with proper typing
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        rotateX: 10,
        rotateY: 10,
        perspective: 1000
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <Card className="h-full relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 flex flex-col min-h-[160px] relative z-10">
          <motion.div
            animate={{
              y: isHovered ? [-5, 5] : 0
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="rounded-full p-2 bg-primary/10 shrink-0 w-fit"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
          <div className="space-y-1.5 mt-3">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Add this type for better type safety
interface QuickAccessItem {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

// Updated QuickAccessCard with better UX
const QuickAccessCard = ({ item, onClick }: { item: QuickAccessItem; onClick: (path: string) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card flip when clicking button
    setIsLoading(true)
    try {
      await onClick(item.path)
    } catch (error) {
      console.error('Navigation error:', error)
      // You might want to add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="relative h-[220px] group cursor-pointer" 
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      aria-label={`${item.title} quick access card. Click to flip for more information`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsFlipped(!isFlipped)
        }
      }}
    >
      {/* Flip indicator */}
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge variant="secondary" className="shadow-sm">
          <ArrowRight className="h-3 w-3 mr-1" />
          Click to flip
        </Badge>
      </div>

      <motion.div
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          opacity: isFlipped ? 0 : 1
        }}
        transition={{ duration: 0.6 }}
        style={{ 
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden"
        }}
        className="absolute inset-0"
      >
        {/* Front of card */}
        <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <div className={cn(
              "p-3 rounded-lg transition-colors mb-4",
              item.color
            )}>
              <item.icon className="h-8 w-8 text-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground text-center">
              Click to learn more
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 0 : -180,
          opacity: isFlipped ? 1 : 0
        }}
        transition={{ duration: 0.6 }}
        style={{ 
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden"
        }}
        className="absolute inset-0"
      >
        {/* Back of card */}
        <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-between h-full">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button 
                onClick={handleAction}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Clock className="h-4 w-4" />
                    </motion.div>
                    Loading...
                  </>
                ) : (
                  <>
                    Access Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(false)
                }}
                className="w-full"
              >
                Back to front
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Update feature data to include AI-specific features
const features = [
  {
    icon: Brain,
    title: "AI-Powered Positioning",
    description: "Automatic facial feature placement using advanced AI algorithms for anatomically accurate composites"
  },
  {
    icon: Database,
    title: "Smart Feature Library",
    description: "Region-specific facial feature database with AI-assisted search and filtering capabilities"
  },
  {
    icon: FileCheck,
    title: "Intelligent Adjustments",
    description: "AI-guided feature scaling and positioning with real-time anatomical validation"
  },
  {
    icon: Users,
    title: "Collaborative Workflow",
    description: "Multi-user case management with real-time updates and version control"
  },
  {
    icon: LayoutDashboard,
    title: "Template System",
    description: "Pre-configured templates for various demographics including age, ethnicity, and gender specifications"
  },
  {
    icon: Lock,
    title: "Case Management",
    description: "Comprehensive tracking of composites with case details, examiner info, and investigation records"
  }
]

// Add this component for section headers
const SectionHeader = ({ 
  badge, 
  title, 
  description 
}: { 
  badge: string, 
  title: string, 
  description: string 
}) => (
  <motion.div 
    className="text-center mb-16"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <Badge variant="outline" className="mb-4">{badge}</Badge>
    <h2 className="text-3xl font-bold mb-4 tracking-tight">{title}</h2>
    <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
  </motion.div>
)

// Update quick access items to be more RFU-specific
const quickAccess = [
  {
    icon: ScrollText,
    title: "Create Composite",
    description: "Generate new facial composite",
    path: "/composite-builder",
    badge: "Primary",
    color: "bg-primary/10"
  },
  {
    icon: Users,
    title: "Witness Interview",
    description: "Record witness descriptions",
    path: "/interview",
    badge: "Process",
    color: "bg-orange-500/10" 
  },
  {
    icon: FileText,
    title: "Case Files",
    description: "Access investigation records",
    path: "/cases",
    badge: "Records",
    color: "bg-blue-500/10"
  },
  {
    icon: Search,
    title: "Search Database",
    description: "Find existing composites",
    path: "/search",
    badge: "Search",
    color: "bg-green-500/10"
  }
]

// Update metric type definition to fix trend type issues
type TrendType = 'up' | 'down' | 'neutral';

interface SystemMetric {
  label: string;
  value: number;
  percentage: number;
  description: string;
  trend: string;
  trendType: TrendType;
  info: string;
}

// Update the metrics array type
const systemMetrics: SystemMetric[] = [
  { 
    label: "Active Cases", 
    value: 24,
    percentage: 85,
    description: "Current open investigations",
    trend: "+3 this week",
    trendType: "up",
    info: "Number of cases currently being processed by RFU-CAR"
  },
  { 
    label: "Database Features", 
    value: 2500,
    percentage: 92,
    description: "Facial components",
    trend: "Updated weekly",
    trendType: "neutral",
    info: "Total number of facial features available in our database"
  },
  { 
    label: "Case Resolution", 
    value: 87,
    percentage: 87,
    description: "Successful identifications",
    trend: "+2% vs last quarter",
    trendType: "up",
    info: "Percentage of cases where composites led to successful identifications"
  },
  { 
    label: "Processing Time", 
    value: 45,
    percentage: 78,
    description: "Average composite creation",
    trend: "15min faster than manual",
    trendType: "up",
    info: "Average time taken to create a complete facial composite"
  }
]

// Update security features with more details and icons
const securityFeatures = [
  {
    title: "Evidence Grade Security",
    description: "Compliant with PNP evidence handling protocols and digital forensics standards",
    icon: Shield,
    features: [
      "End-to-end encryption",
      "Secure data storage",
      "Digital signatures",
      "Audit trails"
    ],
    color: "bg-blue-500/10"
  },
  {
    title: "Access Control",
    description: "Role-based access for investigators, artists, and supervisors with granular permissions",
    icon: Lock,
    features: [
      "Multi-factor authentication",
      "Role-based permissions",
      "Session management",
      "Access logs"
    ],
    color: "bg-green-500/10"
  },
  {
    title: "Audit System",
    description: "Complete activity logs and case integrity tracking with tamper-proof records",
    icon: FileCheck,
    features: [
      "Activity monitoring",
      "Change tracking",
      "Version control",
      "Compliance reports"
    ],
    color: "bg-orange-500/10"
  }
]

// Replace the existing FaceMeshLogo component with this
const Logo = () => {
  const scrollToTop = () => {
    console.log('Scrolling to top'); // Debug log
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group select-none"
      onClick={scrollToTop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          scrollToTop();
        }
      }}
      aria-label="Return to top of page"
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors" />
        <div className="relative flex items-center justify-center">
          <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <div className="flex flex-col group-hover:translate-x-0.5 transition-transform">
        <span className="text-xl font-bold tracking-tight">FACERENDER</span>
        <span className="text-xs text-muted-foreground">RFU-CAR Composite System</span>
      </div>
    </div>
  );
};

// Add this type for contact info
interface ContactInfo {
  icon: LucideIcon;
  label: string;
  value: string;
  link?: string;
  type: 'email' | 'phone' | 'address' | 'hours';
}

// Add contact information
const contactInfo: ContactInfo[] = [
  {
    icon: Mail,
    label: "Email Support",
    value: "it.support@rfu-car.pnp.gov.ph",
    link: "mailto:it.support@rfu-car.pnp.gov.ph",
    type: 'email'
  },
  {
    icon: Phone,
    label: "Hotline",
    value: "(074) 123-4567",
    link: "tel:+63741234567",
    type: 'phone'
  },
  {
    icon: MapPin,
    label: "Office Address",
    value: "RFU-CAR Building, Camp Major Bado Dangwa, La Trinidad, Benguet",
    link: "https://maps.google.com/?q=Camp+Major+Bado+Dangwa",
    type: 'address'
  },
  {
    icon: Clock,
    label: "Operating Hours",
    value: "Monday - Friday: 8:00 AM - 5:00 PM",
    type: 'hours'
  }
]

// Update the Quick Support section with RFU-specific actions
const supportActions = [
  { 
    label: "Standard Procedures", 
    icon: FileText,
    description: "View SOP for composite creation",
    link: "/docs/procedures"
  },
  { 
    label: "Technical Manual", 
    icon: GraduationCap,
    description: "System usage guidelines",
    link: "/docs/manual"
  },
  { 
    label: "Report System Issue", 
    icon: AlertCircle,
    description: "Submit technical problems",
    link: "/support/issue"
  },
  { 
    label: "Request Training", 
    icon: Users,
    description: "Schedule system training",
    link: "/support/training"
  }
]

export default function Landing() {
  const navigate = useNavigate()
  const [imageStates, setImageStates] = useState({
    pnp: { loaded: false, error: false },
    rfu: { loaded: false, error: false },
    office: { loaded: false, error: false }
  });

  // Image loading handler
  const handleImageLoad = (image: keyof typeof imageStates) => {
    console.log(`Image loaded successfully: ${image}`);
    setImageStates(prev => ({
      ...prev,
      [image]: { loaded: true, error: false }
    }));
  };

  const handleImageError = (image: keyof typeof imageStates) => {
    console.error(`Failed to load image: ${image}`);
    setImageStates(prev => ({
      ...prev,
      [image]: { loaded: false, error: true }
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Add scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = (window.scrollY / totalScroll) * 100
      setScrollProgress(currentProgress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
        style={{ scaleX: scrollProgress / 100, transformOrigin: '0%' }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex items-center">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-slate-100/[0.03]" />
          <div className="container relative h-screen flex items-center justify-between gap-8 pt-16">
            <div className="flex max-w-[600px] flex-col">
              {/* Logos - Enhanced with stagger animation */}
              <motion.div 
                className="flex items-center gap-4 mb-6 relative"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                <motion.div variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }} className="relative w-20 h-20">
                  {(!imageStates.pnp.loaded || imageStates.pnp.error) && (
                    <ImagePlaceholder className="h-20 w-20" />
                  )}
                  <img 
                    src="/images/pnp-logo.png" 
                    alt="PNP Logo" 
                    className={cn(
                      "h-20 w-20 object-contain transition-all duration-300",
                      imageStates.pnp.loaded && !imageStates.pnp.error ? "opacity-100" : "opacity-0 absolute"
                    )}
                    onLoad={() => handleImageLoad('pnp')}
                    onError={() => handleImageError('pnp')}
                  />
                </motion.div>
                
                <motion.div variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }} className="relative w-32 h-32">
                  {(!imageStates.rfu.loaded || imageStates.rfu.error) && (
                    <ImagePlaceholder className="h-32 w-32" />
                  )}
                  <img 
                    src="/images/rfu-car-logo.png" 
                    alt="RFU CAR Logo" 
                    className={cn(
                      "h-32 w-32 object-contain transition-all duration-300",
                      imageStates.rfu.loaded && !imageStates.rfu.error ? "opacity-100" : "opacity-0 absolute"
                    )}
                    onLoad={() => handleImageLoad('rfu')}
                    onError={() => handleImageError('rfu')}
                  />
                </motion.div>
              </motion.div>

              {/* Hero content - Enhanced animations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Regional Forensic Unit<br/>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Facial Composite System
                  </span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                  Official digital facial composite system for the Regional Forensic Unit - 
                  <span className="font-medium text-foreground"> Cordillera Administrative Region (RFU-CAR)</span>.
                </p>
                <motion.div 
                  className="mt-8 flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10">Access System</span>
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => scrollToSection('contact')}
                    className="group"
                  >
                    Contact Support
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Office image - Enhanced */}
            <motion.div 
              className="hidden lg:block relative w-[600px] h-[400px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {(!imageStates.office.loaded || imageStates.office.error) && (
                <ImagePlaceholder className="w-full h-full" />
              )}
              <img 
                src="/images/rfu-car-office.jpg" 
                alt="RFU CAR Office"
                className={cn(
                  "w-full h-full object-cover object-center transition-all duration-500",
                  imageStates.office.loaded && !imageStates.office.error ? "opacity-100" : "opacity-0 absolute"
                )}
                onLoad={() => handleImageLoad('office')}
                onError={() => handleImageError('office')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </motion.div>
          </div>

          {/* Improved scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="cursor-pointer"
                onClick={() => scrollToSection('features')}
              >
                <ChevronDown className="h-5 w-5 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 custom-scroll">
          <div className="container">
            <SectionHeader 
              badge="Features"
              title="AI-Powered Composite Creation"
              description="Advanced artificial intelligence capabilities for precise and efficient facial composite generation"
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Section - Updated */}
        <section id="actions" className="py-32 bg-muted/30 custom-scroll">
          <div className="container">
            <SectionHeader 
              badge="Quick Access"
              title="Essential Tools"
              description="Streamlined access to critical investigation resources. Click on cards to learn more."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {quickAccess.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <QuickAccessCard item={item} onClick={navigate} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section id="metrics" className="py-32 relative overflow-hidden custom-scroll">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] dark:bg-grid-slate-100/[0.03]" />
          <div className="container relative">
            <SectionHeader 
              badge="Performance"
              title="System Metrics"
              description="Real-time statistics and operational performance indicators"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {systemMetrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        {/* Circular Progress */}
                        <CircularProgress 
                          value={metric.percentage} 
                          className="mb-4"
                        />
                        
                        {/* Metric Info */}
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <h3 className="font-semibold text-lg">{metric.label}</h3>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px] text-sm">{metric.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <p className="text-3xl font-bold tracking-tight">
                            {typeof metric.value === 'number' && metric.label === "Processing Time" 
                              ? `${metric.value}min`
                              : metric.value.toLocaleString()}
                          </p>
                          
                          <p className="text-sm text-muted-foreground">
                            {metric.description}
                          </p>

                          {/* Trend Indicator */}
                          <div className={cn(
                            "flex items-center justify-center gap-1 text-sm",
                            metric.trendType === "up" ? "text-green-500" : 
                            metric.trendType === "down" ? "text-red-500" : 
                            "text-muted-foreground"
                          )}>
                            {metric.trendType === "up" && <TrendingUp className="h-4 w-4" />}
                            {metric.trendType === "down" && <TrendingDown className="h-4 w-4" />}
                            <span>{metric.trend}</span>
                          </div>
                        </div>
                      </div>

                      {/* Decorative gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-32 bg-muted/30 relative overflow-hidden custom-scroll">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] dark:bg-grid-slate-100/[0.03]" />
          <div className="container relative">
            <SectionHeader 
              badge="Security"
              title="Evidence-Grade Protection"
              description="Enterprise-level security measures compliant with PNP standards"
            />
            
            {/* Main Security Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {securityFeatures.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <CardContent className="p-8 flex flex-col min-h-[420px]"> {/* Increased padding and fixed height */}
                      {/* Icon Header */}
                      <div className="text-center mb-8"> {/* Increased bottom margin */}
                        <div className={cn(
                          "w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center", // Larger icon container
                          item.color
                        )}>
                          <item.icon className="h-10 w-10 text-foreground" /> {/* Larger icon */}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{item.title}</h3> {/* Larger title */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Features List - Now with better spacing */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 mt-auto" // Push to bottom and increase spacing
                      >
                        {item.features.map((feature, index) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className={cn(
                              "h-2 w-2 rounded-full shrink-0", // Slightly larger dot
                              item.color.replace("/10", "/50")
                            )} />
                            <span className="text-sm font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Enhanced hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Additional Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20" // Increased top margin
            >
              <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur">
                <CardContent className="p-8"> {/* Increased padding */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-6"> {/* Increased gap and margin */}
                    <Badge variant="outline" className="bg-primary/10 px-4 py-1.5 text-sm"> {/* Larger badges */}
                      <Lock className="h-4 w-4 mr-2" />
                      Security Certified
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 px-4 py-1.5 text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      PNP Compliant
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
                    Our system adheres to the highest security standards required by law enforcement agencies, 
                    ensuring the integrity and confidentiality of all case-related data.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 relative custom-scroll">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] dark:bg-grid-slate-100/[0.03]" />
          <div className="container relative">
            <SectionHeader 
              badge="Support"
              title="Get in Touch"
              description="Our dedicated support team is here to help you with any questions or technical assistance"
            />
            
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information - Simplified */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full"> {/* Added h-full for equal height */}
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                      <div className="space-y-6">
                        {contactInfo.map((info) => (
                          <motion.div
                            key={info.label}
                            className="group"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {info.link ? (
                              <a 
                                href={info.link}
                                target={info.type === 'address' ? "_blank" : undefined}
                                rel={info.type === 'address' ? "noopener noreferrer" : undefined}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="rounded-full p-2 bg-primary/10 shrink-0">
                                  <info.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{info.label}</p>
                                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                    {info.value}
                                  </p>
                                </div>
                              </a>
                            ) : (
                              <div className="flex items-start gap-3 p-2">
                                <div className="rounded-full p-2 bg-primary/10 shrink-0">
                                  <info.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{info.label}</p>
                                  <p className="text-sm text-muted-foreground">{info.value}</p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Support Resources - Simplified */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full"> {/* Added h-full for equal height */}
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-6">Support Resources</h3>
                      <div className="space-y-6">
                        {/* Support Actions Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {supportActions.map((action) => (
                            <Button
                              key={action.label}
                              variant="outline"
                              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 relative group"
                              onClick={() => navigate(action.link)}
                            >
                              <action.icon className="h-5 w-5" />
                              <span className="font-medium text-sm">{action.label}</span>
                              <p className="text-xs text-muted-foreground text-center">
                                {action.description}
                              </p>
                              <motion.div
                                className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100"
                                initial={{ scale: 0.8 }}
                                whileHover={{ scale: 1 }}
                              >
                                <Badge variant="secondary" className="text-xs">
                                  View
                                </Badge>
                              </motion.div>
                            </Button>
                          ))}
                        </div>

                        {/* IT Support Contact - Simplified */}
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full p-2 bg-primary/10">
                                <Headset className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">IT Support</p>
                                <p className="text-sm text-muted-foreground">
                                  RFU-CAR Technical Team
                                </p>
                              </div>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="ml-auto"
                                onClick={() => window.location.href = 'mailto:it.support@rfu-car.pnp.gov.ph'}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - enhanced */}
      <footer className="border-t py-6">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2024 Regional Forensic Unit - CAR. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Privacy Policy</Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm">Terms of Use</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 