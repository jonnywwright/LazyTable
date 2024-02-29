import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useRef } from "react";

const totalRecords = 1000;
const totalHeight = (22 * totalRecords) + 1; // header is a row
const mockData = () => Array.from(Array(totalRecords).keys()).map(x => ({
  a: x, b: "alsdfjasldf", c: "asldfjsdfjk"
}));

const rowHeight = 22;

function App() {
  const [data, setData] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const allData = useRef(mockData().map(x => x));
  let windowStart = 0;
  let windowEnd = 100;
  let startBufferHeight = 0;
  let endBufferHeight = rowHeight * 1000;
  const startBuffer = useRef(null);
  const endBuffer = useRef(null);

  
  useEffect(() => {
    // load first 100

    startBuffer.current.style.height = `${startBufferHeight}` 
    endBuffer.current.style.height = `${endBufferHeight}px`

    setData(allData.current.slice(windowStart, windowEnd));

    // document.getElementById("super-special-id")?.addEventListener("scroll", (event) => {
    //   console.log(event);

    // });
    
    const superSpecialDiv = document.getElementById("super-special-id");
    
    const more = (event) => {
      console.log("scroll end", event);
      const scrollHeight = superSpecialDiv.scrollHeight;
      const scrollTop = superSpecialDiv.scrollTop;
      const clientHeight = superSpecialDiv.clientHeight;
      
      console.log(scrollHeight, scrollTop, clientHeight)
      setData(allData.current.slice(windowStart, windowEnd));

      windowStart += 75;
      windowEnd += 75;
    }
   
    superSpecialDiv?.addEventListener("scrollend", more);

    return () => {
      document.removeEventListener("scrollend", more); 
    }
  }, [])

  const onChecked = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(prev => prev.filter(x => x !== id));
    } else {
      setCheckedIds(prev => [...prev, id]);
    }
  }

  return (
    <div className="App">
      <div className='App-Inner' id="super-special-id">
      <div ref={startBuffer}/>
      <table>
        <thead>
        <tr>
          <th>Selected</th>
          <th>Company</th>
          <th>Contact</th>
          <th>Country</th>
        </tr>
        </thead>
        <tbody>
        {
          data.map(({a, b, c}) => 
            <tr key={a.toString()}>
              <td><input type="checkbox" onClick={() => onChecked(a)}/></td>
              <td>{a}</td>
              <td>{b}</td>
              <td>{c}</td>
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
