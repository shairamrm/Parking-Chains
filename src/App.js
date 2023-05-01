import React, { useState, useEffect } from 'react';
import ParkingRental from './contracts/compile/ParkingRental.json';
import Web3 from 'web3';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    const init = async () => {
      // Initialize Web3
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          setWeb3(web3);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = ParkingRental.networks[networkId];
          const contract = new web3.eth.Contract(
            ParkingRental.abi,
            deployedNetwork.address
          );
          setContract(contract);
        } catch (error) {
          console.error(error);
        }
      }
    };
    init();
  }, []);
  //connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('No wallet detected');
    }
  };

  //addParkingSpot
  const addParkingSpot = async (id, location, pricePerHour) => {
    if (!isConnected) {
      console.error('Please connect your wallet');
      return;
    }
    await contract.methods.addParkingSpot(id, location, pricePerHour).send({ from: account }); //error
    const spot = await contract.methods.parkingSpots(id).call();
    setParkingSpots([...parkingSpots, spot]);
  };
  //reserveParkingSpot
  const reserveParkingSpot = async (id) => {
    const spot = parkingSpots.find(s => s.id === id);
    if (!spot) {
      console.error(`Parking spot with id ${id} not found.`);
      return;
    }
    await contract.methods.reserveParkingSpot(id).send({ from: account, value: web3.utils.toWei((spot.pricePerHour).toString(), 'wei') });
    const updatedSpot = await contract.methods.parkingSpots(id).call();
    setParkingSpots([...parkingSpots.filter(s => s.id !== id), updatedSpot]);
  };
  //releaseParkingSpot
  const releaseParkingSpot = async (id) => {
    const spot = parkingSpots.find(s => s.id === id);
    if (!spot) {
      console.error(`Parking spot with id ${id} not found.`);
      return;
    }
    await contract.methods.releaseParkingSpot(id).send({ from: account });
    const updatedSpot = await contract.methods.parkingSpots(id).call();
    setParkingSpots([...parkingSpots.filter(s => s.id !== id), updatedSpot]);
  };

  return (  
    <div className="App" style={{backgroundImage: `url(${require('./images/bg-image.png')})`, backgroundRepeat: 'no-repeat', overflowX:"hidden"}}>
        
        {/* Connect Wallet */}
        <div class="d-grid gap-2 d-md-flex justify-content-md-end" >
          <button class="btn btn" style={{borderRadius:"12px", backgroundColor:"#4A2E6F", color:"white", fontWeight:"bold", marginRight:"2%", marginTop:"2%"}} onClick={connectWallet}>Connect Wallet</button>
        </div>
        {/* End of Collect Wallet */}

        {/* Landing Page */}
        <div class="d-grid gap-2 d-md-flex justify-content-md-start" style={{marginTop:"45%", marginLeft:"5%"}}>
          <button class="btn btn me-md-2" type="button" style={{borderRadius:"50px", backgroundColor:"#4A2E6F", color:"white", fontWeight:"bold"}}><a style={{textDecoration:"none", color:"white"}} href="#create">Create Spot</a></button>
          <button class="btn btn" style={{borderRadius:"50px", backgroundColor:"white", color:"#4A2E6F", fontWeight:"bold"}} type="button"><a style={{textDecoration:"none", color:"#4A2E6F"}} href="#reserve">Reserve Spot</a></button>
        </div>
        {/* End of Landing Page */}

        {/* Add Parking Spot */}
        <div id="create" style={{backgroundImage: `url(${require('./images/bg-image-2.png')})`}}>
        <div style={{paddingTop:"10%", paddingBottom:"20%", paddingLeft:"2%", paddingRight:"2%", marginRight:"60%", marginLeft:"5%", marginTop:"4%"}}>
          <form onSubmit={e => {
            e.preventDefault();
            const id = e.target.elements.id.value;
            const location = e.target.elements.location.value;
            const pricePerHour = e.target.elements.pricePerHour.value;
            addParkingSpot(id, location, pricePerHour);
            }}>
              <div class="mb-3">
                <label class="form-label fs-4" style={{fontWeight:"bold", color:"#4A2E6F"}}>Parking Spot ID: </label>
                <input class="form-control" type="number" name="id" placeholder="Enter ID" required />
              </div>

              <div class="mb-3">
                <label class="form-label fs-4" style={{fontWeight:"bold", color:"#4A2E6F"}}>Parking Spot Location: </label>
                <input class="form-control" type="text" name="location" placeholder="Enter Location" required />
              </div>
              
              <div class="mb-3" >
                <label class="form-label fs-4" style={{fontWeight:"bold", color:"#4A2E6F"}}>Parking Spot Price: </label>
                <input class="form-control"type="number" name="pricePerHour" step="0.0001" min="0" placeholder="Enter Price (Wei)" required />
              </div>
              <br/>
              
              &nbsp;
              <button class="btn btn" style={{borderRadius:"50px", backgroundColor:"#4A2E6F", fontWeight:"bold", color:"white", marginLeft:"30%"}} type="submit" onClick={addParkingSpot}>Add Parking Spot</button>
          </form>
        </div>
        </div>
        {/* End of Add Parking Spot */}

        {/* Display Available Parking Spots */}
        <h2 id="reserve" class="display-3" style={{paddingLeft: '2%', textAlign:"center", backgroundImage: `url(${require('./images/bg-image-3.png')})`, paddingTop:"2%", paddingBottom:"2%", fontWeight:"bold", color:"#4A2E6F"}}>
          Available Parking Spots
          <p class="lead" style={{textAlign:"center", marginTop:"1%"}}>
            ***Parking spots are available from 9:00 am to 10:00 pm only***
          </p>
          </h2>
        
        <table class="table">
          <thead>
            <tr class="fs-5" style={{textAlign:"center", color:"#4A2E6F"}}>
              <th>ID</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Renter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {parkingSpots.map(spot => (
            <tr key={spot.id} style={{textAlign:"center"}}>
              <td>{spot.id}</td>
              <td>{spot.location}</td>
              <td>{spot.pricePerHour} wei</td>
              <td>{spot.isAvailable ? "Available" : "Not Available"}</td>
              <td>{spot.renter}</td>
              <td>
                {spot.isAvailable ? (
                  <button class="btn btn" style={{borderRadius:"50px", backgroundColor:"#4A2E6F", color:"white", fontWeight:"bold"}} onClick={() => reserveParkingSpot(spot.id, 1)}>Reserve</button>
                ) : (
                  <button class="btn btn-outline" style={{borderRadius:"50px", backgroundColor:"white", color:"#4A2E6F", fontWeight:"bold", borderColor:"#4A2E6F"}} onClick={() => releaseParkingSpot(spot.id)}>Release</button>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {/* End of Display Available Parking Spots */}
  
    </div>
  );
};

export default App;