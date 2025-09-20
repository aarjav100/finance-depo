import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  Database, 
  Users, 
  Trash2, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DataType {
  id: string;
  name: string;
  description: string;
  collected: boolean;
  sensitive: boolean;
  lastUpdated: string;
  storageLocation: 'local' | 'cloud' | 'both';
}

interface ConsentSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  category: 'analytics' | 'ai' | 'marketing' | 'security';
}

interface PrivacyHealth {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export function PrivacyDashboard() {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [consentSettings, setConsentSettings] = useState<ConsentSetting[]>([]);
  const [privacyHealth, setPrivacyHealth] = useState<PrivacyHealth>({
    score: 85,
    status: 'good',
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPrivacyData = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockDataTypes: DataType[] = [
        {
          id: 'expenses',
          name: 'Expense Records',
          description: 'Transaction amounts, dates, categories, and descriptions',
          collected: true,
          sensitive: true,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'cloud'
        },
        {
          id: 'income',
          name: 'Income Data',
          description: 'Salary, bonuses, and other income sources',
          collected: true,
          sensitive: true,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'cloud'
        },
        {
          id: 'budgets',
          name: 'Budget Plans',
          description: 'Budget categories, limits, and spending goals',
          collected: true,
          sensitive: false,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'cloud'
        },
        {
          id: 'categories',
          name: 'Category Preferences',
          description: 'Custom expense categories and spending patterns',
          collected: true,
          sensitive: false,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'local'
        },
        {
          id: 'analytics',
          name: 'Usage Analytics',
          description: 'App usage patterns, feature interactions, and performance data',
          collected: true,
          sensitive: false,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'cloud'
        },
        {
          id: 'bank_info',
          name: 'Bank Account Info',
          description: 'Account numbers, routing numbers, and bank details',
          collected: false,
          sensitive: true,
          lastUpdated: new Date().toISOString(),
          storageLocation: 'none'
        }
      ];

      const mockConsentSettings: ConsentSetting[] = [
        {
          id: 'ai_recommendations',
          name: 'AI-Powered Recommendations',
          description: 'Allow AI to analyze your spending patterns for personalized financial advice',
          enabled: true,
          required: false,
          category: 'ai'
        },
        {
          id: 'analytics_tracking',
          name: 'Usage Analytics',
          description: 'Help us improve the app by sharing anonymous usage data',
          enabled: true,
          required: false,
          category: 'analytics'
        },
        {
          id: 'marketing_emails',
          name: 'Marketing Communications',
          description: 'Receive tips, updates, and promotional content via email',
          enabled: false,
          required: false,
          category: 'marketing'
        },
        {
          id: 'security_alerts',
          name: 'Security Notifications',
          description: 'Get notified about suspicious account activity and security updates',
          enabled: true,
          required: true,
          category: 'security'
        },
        {
          id: 'data_export',
          name: 'Data Export Access',
          description: 'Allow exporting your financial data for backup or migration',
          enabled: true,
          required: false,
          category: 'security'
        }
      ];

      setDataTypes(mockDataTypes);
      setConsentSettings(mockConsentSettings);
      calculatePrivacyHealth(mockDataTypes, mockConsentSettings);
    } catch (error) {
      console.error('Error loading privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculatePrivacyHealth = (dataTypes: DataType[], consentSettings: ConsentSetting[]) => {
    let score = 100;
    const recommendations: string[] = [];

    // Check encryption status
    const hasEncryption = true; // Mock - in real app, check actual encryption status
    if (!hasEncryption) {
      score -= 20;
      recommendations.push('Enable data encryption for maximum security');
    }

    // Check sensitive data collection
    const sensitiveDataCount = dataTypes.filter(dt => dt.sensitive && dt.collected).length;
    if (sensitiveDataCount > 3) {
      score -= 10;
      recommendations.push('Consider reducing collection of sensitive data');
    }

    // Check consent settings
    const disabledConsents = consentSettings.filter(cs => !cs.enabled && !cs.required).length;
    if (disabledConsents > 0) {
      score += 5; // Bonus for being restrictive
    }

    // Check data storage locations
    const cloudOnlyData = dataTypes.filter(dt => dt.storageLocation === 'cloud' && dt.sensitive).length;
    if (cloudOnlyData > 0) {
      score -= 5;
      recommendations.push('Consider local storage for sensitive data');
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else status = 'poor';

    setPrivacyHealth({ score: Math.max(0, Math.min(100, score)), status, recommendations });
  };

  const handleConsentToggle = (id: string, enabled: boolean) => {
    setConsentSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled } : setting
      )
    );
    
    toast({
      title: "Setting Updated",
      description: `Privacy setting ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  };

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      // Mock deletion - in real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Data Deleted",
        description: "All your personal data has been permanently deleted",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Mock export - in real app, this would generate and download actual data
      const data = {
        dataTypes,
        consentSettings,
        exportDate: new Date().toISOString(),
        userId: user?.id
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your privacy data has been exported successfully"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadPrivacyData();
    }
  }, [user, loadPrivacyData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'fair': return <AlertTriangle className="w-5 h-5" />;
      case 'poor': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStorageIcon = (location: string) => {
    switch (location) {
      case 'local': return <Database className="w-4 h-4" />;
      case 'cloud': return <Database className="w-4 h-4" />;
      case 'both': return <Database className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Data Privacy Dashboard</h2>
            <p className="text-muted-foreground">Manage your data privacy and security settings</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
            <p className="text-foreground font-medium">Loading privacy data...</p>
            <p className="text-muted-foreground text-sm mt-2">Analyzing your privacy settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Data Privacy Dashboard
          </h2>
          <p className="text-muted-foreground">Take control of your personal data and privacy settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPrivacyData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Privacy Health Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Health Score
          </CardTitle>
          <CardDescription>
            Your current data privacy and security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(privacyHealth.status)}`}>
                {getStatusIcon(privacyHealth.status)}
                <span className="font-medium">{privacyHealth.status.charAt(0).toUpperCase() + privacyHealth.status.slice(1)}</span>
              </div>
              <div className="text-3xl font-bold">{privacyHealth.score}%</div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              AES-256 Encrypted
            </Badge>
          </div>
          <Progress value={privacyHealth.score} className="mb-4" />
          {privacyHealth.recommendations.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendations:</strong> {privacyHealth.recommendations.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Data Visibility
          </CardTitle>
          <CardDescription>
            See exactly what data we collect and how it's stored
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataTypes.map((dataType) => (
              <div key={dataType.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{dataType.name}</h4>
                    {dataType.sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensitive
                      </Badge>
                    )}
                    {dataType.collected && (
                      <Badge variant="secondary" className="text-xs">
                        Collected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{dataType.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getStorageIcon(dataType.storageLocation)}
                      <span className="capitalize">{dataType.storageLocation} storage</span>
                    </div>
                    <div>Last updated: {new Date(dataType.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Control how your data is used and who can access it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {consentSettings.map((setting) => (
              <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{setting.name}</h4>
                    {setting.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {setting.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(enabled) => handleConsentToggle(setting.id, enabled)}
                  disabled={setting.required}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete All Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your personal data from our servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. All your expenses, budgets, and personal information will be permanently deleted.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteData}
              disabled={deleting}
              className="w-full"
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting Data...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Download className="w-5 h-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download a copy of all your data for backup or migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get a complete copy of your financial data in JSON format for your records.
            </p>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Privacy-Smart! 🔒</h3>
            <p className="text-muted-foreground mb-4">
              Review your privacy settings regularly to ensure your data remains secure and you're comfortable with how it's being used.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={loadPrivacyData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Review Settings Now
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Learn More About Privacy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
