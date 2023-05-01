const ParkingRental = artifacts.require('ParkingRental.sol'); 

module.exports = function (deployer) {
    deployer.deploy(ParkingRental);
};
