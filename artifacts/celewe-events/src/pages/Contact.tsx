import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function Contact() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock submission
    toast({
      title: "Message Sent",
      description: "We've received your inquiry and will get back to you shortly.",
      className: "bg-primary text-white border-none rounded-none",
    });
    form.reset();
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/mixology.png')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <SectionTitle 
            eyebrow="Get in Touch" 
            title="Private Inquiries"
            subtitle="For VIP table reservations, private event curation, or general questions."
            className="mb-0"
          />
        </div>
      </section>

      {/* Form & Info */}
      <section className="pt-12">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Contact Info */}
            <div>
              <div className="bg-card border border-border/50 p-8 md:p-12 mb-8">
                <h3 className="font-heading text-2xl mb-8">Direct Contact</h3>
                
                <div className="space-y-6 text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-1">Email</p>
                      <p className="text-white font-medium">vip@celeweevent.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-white font-medium">+63 917 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-1">Base</p>
                      <p className="text-white font-medium">Manila, Philippines</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 border border-dashed border-border/50">
                <h4 className="font-heading text-xl mb-4">Table Service</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  VIP table bookings require advance notice and a minimum spend commitment depending on the event. Please reach out directly or use the inquiry form to discuss arrangements with our hospitality team.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-card border border-border/50 p-8 md:p-12">
              <h3 className="font-heading text-2xl mb-8">Send an Inquiry</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs text-muted-foreground">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-background border-border/50 rounded-none focus-visible:ring-primary focus-visible:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs text-muted-foreground">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-background border-border/50 rounded-none focus-visible:ring-primary focus-visible:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs text-muted-foreground">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+63 900 000 0000" {...field} className="bg-background border-border/50 rounded-none focus-visible:ring-primary focus-visible:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs text-muted-foreground">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us what you're looking for..." 
                            className="min-h-[150px] bg-background border-border/50 rounded-none focus-visible:ring-primary focus-visible:border-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-wider mt-4">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </form>
              </Form>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
