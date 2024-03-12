import { useState } from "react";
import './App.css';
import LazyTable from './LazyTable';

const totalRecords = 5000;
const fetchSize = 50;
const tableHeight = 1000;
const rowHeight = 20;

const initialCacheArray = Array.from(new Array((totalRecords/fetchSize))).map((x, idx) => ({
  blockId: idx,
  blockState: ""
}));

const App = () => {  
  const [blockStates, setBlockStates] = useState(initialCacheArray);

  const mockData = Array.from(Array(totalRecords).keys()).map(x => ({
    a: x, b: "Jonny", c: "Wright", d: "Forcura", e: "Jacksonville, Fl"
  }));

  const setBlockStatesHandler = (blockIdx, blockState) => {
    setBlockStates(prev => prev.map(x => (
      {...x, blockState: x.blockId === blockIdx ? blockState : x.blockState}
    )));
  }
  
  const getDataAsync = async (idx, size, blockIdx) => {
    
    try {
      // Paint blocks yellow.
      setBlockStatesHandler(blockIdx, "fetching");

      // Simulate a 300ms response time.
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Paint blocks green.
      setBlockStatesHandler(blockIdx, "loaded");
    } catch(ex) {
      // TODO: Add cancellation token to allow fetch cancelling.
      // Paint blocks red.
      setBlockStatesHandler(blockIdx, "cancelled");
    }

    return mockData.slice(idx, size);
  }

  return (
  <>
     <div className="App">
     <LazyTable
      getDataAsync={getDataAsync} 
      fetchSize={fetchSize}
      tableHeight={tableHeight}
      rowHeight={rowHeight}
      totalRecords={totalRecords}
      
     /> 
    </div>
    <div className="action-table">
      {
        blockStates.map((x) => <div key={`block-key-${x.blockId}`} className={x.blockState}>{x.blockId}</div>)
      }
    </div>
  </> 
  );
}

export default App;
