'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  SlidersHorizontal,
  User,
  Bell,
  Monitor,
  Shield,
  Key,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
  Palette,
  Languages,
  Clock,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Dashboard widget configuration
const availableWidgets = [
  { id: 'balance', name: 'Account Balance', description: 'Your current savings and loan balance', category: 'Financial' },
  { id: 'contributions', name: 'Monthly Contributions', description: 'Track your contribution history', category: 'Financial' },
  { id: 'loans', name: 'Active Loans', description: 'Your loan status and payments', category: 'Financial' },
  { id: 'transactions', name: 'Recent Transactions', description: 'Latest account activities', category: 'Financial' },
  { id: 'announcements', name: 'Announcements', description: 'Important cooperative updates', category: 'Communication' },
  { id: 'calendar', name: 'Calendar Events', description: 'Upcoming meetings and events', category: 'Communication' },
  { id: 'quick-actions', name: 'Quick Actions', description: 'Frequently used functions', category: 'Navigation' },
  { id: 'statistics', name: 'Statistics Overview', description: 'Key performance metrics', category: 'Analytics' },
];

const widgetSizes = ['small', 'medium', 'large'];

export default function PreferencesPage() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preferences, setPreferences] = useState({
    // Dashboard preferences
    widgets: availableWidgets.map(widget => ({
      ...widget,
      isVisible: true,
      displayOrder: widget.id === 'balance' ? 1 : 
                   widget.id === 'contributions' ? 2 :
                   widget.id === 'loans' ? 3 : Math.floor(Math.random() * 10),
      size: 'medium'
    })),
    
    // Profile preferences
    profile: {
      displayName: user?.staffNo || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      phone: '', // User object doesn't have phone property yet
      showEmail: true,
      showPhone: true,
      showLastLogin: false,
    },
    
    // Notification preferences
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      contributionReminders: true,
      loanReminders: true,
      meetingNotifications: true,
      systemUpdates: true,
      marketingEmails: false,
      frequency: 'immediate', // immediate, daily, weekly
    },
    
    // Display preferences
    display: {
      theme: 'system', // light, dark, system
      language: 'en',
      timezone: 'Africa/Lagos',
      dateFormat: 'dd/MM/yyyy',
      currency: 'NGN',
      numberFormat: 'en-NG',
      dashboardRefresh: 'auto', // auto, manual
      showHelperText: true,
    },
    
    // Privacy preferences
    privacy: {
      profileVisibility: 'members', // public, members, private
      showOnlineStatus: true,
      allowDataExport: true,
      shareUsageData: false,
      twoFactorEnabled: false,
    },
    
    // Account preferences
    account: {
      sessionTimeout: 30, // minutes
      requirePasswordChange: false,
      loginNotifications: true,
      accountActivity: true,
      downloadData: false,
    }
  });

  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [preferences]);

  const handleWidgetToggle = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    }));
  };

  const handleWidgetSizeChange = (widgetId: string, size: string) => {
    setPreferences(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, size } : widget
      )
    }));
  };

  const updatePreference = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would save to the database
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      setHasChanges(false);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      
      // Reset to default values
      setPreferences({
        ...preferences,
        widgets: availableWidgets.map(widget => ({
          ...widget,
          isVisible: true,
          displayOrder: Math.floor(Math.random() * 10),
          size: 'medium'
        }))
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Preferences reset to defaults!');
    } catch (error) {
      toast.error('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const dataToExport = {
      preferences,
      exportDate: new Date().toISOString(),
      userId: user?.userId
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-preferences-export.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Preferences exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
            <p className="text-muted-foreground">Customize your experience and manage your settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isSaving}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Preferences</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your preferences to their default values. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>
                  Reset Preferences
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={savePreferences} 
            disabled={isSaving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Preferences Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <CardTitle>Dashboard Widgets</CardTitle>
              </div>
              <CardDescription>
                Customize which widgets appear on your dashboard and how they're displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(
                preferences.widgets.reduce((acc, widget) => {
                  if (!acc[widget.category]) acc[widget.category] = [];
                  acc[widget.category].push(widget);
                  return acc;
                }, {} as Record<string, typeof preferences.widgets>)
              ).map(([category, widgets]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{category} Widgets</h4>
                    <Badge variant="outline">{widgets.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {widgets.map(widget => (
                      <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={widget.isVisible}
                            onCheckedChange={() => handleWidgetToggle(widget.id)}
                          />
                          <div>
                            <p className="font-medium">{widget.name}</p>
                            <p className="text-sm text-muted-foreground">{widget.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={widget.size}
                            onValueChange={(size) => handleWidgetSizeChange(widget.id, size)}
                            disabled={!widget.isVisible}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {widgetSizes.map(size => (
                                <SelectItem key={size} value={size}>
                                  {size.charAt(0).toUpperCase() + size.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your personal information and profile visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={preferences.profile.displayName}
                    onChange={(e) => updatePreference('profile', 'displayName', e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={preferences.profile.email}
                    onChange={(e) => updatePreference('profile', 'email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={preferences.profile.phone}
                  onChange={(e) => updatePreference('profile', 'phone', e.target.value)}
                  placeholder="+234-xxx-xxx-xxxx"
                />
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Profile Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show email to other members</span>
                    </div>
                    <Switch
                      checked={preferences.profile.showEmail}
                      onCheckedChange={(checked) => updatePreference('profile', 'showEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show phone to other members</span>
                    </div>
                    <Switch
                      checked={preferences.profile.showPhone}
                      onCheckedChange={(checked) => updatePreference('profile', 'showPhone', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Show last login time</span>
                    </div>
                    <Switch
                      checked={preferences.profile.showLastLogin}
                      onCheckedChange={(checked) => updatePreference('profile', 'showLastLogin', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Choose how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email notifications</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.emailNotifications}
                      onCheckedChange={(checked) => updatePreference('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SMS notifications</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.smsNotifications}
                      onCheckedChange={(checked) => updatePreference('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Push notifications</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.pushNotifications}
                      onCheckedChange={(checked) => updatePreference('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contribution reminders</span>
                    <Switch
                      checked={preferences.notifications.contributionReminders}
                      onCheckedChange={(checked) => updatePreference('notifications', 'contributionReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loan payment reminders</span>
                    <Switch
                      checked={preferences.notifications.loanReminders}
                      onCheckedChange={(checked) => updatePreference('notifications', 'loanReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meeting notifications</span>
                    <Switch
                      checked={preferences.notifications.meetingNotifications}
                      onCheckedChange={(checked) => updatePreference('notifications', 'meetingNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System updates</span>
                    <Switch
                      checked={preferences.notifications.systemUpdates}
                      onCheckedChange={(checked) => updatePreference('notifications', 'systemUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing emails</span>
                    <Switch
                      checked={preferences.notifications.marketingEmails}
                      onCheckedChange={(checked) => updatePreference('notifications', 'marketingEmails', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <Select
                  value={preferences.notifications.frequency}
                  onValueChange={(value) => updatePreference('notifications', 'frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Display Settings</CardTitle>
              </div>
              <CardDescription>
                Customize the appearance and localization of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.display.theme}
                    onValueChange={(value) => updatePreference('display', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.display.language}
                    onValueChange={(value) => updatePreference('display', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={preferences.display.timezone}
                    onValueChange={(value) => updatePreference('display', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.display.dateFormat}
                    onValueChange={(value) => updatePreference('display', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Interface Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show helper text and tooltips</span>
                    <Switch
                      checked={preferences.display.showHelperText}
                      onCheckedChange={(checked) => updatePreference('display', 'showHelperText', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-refresh dashboard</span>
                    <Switch
                      checked={preferences.display.dashboardRefresh === 'auto'}
                      onCheckedChange={(checked) => updatePreference('display', 'dashboardRefresh', checked ? 'auto' : 'manual')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onValueChange={(value) => updatePreference('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Privacy Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show online status</span>
                    <Switch
                      checked={preferences.privacy.showOnlineStatus}
                      onCheckedChange={(checked) => updatePreference('privacy', 'showOnlineStatus', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow data export</span>
                    <Switch
                      checked={preferences.privacy.allowDataExport}
                      onCheckedChange={(checked) => updatePreference('privacy', 'allowDataExport', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Share usage data for improvements</span>
                    <Switch
                      checked={preferences.privacy.shareUsageData}
                      onCheckedChange={(checked) => updatePreference('privacy', 'shareUsageData', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      updatePreference('privacy', 'twoFactorEnabled', checked);
                      if (checked) {
                        toast.info('Two-factor authentication setup would be initiated here');
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your account security and data preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select
                  value={preferences.account.sessionTimeout.toString()}
                  onValueChange={(value) => updatePreference('account', 'sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notify me of new logins</span>
                    <Switch
                      checked={preferences.account.loginNotifications}
                      onCheckedChange={(checked) => updatePreference('account', 'loginNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account activity alerts</span>
                    <Switch
                      checked={preferences.account.accountActivity}
                      onCheckedChange={(checked) => updatePreference('account', 'accountActivity', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-3">
                  <Button variant="outline" onClick={exportData} className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download my data
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete my account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => toast.error('Account deletion would be processed here')}
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Changes Banner */}
      {hasChanges && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                  Discard
                </Button>
                <Button size="sm" onClick={savePreferences} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
