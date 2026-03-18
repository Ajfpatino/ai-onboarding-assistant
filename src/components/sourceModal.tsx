import { Icon } from "@iconify/react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { STORAGE_KEY } from "../utils/config";

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export default function SourceModal({ open, setOpen }: Props) {
    const [text, setText] = useState("");
    const [sources, setSources] = useState<string[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    }, [sources]);

    const addSource = () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setSources((prev) => [...prev, trimmed]);
        setText("");
    };

    const deleteSource = (indexToDelete: number) => {
        setSources((prev) => prev.filter((_, index) => index !== indexToDelete));
    };
 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Link Sources</DialogTitle>
        <DialogDescription>
            Manage the sources you want to link to your AI agent.
        </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
            {sources.map((source, index) => (
            <div key={index} className="flex items-start gap-2">
<               div className="flex-1 break-all text-sm ">
                    {source}
                </div>
                <Button 
                variant="destructive" 
                size="icon" 
                className="h-10 w-10 shrink-0"
                onClick={() => deleteSource(index)}
                >
                    <Icon icon="material-symbols:delete-sharp" />           
                </Button>
            </div>
            ))}
        </div>
      
          <div className="flex justify-around items-center space-x-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter source link"
            />
            <Button className="h-10 w-10" onClick={addSource}>  Add     
            </Button>
        </div>
    </DialogContent>
    </Dialog>
  );
}