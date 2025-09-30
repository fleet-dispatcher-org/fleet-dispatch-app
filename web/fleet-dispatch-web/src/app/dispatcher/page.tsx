import DispatchBoard from "../components/DispatchBoard";
import AIBoard from "../components/AIBoard";
import UnassignedBoardMini from "../components/UnassignedBoardMini";
import { Metadata } from 'next'
import UnassignedDrivers from "../components/UnassignedDrivers";
import UnassignedTrucksBoard from "../components/UnassignedTrucksBoard";
import UnassignedTrailersBoard from "../components/UnassignedTrailersBoard";
import CreateLoadCard from "../components/CreateLoadCard";
// import AlgorithmBoard from "../components/AlgorithmBoard";

export const metadata: Metadata = {
  title: 'Dispatcher Dashboard',
}

export default function Dispatcher() {
  
    return (
    <main>
      <DispatchBoard />
      {/* <AIBoard/> */}
      <AIBoard/>
    <UnassignedBoardMini/>
    <CreateLoadCard/>
      <div className="flex flex-row">
        <div>
          <UnassignedDrivers/>
          <UnassignedTrailersBoard/>
        </div>
        <UnassignedTrucksBoard/>
      </div>

      <footer className=" text-gray-600 py-4 flex items-center justify-center">
          <p className="text-sm text-gray-400 mt-4">
              &copy; 2025 Smart ETA Tech. All rights reserved.
          </p>
      </footer>
    </main>
);
}