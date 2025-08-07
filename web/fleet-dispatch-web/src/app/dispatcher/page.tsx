import DispatchBoard from "../components/DispatchBoard";
import AIBoard from "../components/AIBoard";
import UnassignedBoardMini from "../components/UnassignedBoardMini";
import { Metadata } from 'next'
import UnassignedDrivers from "../components/UnassignedDrivers";
import UnassignedTrucksBoard from "../components/UnassignedTrucksBoard";

export const metadata: Metadata = {
  title: 'Dispatcher Dashboard',
}

export default function Dispatcher() {
  
    return (
    <main>
      <DispatchBoard />
      <AIBoard
    />
    <UnassignedBoardMini/>
      <div className="flex flex-row">
        <UnassignedDrivers/>
        <UnassignedTrucksBoard/>
      </div>
    </main>
);
}