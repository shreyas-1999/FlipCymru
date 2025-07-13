"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, User, Mail, Calendar } from "lucide-react"

export default function TestAuthPage() {
  const { user, loginWithGoogle, registerWithGoogle, logout } = useAuth()
  const [testResults, setTestResults] = useState<{
    firebaseConfig: boolean
    googleProvider: boolean
    authState: boolean
    error?: string
  }>({
    firebaseConfig: false,
    googleProvider: false,
    authState: false,
  })

  const runDiagnostics = () => {
    const results = {
      firebaseConfig: false,
      googleProvider: false,
      authState: false,
      error: undefined as string | undefined,
    }

    // Check Firebase config
    try {
      const requiredEnvVars = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

      if (missingVars.length === 0) {
        results.firebaseConfig = true
      } else {
        results.error = `Missing environment variables: ${missingVars.join(", ")}`
      }
    } catch (error) {
      results.error = `Firebase config error: ${error}`
    }

    // Check Google Provider availability
    try {
      if (typeof window !== "undefined" && window.google) {
        results.googleProvider = true
      }
    } catch (error) {
      console.log("Google provider check:", error)
    }

    // Check auth state
    results.authState = user !== null

    setTestResults(results)
  }

  const testGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      console.log("Google login successful")
    } catch (error) {
      console.error("Google login failed:", error)
      setTestResults((prev) => ({ ...prev, error: `Google login failed: ${error}` }))
    }
  }

  const testGoogleRegister = async () => {
    try {
      await registerWithGoogle()
      console.log("Google registration successful")
    } catch (error) {
      console.error("Google registration failed:", error)
      setTestResults((prev) => ({ ...prev, error: `Google registration failed: ${error}` }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 welsh-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              FlipCymru - Authentication Test
            </CardTitle>
            <CardDescription>Test and diagnose Google authentication setup</CardDescription>
          </CardHeader>
        </Card>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">User is authenticated</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Name:</strong> {user.displayName || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Email:</strong> {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Created:</strong>{" "}
                      {user.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {user.providerData.map((provider, index) => (
                    <Badge key={index} variant="outline">
                      {provider.providerId === "google.com" ? "Google" : provider.providerId}
                    </Badge>
                  ))}
                </div>

                <Button onClick={logout} variant="outline">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>No user authenticated</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>System Diagnostics</CardTitle>
            <CardDescription>Check if all components are properly configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDiagnostics} variant="outline">
              Run Diagnostics
            </Button>

            {testResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {testResults.firebaseConfig ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Firebase Configuration</span>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.googleProvider ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>Google Provider (may not be available in preview)</span>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.authState ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Authentication State</span>
                </div>

                {testResults.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{testResults.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Google Authentication</CardTitle>
            <CardDescription>Test Google sign-in and registration (requires proper Firebase setup)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Google authentication requires:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Valid Firebase project with Authentication enabled</li>
                  <li>Google provider configured in Firebase Console</li>
                  <li>Authorized domains set up (localhost for development)</li>
                  <li>All environment variables properly set</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={testGoogleLogin} disabled={!!user}>
                Test Google Login
              </Button>
              <Button onClick={testGoogleRegister} disabled={!!user} variant="outline">
                Test Google Registration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>How to properly configure Google authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Firebase Console Setup</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Go to Firebase Console → Authentication → Sign-in method</li>
                  <li>Enable Google provider</li>
                  <li>Add your domain to authorized domains (localhost:3000 for development)</li>
                  <li>Copy your Firebase config from Project Settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Environment Variables</h4>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <div>NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key</div>
                  <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com</div>
                  <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id</div>
                  <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com</div>
                  <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
                  <div>NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Backend Integration</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Ensure your backend can handle Google sign-in tokens</li>
                  <li>Update user registration to accept Google provider data</li>
                  <li>Test the complete flow from frontend to backend</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                "NEXT_PUBLIC_FIREBASE_API_KEY",
                "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
                "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
                "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
                "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
                "NEXT_PUBLIC_FIREBASE_APP_ID",
              ].map((envVar) => (
                <div key={envVar} className="flex items-center gap-2">
                  {process.env[envVar] ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono text-xs">{envVar}</span>
                  {process.env[envVar] && (
                    <Badge variant="outline" className="text-xs">
                      Set
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
