"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/app/dashboard/billing/actions";

/**
 * Self-service erasure, which the privacy policy promises. It offered it "by
 * contacting us" at an address that bounced, so in practice it was promised and
 * not deliverable.
 */
export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <div className="mt-10 rounded-sm border border-red-200 bg-red-50/40 p-5">
        <h2 className="font-semibold text-ink-900">Delete your account</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          Removes your account, every property and guidebook, and all guest messages,
          orders and reviews collected through them. Any subscription is cancelled
          first. This cannot be undone.
        </p>
        <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Your guides go offline immediately and the data cannot be recovered.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 rounded-sm border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-700" />
            <p className="text-sm text-red-900">
              Guests who open a link to one of your guidebooks will see nothing.
            </p>
          </div>

          <div>
            {/* Typing the address, not a checkbox: this has no undo. */}
            <Label htmlFor="confirm-email">
              Type <span className="font-semibold text-ink-900">{email}</span> to confirm
            </Label>
            <Input
              id="confirm-email"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              disabled={pending || confirm.trim().toLowerCase() !== email.toLowerCase()}
              onClick={() =>
                start(async () => {
                  const res = await deleteAccount(confirm);
                  if (res.ok) {
                    await signOut({ callbackUrl: "/" });
                  } else {
                    toast.error(res.error ?? "Something went wrong");
                  }
                })
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Delete permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
