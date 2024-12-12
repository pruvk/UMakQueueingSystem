import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoginForm() {
  // User login state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userError, setUserError] = useState("")
  
  // Device login state
  const [deviceUsername, setDeviceUsername] = useState("")
  const [devicePassword, setDevicePassword] = useState("")
  const [deviceError, setDeviceError] = useState("")
  
  const navigate = useNavigate()

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserError("")

    try {
      const response = await fetch("http://localhost:5272/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("token", data.token)
      
      const decoded = JSON.parse(atob(data.token.split('.')[1]))
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      
      if (role === 'admin') {
        navigate("/admin/dashboard")
      } else if (role === 'staff') {
        navigate("/staff")
      }
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "An error occurred during login")
      console.error("Login error:", err)
    }
  }

  const handleDeviceLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeviceError("")

    try {
      const response = await fetch("http://localhost:5272/api/device/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: deviceUsername, 
          password: devicePassword 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Device login failed")
      }

      // Store token and navigate if successful
      localStorage.setItem("token", data.token)
      navigate("/device")
      
    } catch (err) {
      setDeviceError(err instanceof Error ? err.message : "An error occurred during device login")
      console.error("Device login error:", err)
    }
  }

  return (
    <div className="relative">
      <ModeToggle className="absolute top-4 right-4" />
      <Card className="mx-auto max-w-7xl">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Choose your login type below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="device">Device Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {userError && (
                  <div className="text-sm text-red-500">
                    {userError}
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="device">
              <form onSubmit={handleDeviceLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceUsername">Device Username</Label>
                  <Input
                    id="deviceUsername"
                    type="text"
                    value={deviceUsername}
                    onChange={(e) => setDeviceUsername(e.target.value)}
                    placeholder="Enter device username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devicePassword">Device Password</Label>
                  <Input
                    id="devicePassword"
                    type="password"
                    value={devicePassword}
                    onChange={(e) => setDevicePassword(e.target.value)}
                    required
                  />
                </div>
                {deviceError && (
                  <div className="text-sm text-red-500">
                    {deviceError}
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Connect Device
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm