import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { 
  User, 
  Mail, 
  Hash, 
  Package, 
  LogOut, 
  ExternalLink,
  Copy,
  QrCode
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  random_uid: string;
  created_at: string;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const USDT_ADDRESS = "TFKGm4YPEJHw733GRGz3mTAVjhDPQjmcpt";
  
  const socialLinks = [
    {
      name: "Pinterest",
      url: "https://pin.it/3jHxrZPrn",
      icon: "🔗"
    },
    {
      name: "Telegram", 
      url: "https://t.me/imFINISHER",
      icon: "💬"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/smile_issunaah?igsh=MWR5aWxoejh1NzAxNA==",
      icon: "📷"
    }
  ];

  useEffect(() => {
    if (user && open) {
      fetchProfile();
      fetchProductCount();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching product count:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10 animate-bounce-in">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-primary text-white font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl">My Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <Card className="border-l-4 border-l-primary shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile?.email}</span>
              </div>
              
              {profile?.full_name && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.full_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  ID: {profile?.random_uid}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(profile?.random_uid || '', 'User ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Products: </span>
                <Badge variant="secondary" className="font-bold">
                  {totalProducts}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Admin */}
          <Card className="border-l-4 border-l-accent shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contact Admin</CardTitle>
              <CardDescription>
                Connect with us on social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {socialLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="outline"
                    className="justify-start h-12 hover-scale transition-bounce"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <span className="text-lg mr-3">{link.icon}</span>
                    <span className="font-medium">{link.name}</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* USDT Donation */}
          <Card className="border-l-4 border-l-yellow-500 shadow-medium bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-yellow-600" />
                Support Us (USDT Donation)
              </CardTitle>
              <CardDescription>
                Help us improve SwiftMart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">USDT Address:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all font-mono">
                    {USDT_ADDRESS}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(USDT_ADDRESS, 'USDT Address')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Scan QR code or copy address above
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Sign Out */}
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full transition-bounce"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}