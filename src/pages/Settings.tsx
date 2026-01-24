import { useState, useEffect } from "react";
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
import { Building2, Users, Plus, Trash2, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

interface AppUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}

const DEFAULT_COMPANY: CompanySettings = {
  name: "My Business",
  address: "123 Business Street, City, Country",
  phone: "+1 234 567 890",
  email: "contact@mybusiness.com",
  logo: "",
};

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ email: string; password: string; name: string; role: "admin" | "user" }>({ email: "", password: "", name: "", role: "user" });
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Load settings from localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem("company_settings");
    if (storedCompany) {
      setCompanySettings(JSON.parse(storedCompany));
    }

    const storedUsers = localStorage.getItem("app_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default admin
      const defaultUsers = [
        { id: "1", email: "admin@demo.com", password: "admin123", name: "Admin User", role: "admin" as const },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("app_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleSaveCompany = () => {
    localStorage.setItem("company_settings", JSON.stringify(companySettings));
    toast({
      title: "Settings Saved",
      description: "Company information has been updated successfully",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySettings((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate email
    if (users.some((u) => u.email === newUser.email)) {
      toast({
        title: "User Exists",
        description: "A user with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const user: AppUser = {
      id: Date.now().toString(),
      ...newUser,
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem("app_users", JSON.stringify(updatedUsers));
    setNewUser({ email: "", password: "", name: "", role: "user" });
    setIsAddUserOpen(false);

    toast({
      title: "User Added",
      description: `${user.name} has been added successfully`,
    });
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("app_users", JSON.stringify(updatedUsers));

    toast({
      title: "User Deleted",
      description: "User has been removed successfully",
    });
  };

  const isAdmin = currentUser?.role === "admin";

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
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 overflow-hidden">
                        {companySettings.logo ? (
                          <img
                            src={companySettings.logo}
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
                      value={companySettings.name}
                      onChange={(e) =>
                        setCompanySettings((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input
                      id="company-address"
                      value={companySettings.address}
                      onChange={(e) =>
                        setCompanySettings((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder="Enter company address"
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Phone Number</Label>
                      <Input
                        id="company-phone"
                        value={companySettings.phone}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email Address</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companySettings.email}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveCompany} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
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
                            onValueChange={(value: "admin" | "user") =>
                              setNewUser((prev) => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
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
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
