import DispatchBoard from "../components/DispatchBoard";
import AIBoard from "../components/AIBoard";
import UnassignedBoardMini from "../components/UnassignedBoardMini";
import { Metadata } from 'next'
import UnassignedDrivers from "../components/UnassignedDrivers";
import { dispatch_agent } from "../agent/agent";
import { run } from "@openai/agents"

export const metadata: Metadata = {
  title: 'Dispatcher Dashboard',
}

export default function Dispatcher() {
  
    return (
    <main>
      <DispatchBoard />
      <AIBoard
    />
      <div className="flex flex-row">
        <UnassignedBoardMini
        />
        <UnassignedDrivers/>
      </div>
    </main>
);
}