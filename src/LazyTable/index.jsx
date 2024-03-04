import { useEffect, useState, useRef } from "react";
import "./index.css";

const incrementSize = 1;


/**
 * **************Load behavior for scrolling*********************
 * Table should handle fetching. As we scroll into unfilled space
 * we should fetch to fill up our data reference. While waiting for
 * data we can block scrolling. Think lazy loading.
 */

const LazyTable = ({getDataAsync, 
    fetchSize, 
    tableHeight, 
    rowHeight, 
    totalRecords,
    mockData}) => {
  const initialEndBufferSize = (totalRecords * rowHeight) - tableHeight;
  const recordsPerPage = tableHeight / rowHeight;

  const [data, setData] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const tableContainer = useRef(null);
  const startBuffer = useRef(null);
  const endBuffer = useRef(null);
  const [windowLeft, setWindowLeft] = useState(0);
  
  /**
   * This is a cache. Right now it's going to be size n records. That's
   * probably fine. Eventually I need to support deleting and possibly
   * updating as well.
   */
  const allData = useRef(mockData.map(x => x));
 
  // Where the dom manipulation happens.
  useEffect(() => {
    const fBufferHeight = windowLeft * rowHeight;

    startBuffer.current.style.height = `${fBufferHeight}px`;

    const eBufferHeight = initialEndBufferSize - fBufferHeight;

    endBuffer.current.style.height = `${eBufferHeight}px`
  }, [windowLeft])

  // DEBUG:
  const onClickLeft = () => {
    if (windowLeft === 0) {
      return;
    }

    const updateWindowLeft = windowLeft - incrementSize;

    setWindowLeft(updateWindowLeft);
    const right = updateWindowLeft + recordsPerPage;
    setData(allData.current.slice(updateWindowLeft, right));
  }

  // DEBUG: 
  const onClickRight = () => {
    if (windowLeft + recordsPerPage === totalRecords) {
      return;
    }

    const updateWindowLeft = windowLeft + incrementSize;
    const right = updateWindowLeft + recordsPerPage; 

    setWindowLeft(updateWindowLeft);
    setData(allData.current.slice(updateWindowLeft, right));
  }
  
  // DEBUG:
  useEffect(() => {
    console.log('DEBUG', { windowLeft }, { data });
  }, [windowLeft, data])

  // Load the scroll handler and set the initial data.
  useEffect(() => {
    const handler = () => {
      const scrollTop = tableContainer.current.scrollTop;
      const left = Math.round(scrollTop/rowHeight);
      
      // set the correct data
      setWindowLeft(left);
      setData(allData.current.slice(left, left + recordsPerPage));
    }

    tableContainer.current.style.height = `${tableHeight}px`;

    tableContainer.current.addEventListener("scroll", handler);

    // Set the initial data.

    const setInitialDataAsync = async () => {
      const idxStart = 0;
      
      // TODO:// Make clear that fetch size should never change.
      const initialData = await getDataAsync(idxStart, fetchSize);

      // Write to cache.
      for (let i = idxStart; i < fetchSize; i++) {
        allData.current[i] = initialData[i];
      }
      
      // Write to data
      setData(allData.current.slice(idxStart, fetchSize)); 
    }

    setInitialDataAsync();
    
    // Cleanup listeners.
    return () => {
      tableContainer.current.removeEventListener("scroll", handler);
    }
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
    <>
      <button onClick={onClickLeft}>Up</button>
      <button onClick={onClickRight}>Down</button>
      <div ref={tableContainer} className='App-Inner'>
      <div className="animated-gradient" ref={startBuffer}/>
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
      <div className="animated-gradient" ref={endBuffer}/>
      </div>
    </>
  );
}

export default LazyTable;