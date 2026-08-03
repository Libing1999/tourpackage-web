"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/common/spinner";
import { Reveal } from "@/components/common/reveal";
import { getErrorMessage } from "@/utils/errors";
import { useBlock } from "@/features/cms/site-content-provider";
import { useNewsletterSubscribe } from "../hooks/use-home";
import { newsletterSchema, type NewsletterFormValues } from "../schemas";

export function NewsletterSection() {
  const subscribeMutation = useNewsletterSubscribe();
  const block = useBlock("home.newsletter");

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    subscribeMutation.mutate(values.email, {
      onSuccess: (response) => {
        toast.success(response.message ?? "Subscribed!");
        form.reset();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  return (
    <section id="newsletter" className="bg-primary py-16 text-primary-foreground lg:py-20">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
        <Mail className="size-8" />
        {block?.title ? (
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{block.title}</h2>
        ) : null}
        {block?.subtitle ? (
          <p className="text-primary-foreground/85">{block.subtitle}</p>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="mt-4 flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-left">
            <Input
              type="email"
              placeholder="you@example.com"
              aria-invalid={!!form.formState.errors.email}
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-primary-foreground/90">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={subscribeMutation.isPending}
            className="shrink-0"
          >
            {subscribeMutation.isPending ? <Spinner /> : <Send className="size-4" />}
            Subscribe
          </Button>
        </form>
      </Reveal>
    </section>
  );
}
