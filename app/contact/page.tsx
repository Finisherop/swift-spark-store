import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Mail, MessageCircle, Instagram } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - SwiftMart',
  description: 'Get in touch with SwiftMart through social media, email, or direct messaging. We are here to help with any questions or feedback.',
  keywords: 'contact, support, customer service, social media, email',
};

export default function Contact() {
  const contactLinks = [
    {
      name: "Pinterest",
      href: "https://pin.it/3jHxrZPrn",
      icon: ExternalLink,
      description: "Follow us on Pinterest"
    },
    {
      name: "Telegram",
      href: "https://t.me/imFINISHER",
      icon: MessageCircle,
      description: "@imFINISHER"
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/smile_issunaah",
      icon: Instagram,
      description: "@smile_issunaah"
    },
    {
      name: "Email",
      href: "mailto:akk116636@gmail.com",
      icon: Mail,
      description: "akk116636@gmail.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              If you have any questions, suggestions, or feedback, feel free to reach out through the following:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactLinks.map((contact) => {
              const Icon = contact.icon;
              return (
                <Card key={contact.name} className="group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <a
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors"
                    >
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        <p className="text-muted-foreground">{contact.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  We&apos;d Love to Hear From You!
                </h2>
                <p className="text-muted-foreground">
                  Whether you have product suggestions, partnership inquiries, or just want to say hello, 
                  don&apos;t hesitate to reach out. We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}