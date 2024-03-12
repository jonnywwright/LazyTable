import { useEffect, useState, useRef } from "react";
import "./index.css";

/**
 * **************Idea for paging system.***********************
 * To fix issue with div buffers appearing during scroll we can
 * increase the page size and divide it up into 3 sections. 
 * This way when scrolling the buffers shouldn't bleed into view.
 * The arrow below shows which section is visible and how new 
 * sections get loaded in. Always keep a section above and below
 * current position. This should also solve point scroll. We should
 * also be able to signal cancels on loads happening outside of 
 * the sections. This should improve performance and prevent
 * a lot of unnecessary calls during fast scrolls.
  a b c
  ^
    ^
      ^
    b c d
        ^
      c d e    
 */


/**
 * **************Load behavior for scrolling*********************
 * Table should handle fetching. As we scroll into unfilled space
 * we should fetch to fill up our data reference. We shouldn't 
 * block scrolling that's annoying.
 */
const LazyTable = ({getDataAsync, 
    fetchSize, 
    tableHeight, 
    rowHeight, 
    totalRecords}) => {
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
  const allData = useRef(new Array(totalRecords));

  /**
   * We write data in segments as we scroll. Use promises to block setData
   * while writing to the cache.
   */
  const loadingPromisesLookup = useRef({});
  
  // Where the dom manipulation happens.
  useEffect(() => {
    const fBufferHeight = windowLeft * rowHeight;

    startBuffer.current.style.height = `${fBufferHeight}px`;

    const eBufferHeight = initialEndBufferSize - fBufferHeight;

    endBuffer.current.style.height = `${eBufferHeight}px`
  }, [windowLeft]);

    // DEBUG:
  useEffect(() => {
    console.log('DEBUG', { windowLeft }, { data });
  }, [windowLeft, data])

  // Load the scroll handler and set the initial data.
  useEffect(() => {

    // Scrolling down is solved.
    // TODO: Scrolling up
    // TODO: Point scrolling
    // TODO: Add lock so only one hander per segment.
    const handler = async () => {
      const scrollTop = tableContainer.current.scrollTop;
      const left = Math.round(scrollTop/rowHeight);
      const right = left + recordsPerPage;

      // Found segment without data.
      if (allData.current[right] === undefined) {
        const batchCount = Math.floor((right + fetchSize) / fetchSize) -1;

        if (loadingPromisesLookup.current[batchCount] === undefined)
        {
          let batchLoadingResolver;

          loadingPromisesLookup.current[batchCount] = new Promise(resolver => {
            batchLoadingResolver = resolver;
          });

          const fetchLeft = batchCount * fetchSize;
          
          const fetchRight = fetchLeft + fetchSize;

          const missingBatch = await getDataAsync(fetchLeft, fetchRight, batchCount);

          let missingBatchIdx = 0;

          for (let i = fetchLeft; i < fetchRight; i++) {
            allData.current[i] = missingBatch[missingBatchIdx];
            missingBatchIdx++;
          }

          batchLoadingResolver();
        } else {
          await loadingPromisesLookup.current[batchCount];
        }       
      }

      setWindowLeft(left);
      setData(allData.current.slice(left, right));
    }

    tableContainer.current.style.height = `${tableHeight}px`;

    tableContainer.current.addEventListener("scroll", handler);

    // Set the initial data.
    const setInitialDataAsync = async () => {
      const idxStart = 0;
      
      // TODO:// Make clear that fetch size should never change.
      const initialData = await getDataAsync(idxStart, fetchSize, 0);

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
      <div ref={tableContainer} className='App-Inner'>
      <div className="buffer" ref={startBuffer}/>
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
      <div className="buffer" ref={endBuffer}/>
      </div>
    </>
  );
}

export default LazyTable;