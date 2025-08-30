import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Shield, Eye, UserCheck } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - SwiftMart',
  description: 'SwiftMart Privacy Policy - We value your privacy and do not collect personal information. Learn about our data practices and affiliate partnerships.',
  keywords: 'privacy policy, data protection, affiliate links, privacy, data collection',
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Your privacy matters to us. Learn how we protect your information.
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Our Privacy Commitment</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We value your privacy. We do not collect any personal information from visitors on this website.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      This website contains affiliate links, which means we may earn a small commission if you click on them and make a purchase — at no extra cost to you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Data Collection</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We do not track, store, or sell your data. The only data collected may be through third-party affiliate partners (such as Cuelinks, EarnKaro, or other networks) as per their respective privacy policies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Questions?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions regarding this Privacy Policy, you can contact us via the{" "}
                  <Link 
                    href="/contact" 
                    className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                  >
                    Contact Us
                  </Link>{" "}
                  page.
                </p>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
              <p>This Privacy Policy was last updated on {new Date().toLocaleDateString()}.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}