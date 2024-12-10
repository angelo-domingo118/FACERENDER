import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Shield, Mail, KeyRound, Building2, ArrowLeft, CheckCircle, User, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// Logo component to match Landing page
const Logo = () => {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors" />
        <div className="relative flex items-center justify-center">
          <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">FACERENDER</span>
        <span className="text-xs text-muted-foreground">RFU-CAR Composite System</span>
      </div>
    </div>
  )
}

// Feature item component
const FeatureItem = ({ text }: { text: string }) => (
  <motion.div 
    className="flex items-center gap-3"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="rounded-full p-2 bg-primary/10">
      <CheckCircle className="h-4 w-4 text-primary" />
    </div>
    <span className="text-sm text-muted-foreground">{text}</span>
  </motion.div>
)

// Add loading button component
const LoadingButton = ({ children, loading = false, ...props }: any) => (
  <Button disabled={loading} {...props}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </Button>
)

// Add social login buttons
const SocialButton = ({ children, icon: Icon, ...props }: any) => (
  <Button 
    variant="outline" 
    className="w-full flex items-center justify-center gap-2 hover:bg-accent"
    {...props}
  >
    <Icon className="h-4 w-4" />
    {children}
  </Button>
)

export default function Auth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Fixed */}
      <div className="hidden lg:flex w-1/2 relative bg-muted/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] dark:bg-grid-slate-100/[0.03]" />
        <div className="relative flex flex-col w-full h-full p-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Logo />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-background/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content - Enhanced animations */}
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-8 max-w-[90%]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Welcome to<br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    FACERENDER
                  </span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  The next generation facial composite system for law enforcement professionals.
                </p>
              </motion.div>

              {/* Features with enhanced animations */}
              <div className="space-y-4">
                {[
                  "AI-Powered Feature Recognition",
                  "Secure Evidence Management",
                  "Real-time Collaboration Tools",
                  "PNP-Compliant Platform"
                ].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <FeatureItem text={feature} />
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Security Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Secure Access</h3>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encrypted and PNP compliant platform
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            © 2024 Regional Forensic Unit - CAR. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <motion.div 
                className="rounded-full p-4 bg-primary/10"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the system
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form - Enhanced */}
                <TabsContent value="login">
                  <div className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <SocialButton icon={Shield}>
                        PNP SSO
                      </SocialButton>
                      <SocialButton icon={Building2}>
                        Agency
                      </SocialButton>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@rfu-car.pnp.gov.ph"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="password" 
                            type="password"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember" 
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remember me
                          </label>
                        </div>
                        <Button variant="link" className="text-sm px-0">
                          Forgot password?
                        </Button>
                      </div>

                      <LoadingButton 
                        className="w-full"
                        onClick={handleSignIn}
                        loading={loading}
                      >
                        Sign In
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </LoadingButton>
                    </div>
                  </div>
                </TabsContent>

                {/* Register Form - Enhanced */}
                <TabsContent value="register">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Work Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="reg-email" 
                          type="email" 
                          placeholder="name@rfu-car.pnp.gov.ph"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="department" 
                          placeholder="e.g. Investigation Division"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <LoadingButton className="w-full">
                      Request Access
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </LoadingButton>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Verified law enforcement access only
              </div>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 