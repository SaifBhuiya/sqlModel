import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./App.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement
} from "chart.js";

// Register them
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement
);


function App() {
    //SQL Data 
    const [data, setData] = useState([]); //displayed
    const [originalData, setOGData] = useState([]); //Full original data (not changed)
    const [Chartdata, setChartdata] = useState([]); // Sorted and formatted for chart
    

    //Form placeholders
    const [date, setDate] = useState('');
    const [trade_code, setTrade_code] = useState('')
    const [high, setHigh] = useState('')
    const [low, setLow] = useState('')
    const [open, setOpen] = useState('')
    const [close, setClose] = useState('')
    const [volume, setVolume] = useState('')

    //Variables
    const [isUpdate, setIsUpdate] = useState(false)
    const [Updateindex, setUpdateindex] = useState(0)
    const [selectedTradeCode, setSelectedTradeCode] = useState("ALL");
    const [tradeCodes, setTradeCodes] = useState([]);

    //dropdown menu
    useEffect(() => {
        const fetchTradeCodes = () => {
            fetch("https://sqlmodel-production.up.railway.app/get_trade_codes")
                .then((response) => response.json())
                .then((data) => setTradeCodes(data))
                .catch((error) => console.error("Error fetching trade codes:", error));
        };

        fetchTradeCodes(); // Fetch initially

        const interval = setInterval(fetchTradeCodes, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);
    
  

    useEffect(() => {
        fetch("https://sqlmodel-production.up.railway.app/stocks")  // Get Data from Flask backend
            .then(response => response.json())
            .then(data => {
                setData(data)           //Load to display
                setOGData(data)         //Load to Original Data
            })  // Set data directly
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        fetch("https://sqlmodel-production.up.railway.app/stocksforGraph")  // Get Data from Flask backend for chart
            .then(response => response.json())
            .then(data => {
                setChartdata(data)           //Load chart data
             
            })  // Set data directly
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    const sendDataToFlask = async () => {
        
        fetch("https://sqlmodel-production.up.railway.app/stocksforGraph")
            .then(response => response.json())
            .then(data => {
                setChartdata(data)           //Load chart data

            }) 
            .catch(error => console.error("Error fetching data:", error));            
        
    };




    const handleEdit = (id) => {
        const dt = data.filter((item) => item.id === id);//find row using index

        //fill the onscreen form with the data from the row
        if (dt !== undefined) {
            setIsUpdate(true)
            setUpdateindex(id)
            setDate(dt[0].date)
            setTrade_code(dt[0].trade_code)
            setHigh(dt[0].high)
            setLow(dt[0].low)
            setOpen(dt[0].open)
            setClose(dt[0].close)
            setVolume(dt[0].volume)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            fetch(`https://sqlmodel-production.up.railway.app/Delete?id=${id}`, {
                method: "DELETE"
            })
                .then(response => response.json())  // Process the API response
                .then(data => {
                    console.log("Delete successful:", data);
                    setData(data)           //Load to display
                    setOGData(data)
                    sendDataToFlask()

                })
                .catch(error => {
                    console.error("Error deleting:", error);
                });
        }
        handleClear()
       
    }


    const handleSave = async() => {


        const Formdata = {
            index: Updateindex,
            date: date,
            trade_code: trade_code,
            high: high,
            low: low,
            open: open,
            close: close,
            volume: volume
        };

        fetch("https://sqlmodel-production.up.railway.app/Create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Formdata)// sending the Form data to be updated
        })
            .then(response => response.json())  // Process the API response
            .then(data => {
                console.log("Update successful:", data);
                setData(data)           //Load to display
                setOGData(data)
                sendDataToFlask()
            })
            .catch(error => {
                console.error("Error updating:", error);
            });

        //finally clear the onscreen form
        handleClear()


    
    }
    const handleClear = () => {
        setUpdateindex(0)
        setIsUpdate(false)
        setDate('')
        setTrade_code('')
        setHigh(0)
        setLow(0)
        setOpen(0)
        setClose(0)
        setVolume('0')
       
    }
    const handleUpdate = async () => {
        //update button has been pressed

        //create the array to send
        const Formdata = {
            index: Updateindex,
            date: date,
            trade_code: trade_code,
            high: high,
            low: low,
            open: open,
            close: close,
            volume: volume
        };
       

        //call API to handle the update
        fetch("https://sqlmodel-production.up.railway.app/Edit", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Formdata)// sending the Form data to be updated
        })
            .then(response => response.json())  // Process the API response
            .then(data => {
                console.log("Update successful:", data);
                setData(data)           //Load to display
                setOGData(data)
                sendDataToFlask()
            })
            .catch(error => {
                console.error("Error updating:", error);
            });

        //finally clear the onscreen form
            handleClear()
        

    }
    const handleSearch = (e) => {
        
        const searchTerm = e.currentTarget.value.toLowerCase();

        // First, reset to the original dataset (use originalData directly)
        setData(originalData)

        const dt = originalData.filter(item =>
            item.trade_code.toLowerCase().includes(searchTerm) ||
            item.date.includes(searchTerm) ||
            item.high.toString().includes(searchTerm) ||
            item.low.toString().includes(searchTerm) ||
            item.open.toString().includes(searchTerm) ||
            item.close.toString().includes(searchTerm) ||
            item.volume.toString().includes(searchTerm)
        );

        // Then, update the displayed dataset
        setData(dt);
        
    }

    const handleTradeCodeChange = (e) => {
        setSelectedTradeCode(e.target.value);
    };

    // Filter chart data based on selected trade code
    const filteredData = selectedTradeCode === "ALL"
        ? Chartdata
        : Chartdata.filter(item => item.trade_code === selectedTradeCode);

    return (
        <div>
            <h1>Stock Market Data</h1>
            <h2>Trade Code for Graph</h2>

            {/* Dropdown inside App.js */}
            <select value={selectedTradeCode} onChange={handleTradeCodeChange}>
                <option value="ALL">ALL</option> {/* Default option */}
                {tradeCodes.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <div>
                <Line
                    width={800}
                    height={200}
                    data={{
                        labels: filteredData.map((item) => item.date),
                        datasets: [
                            {
                                label: "Close",
                                data: filteredData.map((item) => item.close),
                                backgroundColor: "#064ff0",
                                borderColor: "#064ff0",
                                fill: false,
                                yAxisID: "y1",
                            },
                            {
                                label: "Volume",
                                data: filteredData.map((item) => item.volume),
                                backgroundColor: "#FF3030",
                                borderColor: "#FF3030",
                                type: "bar",
                                yAxisID: "y2",
                            },
                        ],
                    }}
                    options={{
                        scales: {
                            y1: {
                                type: "linear",
                                position: "left",
                                ticks: {
                                    beginAtZero: true,
                                    min: 100,
                                    max: 5000,
                                    stepSize: 500,
                                },
                                title: {
                                    display: true,
                                    text: "Close Price",
                                },
                            },
                            y2: {
                                type: "linear",
                                position: "right",
                                ticks: {
                                    beginAtZero: true,
                                    min: 0,
                                    max: 5_000_000,
                                    stepSize: 1_000_000,
                                    callback: (value) => value.toLocaleString(),
                                },
                                title: {
                                    display: true,
                                    text: "Volume",
                                },
                            },
                        },
                    }}
                />



            </div>

            <div >
                <input
                    className="search"
                    type='search'
                    placeholder='Search'
                    name='SearchTerm'
                    onChange={handleSearch}
                />
            </div>

            <div className="form">
                <div>
                    <label>
                        Date:
                        <input type='date' placeholder='Enter Date' onChange={(e) => setDate(e.target.value)} value={date} />
                    </label>
                </div>
                <div>
                    <label>
                        Trade_Code:
                        <input type='text' placeholder='Enter trade code' onChange={(e) => setTrade_code(e.target.value)} value={trade_code} />
                    </label>
                </div>
                <div>
                    <label>
                        High:
                        <input type='double' placeholder='Enter value of high' onChange={(e) => setHigh(e.target.value)} value={high} />
                    </label>
                </div>
                <div>
                    <label>
                        Low:
                        <input type='double' placeholder='Enter value of low' onChange={(e) => setLow(e.target.value)} value={low} />
                    </label>
                </div>
                <div>
                    <label>
                        Open:
                        <input type='double' placeholder='Enter value of open' onChange={(e) => setOpen(e.target.value)} value={open} />
                    </label>
                </div>
                <div>
                    <label>
                        Close:
                        <input type='double' placeholder='Enter value of close' onChange={(e) => setClose(e.target.value)} value={close} />
                    </label>
                </div>
                <div>
                    <label>
                        Volume:
                        <input type='double' placeholder='Enter value of Volume' onChange={(e) => setVolume(e.target.value)} value={volume} />
                    </label>
                </div>
                <div>
                    {
                        !isUpdate ? 
                            <button onClick={() => handleSave()}>Save</button> 
                            :
                            <button onClick={() => handleUpdate()}>Update</button>

                    } 
                               
                     <button onClick={() => handleClear()}>Clear</button>

                </div>

            </div>


            <table border="1">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Trade Code</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Open</th>
                        <th>Close</th>
                        <th>Volume</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}> 
                            <td>{item.date}</td>
                            <td>{item.trade_code}</td>
                            <td>{item.high}</td>
                            <td>{item.low}</td>
                            <td>{item.open}</td>
                            <td>{item.close}</td>
                            <td>{item.volume}</td>
                            <td>
                                <button onClick={() => handleEdit(item.id)}>Edit</button>
                                <br></br>
                                <button onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
