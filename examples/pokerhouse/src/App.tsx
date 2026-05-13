import { useState } from "react";
import GameListScreen from "../app/c08-game-list";
import DepositLandingScreen from "../app/c16-deposit-landing";

type ScreenKey = "c08" | "c16";

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("c08");

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex gap-1 rounded-pill bg-bg-elevated border border-border-subtle p-1">
        <button
          type="button"
          onClick={() => setScreen("c08")}
          className={`h-8 px-4 rounded-pill text-caption font-bold ${
            screen === "c08"
              ? "bg-accent-primary text-text-inverse"
              : "text-text-secondary"
          }`}
        >
          c08
        </button>
        <button
          type="button"
          onClick={() => setScreen("c16")}
          className={`h-8 px-4 rounded-pill text-caption font-bold ${
            screen === "c16"
              ? "bg-accent-primary text-text-inverse"
              : "text-text-secondary"
          }`}
        >
          c16
        </button>
      </div>

      {screen === "c08" ? <GameListScreen /> : <DepositLandingScreen />}
    </div>
  );
}
