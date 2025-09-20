import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Plus, 
  DollarSign, 
  Target, 
  Brain, 
  Map,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Globe,
  Building,
  Car,
  Utensils,
  ShoppingBag,
  Home,
  Coffee,
  Fuel,
  Plane,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { InteractiveMap } from '@/components/InteractiveMap';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'restaurant' | 'shopping' | 'gas_station' | 'entertainment' | 'other';
  category: string;
  averageSpending?: number;
  visitCount: number;
  lastVisited: Date;
  isFavorite: boolean;
}

interface LocationSuggestion {
  location: Location;
  suggestedExpense: {
    category: string;
    amount: number;
    description: string;
    confidence: number;
  };
  suggestedBudget: {
    category: string;
    monthlyAmount: number;
    reasoning: string;
  };
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function LocationMap() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<LocationSuggestion[]>([]);
  const [clickedCoordinates, setClickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock location data for demonstration
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'Starbucks Downtown',
      address: '123 Main St, Downtown',
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'restaurant',
      category: 'Food & Dining',
      averageSpending: 8.50,
      visitCount: 15,
      lastVisited: new Date('2024-01-15'),
      isFavorite: true
    },
    {
      id: '2',
      name: 'Whole Foods Market',
      address: '456 Oak Ave, Midtown',
      latitude: 40.7589,
      longitude: -73.9851,
      type: 'shopping',
      category: 'Groceries',
      averageSpending: 85.00,
      visitCount: 8,
      lastVisited: new Date('2024-01-14'),
      isFavorite: false
    },
    {
      id: '3',
      name: 'Shell Gas Station',
      address: '789 Pine St, Uptown',
      latitude: 40.7831,
      longitude: -73.9712,
      type: 'gas_station',
      category: 'Transportation',
      averageSpending: 45.00,
      visitCount: 12,
      lastVisited: new Date('2024-01-13'),
      isFavorite: false
    },
    {
      id: '4',
      name: 'Office Building',
      address: '100 Business Blvd, Financial District',
      latitude: 40.7074,
      longitude: -74.0113,
      type: 'work',
      category: 'Work',
      averageSpending: 0,
      visitCount: 20,
      lastVisited: new Date('2024-01-16'),
      isFavorite: true
    }
  ];

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocations(mockLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLoading(false);
        toast({
          title: "Location Found",
          description: "Your current location has been detected"
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        toast({
          title: "Location Error",
          description: "Could not detect your location. Please try again.",
          variant: "destructive"
        });
      }
    );
  }, [toast]);

  const generateAISuggestions = useCallback(async (location: Location) => {
    try {
      // Mock AI suggestions based on location type and history
      const suggestions: LocationSuggestion[] = [];
      
      switch (location.type) {
        case 'restaurant':
          suggestions.push({
            location,
            suggestedExpense: {
              category: 'Food & Dining',
              amount: location.averageSpending || 15.00,
              description: `Meal at ${location.name}`,
              confidence: 0.85
            },
            suggestedBudget: {
              category: 'Food & Dining',
              monthlyAmount: (location.averageSpending || 15.00) * 4,
              reasoning: `Based on your visit frequency (${location.visitCount} times), consider budgeting $${((location.averageSpending || 15.00) * 4).toFixed(2)} monthly for dining out.`
            }
          });
          break;
          
        case 'shopping':
          suggestions.push({
            location,
            suggestedExpense: {
              category: 'Shopping',
              amount: location.averageSpending || 50.00,
              description: `Shopping at ${location.name}`,
              confidence: 0.75
            },
            suggestedBudget: {
              category: 'Shopping',
              monthlyAmount: (location.averageSpending || 50.00) * 2,
              reasoning: `Your shopping pattern suggests a monthly budget of $${((location.averageSpending || 50.00) * 2).toFixed(2)} for retail purchases.`
            }
          });
          break;
          
        case 'gas_station':
          suggestions.push({
            location,
            suggestedExpense: {
              category: 'Transportation',
              amount: location.averageSpending || 40.00,
              description: `Fuel at ${location.name}`,
              confidence: 0.90
            },
            suggestedBudget: {
              category: 'Transportation',
              monthlyAmount: (location.averageSpending || 40.00) * 3,
              reasoning: `Based on your fuel consumption pattern, budget $${((location.averageSpending || 40.00) * 3).toFixed(2)} monthly for gas.`
            }
          });
          break;
          
        case 'work':
          suggestions.push({
            location,
            suggestedExpense: {
              category: 'Work Expenses',
              amount: 0,
              description: `Work location - no expense`,
              confidence: 1.0
            },
            suggestedBudget: {
              category: 'Work Expenses',
              monthlyAmount: 0,
              reasoning: `This is your workplace - no additional budget needed.`
            }
          });
          break;
          
        default:
          suggestions.push({
            location,
            suggestedExpense: {
              category: 'Other',
              amount: location.averageSpending || 25.00,
              description: `Visit to ${location.name}`,
              confidence: 0.60
            },
            suggestedBudget: {
              category: 'Other',
              monthlyAmount: (location.averageSpending || 25.00) * 2,
              reasoning: `Consider budgeting $${((location.averageSpending || 25.00) * 2).toFixed(2)} monthly for miscellaneous expenses.`
            }
          });
      }
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    generateAISuggestions(location);
  };

  const handleAddLocation = (locationData: Partial<Location>) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: locationData.name || 'New Location',
      address: locationData.address || '',
      latitude: locationData.latitude || 0,
      longitude: locationData.longitude || 0,
      type: locationData.type || 'other',
      category: locationData.category || 'Other',
      averageSpending: locationData.averageSpending || 0,
      visitCount: 1,
      lastVisited: new Date(),
      isFavorite: false
    };

    setLocations(prev => [...prev, newLocation]);
    setShowAddLocation(false);
    toast({
      title: "Success",
      description: "Location added successfully"
    });
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'gas_station': return <Fuel className="w-4 h-4" />;
      case 'entertainment': return <Coffee className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'home': return 'bg-blue-100 text-blue-600';
      case 'work': return 'bg-purple-100 text-purple-600';
      case 'restaurant': return 'bg-green-100 text-green-600';
      case 'shopping': return 'bg-orange-100 text-orange-600';
      case 'gas_station': return 'bg-yellow-100 text-yellow-600';
      case 'entertainment': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locations;
    return locations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user, loadLocations]);

  if (loading && locations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Location Map</h2>
            <p className="text-muted-foreground">Track expenses by location with AI insights</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
            <p className="text-foreground font-medium">Loading locations...</p>
            <p className="text-muted-foreground text-sm mt-2">Fetching your location data</p>
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
            <Map className="w-6 h-6" />
            Location Map
          </h2>
          <p className="text-muted-foreground">Track expenses by location with AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getCurrentLocation} disabled={loading}>
            <Navigation className="w-4 h-4 mr-2" />
            {currentLocation ? 'Update Location' : 'Get My Location'}
          </Button>
          <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Add a location to track expenses and get AI suggestions
                </DialogDescription>
              </DialogHeader>
              <LocationForm 
                onSubmit={handleAddLocation} 
                onCancel={() => {
                  setShowAddLocation(false);
                  setClickedCoordinates(null);
                }}
                initialCoordinates={clickedCoordinates}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Location Status */}
      {currentLocation && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Location:</strong> {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations by name, address, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => (
          <Card 
            key={location.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleLocationSelect(location)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getLocationColor(location.type)}`}>
                    {getLocationIcon(location.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <CardDescription className="text-sm">{location.category}</CardDescription>
                  </div>
                </div>
                {location.isFavorite && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Favorite
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{location.address}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Visits:</span>
                <span className="font-medium">{location.visitCount}</span>
              </div>
              
              {location.averageSpending && location.averageSpending > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Spending:</span>
                  <span className="font-medium text-green-600">
                    ${location.averageSpending.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Visited:</span>
                <span className="font-medium">
                  {location.lastVisited.toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Suggestions */}
      {selectedLocation && aiSuggestions.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Suggestions for {selectedLocation.name}
            </CardTitle>
            <CardDescription>
              Smart recommendations based on your location and spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expense Suggestion */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Suggested Expense
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-lg font-bold text-green-600">
                        ${suggestion.suggestedExpense.amount.toFixed(2)}
                      </div>
                      <p className="text-sm text-green-700">
                        {suggestion.suggestedExpense.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.suggestedExpense.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        {Math.round(suggestion.suggestedExpense.confidence * 100)}% confidence
                      </div>
                    </CardContent>
                  </Card>

                  {/* Budget Suggestion */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Suggested Budget
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-lg font-bold text-blue-600">
                        ${suggestion.suggestedBudget.monthlyAmount.toFixed(2)}/month
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.suggestedBudget.category}
                      </Badge>
                      <p className="text-xs text-blue-700">
                        {suggestion.suggestedBudget.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Interactive Location Map
          </CardTitle>
          <CardDescription>
            Click on markers to view location details, or click on the map to add new locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border">
            <InteractiveMap
              locations={locations}
              currentLocation={currentLocation}
              onLocationSelect={handleLocationSelect}
              onMapClick={(lat, lng) => {
                // Open add location dialog with pre-filled coordinates
                setClickedCoordinates({ lat, lng });
                setShowAddLocation(true);
              }}
              height="100%"
              className="rounded-lg"
            />
          </div>
          
          {/* Map Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Home</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Restaurant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Gas Station</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Entertainment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Your Location</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Location Form Component
function LocationForm({ 
  onSubmit, 
  onCancel,
  initialCoordinates
}: { 
  onSubmit: (data: Partial<Location>) => void; 
  onCancel: () => void;
  initialCoordinates?: { lat: number; lng: number } | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: initialCoordinates?.lat || 0,
    longitude: initialCoordinates?.lng || 0,
    type: 'other' as Location['type'],
    category: 'Other',
    averageSpending: 0
  });

  // Update form data when initial coordinates change
  useEffect(() => {
    if (initialCoordinates) {
      setFormData(prev => ({
        ...prev,
        latitude: initialCoordinates.lat,
        longitude: initialCoordinates.lng
      }));
    }
  }, [initialCoordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const locationTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Building },
    { value: 'restaurant', label: 'Restaurant', icon: Utensils },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'gas_station', label: 'Gas Station', icon: Fuel },
    { value: 'entertainment', label: 'Entertainment', icon: Coffee },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Location Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Starbucks Downtown"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="e.g., 123 Main St, City, State"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
            placeholder="40.7128"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
            placeholder="-74.0060"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Get Current Location</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    }));
                  },
                  (error) => {
                    console.error('Error getting location:', error);
                  }
                );
              }
            }}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Use My Current Location
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Location Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Location['type'] }))}
            className="w-full p-2 border border-input rounded-md"
          >
            {locationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Food & Dining"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="averageSpending">Average Spending</Label>
          <Input
            id="averageSpending"
            type="number"
            step="0.01"
            value={formData.averageSpending}
            onChange={(e) => setFormData(prev => ({ ...prev, averageSpending: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Location
        </Button>
      </div>
    </form>
  );
}
