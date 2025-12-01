"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ClassFormDialog({ open, onOpenChange, onSuccess }: ClassFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    batchId: "",
    topic: "",
    startTime: "",
    endTime: "",
    instructorName: "",
    notes: "",
    createCalendarEvent: false,
  });

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      const response = await fetch("/api/admin/batches");
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Class Session
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchId: formData.batchId,
          topic: formData.topic,
          startTime: formData.startTime,
          endTime: formData.endTime,
          instructorName: formData.instructorName,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule class");
      }

      // 2. Create Calendar Event (if selected)
      if (formData.createCalendarEvent) {
        try {
          // Fetch batch details to get attendees (optional, or just send batchId)
          // For now, we'll just send the basic info
          await fetch("/api/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `Class: ${formData.topic}`,
              description: formData.notes || "EngConnect Class Session",
              startTime: formData.startTime,
              endTime: formData.endTime,
              // attendees: [] // fetch students if needed
            }),
          });
        } catch (calError) {
          console.error("Failed to create calendar event:", calError);
          // Don't block success if calendar fails
        }
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        batchId: "",
        topic: "",
        startTime: "",
        endTime: "",
        instructorName: "",
        notes: "",
        createCalendarEvent: false,
      });
    } catch (error) {
      console.error("Error scheduling class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batchId: string) => {
    const selectedBatch = batches.find(b => b.id === batchId);
    if (selectedBatch) {
      setFormData(prev => ({
        ...prev,
        batchId,
        instructorName: selectedBatch.instructorName // Auto-fill instructor
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Class</DialogTitle>
          <DialogDescription>
            Schedule a new class session for a batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select
                value={formData.batchId}
                onValueChange={handleBatchSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Present Perfect Tense"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Class notes or materials..."
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="createCalendarEvent"
                checked={formData.createCalendarEvent}
                onChange={(e) => setFormData({ ...formData, createCalendarEvent: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="createCalendarEvent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Create Google Calendar Event
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
