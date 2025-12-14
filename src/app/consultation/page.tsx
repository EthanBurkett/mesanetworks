"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  consultationSchema,
  type ConsultationFormData,
} from "@/schemas/consultation.schema";
import {
  Building2,
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSubmitConsultation } from "@/hooks/use-consultation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const serviceOptions = [
  { id: "network-cabling", label: "Network Cabling (Cat6/Cat6a)" },
  { id: "fiber-optic", label: "Fiber Optic Installation" },
  { id: "security-cameras", label: "Security Camera Systems" },
  { id: "wifi-setup", label: "WiFi Setup & Configuration" },
  { id: "rack-organization", label: "Server Rack Organization" },
  { id: "troubleshooting", label: "Network Troubleshooting" },
  { id: "other", label: "Other (specify in notes)" },
];

export default function ScheduleConsultationPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const submitConsultation = useSubmitConsultation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      serviceType: [],
      preferredContactMethod: "either",
      preferredContactTime: "anytime",
    },
  });

  const selectedServices = watch("serviceType") || [];
  const propertyType = watch("propertyType");

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      await submitConsultation.mutateAsync(data);
      setIsSuccess(true);
      toast.success("Consultation request submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit request. Please try again or contact us directly."
      );
    }
  };

  if (isSuccess) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="bg-card border rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your consultation request. We'll review your
                information and get back to you within 24 hours.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                A confirmation email has been sent to your email address.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">Free Consultation</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Schedule Your Consultation
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tell us about your project and we'll provide a detailed plan and
                quote. No contracts, no upsells—just honest advice.
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Customer Information */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Your Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Property Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label>Property Type *</Label>
                      <div className="grid sm:grid-cols-2 gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setValue("propertyType", "residential")
                          }
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                            propertyType === "residential"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Home className="w-5 h-5" />
                          <span className="font-medium">Residential</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue("propertyType", "commercial")}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                            propertyType === "commercial"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">Commercial</span>
                        </button>
                      </div>
                      {errors.propertyType && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.propertyType.message}
                        </p>
                      )}
                    </div>

                    {propertyType === "commercial" && (
                      <div>
                        <Label htmlFor="propertyName">Business Name</Label>
                        <Input
                          id="propertyName"
                          {...register("propertyName")}
                          placeholder="Acme Corporation"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        placeholder="123 Main St"
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          placeholder="Mesa"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...register("state")}
                          placeholder="AZ"
                          maxLength={2}
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          placeholder="85201"
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Requirements */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Project Requirements
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Services Needed *</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {serviceOptions.map((service) => (
                          <label
                            key={service.id}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                const newServices = checked
                                  ? [...selectedServices, service.id]
                                  : selectedServices.filter(
                                      (s) => s !== service.id
                                    );
                                setValue("serviceType", newServices);
                              }}
                            />
                            <span className="text-sm">{service.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.serviceType && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.serviceType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="projectScope">
                        Project Details *
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          (Describe your needs, square footage, number of drops,
                          etc.)
                        </span>
                      </Label>
                      <Textarea
                        id="projectScope"
                        {...register("projectScope")}
                        placeholder="We need to wire a 2,000 sq ft office with 20 network drops, install 8 security cameras around the perimeter, and set up a managed network rack..."
                        rows={5}
                        className="mt-2"
                      />
                      {errors.projectScope && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.projectScope.message}
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeline">Timeline *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("timeline", value as any)
                          }
                        >
                          <SelectTrigger id="timeline">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asap">
                              As soon as possible
                            </SelectItem>
                            <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                            <SelectItem value="1month">
                              Within 1 month
                            </SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.timeline && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.timeline.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="budget">Budget Range *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("budget", value as any)
                          }
                        >
                          <SelectTrigger id="budget">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-5k">
                              Under $5,000
                            </SelectItem>
                            <SelectItem value="5k-10k">
                              $5,000 - $10,000
                            </SelectItem>
                            <SelectItem value="10k-25k">
                              $10,000 - $25,000
                            </SelectItem>
                            <SelectItem value="25k-plus">$25,000+</SelectItem>
                            <SelectItem value="not-sure">
                              Not sure yet
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.budget && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.budget.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">
                        Additional Notes
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          (Optional)
                        </span>
                      </Label>
                      <Textarea
                        id="additionalNotes"
                        {...register("additionalNotes")}
                        placeholder="Any other details we should know..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Preferences */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Preferences
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredContactMethod">
                        Preferred Contact Method
                      </Label>
                      <Select
                        defaultValue="either"
                        onValueChange={(value) =>
                          setValue("preferredContactMethod", value as any)
                        }
                      >
                        <SelectTrigger id="preferredContactMethod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="either">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="preferredContactTime">
                        Best Time to Contact
                      </Label>
                      <Select
                        defaultValue="anytime"
                        onValueChange={(value) =>
                          setValue("preferredContactTime", value as any)
                        }
                      >
                        <SelectTrigger id="preferredContactTime">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (8am-12pm)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (12pm-5pm)
                          </SelectItem>
                          <SelectItem value="evening">
                            Evening (5pm-8pm)
                          </SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitConsultation.isPending}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {submitConsultation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Consultation
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to be contacted about your
                  consultation request.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
