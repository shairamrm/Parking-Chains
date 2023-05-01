// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ParkingRental {
    address public owner;

    struct ParkingSpot {
        uint256 id;
        string location;
        uint256 pricePerHour;
        bool isAvailable;
        address renter;
    }

    mapping(uint256 => ParkingSpot) public parkingSpots;
   

    constructor() {
        owner = msg.sender;
    }

    function addParkingSpot(
        uint256 _id,
        string memory _location,
        uint256 _pricePerHour
    ) public {
        require(msg.sender == owner, "Only owner can add parking spots.");
        require(
            !parkingSpots[_id].isAvailable,
            "Parking spot with this id already exists."
        );
        parkingSpots[_id] = ParkingSpot(
            _id,
            _location,
            _pricePerHour,
            true,
            address(0)
        );
    }

    function reserveParkingSpot(uint256 _id) payable public {
        require(
            parkingSpots[_id].isAvailable,
            "This parking spot is not available."
        );
        require(
            msg.value >= 10000 wei, // 1 ether
            "Incorrect payment amount."
        );

        parkingSpots[_id].isAvailable = false;
        parkingSpots[_id].renter = msg.sender;
    }

    function releaseParkingSpot(uint256 _id) public {
        require(
            msg.sender == parkingSpots[_id].renter,
            "Only the renter can release the parking spot."
        );
        parkingSpots[_id].isAvailable = true;
        parkingSpots[_id].renter = address(0);
    }
}