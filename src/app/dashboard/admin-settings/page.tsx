'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { 
  Settings, 
  Database, 
  Users, 
  Mail, 
  Shield, 
  DollarSign,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

// Types for settings
interface SystemSetting {
  id: number;
  name: string;
  value: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export default function AdminSettingsPage() {
  const [changedSettings, setChangedSettings] = useState<{[key: string]: string}>({});
  const [isSaving, setSaving] = useState(false);

  // Mock settings data - in a real app, this would come from an API
  const settings = {
    general: [
      { id: 1, name: 'system_name', value: 'Corporate Cooperative Management System', description: 'Name of the cooperative system', type: 'text' as const },
      { id: 2, name: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', type: 'boolean' as const },
      { id: 3, name: 'max_file_size', value: '10', description: 'Maximum file upload size (MB)', type: 'number' as const },
    ],
    financial: [
      { id: 4, name: 'monthly_contribution_amount', value: '5000', description: 'Default monthly contribution amount', type: 'number' as const },
      { id: 5, name: 'loan_interest_rate', value: '12', description: 'Annual loan interest rate (%)', type: 'number' as const },
      { id: 6, name: 'max_loan_amount', value: '500000', description: 'Maximum loan amount per member', type: 'number' as const },
      { id: 7, name: 'loan_processing_fee', value: '2.5', description: 'Loan processing fee (%)', type: 'number' as const },
    ],
    membership: [
      { id: 8, name: 'auto_approve_members', value: 'false', description: 'Automatically approve new members', type: 'boolean' as const },
      { id: 9, name: 'min_membership_period', value: '6', description: 'Minimum membership period (months)', type: 'number' as const },
      { id: 10, name: 'registration_fee', value: '1000', description: 'One-time registration fee', type: 'number' as const },
    ],
    notifications: [
      { id: 11, name: 'email_notifications', value: 'true', description: 'Enable email notifications', type: 'boolean' as const },
      { id: 12, name: 'sms_notifications', value: 'false', description: 'Enable SMS notifications', type: 'boolean' as const },
      { id: 13, name: 'notification_frequency', value: 'weekly', description: 'Notification frequency', type: 'select' as const, options: ['daily', 'weekly', 'monthly'] },
    ],
    security: [
      { id: 14, name: 'password_min_length', value: '8', description: 'Minimum password length', type: 'number' as const },
      { id: 15, name: 'session_timeout', value: '30', description: 'Session timeout (minutes)', type: 'number' as const },
      { id: 16, name: 'max_login_attempts', value: '5', description: 'Maximum login attempts before lockout', type: 'number' as const },
    ]
  };

  const handleSettingChange = (settingName: string, value: string) => {
    setChangedSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  const saveSettings = async () => {
    if (Object.keys(changedSettings).length === 0) {
      toast.info('No changes to save');
      return;
    }

    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset changed settings after successful save
      setChangedSettings({});
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChangedSettings({});
      toast.success('Settings reset to defaults!');
    } catch (err) {
      toast.error('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const formatSettingName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const SettingsSection = ({ title, description, settings, icon: Icon }: {
    title: string;
    description: string;
    settings: SystemSetting[];
    icon: React.ElementType;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={setting.name} className="font-medium">
                {formatSettingName(setting.name)}
              </Label>
              {changedSettings[setting.name] && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            
            {setting.type === 'boolean' ? (
              <Select 
                value={changedSettings[setting.name] || setting.value}
                onValueChange={(value) => handleSettingChange(setting.name, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            ) : setting.type === 'select' && setting.options ? (
              <Select 
                value={changedSettings[setting.name] || setting.value}
                onValueChange={(value) => handleSettingChange(setting.name, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.map(option => (
                    <SelectItem key={option} value={option}>
                      {formatSettingName(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={setting.name}
                value={changedSettings[setting.name] || setting.value}
                onChange={(e) => handleSettingChange(setting.name, e.target.value)}
                placeholder={setting.value}
                type={setting.type === 'number' ? 'number' : 'text'}
              />
            )}
            <p className="text-xs text-muted-foreground">{setting.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast.info('Settings refreshed')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isSaving}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Settings to Defaults</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will reset all settings to their default values. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>
                  Reset Settings
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || Object.keys(changedSettings).length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsSection
            title="General Settings"
            description="Basic system configuration and general preferences"
            settings={settings.general}
            icon={Settings}
          />
        </TabsContent>

        <TabsContent value="financial">
          <SettingsSection
            title="Financial Settings"
            description="Configure contribution amounts, interest rates, and loan parameters"
            settings={settings.financial}
            icon={DollarSign}
          />
        </TabsContent>

        <TabsContent value="membership">
          <SettingsSection
            title="Membership Settings"
            description="Manage member registration, approval, and requirements"
            settings={settings.membership}
            icon={Users}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <SettingsSection
            title="Notification Settings"
            description="Configure email, SMS, and system notification preferences"
            settings={settings.notifications}
            icon={Mail}
          />
        </TabsContent>

        <TabsContent value="security">
          <SettingsSection
            title="Security Settings"
            description="Manage password policies, session timeouts, and security measures"
            settings={settings.security}
            icon={Shield}
          />
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and configuration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email Service Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Backup System Running</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and system operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col p-4">
              <Database className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Backup Database</span>
              <span className="text-xs text-muted-foreground">Create system backup</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col p-4">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Export Members</span>
              <span className="text-xs text-muted-foreground">Download member data</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col p-4">
              <Mail className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Send Notifications</span>
              <span className="text-xs text-muted-foreground">Bulk member notifications</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col p-4">
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Security Audit</span>
              <span className="text-xs text-muted-foreground">System security check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
