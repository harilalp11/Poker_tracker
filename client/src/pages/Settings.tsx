import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/useToast'
import {
  User,
  Bell,
  Download,
  Trash2,
  Save,
  Shield,
  Palette,
  Clock
} from 'lucide-react'

export function Settings() {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Player',
      email: 'player@example.com',
      timezone: 'America/New_York',
      preferredStakes: '$1/$2',
      bio: ''
    },
    notifications: {
      emailReports: true,
      browserNotifications: true,
      weeklyReports: true,
      monthlyReports: true,
      achievementAlerts: true
    },
    preferences: {
      theme: 'light',
      cardDesign: 'classic',
      tableColor: 'green',
      autoSaveInterval: 30,
      defaultTableSize: '6-max',
      defaultGameType: 'Texas Hold\'em'
    }
  })

  const { toast } = useToast()

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings)
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleExportData = () => {
    console.log('Exporting user data...')
    toast({
      title: "Export Started",
      description: "Your data export will be emailed to you shortly.",
    })
  }

  const handleDeleteAccount = () => {
    console.log('Account deletion requested')
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.profile.timezone}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, timezone: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakes">Preferred Stakes</Label>
              <Input
                id="stakes"
                placeholder="$1/$2"
                value={settings.profile.preferredStakes}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, preferredStakes: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your poker journey..."
                value={settings.profile.bio}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, bio: e.target.value }
                }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-500" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-reports">Email Reports</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Receive session summaries via email</p>
              </div>
              <Switch
                id="email-reports"
                checked={settings.notifications.emailReports}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, emailReports: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Show notifications in browser</p>
              </div>
              <Switch
                id="browser-notifications"
                checked={settings.notifications.browserNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, browserNotifications: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Weekly performance summaries</p>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, weeklyReports: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="monthly-reports">Monthly Reports</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monthly analytics reports</p>
              </div>
              <Switch
                id="monthly-reports"
                checked={settings.notifications.monthlyReports}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, monthlyReports: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Milestone and achievement notifications</p>
              </div>
              <Switch
                id="achievement-alerts"
                checked={settings.notifications.achievementAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, achievementAlerts: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Preferences */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              Application Preferences
            </CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-design">Card Design</Label>
              <Select
                value={settings.preferences.cardDesign}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, cardDesign: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-color">Table Color</Label>
              <Select
                value={settings.preferences.tableColor}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, tableColor: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-save">Auto-save Interval (seconds)</Label>
              <Input
                id="auto-save"
                type="number"
                min="10"
                max="300"
                value={settings.preferences.autoSaveInterval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, autoSaveInterval: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-table-size">Default Table Size</Label>
              <Select
                value={settings.preferences.defaultTableSize}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, defaultTableSize: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heads-up">Heads-up</SelectItem>
                  <SelectItem value="6-max">6-max</SelectItem>
                  <SelectItem value="9-max">9-max</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Data & Privacy
            </CardTitle>
            <CardDescription>Manage your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Download a complete backup of your poker data
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-3">
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}