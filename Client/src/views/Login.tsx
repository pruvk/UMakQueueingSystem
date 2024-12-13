import { LoginForm } from "@/components/login-form"

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-primary/5 to-background">
      <div className="container flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-primary/90" />
          <div className="relative z-20 flex flex-col items-center justify-center h-full space-y-8">
            <div className="flex flex-col items-center gap-6">
              <img 
                src="/logo.png" 
                alt="University Logo" 
                className="h-40 w-auto"
                onError={(e) => {
                  console.error('Error loading logo');
                }}
              />
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">University Cooperative Store</h1>
                <p className="text-lg font-medium text-white/80">
                  University Of Makati Employees Multi-Purpose Cooperative
                </p>
              </div>
            </div>
            
            <div className="text-center max-w-md">
              <blockquote className="space-y-2">
                <p className="text-xl italic font-medium">
                  "Serving the academic community with excellence and integrity."
                </p>
              </blockquote>
            </div>
          </div>
        </div>
        <div className="lg:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
