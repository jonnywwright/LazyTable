import './App.css';
import VirtualTable from './VirtualTable';

const App = () => {
  const totalRecords = 5000;

  const mockData = Array.from(Array(totalRecords).keys()).map(x => ({
    a: x, b: "Jonny", c: "Wright", d: "Forcura", e: "Jacksonville, Fl"
  }));
  
  /**
   * 
   */
  const getDataAsync = async (idx, size) => {
    // Simulate a 300ms response time.
    await new Promise(resolve => setTimeout(resolve, 300));
  
    return mockData.slice(idx, size);
  }

  return (
    <div className="App">
     <VirtualTable 
      getDataAsync={getDataAsync} 
      fetchSize={50}
      tableHeight={1000}
      rowHeight={20}
      totalRecords={5000}
      mockData={mockData}
     /> 
    </div>
  );
}

export default App;
