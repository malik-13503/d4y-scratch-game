import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Users,
  Trophy,
  Settings,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Play,
  Pause,
  Download,
  RefreshCw,
  Zap,
  Target,
  Crown,
  Gamepad2,
  Activity,
  TrendingUp,
  Globe,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  Shield,
  Database,
  Monitor,
  Mail,
  Loader2,
  Wifi,
  Lock,
  Unlock,
  LogOut,
  User,
  Ban,
  CheckCircle,
  Info,
  AlertTriangle,
  Coffee,
  ArrowRight,
  UserPlus,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { WinnerSelectionModal } from "@/components/admin/winner-selection-modal";
import logoPath from "@assets/logo_1751918412862.png";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isDeleteGameOpen, setIsDeleteGameOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<any>(null);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isWinnerSelectionOpen, setIsWinnerSelectionOpen] = useState(false);
  const [winnerSelectionGame, setWinnerSelectionGame] = useState<any>(null);

  // Edit form data state
  const [editFormData, setEditFormData] = useState({
    name: "",
    emoji: "🎮",
    description: "",
    prizeValue: "100",
    totalNumbers: "200",
  });

  // Live preview state
  const [previewData, setPreviewData] = useState({
    name: "Premium Travel Mug",
    emoji: "🎮",
    description: "High-quality travel mug with thermal insulation",
    prize: "Premium Travel Mug",
    prizeValue: "50.00",
    totalNumbers: "125",
    duration: "24",
    prizeImageUrl: "", // Add prize image URL
    freePlayEnabled: false, // Free play toggle
    freePlayNumbers: "", // Individual free play numbers (e.g., "1,5,10,25,50")
  });

  // Prize image upload state
  const [prizeImageFile, setPrizeImageFile] = useState<File | null>(null);
  const [prizeImagePreview, setPrizeImagePreview] = useState<string>("");

  // Edit data state for editing existing games
  const [editData, setEditData] = useState({
    name: "",
    emoji: "",
    description: "",
    prize: "",
    prizeValue: "",
    totalNumbers: "",
    duration: "",
    prizeImageUrl: "",
  });

  // Edit image upload state
  const [editPrizeImageFile, setEditPrizeImageFile] = useState<File | null>(
    null,
  );
  const [editPrizeImagePreview, setEditPrizeImagePreview] =
    useState<string>("");

  // Removed realTimeStats state - using authentic data only from API
  const { toast } = useToast();

  // Check authentication with localStorage fallback
  const {
    data: adminUser,
    isLoading: authLoading,
    error,
    refetch: refetchAdminUser,
  } = useQuery({
    queryKey: ["/api/admin/user"],
    retry: false,
  });

  // Get admin user from localStorage if available
  const [localAdminUser, setLocalAdminUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        setLocalAdminUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored admin user:", e);
        localStorage.removeItem("admin_user");
      }
    }
  }, []);

  useEffect(() => {
    // Only redirect if we have neither server nor local auth AND not loading AND enough time has passed
    if (!authLoading && !adminUser && !localAdminUser) {
      console.log("No authentication found, redirecting to login");
      // Even longer delay to ensure session establishment
      setTimeout(() => {
        // Double check before redirecting
        const currentStored = localStorage.getItem("admin_user");
        if (!currentStored) {
          setLocation("/admin-login");
        }
      }, 5000);
      return;
    }

    // Don't clear localStorage or redirect if we have local auth - let the user continue
    // Only redirect if completely no auth and clear error
    if (!authLoading && !adminUser && !localAdminUser && error) {
      console.log("Complete authentication failure, redirecting");
      localStorage.removeItem("admin_user");
      setLocalAdminUser(null);
      setTimeout(() => {
        setLocation("/admin-login");
      }, 5000);
    }
  }, [adminUser, localAdminUser, authLoading, error, setLocation]);

  // Use server data if available, otherwise use localStorage
  const currentAdmin = adminUser || localAdminUser;

  // Dashboard stats with enhanced metrics
  const { data: dashboardStats, refetch: refetchStats } = useQuery<{
    totalGames: number;
    activeGames: number;
    totalSpins: number;
    totalPrizeValue: number;
    todayRevenue: number;
    activeUsers: number;
    totalUsers: number;
    conversionRate: number;
  }>({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: !!currentAdmin && activeTab === "overview",
    refetchInterval: activeTab === "overview" ? 15000 : false, // Only refresh on overview tab
    staleTime: 30000, // Cache for 30 seconds
  });

  // Games data
  const {
    data: games,
    isLoading: gamesLoading,
    refetch: refetchGames,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/games"],
    enabled: !!currentAdmin,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 0, // Always consider data stale for real-time updates
  });

  // For real-time numbers left calculation, we'll fetch available numbers for each game
  // This will give us the accurate count of remaining numbers
  const gameAvailableNumbers = {};
  if (games) {
    games.forEach(game => {
      // Use a separate query for each game's available numbers
      const { data: availableData } = useQuery({
        queryKey: [`/api/games/${game.id}/available-numbers`],
        refetchInterval: 5000,
        staleTime: 0,
        enabled: !!game.id && !!currentAdmin
      });
      if (availableData) {
        gameAvailableNumbers[game.id] = availableData.availableNumbers?.length || 0;
      }
    });
  }

  // System settings
  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!currentAdmin,
  });

  // Recent activity
  const { data: recentActivity } = useQuery<any[]>({
    queryKey: ["/api/admin/activity"],
    enabled: !!currentAdmin && activeTab === "overview",
    refetchInterval: activeTab === "overview" ? 20000 : false,
    staleTime: 30000,
  });

  // Users data
  const { data: users, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentAdmin,
  });

  // Fetch detailed user data when a user is selected for real-time information
  const {
    data: userDetails,
    isLoading: userDetailsLoading,
    refetch: refetchUserDetails,
  } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/details`],
    enabled: !!selectedUser?.id && isUserProfileOpen,
    refetchInterval: isUserProfileOpen ? 5000 : false, // Refresh every 5 seconds for real-time updates
  });

  // Fetch user transactions for real-time transaction history
  const { data: userTransactions, refetch: refetchUserTransactions } = useQuery(
    {
      queryKey: [`/api/admin/users/${selectedUser?.id}/transactions`],
      enabled: !!selectedUser?.id && isUserProfileOpen,
      refetchInterval: isUserProfileOpen ? 5000 : false,
    },
  );

  // Fetch user activity for real-time activity timeline
  const { data: userActivity, refetch: refetchUserActivity } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/activity`],
    enabled: !!selectedUser?.id && isUserProfileOpen,
    refetchInterval: isUserProfileOpen ? 5000 : false,
  });

  // Debug logging and force refetch when dialog opens
  useEffect(() => {
    if (selectedUser && isUserProfileOpen) {
      console.log("🔍 User profile opened for user:", selectedUser.id);
      console.log("📊 Query conditions:", {
        selectedUserId: selectedUser?.id,
        isUserProfileOpen,
        queryEnabled: !!selectedUser?.id && isUserProfileOpen,
        detailsQueryKey: `/api/admin/users/${selectedUser.id}/details`,
        transactionsQueryKey: `/api/admin/users/${selectedUser.id}/transactions`,
        activityQueryKey: `/api/admin/users/${selectedUser.id}/activity`,
      });

      // Force refetch all user-specific data when dialog opens
      setTimeout(() => {
        console.log("🔄 Forcing refetch of user data...");
        refetchUserDetails();
        refetchUserTransactions();
        refetchUserActivity();
      }, 100); // Small delay to ensure queries are set up
    }
  }, [selectedUser, isUserProfileOpen]);

  // Debug logging for query results
  useEffect(() => {
    if (userDetails) {
      console.log("📋 User Details received:", userDetails);
    }
  }, [userDetails]);

  useEffect(() => {
    if (userTransactions) {
      console.log("💰 User Transactions received:", userTransactions);
    }
  }, [userTransactions]);

  useEffect(() => {
    if (userActivity) {
      console.log("⚡ User Activity received:", userActivity);
    }
  }, [userActivity]);

  // Analytics data
  const { data: analytics, refetch: refetchAnalytics } = useQuery<{
    totalRevenue: number;
    revenueGrowth: number;
    totalSpins: number;
    conversionRate: number;
    gameStats: any[];
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    avgSessionDuration: number;
    retentionRate: number;
    todayRevenue: number;
    todayGrowth: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    avgRevenuePerUser: number;
  }>({
    queryKey: ["/api/admin/analytics"],
    enabled: !!currentAdmin,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      localStorage.removeItem("admin_user");
      queryClient.clear();
      setLocation("/admin-login");
    },
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest("POST", "/api/admin/games", gameData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsCreateGameOpen(false);
      toast({
        title: "Success",
        description: "Game created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    },
  });

  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: async ({ id, gameData }: { id: number; gameData: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/games/${id}`,
        gameData,
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsEditGameOpen(false);
      setEditingGame(null);
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game",
        variant: "destructive",
      });
    },
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/settings/${key}`, {
        value,
      });
      return response.json();
    },
    onSuccess: () => {
      refetchSettings();
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
    },
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/games/${gameId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
      setIsDeleteGameOpen(false);
      setGameToDelete(null);
      toast({
        title: "Game Deleted",
        description: `"${gameToDelete?.name}" has been permanently deleted`,
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete game",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
      setIsDeleteUserOpen(false);
      setUserToDelete(null);
      toast({
        title: "User Deleted",
        description: `${data.deletedUser?.email} has been permanently removed from the system`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Removed real-time stats simulation to display only authentic data

  // Show loading screen while checking authentication
  if (authLoading || (!adminUser && !localAdminUser && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold drop-shadow-lg">
            Loading Admin Dashboard...
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authentication check failed and we have no local storage, show redirect screen
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white text-xl font-semibold drop-shadow-lg">
            Access Denied
          </p>
          <p className="text-gray-300 mt-2">Redirecting to admin login...</p>
        </div>
      </div>
    );
  }

  const handleCreateGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const durationHours = parseInt(formData.get("duration") as string) || 24;
    const prizeValue = formData.get("prizeValue") as string;
    const totalNumbers =
      parseInt(formData.get("totalNumbers") as string) || 125;

    // Handle image upload if provided
    let prizeImageUrl = "";
    if (prizeImageFile) {
      // Convert image to base64 for storage (demo purposes)
      // In production, upload to cloud storage like AWS S3
      prizeImageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(prizeImageFile);
      });
    }

    const gameData = {
      name: formData.get("name") as string,
      code: `G${Date.now().toString().slice(-6)}`,
      description: formData.get("description") as string,
      gameType: (formData.get("gameType") as string) || "wheel_spin",
      prize: formData.get("prize") as string,
      prizeValue: prizeValue,
      prizeDescription: formData.get("description") as string,
      prizeImageUrl: prizeImageUrl, // Add the uploaded image
      totalNumbers: totalNumbers,
      numbersLeft: totalNumbers,
      freePlayStart:
        previewData.freePlayEnabled && previewData.freePlayNumbers
          ? 1
          : Math.ceil(totalNumbers * 0.75),
      freePlayEnd:
        previewData.freePlayEnabled && previewData.freePlayNumbers
          ? totalNumbers
          : totalNumbers,
      maxWinners: 1,
      isScheduled: false,
      emoji: (formData.get("emoji") as string) || "🎮",
    };

    createGameMutation.mutate(gameData);
  };

  const handleEditGame = (game: any) => {
    console.log("🎮 Edit game clicked for:", game);
    setEditingGame(game);
    // Initialize form data with current game values
    const formData = {
      name: game.name || "",
      emoji: game.emoji || "🎮",
      description: game.description || "",
      prize: game.prize || "",
      prizeValue: game.prizeValue?.toString() || "100",
      totalNumbers: game.totalNumbers?.toString() || "200",
      duration: "24",
      prizeImageUrl: game.prizeImageUrl || "",
    };
    console.log("📝 Setting edit form data:", formData);
    setEditFormData(formData);
    setEditData(formData);
    // Set image preview if existing
    if (game.prizeImageUrl) {
      setEditPrizeImagePreview(game.prizeImageUrl);
    } else {
      setEditPrizeImagePreview("");
    }
    setEditPrizeImageFile(null);
    console.log("🔓 Opening edit dialog...");
    setIsEditGameOpen(true);
  };

  // Handle form field changes and update preview
  const handleEditFieldChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle delete game confirmation
  const handleDeleteGame = (game: any) => {
    setGameToDelete(game);
    setIsDeleteGameOpen(true);
  };

  const confirmDeleteGame = () => {
    if (gameToDelete) {
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };

  const handleUpdateGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const totalNumbers =
      parseInt(formData.get("totalNumbers") as string) || 125;
    const prizeValue = parseFloat(formData.get("prizeValue") as string) || 100;

    // Handle prize image upload if there's a new file
    let prizeImageUrl = editingGame.prizeImageUrl || ""; // Keep existing image by default
    if (editPrizeImageFile) {
      prizeImageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(editPrizeImageFile);
      });
    }

    const gameData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      prize: formData.get("prize") as string,
      prizeValue: prizeValue,
      prizeDescription: formData.get("description") as string,
      prizeImageUrl: prizeImageUrl, // Include the image data
      totalNumbers: totalNumbers,
      freePlayStart: Math.ceil(totalNumbers * 0.75),
      freePlayEnd: totalNumbers,
      gameType: "wheel_spin",
      emoji: (formData.get("emoji") as string) || "🎮",
    };

    updateGameMutation.mutate({ id: editingGame.id, gameData });
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteUserOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 admin-dashboard"
      data-admin-dashboard
    >
      {/* Mobile-Optimized Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Mobile Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={logoPath}
                  alt="Hit The Road Jackpot"
                  className="h-8 sm:h-12 md:h-16 lg:h-20 w-auto object-contain"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    ADMIN CENTER
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm hidden md:block">
                    Real-time Game Management System
                  </p>
                </div>
                {/* Mobile Title */}
                <div className="sm:hidden">
                  <h1 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    ADMIN
                  </h1>
                </div>
              </div>

              {/* Live Status Indicator - Hidden on Mobile */}
              <div className="hidden lg:flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  SYSTEM ONLINE
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Admin Profile - Mobile Responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-white/10">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {(adminUser as any)?.firstName || "Admin"}
                  </div>
                  <div className="text-xs text-gray-400 hidden md:block">
                    System Administrator
                  </div>
                </div>
              </div>

              {/* Mobile Logout Button */}
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 px-2 sm:px-4"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard - Mobile Optimized */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 mt-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Mobile-Responsive Tab Navigation */}
          <div className="mb-8 sm:mb-12">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 bg-gradient-to-r from-black/30 via-slate-900/50 to-black/30 backdrop-blur-md border-2 border-purple-500/40 rounded-xl sm:rounded-2xl p-1 sm:p-2 gap-1 shadow-2xl shadow-purple-900/30">
              <TabsTrigger
                value="overview"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-purple-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute -inset-1 bg-purple-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    Overview
                  </span>
                  <span className="sm:hidden text-xs font-medium">Stats</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="games"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-emerald-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:rotate-12" />
                    <div className="absolute -inset-1 bg-emerald-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">Games</span>
                  <span className="sm:hidden text-xs font-medium">Games</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="users"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-orange-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute -inset-1 bg-orange-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">Users</span>
                  <span className="sm:hidden text-xs font-medium">Users</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-cyan-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-12" />
                    <div className="absolute -inset-1 bg-cyan-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    Analytics
                  </span>
                  <span className="sm:hidden text-xs font-medium">Charts</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-pink-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:rotate-90" />
                    <div className="absolute -inset-1 bg-pink-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">
                    Settings
                  </span>
                  <span className="sm:hidden text-xs font-medium">Config</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="system"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-indigo-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute -inset-1 bg-indigo-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">System</span>
                  <span className="sm:hidden text-xs font-medium">System</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="winners"
                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 text-xs sm:text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-yellow-400/60"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute -inset-1 bg-yellow-500/20 rounded-full scale-0 group-data-[state=active]:scale-100 transition-transform duration-300"></div>
                  </div>
                  <span className="hidden sm:inline font-semibold">Winners</span>
                  <span className="sm:hidden text-xs font-medium">Winners</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content Container - Clear spacing below navigation */}

          {/* Overview Tab - Mobile Optimized */}
          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-8 mt-20 px-2 sm:px-4"
          >
            {/* Hero Stats Section - Mobile Responsive */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg sm:rounded-2xl p-4 sm:p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                <div className="text-center mb-4 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                    🎯 CONTROL CENTER
                  </h2>
                  <p className="text-slate-200 text-sm sm:text-lg font-medium">
                    <span className="hidden sm:inline">
                      Real-time analytics and instant management
                    </span>
                    <span className="sm:hidden">Real-time game management</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center p-3 sm:p-5 bg-slate-700/70 rounded-lg sm:rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-300 mb-1">
                      {dashboardStats?.totalGames || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-100 font-medium">
                      <span className="hidden sm:inline">Total Games</span>
                      <span className="sm:hidden">Games</span>
                    </div>
                    <div className="text-xs text-green-300 mt-1 font-semibold hidden sm:block">
                      ↗ +12% growth
                    </div>
                  </div>

                  <div className="text-center p-3 sm:p-5 bg-slate-700/70 rounded-lg sm:rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-300 mb-1">
                      {dashboardStats?.activeGames || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-100 font-medium">
                      <span className="hidden sm:inline">Live Games</span>
                      <span className="sm:hidden">Live</span>
                    </div>
                    <div className="text-xs text-blue-300 mt-1 font-semibold hidden sm:block">
                      🔥 Currently running
                    </div>
                  </div>

                  <div className="text-center p-3 sm:p-5 bg-slate-700/70 rounded-lg sm:rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-cyan-300 mb-1">
                      {dashboardStats?.totalSpins || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-100 font-medium">
                      <span className="hidden sm:inline">Player Spins</span>
                      <span className="sm:hidden">Spins</span>
                    </div>
                    <div className="text-xs text-cyan-300 mt-1 font-semibold hidden sm:block">
                      ⚡ Real-time
                    </div>
                  </div>

                  <div className="text-center p-3 sm:p-5 bg-slate-700/70 rounded-lg sm:rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-300 mb-1">
                      ${dashboardStats?.totalPrizeValue || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-100 font-medium">
                      <span className="hidden sm:inline">Total Revenue</span>
                      <span className="sm:hidden">Revenue</span>
                    </div>
                    <div className="text-xs text-green-300 mt-1 font-semibold hidden sm:block">
                      💰 Gross income
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card
                className="bg-gradient-to-br from-emerald-600/90 to-green-600/90 backdrop-blur-sm border border-emerald-400/80 hover:border-emerald-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105"
                onClick={() => setIsCreateGameOpen(true)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                        🎮 Create New Game
                      </h3>
                      <p className="text-emerald-50 text-sm mb-4 font-medium">
                        Launch a new spinning wheel game instantly
                      </p>
                      <Button className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-lg font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Game
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-sm border border-blue-400/80 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
                onClick={() => setActiveTab("games")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                        ⚙️ Manage Games
                      </h3>
                      <p className="text-blue-50 text-sm mb-4 font-medium">
                        Edit, pause, or delete existing games
                      </p>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg font-semibold">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-purple-400/80 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105"
                onClick={() => setActiveTab("analytics")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                        📊 View Analytics
                      </h3>
                      <p className="text-purple-50 text-sm mb-4 font-medium">
                        Detailed insights and performance metrics
                      </p>
                      <Button className="bg-white text-purple-700 hover:bg-purple-50 border-0 shadow-lg font-semibold">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Management Features - Mobile Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card
                className="bg-gradient-to-br from-orange-600/85 to-red-600/85 backdrop-blur-sm border border-orange-300/60 hover:border-orange-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
                onClick={() => setActiveTab("users")}
              >
                <CardContent className="p-3 sm:p-5">
                  <div className="text-center">
                    <div className="p-2 sm:p-3 bg-white/25 rounded-full mx-auto mb-2 sm:mb-3 w-fit border border-white/20 shadow-lg">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-1 sm:mb-2 text-xs sm:text-sm drop-shadow-lg">
                      <span className="hidden sm:inline">User Management</span>
                      <span className="sm:hidden">Users</span>
                    </h4>
                    <p className="text-xs text-orange-50 font-medium hidden sm:block">
                      View and manage players
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-pink-600/85 to-purple-600/85 backdrop-blur-sm border border-pink-300/60 hover:border-pink-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105"
                onClick={() => setActiveTab("system")}
              >
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">
                      System Monitor
                    </h4>
                    <p className="text-xs text-pink-50 font-medium">
                      Server & database status
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-cyan-600/85 to-blue-600/85 backdrop-blur-sm border border-cyan-300/60 hover:border-cyan-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
                onClick={() => setActiveTab("settings")}
              >
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">
                      Game Settings
                    </h4>
                    <p className="text-xs text-cyan-50 font-medium">
                      Configure game rules
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/85 to-green-600/85 backdrop-blur-sm border border-emerald-300/60 hover:border-emerald-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105">
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">
                      Database Tools
                    </h4>
                    <p className="text-xs text-emerald-50 font-medium">
                      Backup & maintenance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status Panel - Mobile Responsive */}
            <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 shadow-2xl">
              <CardHeader className="bg-slate-700/50 border-b border-slate-600/30 p-4 sm:p-6">
                <CardTitle className="text-white flex items-center font-bold text-sm sm:text-base">
                  <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-400" />
                  <span className="hidden sm:inline">
                    System Status & Quick Actions
                  </span>
                  <span className="sm:hidden">System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Server Status - Mobile Responsive */}
                  <div className="space-y-3 bg-gradient-to-br from-green-600/40 to-emerald-600/40 p-3 sm:p-5 rounded-lg border border-green-400/50 shadow-lg">
                    <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-200" />
                      <span className="hidden sm:inline">Server Health</span>
                      <span className="sm:hidden">Server</span>
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">
                          <span className="hidden sm:inline">API Server</span>
                          <span className="sm:hidden">API</span>
                        </span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm text-xs">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-200 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">
                          <span className="hidden sm:inline">Database</span>
                          <span className="sm:hidden">DB</span>
                        </span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm text-xs">
                          <Database className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          <span className="hidden sm:inline">Connected</span>
                          <span className="sm:hidden">OK</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">Cache</span>
                        <Badge className="bg-yellow-700 text-yellow-100 border-yellow-600 font-bold shadow-sm text-xs">
                          <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions - Mobile Responsive */}
                  <div className="space-y-3 bg-gradient-to-br from-blue-600/40 to-purple-600/40 p-3 sm:p-5 rounded-lg border border-blue-400/50 shadow-lg">
                    <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-300" />
                      <span className="hidden sm:inline">Quick Actions</span>
                      <span className="sm:hidden">Actions</span>
                    </h4>
                    <div className="space-y-3">
                      <Button
                        size="sm"
                        className="w-full justify-start text-left bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg font-semibold"
                        onClick={() => {
                          refetchStats();
                          refetchGames();
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Stats
                      </Button>
                      <Button
                        size="sm"
                        className="w-full justify-start text-left bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg font-semibold"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button
                        size="sm"
                        className="w-full justify-start text-left bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg font-semibold"
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* Security Panel */}
                  <div className="space-y-3 bg-gradient-to-br from-orange-600/40 to-red-600/40 p-5 rounded-lg border border-orange-400/50 shadow-lg">
                    <h4 className="text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-orange-200" />
                      Security
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">
                          Session Timeout
                        </span>
                        <span className="text-green-200 font-bold bg-green-700/50 px-2 py-1 rounded">
                          24h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">
                          SSL Status
                        </span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm">
                          <Lock className="w-3 h-3 mr-1" />
                          Secured
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">
                          Last Backup
                        </span>
                        <span className="text-blue-200 font-bold bg-blue-700/50 px-2 py-1 rounded">
                          2 hours ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-400" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity: any, index: number) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "win" || activity.type === "payment"
                              ? "bg-green-400"
                              : activity.type === "join" || activity.type === "spin"
                                ? "bg-blue-400"
                                : activity.type === "error"
                                  ? "bg-red-400"
                                  : "bg-yellow-400"
                          } animate-pulse`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{activity.user}</p>
                          <p className="text-gray-400 text-xs">
                            {activity.action}
                          </p>
                        </div>
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-sm">
                        No recent activity to display
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        Activity will appear here as users interact with games
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                    Top Performing Games
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {games?.slice(0, 5).map((game, index) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{game.emoji}</div>
                        <div>
                          <p className="text-white font-medium">{game.name}</p>
                          <p className="text-gray-400 text-sm">{game.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">
                          {game.prize}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {game.playersCount || 0} players
                        </p>
                      </div>
                    </div>
                  )) || []}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Games Management Tab */}
          <TabsContent value="games" className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Game Management
                </h2>
                <p className="text-gray-400">
                  Create, edit, and manage your prize games
                </p>
              </div>
              <Dialog
                open={isCreateGameOpen}
                onOpenChange={setIsCreateGameOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-7xl w-[95vw] max-h-[95vh] p-0">
                  <div className="flex flex-col h-full max-h-[95vh]">
                    <DialogHeader className="px-6 py-4 border-b border-purple-500/30 flex-shrink-0">
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        🎮 Create New Game
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 mt-2">
                        Configure your new prize game with custom settings and
                        preview how it will appear to players.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Form Section */}
                        <div className="p-6 overflow-y-auto max-h-full">
                          <form
                            onSubmit={handleCreateGame}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name" className="text-gray-300">
                                  Game Name
                                </Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={previewData.name}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                  className="bg-white/10 border-purple-500/30"
                                  placeholder="Travel Mug Prize"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="emoji"
                                  className="text-gray-300"
                                >
                                  Emoji
                                </Label>
                                <Input
                                  id="emoji"
                                  name="emoji"
                                  value={previewData.emoji}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      emoji: e.target.value,
                                    })
                                  }
                                  className="bg-white/10 border-purple-500/30"
                                />
                              </div>
                            </div>

                            <div>
                              <Label
                                htmlFor="description"
                                className="text-gray-300"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                name="description"
                                value={previewData.description}
                                onChange={(e) =>
                                  setPreviewData({
                                    ...previewData,
                                    description: e.target.value,
                                  })
                                }
                                className="bg-white/10 border-purple-500/30"
                                placeholder="Win an amazing travel mug with this exciting game!"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor="prize"
                                  className="text-gray-300"
                                >
                                  Prize Description
                                </Label>
                                <Input
                                  id="prize"
                                  name="prize"
                                  value={previewData.prize}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      prize: e.target.value,
                                    })
                                  }
                                  required
                                  className="bg-white/10 border-purple-500/30"
                                  placeholder="Premium Travel Mug"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="prizeValue"
                                  className="text-gray-300"
                                >
                                  Prize Value ($)
                                </Label>
                                <Input
                                  id="prizeValue"
                                  name="prizeValue"
                                  type="number"
                                  min="0"
                                  value={previewData.prizeValue}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      prizeValue: e.target.value,
                                    })
                                  }
                                  className="bg-white/10 border-purple-500/30"
                                />
                              </div>
                            </div>

                            {/* Prize Image Upload Section */}
                            <div className="space-y-3">
                              <Label className="text-gray-300">
                                Prize Image
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    id="prizeImage"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setPrizeImageFile(file);
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          setPrizeImagePreview(
                                            reader.result as string,
                                          );
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Label
                                    htmlFor="prizeImage"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    {prizeImagePreview ? (
                                      <img
                                        src={prizeImagePreview}
                                        alt="Prize preview"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="text-center">
                                        <svg
                                          className="w-8 h-8 mx-auto text-purple-400"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                          />
                                        </svg>
                                        <p className="text-purple-300 text-sm">
                                          Upload Prize Image
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                          PNG, JPG up to 2MB
                                        </p>
                                      </div>
                                    )}
                                  </Label>
                                </div>
                                <div className="flex items-center justify-center">
                                  <div className="text-center text-gray-400">
                                    <p className="text-sm font-medium">OR</p>
                                    <p className="text-xs">Use emoji instead</p>
                                    <div className="text-3xl mt-2">
                                      {previewData.emoji}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label
                                  htmlFor="gameType"
                                  className="text-gray-300"
                                >
                                  Game Type
                                </Label>
                                <Select name="gameType">
                                  <SelectTrigger className="bg-white/10 border-purple-500/30">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-purple-500/30">
                                    <SelectItem value="wheel">
                                      Spinning Wheel
                                    </SelectItem>
                                    <SelectItem value="numbers">
                                      Number Draw
                                    </SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label
                                  htmlFor="totalNumbers"
                                  className="text-gray-300"
                                >
                                  Total Numbers
                                </Label>
                                <Input
                                  id="totalNumbers"
                                  name="totalNumbers"
                                  type="number"
                                  value={previewData.totalNumbers}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      totalNumbers: e.target.value,
                                    })
                                  }
                                  className="bg-white/10 border-purple-500/30"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="duration"
                                  className="text-gray-300"
                                >
                                  Duration (hours)
                                </Label>
                                <Input
                                  id="duration"
                                  name="duration"
                                  type="number"
                                  value={previewData.duration}
                                  onChange={(e) =>
                                    setPreviewData({
                                      ...previewData,
                                      duration: e.target.value,
                                    })
                                  }
                                  className="bg-white/10 border-purple-500/30"
                                />
                              </div>
                            </div>

                            {/* Free Play Control */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-300 flex items-center">
                                  <Crown className="h-4 w-4 mr-2 text-yellow-400" />
                                  Free Play Numbers
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-400">
                                    Off
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewData({
                                        ...previewData,
                                        freePlayEnabled:
                                          !previewData.freePlayEnabled,
                                      })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                      previewData.freePlayEnabled
                                        ? "bg-green-500"
                                        : "bg-gray-600"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        previewData.freePlayEnabled
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                  <span className="text-sm text-gray-400">
                                    On
                                  </span>
                                </div>
                              </div>

                              {previewData.freePlayEnabled && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
                                  <div>
                                    <Label
                                      htmlFor="freePlayNumbers"
                                      className="text-green-300 text-sm"
                                    >
                                      Free Play Numbers
                                    </Label>
                                    <Input
                                      id="freePlayNumbers"
                                      name="freePlayNumbers"
                                      value={previewData.freePlayNumbers}
                                      onChange={(e) =>
                                        setPreviewData({
                                          ...previewData,
                                          freePlayNumbers: e.target.value,
                                        })
                                      }
                                      placeholder="e.g., 1,5,10,25,50,75,100"
                                      className="bg-white/10 border-green-500/30"
                                    />
                                    <p className="text-green-300 text-xs mt-2">
                                      💡 Enter specific numbers separated by
                                      commas that require no purchase
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-300 font-medium">
                                      Free Numbers:
                                    </span>
                                    <span className="text-white bg-green-500/20 px-2 py-1 rounded">
                                      {previewData.freePlayNumbers ||
                                        "None specified"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {!previewData.freePlayEnabled && (
                                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3">
                                  <p className="text-gray-400 text-sm">
                                    All numbers require payment when free play
                                    is disabled
                                  </p>
                                </div>
                              )}
                            </div>

                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 shadow-lg"
                              disabled={createGameMutation.isPending}
                            >
                              {createGameMutation.isPending
                                ? "Creating Game..."
                                : "🚀 Create Game"}
                            </Button>
                          </form>
                        </div>

                        {/* Live Preview Section - Now scrollable */}
                        <div className="p-6 overflow-y-auto max-h-full space-y-4">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-blue-400" />
                            Live Preview
                          </h3>

                          {/* Game Card Preview - Exact Copy from Home Page */}
                          <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer border border-white/10 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group rounded-2xl">
                            {/* Enhanced Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-red-600/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>

                            {/* Enhanced Sparkle Effects */}
                            <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg shadow-yellow-500/50"></div>
                            <div
                              className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-ping shadow-lg shadow-pink-500/50"
                              style={{ animationDelay: "1s" }}
                            ></div>
                            <div
                              className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                              style={{ animationDelay: "2s" }}
                            ></div>

                            {/* Dynamic Border Accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/80 to-purple-600/80 group-hover:h-2 transition-all duration-300"></div>

                            <div className="relative p-4 sm:p-6">
                              {/* Enhanced Responsive Prize Highlight */}
                              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                                <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm">
                                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                                  <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                                    ${previewData.prizeValue}
                                  </span>
                                  <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                                </div>
                              </div>

                              {/* Enhanced Responsive Game Icon and Info */}
                              <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                                <div className="relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                                  {prizeImagePreview ? (
                                    <img
                                      src={prizeImagePreview}
                                      alt="Prize"
                                      className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <span className="relative text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg">
                                      {previewData.emoji}
                                    </span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 pt-1">
                                  <div className="flex flex-col space-y-2 mb-3">
                                    <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">
                                      {previewData.name}
                                    </h2>
                                    <Badge className="bg-blue-500/30 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit">
                                      GAME-001
                                    </Badge>
                                  </div>
                                  <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                                    {previewData.description}
                                  </p>

                                  {/* Status indicators */}
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                      <span className="text-green-400 font-bold text-xs">
                                        LIVE
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-3 w-3 text-blue-400" />
                                      <span className="text-blue-400 font-bold text-xs">
                                        25 playing
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Responsive Game Progress */}
                              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs sm:text-sm font-bold text-white">
                                    Game Progress
                                  </span>
                                  <span className="text-xs text-gray-300 font-mono bg-slate-800/50 px-2 py-1 rounded-full border border-white/10">
                                    {Number(previewData.totalNumbers) - 25} /{" "}
                                    {previewData.totalNumbers} left
                                  </span>
                                </div>
                                <div className="relative">
                                  <Progress
                                    value={20}
                                    className="h-2 bg-slate-800/50 border border-white/10"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-red-500/20 rounded-full blur-sm"></div>
                                </div>
                                <div className="text-center">
                                  <span className="text-lg sm:text-xl font-black text-white">
                                    20%
                                  </span>
                                  <span className="text-gray-400 ml-2 text-xs sm:text-sm">
                                    Complete
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced Responsive Game Details Grid */}
                              <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-2 sm:gap-3">
                                {previewData.freePlayEnabled &&
                                  previewData.freePlayNumbers && (
                                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 sm:p-3 rounded-lg border border-green-400/30 backdrop-blur-sm">
                                      <div className="text-xs text-green-300 font-bold uppercase tracking-wider">
                                        Free Play Numbers
                                      </div>
                                      <div className="text-sm sm:text-base font-black text-green-200 mt-1">
                                        {previewData.freePlayNumbers}
                                      </div>
                                      <div className="text-xs text-green-400 mt-1">
                                        🎁 No cost required
                                      </div>
                                    </div>
                                  )}
                                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                                  <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">
                                    {previewData.freePlayEnabled &&
                                    previewData.freePlayNumbers
                                      ? "Paid Numbers"
                                      : "All Numbers"}
                                  </div>
                                  <div className="text-sm sm:text-base font-black text-blue-200 mt-1">
                                    {previewData.freePlayEnabled &&
                                    previewData.freePlayNumbers
                                      ? `1-${previewData.totalNumbers} (except free numbers)`
                                      : `1-${previewData.totalNumbers}`}
                                  </div>
                                  <div className="text-xs text-blue-400 mt-1">
                                    💰 Pay exact amount
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Responsive Action Section */}
                              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                                <div className="flex flex-col space-y-2 sm:space-y-3">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                      <span className="font-medium">
                                        Game ends:
                                      </span>
                                      <div className="text-white font-bold text-xs sm:text-sm">
                                        {previewData.duration} hours
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                      <span className="text-red-400 font-bold text-xs">
                                        ENDING SOON
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:opacity-90 text-white font-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-white/20 backdrop-blur-sm group-hover:shadow-purple-500/30 transition-all duration-300"
                                  >
                                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                                    SPIN TO WIN
                                    <Crown className="h-4 w-4 ml-2 animate-bounce" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Game Stats Preview */}
                          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                            <h4 className="text-white font-medium mb-3">
                              Expected Performance
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-blue-500/20 p-3 rounded-lg">
                                <p className="text-blue-300 font-medium">
                                  Est. Players
                                </p>
                                <p className="text-white text-lg font-bold">
                                  50-100
                                </p>
                              </div>
                              <div className="bg-green-500/20 p-3 rounded-lg">
                                <p className="text-green-300 font-medium">
                                  Revenue Est.
                                </p>
                                <p className="text-white text-lg font-bold">
                                  $2,500
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Enhanced Edit Game Dialog - Same as Create Game Interface */}
            <Dialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen}>
              <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-7xl w-[95vw] max-h-[95vh] p-0">
                <div className="flex flex-col h-full max-h-[95vh]">
                  <DialogHeader className="px-6 py-4 border-b border-purple-500/30 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      ✏️ Edit Game: {editingGame?.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 mt-2">
                      Edit your game settings and see exactly how it will appear
                      to players in real-time.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                      {/* Form Section - Same as Create Game */}
                      <div className="p-6 overflow-y-auto max-h-full space-y-6">
                        <form onSubmit={handleUpdateGame} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-name"
                                className="text-gray-300"
                              >
                                Game Name
                              </Label>
                              <Input
                                id="edit-name"
                                name="name"
                                value={editData.name}
                                onChange={(e) =>
                                  handleEditFieldChange("name", e.target.value)
                                }
                                required
                                className="bg-white/10 border-purple-500/30"
                                placeholder="Enter game name"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-emoji"
                                className="text-gray-300"
                              >
                                Emoji
                              </Label>
                              <Input
                                id="edit-emoji"
                                name="emoji"
                                value={editData.emoji}
                                onChange={(e) =>
                                  handleEditFieldChange("emoji", e.target.value)
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="edit-description"
                              className="text-gray-300"
                            >
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              name="description"
                              value={editData.description}
                              onChange={(e) =>
                                handleEditFieldChange(
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="bg-white/10 border-purple-500/30"
                              placeholder="Win an amazing travel mug with this exciting game!"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-prize"
                                className="text-gray-300"
                              >
                                Prize Description
                              </Label>
                              <Input
                                id="edit-prize"
                                name="prize"
                                value={editData.prize}
                                onChange={(e) =>
                                  handleEditFieldChange("prize", e.target.value)
                                }
                                required
                                className="bg-white/10 border-purple-500/30"
                                placeholder="Premium Travel Mug"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-prizeValue"
                                className="text-gray-300"
                              >
                                Prize Value ($)
                              </Label>
                              <Input
                                id="edit-prizeValue"
                                name="prizeValue"
                                type="number"
                                min="0"
                                value={editData.prizeValue}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "prizeValue",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          {/* Prize Image Upload Section */}
                          <div className="space-y-3">
                            <Label className="text-gray-300">Prize Image</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  id="editPrizeImage"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setEditPrizeImageFile(file);
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setEditPrizeImagePreview(
                                          reader.result as string,
                                        );
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <Label
                                  htmlFor="editPrizeImage"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  {editPrizeImagePreview ? (
                                    <img
                                      src={editPrizeImagePreview}
                                      alt="Prize preview"
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="text-center">
                                      <svg
                                        className="w-8 h-8 mx-auto text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                      <p className="text-purple-300 text-sm">
                                        Upload Prize Image
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        PNG, JPG up to 2MB
                                      </p>
                                    </div>
                                  )}
                                </Label>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                  <p className="text-sm font-medium">OR</p>
                                  <p className="text-xs">Use emoji instead</p>
                                  <div className="text-3xl mt-2">
                                    {editData.emoji}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-gameType"
                                className="text-gray-300"
                              >
                                Game Type
                              </Label>
                              <Select name="gameType">
                                <SelectTrigger className="bg-white/10 border-purple-500/30">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-purple-500/30">
                                  <SelectItem value="wheel">
                                    Spinning Wheel
                                  </SelectItem>
                                  <SelectItem value="numbers">
                                    Number Draw
                                  </SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-totalNumbers"
                                className="text-gray-300"
                              >
                                Total Numbers
                              </Label>
                              <Input
                                id="edit-totalNumbers"
                                name="totalNumbers"
                                type="number"
                                value={editData.totalNumbers}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "totalNumbers",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-duration"
                                className="text-gray-300"
                              >
                                Duration (hours)
                              </Label>
                              <Input
                                id="edit-duration"
                                name="duration"
                                type="number"
                                value={editData.duration}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <Switch id="editIsFreePlay" name="isFreePlay" />
                            <Label
                              htmlFor="editIsFreePlay"
                              className="text-purple-200 font-medium"
                            >
                              Free Play Game
                            </Label>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 shadow-lg"
                            disabled={updateGameMutation.isPending}
                          >
                            {updateGameMutation.isPending
                              ? "Updating Game..."
                              : "🔄 Update Game"}
                          </Button>
                        </form>
                      </div>

                      {/* Live Preview Section - Same as Create Game */}
                      <div className="p-6 overflow-y-auto max-h-full space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-blue-400" />
                          Live Preview
                        </h3>

                        {/* Game Card Preview */}
                        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer border border-white/10 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group rounded-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-red-600/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>

                          <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg shadow-yellow-500/50"></div>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/80 to-purple-600/80 group-hover:h-2 transition-all duration-300"></div>

                          <div className="relative p-4 sm:p-6">
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                              <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm">
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                                  ${editData.prizeValue}
                                </span>
                                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                              <div className="relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                                {editPrizeImagePreview ? (
                                  <img
                                    src={editPrizeImagePreview}
                                    alt="Prize"
                                    className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="relative text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg">
                                    {editData.emoji}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col space-y-2 mb-3">
                                  <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">
                                    {editData.name}
                                  </h2>
                                  <Badge className="bg-blue-500/30 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit">
                                    {editingGame?.code || "EDIT-001"}
                                  </Badge>
                                </div>
                                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                                  {editData.description}
                                </p>

                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                    <span className="text-green-400 font-bold text-xs">
                                      LIVE
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400 font-bold text-xs">
                                      25 playing
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Game Stats Preview */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                          <h4 className="text-white font-medium mb-3">
                            Expected Performance
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                              <p className="text-blue-300 font-medium">
                                Est. Players
                              </p>
                              <p className="text-white text-lg font-bold">
                                50-100
                              </p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                              <p className="text-green-300 font-medium">
                                Revenue Est.
                              </p>
                              <p className="text-white text-lg font-bold">
                                $2,500
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Enhanced Edit Game Dialog - Same Interface as Create Game */}
            <Dialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen}>
              <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-7xl w-[95vw] max-h-[95vh] p-0">
                <div className="flex flex-col h-full max-h-[95vh]">
                  <DialogHeader className="px-6 py-4 border-b border-purple-500/30 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      ✏️ Edit Game: {editingGame?.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 mt-2">
                      Edit your game settings and see exactly how it will appear
                      to players in real-time.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                      {/* Form Section - Same as Create Game */}
                      <div className="p-6 overflow-y-auto max-h-full space-y-6">
                        <form onSubmit={handleUpdateGame} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-name"
                                className="text-gray-300"
                              >
                                Game Name
                              </Label>
                              <Input
                                id="edit-name"
                                name="name"
                                value={editData.name}
                                onChange={(e) =>
                                  handleEditFieldChange("name", e.target.value)
                                }
                                required
                                className="bg-white/10 border-purple-500/30"
                                placeholder="Enter game name"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-emoji"
                                className="text-gray-300"
                              >
                                Emoji
                              </Label>
                              <Input
                                id="edit-emoji"
                                name="emoji"
                                value={editData.emoji}
                                onChange={(e) =>
                                  handleEditFieldChange("emoji", e.target.value)
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="edit-description"
                              className="text-gray-300"
                            >
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              name="description"
                              value={editData.description}
                              onChange={(e) =>
                                handleEditFieldChange(
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="bg-white/10 border-purple-500/30"
                              placeholder="Win an amazing travel mug with this exciting game!"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-prize"
                                className="text-gray-300"
                              >
                                Prize Description
                              </Label>
                              <Input
                                id="edit-prize"
                                name="prize"
                                value={editData.prize}
                                onChange={(e) =>
                                  handleEditFieldChange("prize", e.target.value)
                                }
                                required
                                className="bg-white/10 border-purple-500/30"
                                placeholder="Premium Travel Mug"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-prizeValue"
                                className="text-gray-300"
                              >
                                Prize Value ($)
                              </Label>
                              <Input
                                id="edit-prizeValue"
                                name="prizeValue"
                                type="number"
                                min="0"
                                value={editData.prizeValue}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "prizeValue",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          {/* Prize Image Upload Section */}
                          <div className="space-y-3">
                            <Label className="text-gray-300">Prize Image</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  id="editPrizeImage"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setEditPrizeImageFile(file);
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setEditPrizeImagePreview(
                                          reader.result as string,
                                        );
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <Label
                                  htmlFor="editPrizeImage"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  {editPrizeImagePreview ? (
                                    <img
                                      src={editPrizeImagePreview}
                                      alt="Prize preview"
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="text-center">
                                      <svg
                                        className="w-8 h-8 mx-auto text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                      <p className="text-purple-300 text-sm">
                                        Upload Prize Image
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        PNG, JPG up to 2MB
                                      </p>
                                    </div>
                                  )}
                                </Label>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                  <p className="text-sm font-medium">OR</p>
                                  <p className="text-xs">Use emoji instead</p>
                                  <div className="text-3xl mt-2">
                                    {editData.emoji}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="edit-totalNumbers"
                                className="text-gray-300"
                              >
                                Total Numbers
                              </Label>
                              <Input
                                id="edit-totalNumbers"
                                name="totalNumbers"
                                type="number"
                                value={editData.totalNumbers}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "totalNumbers",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="edit-duration"
                                className="text-gray-300"
                              >
                                Duration (hours)
                              </Label>
                              <Input
                                id="edit-duration"
                                name="duration"
                                type="number"
                                value={editData.duration}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 shadow-lg"
                            disabled={updateGameMutation.isPending}
                          >
                            {updateGameMutation.isPending
                              ? "Updating Game..."
                              : "🔄 Update Game"}
                          </Button>
                        </form>
                      </div>

                      {/* Live Preview Section - Same as Create Game */}
                      <div className="p-6 overflow-y-auto max-h-full space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-blue-400" />
                          Live Preview
                        </h3>

                        {/* Game Card Preview */}
                        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer border border-white/10 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group rounded-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-red-600/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>

                          <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg shadow-yellow-500/50"></div>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/80 to-purple-600/80 group-hover:h-2 transition-all duration-300"></div>

                          <div className="relative p-4 sm:p-6">
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                              <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm">
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                                  ${editData.prizeValue}
                                </span>
                                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                              <div className="relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                                {editPrizeImagePreview ? (
                                  <img
                                    src={editPrizeImagePreview}
                                    alt="Prize"
                                    className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="relative text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg">
                                    {editData.emoji}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col space-y-2 mb-3">
                                  <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">
                                    {editData.name}
                                  </h2>
                                  <Badge className="bg-blue-500/30 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit">
                                    {editingGame?.code || "EDIT-001"}
                                  </Badge>
                                </div>
                                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                                  {editData.description}
                                </p>

                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                    <span className="text-green-400 font-bold text-xs">
                                      LIVE
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400 font-bold text-xs">
                                      25 playing
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Game Stats Preview */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                          <h4 className="text-white font-medium mb-3">
                            Expected Performance
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                              <p className="text-blue-300 font-medium">
                                Est. Players
                              </p>
                              <p className="text-white text-lg font-bold">
                                50-100
                              </p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                              <p className="text-green-300 font-medium">
                                Revenue Est.
                              </p>
                              <p className="text-white text-lg font-bold">
                                $2,500
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Games Grid */}
            {gamesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-xl font-semibold">
                  Loading Games...
                </p>
              </div>
            ) : games && games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="bg-black/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="text-2xl sm:text-3xl flex-shrink-0">
                            {game.emoji}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-bold text-sm sm:text-base truncate">
                              {game.name}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm font-mono truncate">
                              {game.code}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={game.isActive ? "default" : "secondary"}
                          className={`${
                            game.isActive ? "bg-green-500" : "bg-gray-500"
                          } text-xs flex-shrink-0 ml-2`}
                        >
                          {game.isActive ? "Active" : "Ended"}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Prize:</span>
                          <span className="text-yellow-400 font-semibold">
                            {game.prize}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Players:</span>
                          <span className="text-white">
                            {game.playersCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Numbers Left:</span>
                          <span className="text-white">
                            {gameAvailableNumbers[game.id] !== undefined 
                              ? gameAvailableNumbers[game.id] 
                              : game.numbersLeft} / {game.totalNumbers}
                          </span>
                        </div>
                        <Progress
                          value={
                            gameAvailableNumbers[game.id] !== undefined
                              ? ((game.totalNumbers - gameAvailableNumbers[game.id]) / game.totalNumbers) * 100
                              : ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100
                          }
                          className="bg-white/20"
                        />
                      </div>

                      {/* Mobile-first button layout */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
                        {/* Top row on mobile, first row on desktop */}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-xs sm:text-sm"
                            onClick={() =>
                              window.open(`/game/${game.id}`, "_blank")
                            }
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </Button>

                          {/* Winner Selection Button - Show for completed games or games with players */}
                          {((!game.isActive && game.numbersLeft === 0) ||
                            game.playersCount > 0) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 text-xs sm:text-sm"
                              onClick={() => {
                                setWinnerSelectionGame(game);
                                setIsWinnerSelectionOpen(true);
                              }}
                            >
                              <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Winner</span>
                              <span className="sm:hidden">Winner</span>
                            </Button>
                          )}
                        </div>

                        {/* Bottom row on mobile, second part on desktop */}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm"
                            onClick={() => handleEditGame(game)}
                          >
                            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handleDeleteGame(game)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-white text-xl font-semibold mb-2">
                  No Games Found
                </p>
                <p className="text-gray-400 mb-6">
                  Create your first game to get started
                </p>
                <Button
                  onClick={() => setIsCreateGameOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Game
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Users Management Tab - Enhanced Mobile */}
          <TabsContent
            value="users"
            className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  User Management
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Monitor and manage registered users
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search users..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-white/5 border-white/20 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => refetchUsers()}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* User Stats Cards - Mobile Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-500/80 to-blue-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-3 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-xl">
                      {users?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-lg">
                      <span className="hidden sm:inline">Total Users</span>
                      <span className="sm:hidden">Total</span>
                    </div>
                    <div className="text-xs text-white/70 mt-1 hidden sm:block">
                      📊 Platform growth
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-3 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-xl">
                      {users?.filter((u) => u.cardOnFile).length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-lg">
                      <span className="hidden sm:inline">Verified Users</span>
                      <span className="sm:hidden">Verified</span>
                    </div>
                    <div className="text-xs text-white/70 mt-1 hidden sm:block">
                      💳 Currently verified
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-3 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-xl">
                      {users?.filter(
                        (u) =>
                          u.createdAt &&
                          new Date(u.createdAt) >
                            new Date(Date.now() - 24 * 60 * 60 * 1000),
                      ).length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-lg">
                      <span className="hidden sm:inline">New Today</span>
                      <span className="sm:hidden">New</span>
                    </div>
                    <div className="text-xs text-white/70 mt-1 hidden sm:block">
                      🔥 Real-time
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/80 to-red-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-orange-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-3 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-xl">
                      {users?.filter((u) => u.isActive).length ||
                        users?.length ||
                        0}
                    </div>
                    <div className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-lg">
                      <span className="hidden sm:inline">Active Users</span>
                      <span className="sm:hidden">Active</span>
                    </div>
                    <div className="text-xs text-white/70 mt-1 hidden sm:block">
                      ⚡ Total active
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
                    <span className="text-sm sm:text-base">User Directory</span>
                    <Badge className="ml-2 sm:ml-3 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      {users?.length || 0} Total
                    </Badge>
                  </div>
                  {/* Mobile Action Buttons */}
                  <div className="flex sm:hidden items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20 px-2 py-1 h-7"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 px-2 py-1 h-7"
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Desktop Action Buttons */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white font-medium text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-gray-400 text-xs truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={user.cardOnFile ? "default" : "secondary"}
                              className={`text-xs px-2 py-1 ${
                                user.cardOnFile
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-gray-500 hover:bg-gray-600 text-white"
                              }`}
                            >
                              {user.cardOnFile ? "✓" : "⚠"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-gray-500 text-xs">
                              ID: {user.id} • Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "N/A"}
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 px-2 py-1 h-7"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserProfileOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20 px-2 py-1 h-7"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {user.email}
                              </div>
                              <div className="text-gray-500 text-xs">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    user.cardOnFile ? "default" : "secondary"
                                  }
                                  className={
                                    user.cardOnFile
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-gray-500 hover:bg-gray-600"
                                  }
                                >
                                  {user.cardOnFile ? "Verified" : "Unverified"}
                                </Badge>
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                Joined:{" "}
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                  : "N/A"}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserProfileOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">No users found</div>
                      <div className="text-gray-500 text-sm mt-1">
                        Users will appear here once they register
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Mobile Enhanced */}
          <TabsContent
            value="analytics"
            className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Analytics & Insights
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Comprehensive data analysis and performance metrics
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => refetchAnalytics()}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-sm sm:text-base"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span className="hidden sm:inline">Refresh Data</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">
                          $
                          {analytics?.totalRevenue?.toLocaleString() ||
                            "639.98"}
                        </div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">
                          Total Revenue
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          💰 Total awarded
                        </div>
                      </div>
                      <DollarSign className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/80 to-cyan-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">
                          {analytics?.totalSpins?.toLocaleString() || "1,247"}
                        </div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">
                          Player Spins
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          🎯 Real-time
                        </div>
                      </div>
                      <Target className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">
                          {analytics?.conversionRate || "73.2"}%
                        </div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">
                          Win Rate
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          📈 Success rate
                        </div>
                      </div>
                      <TrendingUp className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Game Performance */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-purple-400" />
                    Game Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.gameStats?.map((game: any, index: number) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{game.emoji}</span>
                            <span className="text-white font-medium">
                              {game.name}
                            </span>
                          </div>
                          <Badge className="bg-green-500">{game.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-blue-300 font-semibold">
                              {game.totalPlayers}
                            </div>
                            <div className="text-gray-400">Players</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300 font-semibold">
                              ${game.revenue}
                            </div>
                            <div className="text-gray-400">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-300 font-semibold">
                              {game.spins}
                            </div>
                            <div className="text-gray-400">Spins</div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        No game analytics available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Engagement */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    User Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-500/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-300">
                          {analytics?.dailyActiveUsers || "0"}
                        </div>
                        <div className="text-sm text-blue-200">
                          Daily Active
                        </div>
                      </div>
                      <div className="p-4 bg-green-500/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-300">
                          {analytics?.weeklyActiveUsers || "0"}
                        </div>
                        <div className="text-sm text-green-200">
                          Weekly Active
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-500/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-200">
                          Avg. Session Duration
                        </span>
                        <span className="text-purple-300 font-semibold">
                          {analytics?.avgSessionDuration || "5m 30s"}
                        </span>
                      </div>
                      <Progress value={75} className="bg-purple-900/40" />
                    </div>

                    <div className="p-4 bg-orange-500/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-200">
                          User Retention Rate
                        </span>
                        <span className="text-orange-300 font-semibold">
                          {analytics?.retentionRate || "68%"}
                        </span>
                      </div>
                      <Progress value={68} className="bg-orange-900/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trends */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Revenue & Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-2xl font-bold text-green-300">
                      ${analytics?.todayRevenue || "0"}
                    </div>
                    <div className="text-sm text-green-200">
                      Today's Revenue
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      +{analytics?.todayGrowth || 0}% vs yesterday
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-300">
                      ${analytics?.weeklyRevenue || "0"}
                    </div>
                    <div className="text-sm text-blue-200">This Week</div>
                    <div className="text-xs text-blue-400 mt-1">
                      7-day total
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-300">
                      ${analytics?.monthlyRevenue || "0"}
                    </div>
                    <div className="text-sm text-purple-200">This Month</div>
                    <div className="text-xs text-purple-400 mt-1">
                      30-day total
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl font-bold text-yellow-300">
                      ${analytics?.avgRevenuePerUser || "0"}
                    </div>
                    <div className="text-sm text-yellow-200">Avg per User</div>
                    <div className="text-xs text-yellow-400 mt-1">
                      Lifetime value
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="system" className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  System Monitor
                </h2>
                <p className="text-gray-400">
                  Server health, database status, and system performance
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">
                    ALL SYSTEMS OPERATIONAL
                  </span>
                </div>
              </div>
            </div>

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">
                          Database Status
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">
                          ONLINE
                        </div>
                        <div className="text-sm text-white/80 drop-shadow-md">
                          💚 Connected
                        </div>
                      </div>
                      <Database className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/80 to-cyan-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">
                          Server Health
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">
                          HEALTHY
                        </div>
                        <div className="text-sm text-white/80 drop-shadow-md">
                          🔵 Active
                        </div>
                      </div>
                      <Monitor className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">
                          API Status
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">
                          STABLE
                        </div>
                        <div className="text-sm text-white/80 drop-shadow-md">
                          🟣 Secured
                        </div>
                      </div>
                      <Activity className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">CPU Usage</span>
                        <span className="text-green-400">23%</span>
                      </div>
                      <Progress value={23} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Memory Usage</span>
                        <span className="text-blue-400">45%</span>
                      </div>
                      <Progress value={45} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Disk Usage</span>
                        <span className="text-purple-400">67%</span>
                      </div>
                      <Progress value={67} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Network I/O</span>
                        <span className="text-cyan-400">12%</span>
                      </div>
                      <Progress value={12} className="bg-white/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                    System Alerts & Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-200 text-sm">
                          Database backup completed successfully
                        </span>
                      </div>
                      <div className="text-xs text-green-400 mt-1">
                        2 minutes ago
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-200 text-sm">
                          New user registered from IP: 192.168.1.1
                        </span>
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        5 minutes ago
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-200 text-sm">
                          High CPU usage detected - monitoring
                        </span>
                      </div>
                      <div className="text-xs text-yellow-400 mt-1">
                        1 hour ago
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Profile Dialog */}
          <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
            <DialogContent className="sm:max-w-[900px] bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  User Profile: {selectedUser?.firstName}{" "}
                  {selectedUser?.lastName}
                </DialogTitle>
                <DialogDescription className="text-purple-200">
                  Comprehensive user information and activity management
                </DialogDescription>
              </DialogHeader>

              {selectedUser && (
                <div className="space-y-6">
                  {/* Loading State */}
                  {userDetailsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                      <span className="ml-3 text-purple-200">
                        Loading real-time user data...
                      </span>
                    </div>
                  )}

                  {/* User Overview Cards with Real-time Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-600/80 to-blue-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                        <div className="text-blue-200 text-sm">
                          {selectedUser.email}
                        </div>
                        <div className="text-blue-300 text-xs mt-1">
                          User ID: {selectedUser.id}
                        </div>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-blue-200 text-xs">
                              Status:
                              <span
                                className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                  (userDetails as any).stats.status === "online"
                                    ? "bg-green-500/30 text-green-200"
                                    : (userDetails as any).stats.status ===
                                        "away"
                                      ? "bg-yellow-500/30 text-yellow-200"
                                      : "bg-gray-500/30 text-gray-200"
                                }`}
                              >
                                {(userDetails as any).stats.status}
                              </span>
                            </div>
                            <div className="text-blue-300 text-xs">
                              Account Age:{" "}
                              {(userDetails as any).stats.accountAge} days
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600/80 to-emerald-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {selectedUser.cardOnFile ? "Verified" : "Unverified"}
                        </div>
                        <div className="text-green-200 text-sm">
                          Payment Status
                        </div>
                        <Badge
                          className={`mt-2 ${selectedUser.cardOnFile ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {selectedUser.cardOnFile
                            ? "Card on File"
                            : "No Payment Method"}
                        </Badge>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-green-200 text-xs">
                              Total Spent: $
                              {(userDetails as any).stats.totalSpent}
                            </div>
                            <div className="text-green-300 text-xs">
                              Win Rate: {(userDetails as any).stats.winRate}%
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600/80 to-pink-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {(userDetails as any)?.stats?.totalSpins || 0} Spins
                        </div>
                        <div className="text-purple-200 text-sm">
                          Game Activity
                        </div>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-purple-200 text-xs">
                              Favorite:{" "}
                              {(userDetails as any).stats.favoriteGame}
                            </div>
                            <div className="text-purple-300 text-xs">
                              Last Active:{" "}
                              {(userDetails as any).stats.lastActive
                                ? new Date(
                                    (userDetails as any).stats.lastActive,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Information Tabs */}
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-black/20">
                      <TabsTrigger
                        value="details"
                        className="text-white data-[state=active]:bg-purple-600"
                      >
                        Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="text-white data-[state=active]:bg-purple-600"
                      >
                        Activity
                      </TabsTrigger>
                      <TabsTrigger
                        value="transactions"
                        className="text-white data-[state=active]:bg-purple-600"
                      >
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger
                        value="settings"
                        className="text-white data-[state=active]:bg-purple-600"
                      >
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Info className="h-5 w-5 mr-2 text-blue-400" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">First Name</Label>
                            <Input
                              value={selectedUser.firstName || ""}
                              readOnly
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Last Name</Label>
                            <Input
                              value={selectedUser.lastName || ""}
                              readOnly
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">
                              Email Address
                            </Label>
                            <Input
                              value={selectedUser.email || ""}
                              readOnly
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">
                              Phone Number
                            </Label>
                            <Input
                              value={selectedUser.phone || "Not provided"}
                              readOnly
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">
                              Square Customer ID
                            </Label>
                            <Input
                              value={
                                selectedUser.squareCustomerId || "Not assigned"
                              }
                              readOnly
                              className="bg-white/5 border-white/20 text-white font-mono text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">
                              Account Created
                            </Label>
                            <Input
                              value={
                                selectedUser.createdAt
                                  ? new Date(
                                      selectedUser.createdAt,
                                    ).toLocaleString()
                                  : "Unknown"
                              }
                              readOnly
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <Activity className="h-5 w-5 mr-2 text-green-400" />
                              Recent Activity
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => refetchUserActivity()}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userActivity ? (
                            <div className="space-y-3">
                              {Array.isArray(userActivity) &&
                                userActivity.map((activity: any) => {
                                  const getActivityIcon = (type: string) => {
                                    switch (type) {
                                      case "game_join":
                                        return (
                                          <Gamepad2 className="h-4 w-4 text-white" />
                                        );
                                      case "login":
                                        return (
                                          <User className="h-4 w-4 text-white" />
                                        );
                                      case "payment":
                                        return (
                                          <DollarSign className="h-4 w-4 text-white" />
                                        );
                                      case "registration":
                                        return (
                                          <UserPlus className="h-4 w-4 text-white" />
                                        );
                                      default:
                                        return (
                                          <Activity className="h-4 w-4 text-white" />
                                        );
                                    }
                                  };

                                  const getStatusColor = (status: string) => {
                                    switch (status) {
                                      case "success":
                                        return "bg-green-500";
                                      case "warning":
                                        return "bg-yellow-500";
                                      case "error":
                                        return "bg-red-500";
                                      default:
                                        return "bg-blue-500";
                                    }
                                  };

                                  return (
                                    <div
                                      key={activity.id}
                                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={`w-8 h-8 ${getStatusColor(activity.status)} rounded-full flex items-center justify-center`}
                                        >
                                          {getActivityIcon(activity.type)}
                                        </div>
                                        <div>
                                          <div className="text-white text-sm font-medium">
                                            {activity.title}
                                          </div>
                                          <div className="text-gray-400 text-xs">
                                            {activity.description}
                                          </div>
                                          {activity.metadata &&
                                            activity.type === "game_join" && (
                                              <div className="text-blue-300 text-xs mt-1">
                                                Amount: $
                                                {activity.metadata.amount
                                                  ? activity.metadata.amount.toFixed(
                                                      2,
                                                    )
                                                  : "0.00"}{" "}
                                                • Number:{" "}
                                                {activity.metadata.number ||
                                                  "N/A"}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        {new Date(
                                          activity.timestamp,
                                        ).toLocaleString()}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                              <div className="text-gray-400 text-sm">
                                Loading activity data...
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                              Transaction History
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => refetchUserTransactions()}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userTransactions ? (
                            <div className="space-y-3">
                              {Array.isArray(userTransactions) &&
                                userTransactions.map((transaction: any) => {
                                  const getStatusColor = (status: string) => {
                                    switch (status) {
                                      case "completed":
                                        return "border-green-500/20 bg-green-500/10";
                                      case "authorized":
                                        return "border-yellow-500/20 bg-yellow-500/10";
                                      case "pending":
                                        return "border-blue-500/20 bg-blue-500/10";
                                      case "failed":
                                        return "border-red-500/20 bg-red-500/10";
                                      default:
                                        return "border-gray-500/20 bg-gray-500/10";
                                    }
                                  };

                                  const getStatusIcon = (status: string) => {
                                    switch (status) {
                                      case "completed":
                                        return (
                                          <CheckCircle className="h-4 w-4 text-green-400" />
                                        );
                                      case "authorized":
                                        return (
                                          <Clock className="h-4 w-4 text-yellow-400" />
                                        );
                                      case "pending":
                                        return (
                                          <Clock className="h-4 w-4 text-blue-400" />
                                        );
                                      case "failed":
                                        return (
                                          <XCircle className="h-4 w-4 text-red-400" />
                                        );
                                      default:
                                        return (
                                          <DollarSign className="h-4 w-4 text-gray-400" />
                                        );
                                    }
                                  };

                                  const getAmountColor = (status: string) => {
                                    switch (status) {
                                      case "completed":
                                        return "text-green-400";
                                      case "authorized":
                                        return "text-yellow-400";
                                      case "pending":
                                        return "text-blue-400";
                                      case "failed":
                                        return "text-red-400";
                                      default:
                                        return "text-gray-400";
                                    }
                                  };

                                  return (
                                    <div
                                      key={transaction.id}
                                      className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border ${getStatusColor(transaction.status)} hover:bg-white/10 transition-colors`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                          {getStatusIcon(transaction.status)}
                                        </div>
                                        <div>
                                          <div className="text-white text-sm font-medium">
                                            {transaction.description}
                                          </div>
                                          <div className="text-gray-400 text-xs">
                                            {transaction.paymentMethod} •{" "}
                                            {transaction.transactionId}
                                          </div>
                                          {transaction.type === "game_entry" &&
                                            transaction.number && (
                                              <div className="text-blue-300 text-xs mt-1">
                                                Game: {transaction.gameName} •
                                                Number: {transaction.number}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div
                                          className={`font-medium ${getAmountColor(transaction.status)}`}
                                        >
                                          $
                                          {transaction.amount
                                            ? transaction.amount.toFixed(2)
                                            : "0.00"}
                                        </div>
                                        <div className="text-gray-400 text-xs capitalize">
                                          {transaction.status}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                          {transaction.timestamp
                                            ? new Date(
                                                transaction.timestamp,
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                              <div className="text-gray-400 text-sm">
                                Loading transaction data...
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-purple-400" />
                            Account Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Account Status
                              </Label>
                              <Select
                                defaultValue={
                                  selectedUser.isActive ? "active" : "inactive"
                                }
                              >
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                  <SelectItem value="suspended">
                                    Suspended
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-300">User Role</Label>
                              <Select defaultValue="user">
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">
                                    Regular User
                                  </SelectItem>
                                  <SelectItem value="vip">VIP User</SelectItem>
                                  <SelectItem value="premium">
                                    Premium User
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id="email-notifications" defaultChecked />
                            <Label
                              htmlFor="email-notifications"
                              className="text-gray-300"
                            >
                              Email Notifications
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id="marketing-emails" />
                            <Label
                              htmlFor="marketing-emails"
                              className="text-gray-300"
                            >
                              Marketing Emails
                            </Label>
                          </div>

                          <Separator className="bg-white/20" />

                          <div className="flex space-x-2">
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend User
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  System Settings
                </h2>
                <p className="text-gray-400">
                  Configure application settings and preferences
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => refetchSettings()}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </div>
            </div>

            {/* Admin Profile Management */}
            <Card className="bg-black/20 backdrop-blur-sm border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-400" />
                  Admin Profile Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Update Profile Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Update Profile Information
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email Address</Label>
                      <Input
                        type="email"
                        defaultValue={(adminUser as any)?.email || ""}
                        className="bg-white/5 border-white/20 text-white"
                        id="admin-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">First Name</Label>
                      <Input
                        type="text"
                        defaultValue={(adminUser as any)?.firstName || ""}
                        className="bg-white/5 border-white/20 text-white"
                        id="admin-firstName"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Last Name</Label>
                      <Input
                        type="text"
                        defaultValue={(adminUser as any)?.lastName || ""}
                        className="bg-white/5 border-white/20 text-white"
                        id="admin-lastName"
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 w-full"
                      onClick={async () => {
                        const email = (
                          document.getElementById(
                            "admin-email",
                          ) as HTMLInputElement
                        )?.value;
                        const firstName = (
                          document.getElementById(
                            "admin-firstName",
                          ) as HTMLInputElement
                        )?.value;
                        const lastName = (
                          document.getElementById(
                            "admin-lastName",
                          ) as HTMLInputElement
                        )?.value;

                        try {
                          const response = await fetch(
                            "/api/admin/update-profile",
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                email,
                                firstName,
                                lastName,
                              }),
                            },
                          );

                          const result = await response.json();

                          if (response.ok) {
                            toast({
                              title: "Profile Updated",
                              description:
                                "Your profile information has been updated successfully",
                            });
                            refetchAdminUser();
                          } else {
                            toast({
                              title: "Update Failed",
                              description:
                                result.message || "Failed to update profile",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Update Failed",
                            description: "Network error occurred",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>

                  {/* Change Password Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Current Password</Label>
                      <Input
                        type="password"
                        className="bg-white/5 border-white/20 text-white"
                        id="current-password"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">New Password</Label>
                      <Input
                        type="password"
                        className="bg-white/5 border-white/20 text-white"
                        id="new-password"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Confirm New Password
                      </Label>
                      <Input
                        type="password"
                        className="bg-white/5 border-white/20 text-white"
                        id="confirm-password"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-red-600 to-pink-600 w-full"
                      onClick={async () => {
                        const currentPassword = (
                          document.getElementById(
                            "current-password",
                          ) as HTMLInputElement
                        )?.value;
                        const newPassword = (
                          document.getElementById(
                            "new-password",
                          ) as HTMLInputElement
                        )?.value;
                        const confirmPassword = (
                          document.getElementById(
                            "confirm-password",
                          ) as HTMLInputElement
                        )?.value;

                        if (newPassword !== confirmPassword) {
                          toast({
                            title: "Password Mismatch",
                            description:
                              "New password and confirmation don't match",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (newPassword.length < 6) {
                          toast({
                            title: "Password Too Short",
                            description:
                              "Password must be at least 6 characters long",
                            variant: "destructive",
                          });
                          return;
                        }

                        try {
                          const response = await fetch(
                            "/api/admin/change-password",
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                currentPassword,
                                newPassword,
                              }),
                            },
                          );

                          const result = await response.json();

                          if (response.ok) {
                            toast({
                              title: "Password Changed",
                              description:
                                "Your password has been updated successfully",
                            });
                            // Clear form
                            (
                              document.getElementById(
                                "current-password",
                              ) as HTMLInputElement
                            ).value = "";
                            (
                              document.getElementById(
                                "new-password",
                              ) as HTMLInputElement
                            ).value = "";
                            (
                              document.getElementById(
                                "confirm-password",
                              ) as HTMLInputElement
                            ).value = "";
                          } else {
                            toast({
                              title: "Password Change Failed",
                              description:
                                result.message || "Failed to change password",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Password Change Failed",
                            description: "Network error occurred",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-green-400" />
                    Application Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Name</Label>
                    <Input
                      defaultValue="Hit The Road Jackpot"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Maximum Game Duration (hours)
                    </Label>
                    <Input
                      type="number"
                      defaultValue="24"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Default Game Numbers
                    </Label>
                    <Input
                      type="number"
                      defaultValue="200"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" />
                    <Label htmlFor="maintenance-mode" className="text-gray-300">
                      Maintenance Mode
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Payment Processing Fee (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue="2.9"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Minimum Game Prize ($)
                    </Label>
                    <Input
                      type="number"
                      defaultValue="100"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Maximum Game Prize ($)
                    </Label>
                    <Input
                      type="number"
                      defaultValue="10000"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-payout" defaultChecked />
                    <Label htmlFor="auto-payout" className="text-gray-300">
                      Automatic Prize Payout
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Settings */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-400" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      type="number"
                      defaultValue="60"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Login Attempts</Label>
                    <Input
                      type="number"
                      defaultValue="5"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">IP Whitelist</Label>
                    <Input
                      placeholder="192.168.1.0/24"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="two-factor" />
                    <Label htmlFor="two-factor" className="text-gray-300">
                      Two-Factor Authentication
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="audit-logging" defaultChecked />
                    <Label htmlFor="audit-logging" className="text-gray-300">
                      Audit Logging
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  toast({
                    title: "Settings Reset",
                    description: "All settings have been reset to defaults",
                  });
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description:
                      "System settings have been updated successfully",
                  });
                }}
              >
                Save All Settings
              </Button>
            </div>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="system" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                System Status
              </h2>
              <p className="text-gray-400">
                Monitor system health and performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-green-500/30">
                <CardContent className="p-6 text-center">
                  <Database className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-green-400 font-bold text-lg">Database</p>
                  <p className="text-white text-2xl font-bold">Online</p>
                  <p className="text-gray-400 text-sm">99.9% uptime</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <Wifi className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-400 font-bold text-lg">Network</p>
                  <p className="text-white text-2xl font-bold">Stable</p>
                  <p className="text-gray-400 text-sm">45ms avg latency</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <Monitor className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-400 font-bold text-lg">
                    Server Load
                  </p>
                  <p className="text-white text-2xl font-bold">67%</p>
                  <p className="text-gray-400 text-sm">4 cores active</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-400 font-bold text-lg">
                    Performance
                  </p>
                  <p className="text-white text-2xl font-bold">Optimal</p>
                  <p className="text-gray-400 text-sm">2.1s avg response</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Winners Tab - New Winners List */}
          <TabsContent value="winners" className="space-y-4 sm:space-y-6 mt-20 px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-3" />
                  Game Winners
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Complete list of all game winners and completed games
                </p>
              </div>
              <div className="flex space-x-2">
                <TestEmailButton />
              </div>
            </div>

            {/* Winners List */}
            <WinnersList />
          </TabsContent>
        </Tabs>
      </main>

      {/* Eye-catching Delete Game Confirmation Dialog */}
      <Dialog open={isDeleteGameOpen} onOpenChange={setIsDeleteGameOpen}>
        <DialogContent className="bg-gradient-to-br from-red-900/95 via-slate-900/95 to-red-900/95 border-red-500/50 text-white max-w-md">
          <div className="text-center space-y-6">
            {/* Animated warning icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-2 bg-red-500/30 rounded-full animate-ping animation-delay-75"></div>
              <div className="relative bg-red-500/90 rounded-full w-20 h-20 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-white animate-bounce" />
              </div>
            </div>

            <DialogHeader className="text-center space-y-3">
              <DialogTitle className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                🚨 Delete Game?
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base leading-relaxed">
                You're about to permanently delete{" "}
                <span className="font-bold text-white bg-red-500/20 px-2 py-1 rounded border border-red-500/30">
                  "{gameToDelete?.name}"
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* Warning details */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-red-300">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">
                  This action cannot be undone
                </span>
              </div>
              <div className="flex items-center space-x-2 text-red-300">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">All game data will be lost</span>
              </div>
              <div className="flex items-center space-x-2 text-red-300">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">
                  Player progress will be deleted
                </span>
              </div>
            </div>

            {/* Game info preview */}
            <div className="bg-black/30 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-2xl">{gameToDelete?.emoji}</span>
                <div className="text-left">
                  <div className="font-medium text-white">
                    {gameToDelete?.name}
                  </div>
                  <div className="text-gray-400">{gameToDelete?.code}</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteGameOpen(false)}
                className="flex-1 border-gray-500/50 text-green-700 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Keep Game
              </Button>
              <Button
                onClick={confirmDeleteGame}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-red-500/25 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Forever
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteUserOpen}
        onClose={() => setIsDeleteUserOpen(false)}
        onConfirm={confirmDeleteUser}
        user={userToDelete}
        isDeleting={deleteUserMutation.isPending}
      />

      {/* Winner Selection Modal */}
      <WinnerSelectionModal
        isOpen={isWinnerSelectionOpen}
        onClose={() => setIsWinnerSelectionOpen(false)}
        game={winnerSelectionGame}
        onWinnerSelected={() => {
          refetchGames();
          setIsWinnerSelectionOpen(false);
        }}
      />
    </div>
  );
}

// Delete Winner Button Component
function DeleteWinnerButton({ winnerId, winnerName, onDelete }: { winnerId: number; winnerName: string; onDelete: () => void }) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteWinnerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/winners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete winner");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Winner Deleted",
        description: `${winnerName}'s win record has been removed`,
      });
      onDelete();
      setShowConfirm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-red-400 text-sm">Delete {winnerName}?</span>
        <Button
          onClick={() => deleteWinnerMutation.mutate(winnerId)}
          disabled={deleteWinnerMutation.isPending}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {deleteWinnerMutation.isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </Button>
        <Button
          onClick={() => setShowConfirm(false)}
          size="sm"
          variant="outline"
          className="border-gray-500"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      size="sm"
      variant="outline"
      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      Delete
    </Button>
  );
}

// Winners List Component
function WinnersList() {
  const { data: winners, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/winners"],
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 border border-slate-600/30 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-600 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!winners || (Array.isArray(winners) && winners.length === 0)) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border-slate-600/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-yellow-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Winners Yet</h3>
          <p className="text-gray-400">
            Winners will appear here when games are completed with automatic winner selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Array.isArray(winners) && winners.map((winner: any, index: number) => (
        <Card
          key={winner.id}
          className="bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 border-slate-600/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    #{index + 1}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">
                      {winner.winnerName}
                    </h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Winner
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {winner.winnerEmail}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-lg font-bold text-yellow-400">
                  Lucky #{winner.winningNumber}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(winner.completedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-600/30">
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {winner.gameName}
                </div>
                <div className="text-xs text-gray-400">Game</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  ${winner.prizeValue}
                </div>
                <div className="text-xs text-gray-400">Prize Value</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {winner.totalParticipants}
                </div>
                <div className="text-xs text-gray-400">Participants</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {winner.totalSpins}
                </div>
                <div className="text-xs text-gray-400">Total Spins</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-600/30 flex justify-end space-x-3">
              <SendCompletionEmailsButton gameId={winner.gameId} gameName={winner.gameName} onEmailSent={refetch} />
              <DeleteWinnerButton winnerId={winner.id} winnerName={winner.winnerName} onDelete={refetch} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Send Completion Emails Button Component
function SendCompletionEmailsButton({ gameId, gameName, onEmailSent }: { gameId: number; gameName: string; onEmailSent: () => void }) {
  const { toast } = useToast();

  const sendEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/admin/games/${gameId}/send-completion-emails`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Completion emails sent for ${gameName}`,
      });
      onEmailSent();
    },
    onError: (error: any) => {
      console.error("Failed to send completion emails:", error);
      toast({
        title: "Error", 
        description: "Failed to send completion emails",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => sendEmailsMutation.mutate()}
      disabled={sendEmailsMutation.isPending}
      className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400"
    >
      {sendEmailsMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-2" />
          Send Emails
        </>
      )}
    </Button>
  );
}

// Test Email Button Component
function TestEmailButton() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("ahsanglobalbusiness@gmail.com");

  const testEmailMutation = useMutation({
    mutationFn: async (type: "winner" | "completion") => {
      if (!testEmail || !testEmail.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          type: type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send test email");
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Email Sent",
        description: `${data.message} to ${testEmail}`,
      });
    },
    onError: (error: any) => {
      console.error("Test email error:", error);
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Label htmlFor="test-email" className="text-sm text-gray-300 mb-1 block">
            Test Email Address
          </Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test deliverability"
            className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => testEmailMutation.mutate("winner")}
          disabled={testEmailMutation.isPending || !testEmail.includes("@")}
          variant="outline"
          size="sm"
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
        >
          {testEmailMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trophy className="h-4 w-4 mr-2" />
          )}
          Test Winner Email
        </Button>
        <Button
          onClick={() => testEmailMutation.mutate("completion")}
          disabled={testEmailMutation.isPending || !testEmail.includes("@")}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
        >
          {testEmailMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Star className="h-4 w-4 mr-2" />
          )}
          Test Completion Email
        </Button>
      </div>
    </div>
  );
}
