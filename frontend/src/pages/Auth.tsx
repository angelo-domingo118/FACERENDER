import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Shield, Mail, KeyRound, Building2, ArrowLeft, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Auth() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Fixed, no scroll */}
      <div className="hidden lg:flex w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative flex flex-col w-full h-full p-8">
          {/* Logo and Back Button */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">FACERENDER</span>
                <span className="text-xs text-muted-foreground">AI Composite System</span>
              </div>
            </div>
          </div>

          {/* Content - centered in remaining space */}
          <div className="flex-1 flex items-center">
            <div className="space-y-6 max-w-[90%]">
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                Next Generation<br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Facial Composite System
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Join law enforcement agencies worldwide using our advanced AI-powered system to create accurate facial composites in minutes.
              </p>
              <div className="space-y-4">
                {[
                  "Advanced AI-powered feature matching",
                  "Secure and compliant platform",
                  "Real-time collaboration tools",
                  "Extensive feature database"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            © 2024 FaceRender. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Scrollable */}
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center mb-6">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="mt-3 text-2xl font-bold">Welcome Back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Secure access for law enforcement personnel
              </p>
            </div>
            
            <Card className="w-full">
              <CardContent className="pt-4">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="m.smith@agency.gov"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          Password
                        </Label>
                        <Input 
                          id="password" 
                          type="password"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                          Remember me
                        </label>
                        <Button variant="link" className="text-sm">
                          Forgot password?
                        </Button>
                      </div>
                      <Button className="w-full" onClick={handleSignIn}>
                        Sign In
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="register">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Work Email
                        </Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          placeholder="m.smith@agency.gov"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agency" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Agency/Department
                        </Label>
                        <Input 
                          id="agency" 
                          placeholder="e.g. FBI, Local PD"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          Password
                        </Label>
                        <Input 
                          id="reg-password" 
                          type="password"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters long
                        </p>
                      </div>
                      <Button className="w-full">
                        Request Access
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 border-t pt-4">
                <div className="flex w-full items-center justify-center text-xs text-muted-foreground">
                  <Shield className="mr-2 h-3 w-3" />
                  Verified law enforcement access only
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to FaceRender's Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 