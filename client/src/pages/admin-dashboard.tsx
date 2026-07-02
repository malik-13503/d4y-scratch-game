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
  Tag,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Wallet,
  List,
  Coins,
  Hash,
  Search,
  ChevronRight,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  Filter,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { WinnerSelectionModal } from "@/components/admin/winner-selection-modal";
import logoPath from "@assets/logo_1777237644041.png";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("pending");
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
    tokenCostPerEntry: "10",
  });

  // Live preview state
  const [previewData, setPreviewData] = useState({
    name: "Premium Travel Mug",
    emoji: "🎮",
    description: "High-quality travel mug with thermal insulation",
    prize: "Premium Travel Mug",
    prizeValue: "50.00",
    totalNumbers: "125",
    duration: "240",
    noExpiry: false,
    prizeImageUrl: "",
    freePlayEnabled: false,
    freePlayNumbers: "",
    targetRevenue: "800",
    tokenCostPerEntry: "10",
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
    tokenCostPerEntry: "10",
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

  // Get admin user from localStorage — read synchronously so it's available on first render
  // (avoids race where API returns 401 before useEffect populates state)
  const [localAdminUser, setLocalAdminUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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

  // Custom hook to fetch real-time available numbers for games
  const useGameAvailableNumbers = (games: any[]) => {
    const [gameAvailableNumbers, setGameAvailableNumbers] = useState<{[key: number]: number}>({});
    
    useEffect(() => {
      if (!games || games.length === 0 || !currentAdmin) return;
      
      const fetchAllAvailableNumbers = async () => {
        try {
          const promises = games.map(async (game) => {
            const response = await fetch(`/api/games/${game.id}/available-numbers`);
            const data = await response.json();
            return { gameId: game.id, count: data.availableNumbers?.length || 0 };
          });
          
          const results = await Promise.all(promises);
          const numbersMap: {[key: number]: number} = {};
          results.forEach(result => {
            numbersMap[result.gameId] = result.count;
          });
          
          setGameAvailableNumbers(numbersMap);
          console.log('🔄 Real-time numbers updated:', numbersMap);
        } catch (error) {
          console.error('Error fetching available numbers:', error);
        }
      };
      
      // Fetch immediately
      fetchAllAvailableNumbers();
      
      // Set up interval for real-time updates
      const interval = setInterval(fetchAllAvailableNumbers, 5000);
      
      return () => clearInterval(interval);
    }, [games, currentAdmin]);
    
    return gameAvailableNumbers;
  };
  
  // Use the custom hook
  const gameAvailableNumbers = useGameAvailableNumbers(games || []);

  // System settings
  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!currentAdmin,
  });

  // Payment destinations — editable from admin
  const { data: paymentDests, refetch: refetchPaymentDests } = useQuery<Record<string, { label: string; destination: string; hint: string }>>({
    queryKey: ["/api/admin/payment-destinations"],
    enabled: !!currentAdmin,
  });
  const [editedDests, setEditedDests] = useState<Record<string, string>>({});
  const updatePaymentDestsMutation = useMutation({
    mutationFn: async (dests: Record<string, string>) => {
      const response = await apiRequest("PATCH", "/api/admin/payment-destinations", dests);
      return response.json();
    },
    onSuccess: () => {
      refetchPaymentDests();
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/destinations"] });
      toast({ title: "Payment Accounts Saved", description: "Destination addresses updated successfully." });
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Could not update payment destinations.", variant: "destructive" });
    },
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

  // Pending payments count for sidebar badge
  const { data: pendingPaymentsForBadge = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-payments-badge"],
    queryFn: () => fetch("/api/admin/pending-payments?status=pending").then(r => r.json()),
    enabled: !!currentAdmin,
    refetchInterval: 30000,
  });
  const pendingCount = Array.isArray(pendingPaymentsForBadge) ? pendingPaymentsForBadge.length : 0;

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

  // Per-game profit stats
  const { data: perGameStats = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/per-game-stats"],
    enabled: !!currentAdmin,
    refetchInterval: 30000,
  });

  // Token type stats (paid vs free)
  const { data: tokenStats } = useQuery<{ paidTokens: number; freeTokens: number }>({
    queryKey: ["/api/admin/token-stats"],
    enabled: !!currentAdmin,
    refetchInterval: 30000,
  });

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

  // Add tokens to user
  const [addTokensUser, setAddTokensUser] = useState<any>(null);
  const [addTokensAmount, setAddTokensAmount] = useState("");

  const addTokensMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: number; amount: number }) =>
      apiRequest("POST", `/api/admin/users/${userId}/add-tokens`, { amount }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Tokens Added ✅",
        description: `${vars.amount} tokens added to ${addTokensUser?.email}`,
      });
      setAddTokensUser(null);
      setAddTokensAmount("");
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
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

    const durationHours = parseInt(formData.get("duration") as string) || 240;
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

    // Calculate start and end times — no-expiry games use year 2099 sentinel
    const startTime = new Date();
    const noExpiry = previewData.noExpiry === true;
    const endTime = noExpiry
      ? new Date('2099-12-31T23:59:59Z')
      : new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const tokenCostPerEntry = parseInt(previewData.tokenCostPerEntry || "10");
    // Auto-calculate revenue: every spot filled = 1 spin = tokenCostPerEntry tokens
    const targetRevenue = totalNumbers * tokenCostPerEntry;

    const gameData = {
      name: formData.get("name") as string,
      code: `G${Date.now().toString().slice(-6)}`,
      description: formData.get("description") as string,
      gameType: (formData.get("gameType") as string) || "wheel_spin",
      prize: formData.get("prize") as string,
      prizeValue: prizeValue,
      prizeDescription: formData.get("description") as string,
      prizeImageUrl: prizeImageUrl,
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
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationHours: noExpiry ? 0 : durationHours,
      noExpiry: noExpiry,
      targetRevenue: targetRevenue.toFixed(2),
      tokenCostPerEntry: tokenCostPerEntry,
      tokenThreshold: targetRevenue,
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
      duration: "240",
      prizeImageUrl: game.prizeImageUrl || "",
      tokenCostPerEntry: game.tokenCostPerEntry?.toString() || "10",
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

  const handleForceCloseGame = async (gameId: number, gameName: string) => {
    if (!confirm(`Close "${gameName}" now and auto-select a winner from all participants? This cannot be undone.`)) return;
    try {
      const res = await apiRequest("POST", `/api/admin/games/${gameId}/force-close`, {});
      const data = await res.json();
      toast({
        title: data.winnerSelected ? "✅ Winner Selected!" : "⚠️ Game Closed",
        description: data.winnerSelected
          ? `Game closed and winner selected: ${data.winner?.playerName || "Unknown"}. Emails sent!`
          : data.message,
        className: data.winnerSelected ? "bg-green-700 text-white border-green-600" : "bg-yellow-700 text-white border-yellow-600",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/winners"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to close game", variant: "destructive" });
    }
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

    const tokenCostPerEntry = parseInt(formData.get("tokenCostPerEntry") as string) || 10;
    const gameData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      prize: formData.get("prize") as string,
      prizeValue: prizeValue,
      prizeDescription: formData.get("description") as string,
      prizeImageUrl: prizeImageUrl,
      totalNumbers: totalNumbers,
      tokenCostPerEntry: tokenCostPerEntry,
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
    <div className="flex h-screen overflow-hidden" style={{background:"#0b0c18"}} data-admin-dashboard>

      {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col overflow-hidden"
        style={{background:"#0f1117", borderRight:"1px solid rgba(255,255,255,0.07)", height:"100vh"}}>

        {/* Logo */}
        <div className="px-4 py-4 flex-shrink-0 border-b" style={{borderColor:"rgba(255,255,255,0.07)"}}>
          <img src={logoPath} alt="PrizePLugz" className="h-9 w-auto object-contain" />
        </div>

        {/* Admin profile */}
        <div className="px-4 py-3 flex-shrink-0 border-b" style={{borderColor:"rgba(255,255,255,0.07)"}}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {((adminUser as any)?.firstName?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 leading-none">Welcome,</p>
              <p className="text-white font-semibold text-sm truncate leading-tight mt-0.5">
                {(adminUser as any)?.firstName || "Admin"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-gray-500 text-[10px]">Online</span>
              </div>
            </div>
          </div>
          <span className="mt-2 inline-block text-[10px] font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Administrator</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">

          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 pt-2 pb-1">Payments</p>
          <button
            onClick={() => setActiveTab("card-payments")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "card-payments" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
            <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Card Payments</span>
          </button>
          {([
            { label:"Pending Payments", icon:Clock,       filter:"pending",  badge:true },
            { label:"All Payments",     icon:List,        filter:"all"                  },
            { label:"Approved",         icon:CheckCircle, filter:"approved"             },
            { label:"Rejected",         icon:XCircle,     filter:"rejected"             },
          ] as const).map(item => {
            const isActive = activeTab === "pending-payments" && paymentStatusFilter === item.filter;
            return (
              <button key={item.label}
                onClick={() => { setActiveTab("pending-payments"); setPaymentStatusFilter(item.filter); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {(item as any).badge && pendingCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? "bg-white/20 text-white" : "bg-blue-600 text-white"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}

          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 pt-3 pb-1">Management</p>
          {([
            { label:"Users",         icon:Users,      tab:"users"        },
            { label:"Games",         icon:Gamepad2,   tab:"games"        },
            { label:"Game Details",  icon:Hash,       tab:"game-details" },
            { label:"Winners",       icon:Trophy,     tab:"winners"      },
            { label:"Winner Wall",   icon:Star,       tab:"winner-wall"  },
            { label:"Overview",      icon:BarChart3,  tab:"overview"     },
            { label:"Analytics",     icon:TrendingUp, tab:"analytics"    },
            { label:"Email Center",  icon:Mail,       tab:"email-center" },
          ] as const).map(item => {
            const isActive = activeTab === item.tab;
            return (
              <button key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 pt-3 pb-1">Config</p>
          {([
            { label:"Settings",    icon:Settings, tab:"settings"    },
            { label:"Promo Codes", icon:Tag,      tab:"promo-codes" },
            { label:"System",      icon:Monitor,  tab:"system"      },
          ] as const).map(item => {
            const isActive = activeTab === item.tab;
            return (
              <button key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout + Help */}
        <div className="flex-shrink-0 p-2 border-t" style={{borderColor:"rgba(255,255,255,0.07)"}}>
          <button onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Logout</span>
          </button>
          <div className="mt-1.5 px-3 py-2 rounded-lg" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Info className="h-3 w-3 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-300">Need Help?</p>
                <p className="text-[10px] text-gray-500">Contact Support</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
          style={{background:"#0f1117", borderColor:"rgba(255,255,255,0.07)"}}>
          <img src={logoPath} alt="PrizePLugz" className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-2">
            <select value={activeTab} onChange={e => setActiveTab(e.target.value)}
              className="text-xs rounded-lg px-2 py-1.5 text-white"
              style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)"}}>
              <option value="overview">Overview</option>
              <option value="pending-payments">Payments</option>
              <option value="games">Games</option>
              <option value="users">Users</option>
              <option value="analytics">Analytics</option>
              <option value="settings">Settings</option>
              <option value="system">System</option>
              <option value="winners">Winners</option>
              <option value="promo-codes">Promo Codes</option>
              <option value="email-center">Email Center</option>
              <option value="game-details">Game Details</option>
            </select>
            <Button onClick={() => logoutMutation.mutate()} variant="outline" size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 px-2">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto" style={{background:"#0b0c18"}}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Sidebar drives navigation — TabsList hidden */}
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="winners">Winners</TabsTrigger>
              <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
              <TabsTrigger value="pending-payments">Payments</TabsTrigger>
              <TabsTrigger value="email-center">Email Center</TabsTrigger>
              <TabsTrigger value="game-details">Game Details</TabsTrigger>
              <TabsTrigger value="card-payments">Card Payments</TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-8 px-4 sm:px-6 py-4 sm:py-6"
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
          <TabsContent value="games" className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
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

                            {/* Token Economy Settings */}
                            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 space-y-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-purple-400" />
                                <Label className="text-purple-300 font-bold text-sm">Token Economy</Label>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="tokenCostPerEntry" className="text-gray-300 text-sm">
                                    Tokens Per Play
                                  </Label>
                                  <Input
                                    id="tokenCostPerEntry"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={previewData.tokenCostPerEntry}
                                    onChange={(e) =>
                                      setPreviewData({ ...previewData, tokenCostPerEntry: e.target.value })
                                    }
                                    className="bg-white/10 border-purple-500/30"
                                    placeholder="e.g. 10"
                                  />
                                  <p className="text-gray-500 text-xs mt-1">Tokens charged per spin — 1 token = $0.50</p>
                                </div>
                                <div className="flex flex-col justify-center bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                  <p className="text-gray-400 text-xs mb-1">Auto-calculated revenue</p>
                                  <p className="text-yellow-400 font-black text-xl">
                                    {"$" + (parseInt(previewData.totalNumbers || "0") * parseInt(previewData.tokenCostPerEntry || "0") * 0.50).toLocaleString()}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {previewData.totalNumbers || "0"} spots &times; {previewData.tokenCostPerEntry || "0"} tokens &times; $0.50
                                  </p>
                                </div>
                              </div>
                              {/* Revenue Calculator */}
                              {previewData.totalNumbers && previewData.tokenCostPerEntry && (() => {
                                const totalSpots = parseInt(previewData.totalNumbers || "0");
                                const tokensPerPlay = parseInt(previewData.tokenCostPerEntry || "5");
                                const pricePerSpin = tokensPerPlay * 0.50; // 1 token = $0.50 (base rate: $5 = 10 tokens)
                                const totalRevenue = totalSpots * pricePerSpin;

                                return (
                                  <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-purple-600/30 px-4 py-2 flex items-center space-x-2">
                                      <span className="text-purple-200 text-xs font-bold uppercase tracking-widest">📊 Revenue Calculator</span>
                                    </div>

                                    {/* Main stats row */}
                                    <div className="grid grid-cols-3 divide-x divide-white/10 p-0">
                                      <div className="text-center py-4 px-3">
                                        <p className="text-gray-400 text-xs mb-1">Total Spots</p>
                                        <p className="text-white font-black text-2xl">{totalSpots}</p>
                                        <p className="text-gray-500 text-xs mt-1">players needed</p>
                                      </div>
                                      <div className="text-center py-4 px-3">
                                        <p className="text-gray-400 text-xs mb-1">Price Per Spin</p>
                                        <p className="text-green-400 font-black text-2xl">${pricePerSpin}</p>
                                        <p className="text-gray-500 text-xs mt-1">per player</p>
                                      </div>
                                      <div className="text-center py-4 px-3">
                                        <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
                                        <p className="text-yellow-400 font-black text-2xl">${totalRevenue.toLocaleString()}</p>
                                        <p className="text-gray-500 text-xs mt-1">when full</p>
                                      </div>
                                    </div>

                                    {/* Breakdown bar */}
                                    <div className="px-4 pb-4 pt-1 space-y-2">
                                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Fill progress example</span>
                                        <span>100% = ${totalRevenue.toLocaleString()}</span>
                                      </div>
                                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-green-400 rounded-full w-full"></div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-3">
                                        <div className="bg-white/5 rounded-lg p-2 text-center">
                                          <p className="text-gray-400 text-xs">At 50% full</p>
                                          <p className="text-white font-bold">${(totalRevenue * 0.5).toLocaleString()}</p>
                                          <p className="text-gray-500 text-xs">{Math.ceil(totalSpots * 0.5)} spots claimed</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 text-center">
                                          <p className="text-gray-400 text-xs">At 75% full</p>
                                          <p className="text-white font-bold">${(totalRevenue * 0.75).toLocaleString()}</p>
                                          <p className="text-gray-500 text-xs">{Math.ceil(totalSpots * 0.75)} spots claimed</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
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
                                <div className="flex items-center justify-between mb-1">
                                  <Label htmlFor="duration" className="text-gray-300">
                                    Duration (hours)
                                  </Label>
                                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 accent-purple-500"
                                      checked={previewData.noExpiry}
                                      onChange={(e) =>
                                        setPreviewData({ ...previewData, noExpiry: e.target.checked })
                                      }
                                    />
                                    <span className="text-purple-300 text-xs font-semibold">No Expiry</span>
                                  </label>
                                </div>
                                {previewData.noExpiry ? (
                                  <div className="bg-purple-900/40 border border-purple-500/40 rounded-md px-3 py-2 text-purple-300 text-sm flex items-center gap-2">
                                    <span>♾️</span>
                                    <span>Closes only when progress bar fills</span>
                                  </div>
                                ) : (
                                  <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    max="730"
                                    value={previewData.duration}
                                    onChange={(e) =>
                                      setPreviewData({
                                        ...previewData,
                                        duration: e.target.value,
                                      })
                                    }
                                    className="bg-white/10 border-purple-500/30"
                                    placeholder="240"
                                  />
                                )}
                              </div>
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
                                htmlFor="edit-tokenCostPerEntry"
                                className="text-gray-300"
                              >
                                Tokens Per Play
                              </Label>
                              <Input
                                id="edit-tokenCostPerEntry"
                                name="tokenCostPerEntry"
                                type="number"
                                min="1"
                                step="1"
                                value={editData.tokenCostPerEntry}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "tokenCostPerEntry",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                                placeholder="e.g. 60"
                              />
                              <p className="text-gray-500 text-xs mt-1">
                                1 token = $0.50 &nbsp;·&nbsp; {editData.tokenCostPerEntry ? `${editData.tokenCostPerEntry} tokens = $${(parseInt(editData.tokenCostPerEntry) * 0.5).toFixed(2)}` : "enter amount"}
                              </p>
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
                                htmlFor="edit-tokenCostPerEntry"
                                className="text-gray-300"
                              >
                                Tokens Per Play
                              </Label>
                              <Input
                                id="edit-tokenCostPerEntry"
                                name="tokenCostPerEntry"
                                type="number"
                                min="1"
                                step="1"
                                value={editData.tokenCostPerEntry}
                                onChange={(e) =>
                                  handleEditFieldChange(
                                    "tokenCostPerEntry",
                                    e.target.value,
                                  )
                                }
                                className="bg-white/10 border-purple-500/30"
                                placeholder="e.g. 60"
                              />
                              <p className="text-gray-500 text-xs mt-1">
                                1 token = $0.50 &nbsp;·&nbsp; {editData.tokenCostPerEntry ? `${editData.tokenCostPerEntry} tokens = $${(parseInt(editData.tokenCostPerEntry) * 0.5).toFixed(2)}` : "enter amount"}
                              </p>
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
                        {(() => {
                          const isNoExpiry = game.endTime && new Date(game.endTime).getFullYear() >= 2050;
                          const isExpired = game.isActive && !isNoExpiry && new Date(game.endTime) < new Date();
                          if (isExpired) {
                            return (
                              <Badge className="bg-red-600 text-xs flex-shrink-0 ml-2 animate-pulse">
                                ⚠️ Expired
                              </Badge>
                            );
                          }
                          return (
                            <Badge
                              variant={game.isActive ? "default" : "secondary"}
                              className={`${
                                game.isActive
                                  ? isNoExpiry ? "bg-purple-600" : "bg-green-500"
                                  : "bg-gray-500"
                              } text-xs flex-shrink-0 ml-2`}
                            >
                              {game.isActive ? (isNoExpiry ? "♾️ Active" : "Active") : "Ended"}
                            </Badge>
                          );
                        })()}
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
                            {/* Debug info - remove in production */}
                            {gameAvailableNumbers[game.id] !== undefined && (
                              <span className="text-xs text-green-400 ml-1">●</span>
                            )}
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

                          {/* Force-Close button for expired-but-still-active games (not no-expiry games) */}
                          {game.isActive && new Date(game.endTime).getFullYear() < 2050 && new Date(game.endTime) < new Date() && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-500/70 text-red-400 hover:bg-red-500/20 text-xs sm:text-sm font-semibold"
                              onClick={() => handleForceCloseGame(game.id, game.name)}
                            >
                              <span className="mr-1">🏁</span>
                              <span>Close & Pick Winner</span>
                            </Button>
                          )}

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
                            title={game.isGameOfTheDay ? "Remove Game of the Day" : "Set as Game of the Day"}
                            className={`px-2 sm:px-3 text-xs sm:text-sm ${game.isGameOfTheDay ? "border-yellow-400/70 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20" : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-300"}`}
                            onClick={async () => {
                              try {
                                await fetch(`/api/admin/games/${game.id}/game-of-the-day`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({ value: !game.isGameOfTheDay }),
                                });
                                queryClient.invalidateQueries({ queryKey: ["/api/games"] });
                                queryClient.invalidateQueries({ queryKey: ["/api/games/game-of-the-day"] });
                              } catch (_) {}
                            }}
                          >
                            ⭐
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
            className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6"
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
                <Button
                  onClick={() => {
                    if (!users || users.length === 0) return;
                    const header = ["Name", "Email", "Token Balance", "Games Played", "Joined Date"];
                    const rows = (users as any[]).map((u: any) => [
                      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
                      u.email ?? "",
                      u.tokenBalance ?? 0,
                      u.gamesPlayed ?? 0,
                      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
                    ]);
                    const csv = [header, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `prizeplugz-emails-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Emails
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
                                className="border-green-500/50 text-green-400 hover:bg-green-500/20 px-2 py-1 h-7"
                                onClick={() => { setAddTokensUser(user); setAddTokensAmount(""); }}
                                title="Add tokens"
                              >
                                <Plus className="h-3 w-3" />
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
                                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                                onClick={() => { setAddTokensUser(user); setAddTokensAmount(""); }}
                                title="Add tokens to this user"
                              >
                                <Plus className="h-4 w-4" />
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
            className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6"
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

            {/* Token Type Breakdown */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-yellow-400" />
                  Token Breakdown — Paid vs Free
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-300 mb-1">
                      {(tokenStats?.paidTokens ?? 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-200 font-medium">Purchased Tokens</div>
                    <div className="text-xs text-green-400 mt-1">Paid by users (token purchases)</div>
                  </div>
                  <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <div className="text-3xl font-bold text-amber-300 mb-1">
                      {(tokenStats?.freeTokens ?? 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-amber-200 font-medium">Bonus Tokens</div>
                    <div className="text-xs text-amber-400 mt-1">Free (referrals, daily, promo, welcome)</div>
                  </div>
                </div>
                {tokenStats && (tokenStats.paidTokens + tokenStats.freeTokens) > 0 && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Paid</span>
                      <span>{Math.round((tokenStats.paidTokens / (tokenStats.paidTokens + tokenStats.freeTokens)) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.round((tokenStats.paidTokens / (tokenStats.paidTokens + tokenStats.freeTokens)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Per-Game Revenue / Profit Table */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Per-Game Revenue &amp; Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {perGameStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No games found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-left">
                          <th className="pb-3 pr-4">Game</th>
                          <th className="pb-3 pr-4 text-right">Tokens In</th>
                          <th className="pb-3 pr-4 text-right">Revenue</th>
                          <th className="pb-3 pr-4 text-right">Prize Payout</th>
                          <th className="pb-3 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {perGameStats.map((game: any) => (
                          <tr key={game.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center space-x-2">
                                <span>{game.emoji}</span>
                                <span className="text-white font-medium truncate max-w-[140px]">{game.name}</span>
                                {game.isActive && <span className="text-xs text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full">Live</span>}
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right text-blue-300">{game.tokensCollected}</td>
                            <td className="py-3 pr-4 text-right text-green-300">${game.revenue.toFixed(2)}</td>
                            <td className="py-3 pr-4 text-right text-orange-300">${game.prizeValue.toFixed(2)}</td>
                            <td className={`py-3 text-right font-bold ${game.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {game.profit >= 0 ? '+' : ''}${game.profit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/20 font-bold">
                          <td className="pt-3 pr-4 text-white">Total</td>
                          <td className="pt-3 pr-4 text-right text-blue-300">{perGameStats.reduce((s: number, g: any) => s + (g.tokensCollected || 0), 0)}</td>
                          <td className="pt-3 pr-4 text-right text-green-300">${perGameStats.reduce((s: number, g: any) => s + g.revenue, 0).toFixed(2)}</td>
                          <td className="pt-3 pr-4 text-right text-orange-300">${perGameStats.reduce((s: number, g: any) => s + g.prizeValue, 0).toFixed(2)}</td>
                          <td className={`pt-3 text-right font-bold ${perGameStats.reduce((s: number, g: any) => s + g.profit, 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {perGameStats.reduce((s: number, g: any) => s + g.profit, 0) >= 0 ? '+' : ''}${perGameStats.reduce((s: number, g: any) => s + g.profit, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

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
          <TabsContent value="system" className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
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
          <TabsContent value="settings" className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
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

            {/* Payment Account Destinations */}
            <Card className="bg-black/20 backdrop-blur-sm border border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-400" />
                  Payment Account Destinations
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Set the account handles users send payments to. Changes apply immediately to all users.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { id: "cashapp",  label: "💵 Cash App",       placeholder: "$YourCashtag",       color: "#00c244" },
                    { id: "venmo",    label: "💳 Venmo",           placeholder: "@YourHandle",        color: "#3d95ce" },
                    { id: "chime",    label: "🏦 Chime",           placeholder: "Phone or email",     color: "#00c6a0" },
                    { id: "applepay", label: "🍎 Apple Pay/Cash",  placeholder: "+1 (000) 000-0000",  color: "#aaaaaa" },
                  ].map(m => {
                    const current = editedDests[m.id] ?? paymentDests?.[m.id]?.destination ?? "";
                    return (
                      <div key={m.id} className="space-y-1.5">
                        <Label className="text-gray-300 font-semibold">{m.label}</Label>
                        <div className="relative">
                          <Input
                            value={current}
                            onChange={e => setEditedDests(prev => ({ ...prev, [m.id]: e.target.value }))}
                            placeholder={m.placeholder}
                            className="bg-white/5 border-white/20 text-white placeholder-gray-600 pr-10 focus:border-opacity-80"
                            style={{ borderColor: `${m.color}40` }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: m.color }} />
                        </div>
                        {paymentDests?.[m.id] && (
                          <p className="text-gray-600 text-xs">Current: <span className="text-gray-400">{paymentDests[m.id].destination}</span></p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/10">
                  <Button
                    onClick={() => updatePaymentDestsMutation.mutate(editedDests)}
                    disabled={Object.keys(editedDests).length === 0 || updatePaymentDestsMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold"
                  >
                    {updatePaymentDestsMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" />Save Payment Accounts</>
                    )}
                  </Button>
                  {Object.keys(editedDests).length > 0 && (
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-400"
                      onClick={() => setEditedDests({})}
                    >
                      Cancel
                    </Button>
                  )}
                  {Object.keys(editedDests).length > 0 && (
                    <span className="text-yellow-400 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {Object.keys(editedDests).length} unsaved change{Object.keys(editedDests).length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

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
                      defaultValue="Prize Plugz"
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
          <TabsContent value="winners" className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
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
            <WinnersList />
          </TabsContent>

          {/* Winner Wall Tab */}
          <TabsContent value="winner-wall" className="space-y-6 px-4 sm:px-6 py-4 sm:py-6">
            <WinnerWallManager />
          </TabsContent>

          {/* ── Promo Codes Tab ────────────────────────────────────────── */}
          <PromoCodesTab />

          {/* ── Pending Payments Tab ───────────────────────────────────── */}
          <PendingPaymentsTab externalStatus={paymentStatusFilter} />

          {/* ── Email Center Tab ───────────────────────────────────────── */}
          <TabsContent value="email-center" className="px-4 sm:px-6 py-4 sm:py-6">
            <EmailCenterTab />
          </TabsContent>

          {/* ── Game Details Tab ────────────────────────────────────────── */}
          <TabsContent value="game-details" className="h-full">
            <GameDetailsTab />
          </TabsContent>

          {/* Card Payments Tab */}
          <TabsContent value="card-payments" className="space-y-6 px-4 sm:px-6 py-4 sm:py-6">
            <CardPaymentsTab />
          </TabsContent>

          </Tabs>
        </main>
      </div>

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

      {/* Add Tokens Dialog */}
      {addTokensUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Add Tokens</h3>
                <p className="text-gray-400 text-sm truncate max-w-[200px]">{addTokensUser.email}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="text-gray-300 text-sm font-medium mb-2 block">How many tokens to add?</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={addTokensAmount}
                onChange={(e) => setAddTokensAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addTokensAmount && Number(addTokensAmount) > 0) {
                    addTokensMutation.mutate({ userId: addTokensUser.id, amount: Number(addTokensAmount) });
                  }
                }}
                className="w-full px-4 py-3 rounded-lg text-white text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.15)" }}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setAddTokensUser(null); setAddTokensAmount(""); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (addTokensAmount && Number(addTokensAmount) > 0) {
                    addTokensMutation.mutate({ userId: addTokensUser.id, amount: Number(addTokensAmount) });
                  }
                }}
                disabled={addTokensMutation.isPending || !addTokensAmount || Number(addTokensAmount) <= 0}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addTokensMutation.isPending ? "Adding..." : `Add ${addTokensAmount || 0} Tokens`}
              </button>
            </div>
          </div>
        </div>
      )}

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

// Promo Codes Tab Component
function PromoCodesTab() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState<any>(null);
  const [form, setForm] = useState({ code: "", tokenAmount: "", description: "", expiresAt: "", maxUses: "" });

  const { data: promoCodes = [], isLoading } = useQuery({ queryKey: ["/api/admin/promo-codes"] });

  const resetForm = () => {
    setForm({ code: "", tokenAmount: "", description: "", expiresAt: "", maxUses: "" });
    setEditCode(null);
    setShowForm(false);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/promo-codes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Promo code created!" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PATCH", `/api/admin/promo-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Promo code updated!" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/promo-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Promo code deleted!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetUsesMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/admin/promo-codes/${id}`, { usesCount: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Uses reset to 0 ✅", description: "The code can be used again." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.code || !form.tokenAmount) {
      toast({ title: "Code and token amount are required", variant: "destructive" });
      return;
    }
    const payload = {
      code: form.code.toUpperCase().trim(),
      tokenAmount: parseInt(form.tokenAmount),
      description: form.description || null,
      expiresAt: form.expiresAt || null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
    };
    if (editCode) {
      updateMutation.mutate({ id: editCode.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (code: any) => {
    setEditCode(code);
    setForm({
      code: code.code,
      tokenAmount: String(code.tokenAmount),
      description: code.description || "",
      expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().slice(0, 16) : "",
      maxUses: code.maxUses != null ? String(code.maxUses) : "",
    });
    setShowForm(true);
  };

  return (
    <TabsContent value="promo-codes" className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
            <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3" />
            Promo Codes
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">Create and manage promotional token codes</p>
        </div>
        <Button
          onClick={() => { setEditCode(null); setForm({ code: "", tokenAmount: "", description: "", expiresAt: "", maxUses: "" }); setShowForm(true); }}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> New Promo Code
        </Button>
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-green-500/30 rounded-2xl p-6 mb-6 space-y-4 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white">{editCode ? "Edit Promo Code" : "Create Promo Code"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Code *</label>
              <input
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400 uppercase"
                placeholder="e.g. WELCOME10"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Token Amount *</label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                placeholder="e.g. 10"
                value={form.tokenAmount}
                onChange={e => setForm(f => ({ ...f, tokenAmount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Description</label>
              <input
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                placeholder="Optional description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Max Uses (leave blank = unlimited)</label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                placeholder="e.g. 100"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-300 text-sm font-medium block mb-1">Expiry Date (leave blank = no expiry)</label>
              <input
                type="datetime-local"
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editCode ? "Update Code" : "Create Code"}
            </Button>
            <Button onClick={resetForm} variant="outline" className="border-slate-500 text-gray-300 hover:text-white hover:bg-slate-700">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-700/40 rounded-xl animate-pulse" />)}
        </div>
      ) : (promoCodes as any[]).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No promo codes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(promoCodes as any[]).map((code: any) => {
            const isExpired = code.expiresAt && new Date() > new Date(code.expiresAt);
            const isExhausted = code.maxUses != null && code.usesCount >= code.maxUses;
            return (
              <div key={code.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-600/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-green-300 text-lg tracking-widest">{code.code}</span>
                    <Badge className={`text-xs ${code.isActive && !isExpired && !isExhausted ? "bg-green-600/30 text-green-300 border-green-500/30" : "bg-red-600/30 text-red-300 border-red-500/30"}`}>
                      {!code.isActive ? "Disabled" : isExpired ? "Expired" : isExhausted ? "Exhausted" : "Active"}
                    </Badge>
                    <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/30 text-xs">
                      🪙 {code.tokenAmount} tokens
                    </Badge>
                  </div>
                  {code.description && <p className="text-gray-400 text-sm truncate">{code.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span>Used: {code.usesCount}{code.maxUses != null ? ` / ${code.maxUses}` : " (unlimited)"}</span>
                    {code.expiresAt && <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: code.id, data: { isActive: !code.isActive } })}
                    className="border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 text-xs"
                  >
                    {code.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    <span className="ml-1 hidden sm:inline">{code.isActive ? "Active" : "Inactive"}</span>
                  </Button>
                  {(code.usesCount > 0 || (code.expiresAt && new Date() > new Date(code.expiresAt))) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetUsesMutation.mutate(code.id)}
                      disabled={resetUsesMutation.isPending}
                      className="border-yellow-500/40 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 text-xs"
                      title="Reset use count to 0 so the code can be used again"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">Reset Uses</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(code)}
                    className="border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(code.id)}
                    disabled={deleteMutation.isPending}
                    className="border-red-500/40 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}

// ── Pending Payments Tab ─────────────────────────────────────────────────────
function PendingPaymentsTab({ externalStatus }: { externalStatus?: string }) {
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [searchHandle, setSearchHandle] = useState("");
  const [filterAmount, setFilterAmount] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState(externalStatus ?? "pending");
  const [selected, setSelected] = useState<number[]>([]);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Sync filter when sidebar nav changes
  useEffect(() => {
    if (externalStatus && externalStatus !== "transactions") {
      setFilterStatus(externalStatus);
      setPage(1);
    }
  }, [externalStatus]);

  const { data: payments = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-payments", filterStatus, filterMethod],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterMethod !== "all") params.set("paymentMethod", filterMethod);
      return fetch(`/api/admin/pending-payments?${params}`).then(r => r.json());
    },
    refetchInterval: 15000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/pending-payments/${id}/approve`, {}),
    onSuccess: () => { toast({ title: "Payment approved! Tokens added." }); refetch(); },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      apiRequest("POST", `/api/admin/pending-payments/${id}/reject`, { notes }),
    onSuccess: () => { toast({ title: "Payment rejected." }); setRejectDialogId(null); refetch(); },
    onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: number[]) => apiRequest("POST", "/api/admin/pending-payments/bulk-approve", { ids }),
    onSuccess: (_, ids) => { toast({ title: `${ids.length} payment(s) approved!` }); setSelected([]); refetch(); },
    onError: () => toast({ title: "Bulk approve failed", variant: "destructive" }),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ids: number[]) => apiRequest("POST", "/api/admin/pending-payments/bulk-reject", { ids, notes: "Bulk rejected by staff" }),
    onSuccess: (_, ids) => { toast({ title: `${ids.length} payment(s) rejected.` }); setSelected([]); refetch(); },
    onError: () => toast({ title: "Bulk reject failed", variant: "destructive" }),
  });

  const METHOD_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    cashapp:  { label: "Cash App",   color: "#00d632", bg: "rgba(0,214,50,0.12)"    },
    venmo:    { label: "Venmo",      color: "#3d95ce", bg: "rgba(61,149,206,0.12)"  },
    chime:    { label: "Chime",      color: "#00c88c", bg: "rgba(0,200,140,0.12)"   },
    applepay: { label: "Apple Pay",  color: "#e8e8e8", bg: "rgba(232,232,232,0.10)" },
  };

  const filtered = (payments as any[]).filter(p => {
    if (searchUser && !`${p.user?.firstName} ${p.user?.lastName} ${p.user?.email}`.toLowerCase().includes(searchUser.toLowerCase())) return false;
    if (searchHandle && !(p.paymentHandle ?? "").toLowerCase().includes(searchHandle.toLowerCase())) return false;
    if (filterAmount !== "all") {
      const amt = Number(p.dollarAmount);
      if (filterAmount === "5"   && amt !== 5)   return false;
      if (filterAmount === "10"  && amt !== 10)  return false;
      if (filterAmount === "20"  && amt !== 20)  return false;
      if (filterAmount === "50"  && amt !== 50)  return false;
      if (filterAmount === "100" && amt !== 100) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));
  function toggleAll()          { allSelected ? setSelected([]) : setSelected(filtered.map(p => p.id)); }
  function toggleOne(id: number){ setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }

  function timeAgo(date: string) {
    const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
    return new Date(date).toLocaleDateString();
  }

  // Stats
  const allPayments   = payments as any[];
  const pendingList   = allPayments.filter(p => p.status === "pending");
  const todayStart    = new Date(); todayStart.setHours(0,0,0,0);
  const approvedToday = allPayments.filter(p => p.status === "approved" && new Date(p.processedAt) >= todayStart);
  const rejectedToday = allPayments.filter(p => p.status === "rejected" && new Date(p.processedAt) >= todayStart);
  const totalPending  = pendingList.reduce((s, p) => s + Number(p.dollarAmount), 0);
  const totalApproved = allPayments.filter(p => p.status === "approved").length;
  const totalRejected = allPayments.filter(p => p.status === "rejected").length;

  function clearFilters() {
    setSearchUser(""); setSearchHandle(""); setFilterAmount("all"); setFilterMethod("all"); setFilterStatus("pending"); setPage(1);
  }

  const inputCls = "w-full pl-9 pr-3 py-2 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white";
  const inputStyle = { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" };

  return (
    <TabsContent value="pending-payments" className="px-0 py-0 mt-0">
      <div className="p-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Pending Payments</h1>
            <p className="text-gray-400 text-sm mt-0.5">Review and process incoming payment submissions</p>
          </div>
          <button onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)"}}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Clock,       iconBg:"rgba(245,158,11,0.15)", iconColor:"#f59e0b", value: pendingList.length,    label:"Pending Payments", sub:"Needs Review",                       valueCls:"text-yellow-400" },
            { icon: CheckCircle, iconBg:"rgba(16,185,129,0.15)", iconColor:"#10b981", value: approvedToday.length,  label:"Approved Today",   sub:`Total: ${totalApproved.toLocaleString()}`, valueCls:"text-emerald-400" },
            { icon: XCircle,     iconBg:"rgba(239,68,68,0.15)",  iconColor:"#ef4444", value: rejectedToday.length,  label:"Rejected Today",   sub:`Total: ${totalRejected.toLocaleString()}`, valueCls:"text-red-400" },
            { icon: DollarSign,  iconBg:"rgba(245,158,11,0.15)", iconColor:"#f59e0b", value:`$${totalPending.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`, label:"Total Pending", sub:`Across ${pendingList.length} Payments`, valueCls:"text-yellow-400" },
          ].map(({ icon: Icon, iconBg, iconColor, value, label, sub, valueCls }) => (
            <div key={label} className="rounded-xl p-4 flex items-center gap-3"
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{background:iconBg}}>
                <Icon className="h-5 w-5" style={{color:iconColor}} />
              </div>
              <div className="min-w-0">
                <p className={`text-2xl font-black leading-none ${valueCls}`}>{value}</p>
                <p className="text-white text-xs font-semibold mt-1 truncate">{label}</p>
                <p className="text-gray-500 text-[10px] truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end gap-2">
          {/* Search User */}
          <div className="flex-1 min-w-[160px]">
            <p className="text-gray-400 text-xs mb-1 font-medium">Search User</p>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input placeholder="Search by name or email" value={searchUser} onChange={e => { setSearchUser(e.target.value); setPage(1); }}
                className={inputCls} style={inputStyle} />
            </div>
          </div>
          {/* Search Handle */}
          <div className="flex-1 min-w-[150px]">
            <p className="text-gray-400 text-xs mb-1 font-medium">Search Handle</p>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input placeholder="Search by payment handle" value={searchHandle} onChange={e => { setSearchHandle(e.target.value); setPage(1); }}
                className={inputCls} style={inputStyle} />
            </div>
          </div>
          {/* Amount */}
          <div className="min-w-[130px]">
            <p className="text-gray-400 text-xs mb-1 font-medium">Filter by Amount</p>
            <select value={filterAmount} onChange={e => { setFilterAmount(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              style={inputStyle}>
              <option value="all">All Amounts</option>
              <option value="5">$5</option><option value="10">$10</option>
              <option value="20">$20</option><option value="50">$50</option><option value="100">$100</option>
            </select>
          </div>
          {/* Method */}
          <div className="min-w-[130px]">
            <p className="text-gray-400 text-xs mb-1 font-medium">Filter by Method</p>
            <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              style={inputStyle}>
              <option value="all">All Methods</option>
              <option value="cashapp">Cash App</option><option value="venmo">Venmo</option>
              <option value="chime">Chime</option><option value="applepay">Apple Pay</option>
            </select>
          </div>
          {/* Status */}
          <div className="min-w-[130px]">
            <p className="text-gray-400 text-xs mb-1 font-medium">Filter by Status</p>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              style={inputStyle}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
          </div>
          {/* Clear */}
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors self-end"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
            <X className="h-3.5 w-3.5" /> Clear Filters
          </button>
        </div>

        {/* ── Table Container ─────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>

          {/* Bulk action bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{borderColor:"rgba(255,255,255,0.07)"}}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              className="rounded cursor-pointer accent-blue-500 w-4 h-4" />
            <span className="text-gray-400 text-sm">{selected.length} selected</span>
            {filtered.length > 0 && (
              <button onClick={() => setSelected(filtered.map(p => p.id))}
                className="text-blue-400 hover:text-blue-300 text-sm underline-offset-2 hover:underline">
                Select all {filtered.length} payments
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => { if (selected.length) bulkApproveMutation.mutate(selected); }}
                disabled={bulkApproveMutation.isPending || selected.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40"
                style={{background:"#16a34a"}}>
                <Check className="h-3 w-3" /> Approve Selected ({selected.length})
              </button>
              <button onClick={() => { if (selected.length) bulkRejectMutation.mutate(selected); }}
                disabled={bulkRejectMutation.isPending || selected.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40"
                style={{background:"#dc2626"}}>
                <X className="h-3 w-3" /> Reject Selected ({selected.length})
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden xl:grid px-4 py-2.5 border-b text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            style={{borderColor:"rgba(255,255,255,0.07)", gridTemplateColumns:"2.5rem 2.5fr 2fr 4.5rem 3.5rem 5rem 5rem 5.5rem 4.5rem 6rem"}}>
            <span />
            <span>User</span><span>Email</span><span>Amount</span><span>Tokens</span>
            <span>Method</span><span>Payment Info</span><span>Time Submitted</span>
            <span>Status</span><span>Actions</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{background:"rgba(255,255,255,0.04)"}} />)}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No payments found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.05)"}}>
              {pageItems.map((p: any) => {
                const isSel = selected.includes(p.id);
                const method = METHOD_LABELS[p.paymentMethod] ?? { label: p.paymentMethod, color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };
                const statusStyle =
                  p.status === "approved" ? { bg:"rgba(16,185,129,0.15)", color:"#10b981", label:"Approved" } :
                  p.status === "rejected" ? { bg:"rgba(239,68,68,0.15)",  color:"#ef4444", label:"Rejected" } :
                                            { bg:"rgba(245,158,11,0.15)", color:"#f59e0b", label:"Pending"  };
                return (
                  <div key={p.id} className={`transition-colors ${isSel ? "bg-blue-500/8" : "hover:bg-white/[0.015]"}`}>
                    {/* Mobile */}
                    <div className="xl:hidden p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" checked={isSel} onChange={() => toggleOne(p.id)}
                            className="rounded cursor-pointer accent-blue-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                            {(p.user?.firstName?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm leading-tight">{p.user?.firstName} {p.user?.lastName}</p>
                            <p className="text-gray-500 text-xs">{p.user?.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{background:statusStyle.bg, color:statusStyle.color}}>{statusStyle.label}</span>
                      </div>
                      <div className="flex items-center gap-3 pl-[60px] text-sm flex-wrap">
                        <span className="font-bold" style={{color:"#10b981"}}>${Number(p.dollarAmount).toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">{p.creditsAmount} tokens</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:method.bg,color:method.color}}>{method.label}</span>
                      </div>
                      <p className="pl-[60px] text-xs text-gray-500">Name: {p.paymentName} · Handle: {p.paymentHandle}</p>
                      {p.status === "pending" && (
                        <div className="pl-[60px] flex gap-2">
                          <button onClick={() => approveMutation.mutate(p.id)} disabled={approveMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:"#16a34a"}}>
                            <Check className="h-3 w-3" />Approve
                          </button>
                          <button onClick={() => setRejectDialogId(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:"#dc2626"}}>
                            <X className="h-3 w-3" />Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden xl:grid items-center gap-3 px-4 py-3 text-sm"
                      style={{gridTemplateColumns:"2.5rem 2.5fr 2fr 4.5rem 3.5rem 5rem 5rem 5.5rem 4.5rem 6rem"}}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(p.id)}
                        className="rounded cursor-pointer accent-blue-500 w-4 h-4" />
                      {/* User */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                          {(p.user?.firstName?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-xs leading-tight truncate">{p.user?.firstName} {p.user?.lastName}</p>
                          <p className="text-gray-500 text-[10px] truncate">@{p.paymentHandle}</p>
                        </div>
                      </div>
                      {/* Email */}
                      <span className="text-gray-400 text-xs truncate">{p.user?.email}</span>
                      {/* Amount */}
                      <span className="font-bold text-sm" style={{color:"#10b981"}}>${Number(p.dollarAmount).toFixed(2)}</span>
                      {/* Tokens */}
                      <span className="text-white font-semibold text-sm">{p.creditsAmount}</span>
                      {/* Method */}
                      <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block"
                        style={{background:method.bg, color:method.color}}>{method.label}</span>
                      {/* Payment Info */}
                      <div className="text-[11px] text-gray-400 min-w-0">
                        <p className="truncate">Name: {p.paymentName}</p>
                        <p className="truncate">Handle: {p.paymentHandle}</p>
                      </div>
                      {/* Time */}
                      <div className="text-[11px] text-gray-400">
                        <p>{timeAgo(p.submittedAt)}</p>
                        <p className="text-gray-600">{new Date(p.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                      </div>
                      {/* Status */}
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full text-center inline-block"
                        style={{background:statusStyle.bg, color:statusStyle.color}}>{statusStyle.label}</span>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {p.status === "pending" ? (
                          <>
                            <button onClick={() => approveMutation.mutate(p.id)} disabled={approveMutation.isPending}
                              className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                              style={{background:"#16a34a"}}>
                              <Check className="h-2.5 w-2.5" />Approve
                            </button>
                            <button onClick={() => setRejectDialogId(p.id)}
                              className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-80"
                              style={{background:"#dc2626"}}>
                              <X className="h-2.5 w-2.5" />Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-600 italic">
                            {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "–"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{borderColor:"rgba(255,255,255,0.07)"}}>
              <p className="text-xs text-gray-500">
                Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} payments
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
                  ‹
                </button>
                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${p === safePage ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/10"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
                  ›
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                Items per page:
                <span className="text-white font-semibold">{PAGE_SIZE}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject dialog */}
      {rejectDialogId !== null && (
        <Dialog open={true} onOpenChange={() => setRejectDialogId(null)}>
          <DialogContent className="border-red-500/30 text-white" style={{background:"#111827"}}>
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> Reject Payment
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Optionally enter a reason for rejection (visible to staff only).
              </DialogDescription>
            </DialogHeader>
            <textarea
              className="w-full rounded-xl p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
              style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)"}}
              rows={3} placeholder="Reason for rejection (optional)"
              value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogId(null)} className="border-white/20 text-gray-300">
                Cancel
              </Button>
              <Button onClick={() => rejectMutation.mutate({ id: rejectDialogId, notes: rejectNotes })}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-bold">
                <X className="h-4 w-4 mr-1.5" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TabsContent>
  );
}

// ── Winner Wall Manager Component ────────────────────────────────────────────
function WinnerWallManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [form, setForm] = useState({ name: "", prize: "", prizeColor: "#10b981", imageUrl: "", displayOrder: 0, isActive: true });

  const { data: entries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/winner-wall"],
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/admin/winner-wall", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/winner-wall"] }); queryClient.invalidateQueries({ queryKey: ["/api/winner-wall"] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => fetch(`/api/admin/winner-wall/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/winner-wall"] }); queryClient.invalidateQueries({ queryKey: ["/api/winner-wall"] }); setEditEntry(null); setShowForm(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/admin/winner-wall/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/winner-wall"] }); queryClient.invalidateQueries({ queryKey: ["/api/winner-wall"] }); },
  });

  function resetForm() { setForm({ name: "", prize: "", prizeColor: "#10b981", imageUrl: "", displayOrder: 0, isActive: true }); }

  function startEdit(entry: any) {
    setEditEntry(entry);
    setForm({ name: entry.name, prize: entry.prize, prizeColor: entry.prizeColor, imageUrl: entry.imageUrl ?? "", displayOrder: entry.displayOrder, isActive: entry.isActive });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, displayOrder: Number(form.displayOrder) };
    if (editEntry) updateMutation.mutate({ id: editEntry.id, data: payload });
    else createMutation.mutate(payload);
  }

  const COLOR_PRESETS = ["#10b981","#7c3aed","#f59e0b","#ef4444","#3b82f6","#ec4899","#14b8a6"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400" /> Winner Wall Manager
          </h2>
          <p className="text-gray-400 text-sm mt-1">Curate the winners shown on the homepage winner wall</p>
        </div>
        <Button onClick={() => { resetForm(); setEditEntry(null); setShowForm(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Winner
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white text-base">{editEntry ? "Edit Winner" : "Add New Winner"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-300 text-sm">Winner Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mike T." required className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300 text-sm">Prize Label *</Label>
                  <Input value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} placeholder="e.g. Won $500 Cash" required className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Photo URL (paste direct image link)</Label>
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/winner-photo.jpg" className="bg-slate-700 border-slate-600 text-white" />
                {form.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden w-24 h-24 border border-slate-600">
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Badge Color</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button type="button" key={c} onClick={() => setForm(f => ({ ...f, prizeColor: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: c, borderColor: form.prizeColor === c ? "white" : "transparent" }} />
                  ))}
                  <input type="color" value={form.prizeColor} onChange={e => setForm(f => ({ ...f, prizeColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" title="Custom color" />
                  <span className="text-xs text-gray-400 ml-1">{form.prizeColor}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-300 text-sm">Display Order (lower = first)</Label>
                  <Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                  <Label className="text-gray-300 text-sm">Show on homepage</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editEntry ? "Save Changes" : "Add Winner"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditEntry(null); resetForm(); }} className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entries Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl animate-pulse bg-slate-800" />)}
        </div>
      ) : entries.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Star className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No winner wall entries yet. Add your first winner!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry: any) => (
            <Card key={entry.id} className={`bg-slate-800 border-slate-700 overflow-hidden ${!entry.isActive ? "opacity-50" : ""}`}>
              <div className="relative overflow-hidden" style={{ height: 160 }}>
                {entry.imageUrl ? (
                  <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" style={{ objectPosition: "center top" }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}>🏆</div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md text-white" style={{ background: entry.prizeColor }}>
                    {entry.isActive ? "VISIBLE" : "HIDDEN"}
                  </span>
                </div>
                <div className="absolute top-2 right-2 text-[10px] text-gray-400 bg-black/60 px-1.5 py-0.5 rounded">
                  #{entry.displayOrder}
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-white font-bold text-sm">{entry.name}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: entry.prizeColor }}>{entry.prize}</p>
                <p className="text-gray-500 text-xs mt-1">{new Date(entry.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => startEdit(entry)} className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700 text-xs h-7">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(entry.id)} disabled={deleteMutation.isPending}
                    className="border-red-800 text-red-400 hover:bg-red-900/30 text-xs h-7">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
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

// ── Game Details Tab ─────────────────────────────────────────────────────────
function GameDetailsTab() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"players" | "numbers">("players");
  const [gameSearch, setGameSearch] = useState("");
  // Mobile: true = showing details panel, false = showing game list
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Fetch all games for the list panel
  const { data: allGames = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/games"],
    refetchInterval: 30000,
  });

  // Fetch details for selected game
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/admin/games", selectedGameId, "full-details"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/games/${selectedGameId}/full-details`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: selectedGameId !== null,
    refetchInterval: 15000,
  });

  const game = data?.game;
  const players: any[] = data?.players || [];
  const summary = data?.summary;
  const winner = data?.winner;

  const filteredPlayers = players.filter(p =>
    !searchQuery ||
    p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGames = (allGames as any[]).filter((g: any) =>
    !gameSearch ||
    g.name.toLowerCase().includes(gameSearch.toLowerCase()) ||
    g.code.toLowerCase().includes(gameSearch.toLowerCase())
  );

  const allClaimedNumbers = new Set<number>();
  const numberOwnerMap: Record<number, string> = {};
  for (const p of players) {
    for (const n of (p.ownedNumbers || [])) {
      const num = parseInt(n);
      allClaimedNumbers.add(num);
      numberOwnerMap[num] = p.playerName;
    }
  }
  const totalNumbers = game?.totalNumbers || 0;

  // Shared game list panel content
  const gameListPanel = (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-4 pb-2 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">All Games</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            className="w-full text-xs rounded-lg pl-8 pr-3 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
            placeholder="Search games…"
            value={gameSearch}
            onChange={e => setGameSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredGames.map((g: any) => (
          <button
            key={g.id}
            onClick={() => {
              setSelectedGameId(g.id);
              setSearchQuery("");
              setActiveSection("players");
              setMobileShowDetail(true);
            }}
            className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${
              selectedGameId === g.id
                ? "bg-purple-600/30 border border-purple-500/40"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-white flex items-center gap-1.5 min-w-0">
                <span className="flex-shrink-0">{g.emoji || "🎮"}</span>
                <span className="truncate">{g.name}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-gray-500">{g.code}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                g.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"
              }`}>
                {g.isActive ? "LIVE" : "ENDED"}
              </span>
            </div>
          </button>
        ))}
        {filteredGames.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-8">No games found</p>
        )}
      </div>
    </div>
  );

  // Shared detail panel content
  const detailPanel = (
    <div className="flex-1 overflow-y-auto min-w-0">
      {selectedGameId === null && (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
          <Hash className="h-16 w-16 text-gray-700 mb-4" />
          <p className="text-gray-400 font-semibold text-lg">Select a game</p>
          <p className="text-gray-600 text-sm mt-1">Pick any game from the list to view its full details</p>
        </div>
      )}

      {selectedGameId !== null && isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        </div>
      )}

      {selectedGameId !== null && error && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400">Failed to load game details.</p>
        </div>
      )}

      {selectedGameId !== null && data && (
        <div>
          {/* Game header — with Back button on mobile */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center gap-3 sticky top-0 z-10"
            style={{ borderColor: "rgba(124,58,237,0.25)", background: "rgba(11,12,24,0.97)" }}>
            {/* Back button — mobile only */}
            <button
              className="md:hidden flex items-center gap-1 text-purple-400 text-sm font-medium flex-shrink-0"
              onClick={() => setMobileShowDetail(false)}
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Games</span>
            </button>
            <span className="text-2xl sm:text-3xl flex-shrink-0">{game?.emoji || "🎮"}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{game?.name}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="text-xs font-mono text-gray-400">{game?.code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${game?.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}>
                  {game?.isActive ? "● LIVE" : "● ENDED"}
                </span>
                <span className="text-xs text-yellow-400 font-semibold truncate">{game?.prize}</span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {[
              { label: "Players",      value: summary?.totalPlayers ?? 0,                  icon: Users,  color: "text-blue-400" },
              { label: "Total Spins",  value: summary?.totalSpins ?? 0,                    icon: Zap,    color: "text-purple-400" },
              { label: "Tokens Spent", value: summary?.totalTokensSpent?.toFixed(0) ?? 0, icon: Coins,  color: "text-yellow-400" },
              { label: "% Full",       value: `${summary?.pctFull ?? 0}%`,                 icon: Target, color: "text-green-400" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-base sm:text-lg font-bold leading-none ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="px-3 sm:px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{summary?.claimedNumbers ?? 0} claimed</span>
              <span>{summary?.numbersLeft ?? 0} left of {totalNumbers}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${summary?.pctFull ?? 0}%`,
                  background: (summary?.pctFull ?? 0) >= 95
                    ? "linear-gradient(90deg,#dc2626,#f97316)"
                    : (summary?.pctFull ?? 0) >= 80
                    ? "linear-gradient(90deg,#d97706,#f59e0b)"
                    : "linear-gradient(90deg,#7c3aed,#3b82f6)",
                }} />
            </div>
          </div>

          {/* Winner banner */}
          {winner && (
            <div className="mx-3 sm:mx-6 mt-3 rounded-xl p-3 sm:p-4 flex items-center gap-3"
              style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.3)" }}>
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-yellow-300 font-bold text-sm">Winner: {winner.playerName}</p>
                <p className="text-yellow-500/80 text-xs truncate">{winner.email} · #{winner.ownedNumbers?.join(", #")}</p>
              </div>
            </div>
          )}

          {/* Section tabs */}
          <div className="flex gap-1 sm:gap-2 px-3 sm:px-6 pt-3 border-b pb-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {([
              { key: "players", label: "Players", icon: Users },
              { key: "numbers", label: "Numbers Grid", icon: Hash },
            ] as const).map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeSection === s.key
                    ? "border-purple-500 text-purple-300"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}>
                <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {s.label}
                {s.key === "players" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                    {players.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Players — card layout on mobile, table on desktop */}
          {activeSection === "players" && (
            <div className="px-3 sm:px-6 pb-6 pt-3 sm:pt-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 pl-9"
                />
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No players yet</p>
                  <p className="text-gray-600 text-sm mt-1">Players will appear here once they join</p>
                </div>
              ) : (
                <>
                  {/* Mobile card list */}
                  <div className="sm:hidden space-y-2">
                    {filteredPlayers.map(player => (
                      <div key={player.id} className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{ background: player.isWinner ? "rgba(250,204,21,0.2)" : "rgba(124,58,237,0.2)", color: player.isWinner ? "#facc15" : "#a78bfa" }}>
                              {player.playerName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{player.playerName}</p>
                              <p className="text-[11px] text-gray-500 truncate">{player.email}</p>
                            </div>
                          </div>
                          {player.isWinner ? (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex-shrink-0">🏆 Winner</span>
                          ) : player.freeSpins > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">Free</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex-shrink-0">Paid</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs mb-2">
                          <span className="text-gray-500">Spins: <span className="text-purple-300 font-bold">{player.spinCount}</span></span>
                          <span className="text-gray-500">Tokens: <span className="text-yellow-400 font-bold">{player.totalSpent?.toFixed(0) ?? 0}</span></span>
                          <span className="text-gray-500">Nums: <span className="text-white font-bold">{player.numbersCount}</span></span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(player.ownedNumbers || []).slice(0, 10).map((n: string) => (
                            <span key={n} className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(124,58,237,0.25)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.4)" }}>
                              {n}
                            </span>
                          ))}
                          {player.ownedNumbers?.length > 10 && (
                            <span className="text-[10px] text-gray-500 self-center">+{player.ownedNumbers.length - 10} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="grid text-[11px] font-semibold uppercase tracking-widest text-gray-500 px-4 py-2.5"
                      style={{ gridTemplateColumns: "1fr 1fr auto auto auto auto", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span>Player</span><span>Email</span>
                      <span className="text-center">Numbers</span>
                      <span className="text-center">Spins</span>
                      <span className="text-center">Tokens</span>
                      <span className="text-center">Status</span>
                    </div>
                    <div>
                      {filteredPlayers.map((player, idx) => (
                        <div key={player.id}
                          className="grid items-center px-4 py-3 transition-colors hover:bg-white/[0.02]"
                          style={{ gridTemplateColumns: "1fr 1fr auto auto auto auto", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="flex items-center gap-2 min-w-0 pr-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{ background: player.isWinner ? "rgba(250,204,21,0.2)" : "rgba(124,58,237,0.2)", color: player.isWinner ? "#facc15" : "#a78bfa" }}>
                              {player.playerName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-white font-medium truncate">{player.playerName}</span>
                          </div>
                          <div className="min-w-0 pr-3">
                            <span className="text-xs text-gray-400 truncate block">{player.email}</span>
                          </div>
                          <div className="text-center px-3">
                            <div className="inline-flex flex-wrap gap-1 justify-center max-w-[160px]">
                              {(player.ownedNumbers || []).slice(0, 6).map((n: string) => (
                                <span key={n} className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ background: "rgba(124,58,237,0.25)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.4)" }}>
                                  {n}
                                </span>
                              ))}
                              {player.ownedNumbers?.length > 6 && (
                                <span className="text-[10px] text-gray-500">+{player.ownedNumbers.length - 6}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-0.5">{player.numbersCount} total</p>
                          </div>
                          <div className="text-center px-3">
                            <span className="text-sm font-bold text-purple-300">{player.spinCount}</span>
                          </div>
                          <div className="text-center px-3">
                            <span className="text-sm font-bold text-yellow-400">{player.totalSpent?.toFixed(0) ?? 0}</span>
                          </div>
                          <div className="text-center">
                            {player.isWinner ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🏆 Winner</span>
                            ) : player.freeSpins > 0 ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Free</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Paid</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Numbers grid */}
          {activeSection === "numbers" && (
            <div className="px-3 sm:px-6 pb-6 pt-3 sm:pt-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded" style={{ background: "rgba(124,58,237,0.4)", border: "1px solid rgba(124,58,237,0.6)" }} />
                  <span className="text-gray-400">Claimed ({allClaimedNumbers.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <span className="text-gray-400">Available ({totalNumbers - allClaimedNumbers.size})</span>
                </div>
                {winner && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ background: "rgba(250,204,21,0.3)", border: "1px solid rgba(250,204,21,0.6)" }} />
                    <span className="text-yellow-400">Winner</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl p-3 sm:p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(n => {
                    const isClaimed = allClaimedNumbers.has(n);
                    const isWinnerNum = winner && winner.ownedNumbers?.includes(String(n));
                    return (
                      <div key={n}
                        title={isClaimed ? `#${n} — ${numberOwnerMap[n]}` : `#${n} — Available`}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold cursor-default transition-all hover:scale-110"
                        style={{
                          background: isWinnerNum ? "rgba(250,204,21,0.3)" : isClaimed ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.05)",
                          border: isWinnerNum ? "1px solid rgba(250,204,21,0.7)" : isClaimed ? "1px solid rgba(124,58,237,0.55)" : "1px solid rgba(255,255,255,0.1)",
                          color: isWinnerNum ? "#facc15" : isClaimed ? "#c4b5fd" : "#374151",
                        }}>
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 130px)" }}>
      {/* Mobile: single-panel toggle */}
      <div className="md:hidden h-full flex flex-col" style={{ minHeight: "calc(100vh - 130px)" }}>
        {!mobileShowDetail ? (
          <div className="flex-1 overflow-y-auto" style={{ background: "rgba(0,0,0,0.2)" }}>
            {gameListPanel}
          </div>
        ) : (
          detailPanel
        )}
      </div>

      {/* Desktop: split-pane */}
      <div className="hidden md:flex h-full" style={{ minHeight: "calc(100vh - 130px)" }}>
        <div className="w-64 flex-shrink-0 border-r"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}>
          {gameListPanel}
        </div>
        {detailPanel}
      </div>
    </div>
  );
}

// ── Email Center Tab ────────────────────────────────────────────────────────
function EmailCenterTab() {
  const { toast } = useToast();
  const [emailType, setEmailType] = useState<"custom" | "new_game" | "low_token_warning" | "game_closing_soon">("custom");
  const [recipients, setRecipients] = useState<"all" | "specific">("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [specificEmail, setSpecificEmail] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [tokenThreshold, setTokenThreshold] = useState("5");
  const [lastResult, setLastResult] = useState<{ sent: number; skipped: number; failed: number; total: number } | null>(null);

  const { data: games } = useQuery<any[]>({ queryKey: ["/api/admin/games"] });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { type: emailType, recipients };
      if (emailType === "custom") { payload.subject = subject; payload.message = message; }
      if (emailType === "new_game" || emailType === "game_closing_soon") payload.gameId = selectedGameId;
      if (emailType === "low_token_warning") payload.tokenThreshold = tokenThreshold;
      if (recipients === "specific") payload.specificEmail = specificEmail;
      const res = await apiRequest("POST", "/api/admin/send-bulk-email", payload);
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast({ title: "Campaign sent!", description: `${data.sent} emails delivered${data.skipped ? `, ${data.skipped} skipped` : ""}${data.failed ? `, ${data.failed} failed` : ""}.` });
    },
    onError: (err: any) => {
      toast({ title: "Send failed", description: err.message || "Something went wrong", variant: "destructive" });
    },
  });

  const emailTypeOptions = [
    { value: "custom",            label: "Custom Message",       icon: "✍️", desc: "Write a custom subject & body to send to users" },
    { value: "new_game",          label: "New Game Announcement",icon: "🎮", desc: "Notify users a new game is now live" },
    { value: "low_token_warning", label: "Low Token Warning",    icon: "⚠️", desc: "Alert users who have few tokens left" },
    { value: "game_closing_soon", label: "Game Closing Soon",    icon: "🔥", desc: "Urgency email for a nearly-full game" },
  ] as const;

  const canSend = (() => {
    if (sendMutation.isPending) return false;
    if (recipients === "specific" && !specificEmail.includes("@")) return false;
    if (emailType === "custom" && (!subject.trim() || !message.trim())) return false;
    if ((emailType === "new_game" || emailType === "game_closing_soon") && !selectedGameId) return false;
    return true;
  })();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Mail className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Email Center</h2>
          <p className="text-sm text-gray-400">Send targeted emails to your users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose */}
        <div className="lg:col-span-2 space-y-5">

          {/* Email Type */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Email Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emailTypeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setEmailType(opt.value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    emailType === opt.value
                      ? "border-purple-500/60 bg-purple-600/10"
                      : "border-white/8 hover:border-white/20 hover:bg-white/4"
                  }`}
                >
                  <span className="text-lg mt-0.5">{opt.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${emailType === opt.value ? "text-purple-300" : "text-gray-200"}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Recipients</p>
            <div className="flex gap-2">
              {([
                { value: "all",      label: "All Users",       icon: Users },
                { value: "specific", label: "Specific Email",  icon: User  },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRecipients(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    recipients === opt.value
                      ? "border-blue-500/60 bg-blue-600/10 text-blue-300"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
            {recipients === "specific" && (
              <div className="mt-3">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={specificEmail}
                  onChange={e => setSpecificEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-500"
                />
              </div>
            )}
          </div>

          {/* Dynamic Fields */}
          {emailType === "custom" && (
            <div className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Compose</p>
              <div>
                <Label className="text-sm text-gray-300 mb-1 block">Subject Line</Label>
                <Input
                  placeholder="e.g. Exciting news from Prize Plugz!"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-300 mb-1 block">Message Body</Label>
                <Textarea
                  rows={6}
                  placeholder="Write your message here. Users will be greeted by name automatically."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-500 resize-none"
                />
                <p className="text-xs text-gray-600 mt-1">New lines are preserved. Each user is greeted by their first name.</p>
              </div>
            </div>
          )}

          {(emailType === "new_game" || emailType === "game_closing_soon") && (
            <div className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Select Game</p>
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Choose a game…" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {(games || []).map((g: any) => (
                    <SelectItem key={g.id} value={String(g.id)} className="text-white hover:bg-slate-700">
                      {g.name} — {g.prize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {emailType === "low_token_warning" && (
            <div className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Token Threshold</p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={tokenThreshold}
                  onChange={e => setTokenThreshold(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white w-32"
                />
                <p className="text-sm text-gray-400">Send warning to users with this many tokens or fewer</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!canSend}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40"
          >
            {sendMutation.isPending ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending emails…</>
            ) : (
              <><Mail className="h-5 w-5 mr-2" />Send Email Campaign</>
            )}
          </Button>
        </div>

        {/* Right: Info panel */}
        <div className="space-y-4">

          {/* Last Result */}
          {lastResult && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" /> Last Campaign
              </p>
              <div className="space-y-2">
                {[
                  { label: "Total targeted", value: lastResult.total, color: "text-white" },
                  { label: "Successfully sent", value: lastResult.sent, color: "text-green-400" },
                  { label: "Skipped (criteria)", value: lastResult.skipped, color: "text-yellow-400" },
                  { label: "Failed", value: lastResult.failed, color: "text-red-400" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{row.label}</span>
                    <span className={`font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email types guide */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Email Templates</p>
            <div className="space-y-3">
              {[
                { icon: "✍️", name: "Custom", detail: "Freeform subject & body with your own message" },
                { icon: "🎮", name: "New Game", detail: "Branded announcement with prize & CTA" },
                { icon: "⚠️", name: "Low Tokens", detail: "Sent only to users at or below your threshold" },
                { icon: "🔥", name: "Closing Soon", detail: "Shows current % full and urgent CTA" },
              ].map(t => (
                <div key={t.name} className="flex gap-2.5">
                  <span className="text-base mt-0.5">{t.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{t.name}</p>
                    <p className="text-xs text-gray-500 leading-snug">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Tips
            </p>
            <ul className="text-xs text-gray-400 space-y-1.5 leading-relaxed">
              <li>• Use <strong className="text-gray-300">Specific Email</strong> to test before blasting all users</li>
              <li>• Low Token Warning skips users above the threshold automatically</li>
              <li>• All emails use the branded Prize Plugz template</li>
              <li>• Users are addressed by their first name in every email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
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

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "rgba(16,185,129,0.15)", text: "#10b981", label: "✓ Completed" },
    pending:   { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", label: "⏳ Pending" },
    failed:    { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", label: "✗ Failed" },
    refunded:  { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", label: "↩ Refunded" },
  };
  const c = cfg[status] ?? { bg: "rgba(255,255,255,0.08)", text: "#9ca3af", label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

function CardPaymentsTab() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]     = useState("all"); // all | real | manual
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 25;

  const { data, isLoading } = useQuery<{
    payments: any[];
    totalRevenue: number;
    totalTokensSold: number;
    monthRevenue: number;
    count: number;
  }>({
    queryKey: ["/api/admin/card-payments"],
    refetchInterval: 30000,
  });

  const payments = data?.payments ?? [];

  // Derived counts for stat bar
  const realCount     = payments.filter(p => p.transactionId !== "—").length;
  const completedCount = payments.filter(p => p.status === "completed").length;
  const failedCount   = payments.filter(p => p.status === "failed").length;
  const pendingCount2  = payments.filter(p => p.status === "pending").length;

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.userName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.transactionId !== "—" && p.transactionId.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType   = typeFilter === "all"
      || (typeFilter === "real"   && p.transactionId !== "—")
      || (typeFilter === "manual" && p.transactionId === "—");
    return matchSearch && matchStatus && matchType;
  });

  // Reset to page 1 on filter change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function exportCSV() {
    const header = ["#","Date","Time","Name","Email","Package","Tokens","Amount ($)","Payment Type","Txn ID","Status"];
    const rows = filtered.map((p, i) => [
      i + 1,
      new Date(p.createdAt).toLocaleDateString(),
      new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      p.userName,
      p.email,
      p.description?.split("—")[0]?.trim() ?? "",
      p.tokens,
      p.dollarAmount.toFixed(2),
      p.transactionId !== "—" ? "Real Card Payment" : "Manual / Other",
      p.transactionId,
      p.status,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `card-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    { label: "Total Revenue",       value: `$${(data?.totalRevenue ?? 0).toFixed(2)}`,    icon: DollarSign,  color: "#10b981" },
    { label: "This Month",          value: `$${(data?.monthRevenue ?? 0).toFixed(2)}`,    icon: TrendingUp,  color: "#7c3aed" },
    { label: "Real Card Payments",  value: realCount,                                      icon: CreditCard,  color: "#2563eb" },
    { label: "Completed",           value: completedCount,                                 icon: CheckCircle, color: "#10b981" },
    { label: "Failed",              value: failedCount,                                    icon: XCircle,     color: "#ef4444" },
    { label: "Pending",             value: pendingCount2,                                  icon: Clock,       color: "#fbbf24" },
    { label: "Total Transactions",  value: data?.count ?? 0,                               icon: Receipt,     color: "#6b7280" },
    { label: "Tokens Sold",         value: (data?.totalTokensSold ?? 0).toLocaleString(), icon: Coins,       color: "#f59e0b" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Card Payment History
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            All token purchases — real card charges include an Authorize.net Transaction ID
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          <ArrowDownCircle className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className="h-3 w-3 flex-shrink-0" style={{ color }} />
              <span className="text-gray-500 text-[10px] leading-tight">{label}</span>
            </div>
            <p className="text-white text-base font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, Txn ID…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          {[
            { v: "all",    l: "All Types" },
            { v: "real",   l: "💳 Real Card" },
            { v: "manual", l: "📋 Manual" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => { setTypeFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === v ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          {["all","completed","pending","failed","refunded"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No payments match your filters</p>
        </div>
      ) : (
        <>
          {/* Results count + page info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""} · page {safePage} of {totalPages}</span>
            <span>Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          </div>

          {/* ── Desktop table ─────────────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl overflow-x-auto"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["#","Date & Time","Customer","Package","Tokens","Amount","Payment Type","Txn ID","Status"].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-gray-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => {
                  const isReal = p.transactionId !== "—";
                  const rowN   = (safePage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={p.id}
                      style={{
                        background: isReal
                          ? (i % 2 === 0 ? "rgba(37,99,235,0.04)" : "rgba(37,99,235,0.02)")
                          : (i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"),
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                      }}>
                      {/* # */}
                      <td className="px-3 py-3 text-gray-600 text-xs">{rowN}</td>
                      {/* Date */}
                      <td className="px-3 py-3 text-gray-300 text-xs whitespace-nowrap">
                        <p>{new Date(p.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</p>
                        <p className="text-gray-500">{new Date(p.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</p>
                      </td>
                      {/* Customer */}
                      <td className="px-3 py-3">
                        <p className="text-white font-semibold text-xs">{p.userName}</p>
                        <p className="text-gray-500 text-[11px]">{p.email}</p>
                      </td>
                      {/* Package */}
                      <td className="px-3 py-3 text-gray-300 text-xs max-w-[160px]">
                        <span className="line-clamp-2">{p.description?.split("—")[0]?.trim() ?? "—"}</span>
                      </td>
                      {/* Tokens */}
                      <td className="px-3 py-3">
                        <span className="text-yellow-400 font-bold text-xs">
                          {p.tokens > 0 ? `+${p.tokens}` : p.tokens}
                        </span>
                      </td>
                      {/* Amount */}
                      <td className="px-3 py-3">
                        <span className={`font-bold text-sm ${p.dollarAmount > 0 ? "text-green-400" : "text-gray-500"}`}>
                          {p.dollarAmount > 0 ? `$${p.dollarAmount.toFixed(2)}` : "—"}
                        </span>
                      </td>
                      {/* Payment Type */}
                      <td className="px-3 py-3">
                        {isReal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: "rgba(37,99,235,0.2)", color: "#60a5fa" }}>
                            💳 Real Card
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: "rgba(255,255,255,0.07)", color: "#9ca3af" }}>
                            📋 Manual
                          </span>
                        )}
                      </td>
                      {/* Txn ID */}
                      <td className="px-3 py-3">
                        {isReal ? (
                          <span className="font-mono text-[11px] text-blue-300 select-all">{p.transactionId}</span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ──────────────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {paginated.map((p, i) => {
              const isReal = p.transactionId !== "—";
              const rowN   = (safePage - 1) * PAGE_SIZE + i + 1;
              return (
                <div key={p.id} className="rounded-2xl p-4 space-y-3"
                  style={{
                    background: isReal ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isReal ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.08)"}`,
                  }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-[10px]">#{rowN}</span>
                        {isReal ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(37,99,235,0.2)", color: "#60a5fa" }}>💳 Real Card</span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.07)", color: "#9ca3af" }}>📋 Manual</span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm mt-1">{p.userName}</p>
                      <p className="text-gray-500 text-xs">{p.email}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg p-2" style={{ background: "rgba(16,185,129,0.08)" }}>
                      <p className={`font-black text-base ${p.dollarAmount > 0 ? "text-green-400" : "text-gray-500"}`}>
                        {p.dollarAmount > 0 ? `$${p.dollarAmount.toFixed(2)}` : "—"}
                      </p>
                      <p className="text-gray-500 text-[10px]">Charged</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: "rgba(245,158,11,0.08)" }}>
                      <p className="text-yellow-400 font-black text-base">+{p.tokens}</p>
                      <p className="text-gray-500 text-[10px]">Tokens</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-gray-300 font-semibold text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-[10px]">{new Date(p.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</p>
                    </div>
                  </div>

                  {/* Package */}
                  <p className="text-gray-400 text-xs">{p.description?.split("—")[0]?.trim() ?? "—"}</p>

                  {/* Txn ID — always shown for real payments */}
                  {isReal && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                      <p className="text-gray-500 text-[10px] mb-0.5">Authorize.net Transaction ID</p>
                      <p className="text-blue-300 font-mono text-xs select-all break-all">{p.transactionId}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(1)} disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all text-gray-400 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                «
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all text-gray-400 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                ‹ Prev
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, idx) =>
                  n === "…" ? (
                    <span key={`e${idx}`} className="text-gray-600 text-xs px-1">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${safePage === n ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                      style={safePage !== n ? { background: "rgba(255,255,255,0.06)" } : {}}>
                      {n}
                    </button>
                  )
                )}

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all text-gray-400 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                Next ›
              </button>
              <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all text-gray-400 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                »
              </button>
            </div>
          )}

          <p className="text-gray-600 text-xs text-center pb-2">
            {filtered.length} total · {PAGE_SIZE} per page
          </p>
        </>
      )}
    </div>
  );
}
