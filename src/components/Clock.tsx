import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const date = time.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50 shadow-lg">
      <div className="text-5xl md:text-6xl font-bold tabular-nums mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {hours}:{minutes}:{seconds}
      </div>
      <p className="text-sm text-muted-foreground capitalize">{date}</p>
    </Card>
  );
};
