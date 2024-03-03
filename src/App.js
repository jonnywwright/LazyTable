import './App.css';
import { useEffect, useState, useRef } from "react";

const totalRecords = 5000;
const mockData = () => Array.from(Array(totalRecords).keys()).map(x => ({
  a: x, b: "alsdfjasldf", c: "asldfjsdfjk"
}));

const rowHeight = 20;

// size of the visible portion of the table
const pageSize = 1000;

// records per page
const recordsPerPage = pageSize / rowHeight;

// number of row to increment on next page
const incrementSize = 1;

// amount to grow or shrink buffers 
const incrementBufferSize = rowHeight * incrementSize; 

const initialEndBufferSize = (totalRecords * rowHeight) - pageSize;

const getSizeFromPixel = (str) => Number(str.substring(0, str.length - 2));

function App() {
  const [data, setData] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const allData = useRef(mockData().map(x => x));
  const startBuffer = useRef(null);
  const endBuffer = useRef(null);

  const [windowLeft, setWindowLeft] = useState(0);
  const [windowRight, setWindowRight] = useState(50);

  const incrementBuffer = (ref, count) => {
    const pixelHeight = ref.current.style.height;
    
    console.log({pixelHeight})
    let height = getSizeFromPixel(pixelHeight);

    height += count;

    ref.current.style.height = `${height}px`;
  }

  const scrollTableIntoView = () => {
    document.getElementById("tid").scrollIntoView();
  }

  const onClickLeft = () => {
    if (windowLeft === 0) {
      return;
    }

    const updateWindowLeft = windowLeft - incrementSize;
    const updateWindowRight = windowRight - incrementSize;

    setWindowLeft(updateWindowLeft);
    setWindowRight(updateWindowRight);

    setData(allData.current.slice(updateWindowLeft, updateWindowRight));

    incrementBuffer(startBuffer, -incrementBufferSize);
    incrementBuffer(endBuffer, incrementBufferSize);

    scrollTableIntoView();
  }
  const onClickRight = () => {
    if (windowRight === totalRecords) {
      return;
    }

    const updateWindowLeft = windowLeft + incrementSize;
    const updateWindowRight = windowRight + incrementSize;

    setWindowLeft(updateWindowLeft);
    setWindowRight(updateWindowRight);

    setData(allData.current.slice(updateWindowLeft, updateWindowRight));

    incrementBuffer(startBuffer, incrementBufferSize);
    incrementBuffer(endBuffer, -incrementBufferSize);

    scrollTableIntoView();
  }

  useEffect(() => {
    setData(allData.current.slice(0, windowRight));
    // set initial buffer heights
    startBuffer.current.style.height = "0px";
    endBuffer.current.style.height = `${initialEndBufferSize}px`;
  }, []);

  useEffect(() => {
    const container = document.getElementById("super-special-id");

    const handler = (event) => {
      const st = container.scrollTop;
      const c = Math.round(st/rowHeight);
      // print scroll top
      console.log(container.scrollTop, { c });
      
      // set the correct data
      const l = c;
      const r = c + recordsPerPage;
      
      setData(allData.current.slice(l, r));

      // get the frontBuffer height and set it
      const fBufferHeight = c * rowHeight;

      startBuffer.current.style.height = `${fBufferHeight}px`;

      const eBufferHeight = initialEndBufferSize - fBufferHeight;

      endBuffer.current.style.height = `${eBufferHeight}px`

      // get the back buffer height and set it

      // scroll into view
     scrollTableIntoView();
    }

    container.addEventListener("scrollend", handler);
  }, []);
  
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
      <div className='App-Inner' id="super-special-id">
      <div ref={startBuffer}/>
      <table id="tid">
        <tbody>
        {
          data.map(({a, b, c}) => 
            <tr key={a.toString()}>
              <td><input type="checkbox" checked={checkedIds.includes(a)} onClick={() => onChecked(a)}/></td>
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
