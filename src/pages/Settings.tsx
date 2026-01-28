import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Users, Plus, Trash2, Upload, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, createUser, deleteUser, getSettings, updateSettings, type CompanySettings as ApiCompanySettings } from "@/lib/api";

interface AppUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ email: string; password: string; name: string; role: string }>({ email: "", password: "", name: "", role: "User" });
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch company settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        setCompanyName(settings.companyName || "");
        setCompanyAddress(settings.companyAddress || "");
        setCompanyPhone(settings.companyPhone || "");
        setTaxRate(settings.taxRate || 0);
        setCurrencySymbol(settings.currencySymbol || "Rs.");
        if (settings.logo?.url) {
          setLogoUrl(settings.logo.url);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [toast]);

  // Fetch users from API (with graceful error handling for missing endpoint)
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        // Silently fail if the endpoint doesn't exist (404)
        // This prevents the error popup for missing API
        console.warn("User management API not available:", error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (currentUser?.role === "admin" || currentUser?.role === "Super Admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const handleSaveCompany = async () => {
    setIsSavingSettings(true);
    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("companyAddress", companyAddress);
      formData.append("companyPhone", companyPhone);
      formData.append("taxRate", taxRate.toString());
      formData.append("currencySymbol", currencySymbol);
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const updatedSettings = await updateSettings(formData);
      
      // Update local state with response
      if (updatedSettings.logo?.url) {
        setLogoUrl(updatedSettings.logo.url);
        setLogoPreview("");
        setLogoFile(null);
      }

      toast({
        title: "Settings Saved",
        description: "Company information has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsAddingUser(true);
    try {
      const createdUser = await createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });

      setUsers((prev) => [...prev, createdUser]);
      setNewUser({ email: "", password: "", name: "", role: "User" });
      setIsAddUserOpen(false);

      toast({
        title: "User Added",
        description: `${createdUser.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find((u) => u._id === id);
    
    if (userToDelete?.role === "Super Admin") {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete Super Admin",
        variant: "destructive",
      });
      return;
    }

    if (id === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    setDeletingUserId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));

      toast({
        title: "User Deleted",
        description: "User has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "Super Admin";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} title="Settings" />

        <div className="p-4 md:p-8 max-w-4xl w-full mx-auto">
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2" disabled={!isAdmin}>
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            </TabsList>

            {/* Company Settings Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    This information will appear on your invoices and documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading settings...</span>
                    </div>
                  ) : (
                    <>
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 overflow-hidden">
                            {logoPreview || logoUrl ? (
                              <img
                                src={logoPreview || logoUrl}
                                alt="Company Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <Label htmlFor="logo-upload" className="cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                                <Upload className="h-4 w-4" />
                                Upload Logo
                              </div>
                            </Label>
                            <input
                              ref={fileInputRef}
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 2MB
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="company-address">Address</Label>
                        <Input
                          id="company-address"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Enter company address"
                        />
                      </div>

                      {/* Phone & Currency/Tax */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-phone">Phone Number</Label>
                          <Input
                            id="company-phone"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency-symbol">Currency Symbol</Label>
                          <Input
                            id="currency-symbol"
                            value={currencySymbol}
                            onChange={(e) => setCurrencySymbol(e.target.value)}
                            placeholder="e.g., Rs., $, €"
                          />
                        </div>
                      </div>

                      {/* Default Tax Rate */}
                      <div className="space-y-2">
                        <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          placeholder="Enter default tax rate"
                        />
                        <p className="text-xs text-muted-foreground">
                          This will be the default tax rate for new invoices
                        </p>
                      </div>

                      <Button 
                        onClick={handleSaveCompany} 
                        className="w-full md:w-auto"
                        disabled={isSavingSettings}
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage users who can access this application
                    </CardDescription>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account with specific permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-name">Full Name</Label>
                          <Input
                            id="new-name"
                            value={newUser.name}
                            onChange={(e) =>
                              setNewUser((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-email">Email</Label>
                          <Input
                            id="new-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) =>
                              setNewUser((prev) => ({ ...prev, email: e.target.value }))
                            }
                            placeholder="user@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) =>
                              setNewUser((prev) => ({ ...prev, password: e.target.value }))
                            }
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-role">Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value: string) =>
                              setNewUser((prev) => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="User">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)} disabled={isAddingUser}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser} disabled={isAddingUser}>
                          {isAddingUser ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add User"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading users...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === "Admin" || user.role === "Super Admin"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={user._id === currentUser?.id || user.role === "Super Admin" || deletingUserId === user._id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deletingUserId === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
