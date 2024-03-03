import './App.css';
import { useEffect, useState, useRef } from "react";

const totalRecords = 5000;
const mockData = () => Array.from(Array(totalRecords).keys()).map(x => ({
  a: x, b: "Jonny", c: "Wright", d: "Forcura", e: "Jacksonville, Fl"
}));

const rowHeight = 20;

// size of the visible portion of the table
const pageSize = 1000;

// records per page
const recordsPerPage = pageSize / rowHeight;

// number of row to increment on next page
const incrementSize = 1;

const initialEndBufferSize = (totalRecords * rowHeight) - pageSize;

function App() {
  const [data, setData] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const allData = useRef(mockData().map(x => x));
  const tableContainer = useRef(null);
  const startBuffer = useRef(null);
  const endBuffer = useRef(null);
  const [windowLeft, setWindowLeft] = useState(0);

  // Where the dom manipulation happens.
  useEffect(() => {
    const fBufferHeight = windowLeft * rowHeight;

    startBuffer.current.style.height = `${fBufferHeight}px`;

    const eBufferHeight = initialEndBufferSize - fBufferHeight;

    endBuffer.current.style.height = `${eBufferHeight}px`

    document.getElementById("tid").scrollIntoView();
  }, [windowLeft])

  // Used for debugging;
  const onClickLeft = () => {
    if (windowLeft === 0) {
      return;
    }

    const updateWindowLeft = windowLeft - incrementSize;

    setWindowLeft(updateWindowLeft);
    const right = updateWindowLeft + recordsPerPage;
    setData(allData.current.slice(updateWindowLeft, right));
  }

  // Used for debugging;
  const onClickRight = () => {
    if (windowLeft + recordsPerPage === totalRecords) {
      return;
    }

    const updateWindowLeft = windowLeft + incrementSize;
    const right = updateWindowLeft + recordsPerPage; 

    setWindowLeft(updateWindowLeft);
    setData(allData.current.slice(updateWindowLeft, right));
  } 

  // Load the scroll handler and set the initial data.
  useEffect(() => {
    const handler = () => {
      const scrollTop = tableContainer.current.scrollTop;
      const left = Math.round(scrollTop/rowHeight);
      
      // set the correct data
      setWindowLeft(left);
      setData(allData.current.slice(left, left + recordsPerPage));
    }

    tableContainer.current.addEventListener("scrollend", handler);

    // Set the initial data.
    setData(allData.current.slice(0, recordsPerPage));
  }, []);
  
  /**
   * 
   * Box checking should feel instant. This is a good test to
   * ensure the rendered row count isn't to high.
   */
  const onChecked = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(prev => prev.filter(x => x !== id));
    } else {
      setCheckedIds(prev => [...prev, id]);
    }
  }

  return (
    <div className="App">
      <button onClick={onClickLeft}>Up</button>
      <button onClick={onClickRight}>Down</button>
      <div ref={tableContainer} className='App-Inner'>
      <div ref={startBuffer}/>
      <table id="tid">
        <tbody>
        {
          data.map(({a, b, c, d, e}) => 
            <tr key={a.toString()}>
              <td><input type="checkbox" checked={checkedIds.includes(a)} onChange={() => onChecked(a)}/></td>
              <td>{a}</td>
              <td>{b}</td>
              <td>{c}</td>
              <td>{d}</td>
              <td>{e}</td>
            </tr>
          )
        }
        </tbody>
      </table> 
      <div ref={endBuffer}/>
      </div>
    </div>
  );
}

export default App;
