import React from "react";
import { SEO } from "@/components/SEO";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { IMG_CONTACT_HEADER } from "@/assets/images";
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
  const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!web3FormsAccessKey) {
      toast({
        title: "Configuration Required",
        description: "Web3Forms key is missing. Set VITE_WEB3FORMS_ACCESS_KEY to enable contact form delivery.",
        className: "bg-primary text-white border-none rounded-none",
      });
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: web3FormsAccessKey,
          from_name: "Cèlewé Events Contact Form",
          subject: "New contact inquiry from celeweevent.com",
          website: "https://celeweevent.com",
          name: values.name,
          email: values.email,
          phone: values.phone || "Not provided",
          message: values.message,
          replyto: values.email,
          botcheck: "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message");
      }

      toast({
        title: "Message Sent",
        description: "Your message was sent successfully to contact@celeweevent.com.",
        className: "bg-primary text-white border-none rounded-none",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Unable to send your message right now. Please email us directly at contact@celeweevent.com.",
        className: "bg-primary text-white border-none rounded-none",
      });
      console.error("Contact form submission failed", error);
    }
  }

  return (
    <div className="flex flex-col pb-24">
      <SEO
        title="Contact"
        description="For VIP table reservations, private event curation, or general inquiries — reach out to Cèlewé Events. Manila's premier nightlife agency."
        canonicalPath="/contact"
      />
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background relative overflow-hidden">
        <img
          src={IMG_CONTACT_HEADER}
          alt="Cèlewé event ambience"
          className="absolute top-0 left-0 w-full h-full max-w-full object-cover opacity-10 mix-blend-screen pointer-events-none"
          loading="lazy"
          decoding="async"
        />
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
                      <p className="text-white font-medium">contact@celeweevent.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-white font-medium">+63 977 322 57 39</p>
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
                  
                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-wider mt-4 disabled:opacity-60">
                    <Send className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
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
