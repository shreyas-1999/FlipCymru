"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, Settings, Volume2, Globe, Bell } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UserPreferences {
  welshDialect: string
  welshFormality: string
  audioEnabled: boolean
  autoPlayPronunciation: boolean
  showPronunciationText: boolean
  defaultDifficulty: string
  notificationsEnabled: boolean
  dailyGoal: number
}

export default function PreferencesPage() {
  const { user } = useAuth()
  const api = useApi()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    welshDialect: "Standard",
    welshFormality: "Standard",
    audioEnabled: true,
    autoPlayPronunciation: false,
    showPronunciationText: true,
    defaultDifficulty: "Beginner",
    notificationsEnabled: true,
    dailyGoal: 10,
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    setLoading(true)
    try {
      // In a real app, you'd fetch preferences from your backend
      // For now, we'll use localStorage as a demo
      const savedPreferences = localStorage.getItem("userPreferences")
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save to your backend
      localStorage.setItem("userPreferences", JSON.stringify(preferences))
      toast({
        title: "Preferences Saved",
        description: "Your learning preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Preferences</h1>
            <p className="text-gray-600">Customize your Welsh learning experience</p>
          </div>
        </div>

        {/* Welsh Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Welsh Language Settings
            </CardTitle>
            <CardDescription>Configure how Welsh content is presented to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="welshDialect">Preferred Welsh Dialect</Label>
                <Select
                  value={preferences.welshDialect}
                  onValueChange={(value) => updatePreference("welshDialect", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard Welsh</SelectItem>
                    <SelectItem value="North-Welsh">North Welsh</SelectItem>
                    <SelectItem value="South-Welsh">South Welsh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welshFormality">Default Formality Level</Label>
                <Select
                  value={preferences.welshFormality}
                  onValueChange={(value) => updatePreference("welshFormality", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informal">Informal</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultDifficulty">Default Difficulty Level</Label>
              <Select
                value={preferences.defaultDifficulty}
                onValueChange={(value) => updatePreference("defaultDifficulty", value)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Audio & Pronunciation
            </CardTitle>
            <CardDescription>Configure audio playback and pronunciation features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Audio Features</Label>
                <p className="text-sm text-gray-600">Allow text-to-speech and audio playback</p>
              </div>
              <Switch
                checked={preferences.audioEnabled}
                onCheckedChange={(checked) => updatePreference("audioEnabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-play Pronunciation</Label>
                <p className="text-sm text-gray-600">Automatically play pronunciation when viewing flashcards</p>
              </div>
              <Switch
                checked={preferences.autoPlayPronunciation}
                onCheckedChange={(checked) => updatePreference("autoPlayPronunciation", checked)}
                disabled={!preferences.audioEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Pronunciation Text</Label>
                <p className="text-sm text-gray-600">Display phonetic pronunciation guide</p>
              </div>
              <Switch
                checked={preferences.showPronunciationText}
                onCheckedChange={(checked) => updatePreference("showPronunciationText", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Learning Goals
            </CardTitle>
            <CardDescription>Set your daily learning targets and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Flashcard Goal</Label>
              <Select
                value={preferences.dailyGoal.toString()}
                onValueChange={(value) => updatePreference("dailyGoal", Number.parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 cards per day</SelectItem>
                  <SelectItem value="10">10 cards per day</SelectItem>
                  <SelectItem value="15">15 cards per day</SelectItem>
                  <SelectItem value="20">20 cards per day</SelectItem>
                  <SelectItem value="25">25 cards per day</SelectItem>
                  <SelectItem value="30">30 cards per day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your learning reminders and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-gray-600">Receive daily learning reminders and progress updates</p>
              </div>
              <Switch
                checked={preferences.notificationsEnabled}
                onCheckedChange={(checked) => updatePreference("notificationsEnabled", checked)}
              />
            </div>

            {!preferences.notificationsEnabled && (
              <Alert>
                <AlertDescription>
                  Notifications are disabled. You won't receive daily learning reminders or progress updates.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
