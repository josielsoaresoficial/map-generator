import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
  open: boolean;
  onSave: (name: string) => void;
}

export const WelcomeDialog = ({ open, onSave }: WelcomeDialogProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bem-vindo ao seu Assistente de Rotina!</DialogTitle>
          <DialogDescription>
            Para começar, me diga seu nome para que eu possa te saudar adequadamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Digite seu nome aqui"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="text-lg"
          />
          <Button type="submit" className="w-full" size="lg" disabled={!name.trim()}>
            Continuar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
