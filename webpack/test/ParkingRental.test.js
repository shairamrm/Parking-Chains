// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

const ParkingRental = artifacts.require("ParkingRental");

contract("ParkingRental", function ([owner, renter]) {
  let parkingRental;

  beforeEach(async function () {
    parkingRental = await ParkingRental.new({ from: owner });
  });

  it("should allow the owner to add a parking spot", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });

    const parkingSpot = await parkingRental.parkingSpots(1);

    assert.equal(parkingSpot.id, 1);
    assert.equal(parkingSpot.location, "location");
    assert.equal(parkingSpot.pricePerHour, 100);
    assert.equal(parkingSpot.availableHours, 5);
    assert.equal(parkingSpot.isAvailable, true);
    assert.equal(parkingSpot.renter, "0x0000000000000000000000000000000000000000");
  });

  it("should not allow anyone other than the owner to add a parking spot", async function () {
    await expectRevert(
      parkingRental.addParkingSpot(1, "location", 100, 5, { from: renter }),
      "Only owner can add parking spots."
    );
  });

  it("should not allow adding a parking spot with an existing ID", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });

    await expectRevert(
      parkingRental.addParkingSpot(1, "location", 200, 5, { from: owner }),
      "Parking spot with this id already exists."
    );
  });

  it("should allow a renter to reserve a parking spot", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });

    await parkingRental.reserveParkingSpot(1, 2, { from: renter, value: 200 });

    const parkingSpot = await parkingRental.parkingSpots(1);

    assert.equal(parkingSpot.isAvailable, false);
    assert.equal(parkingSpot.renter, renter);
    assert.equal(parkingSpot.availableHours, 3);
  });

  it("should not allow reserving an unavailable parking spot", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });
    await parkingRental.reserveParkingSpot(1, 2, { from: renter, value: 200 });

    await expectRevert(
      parkingRental.reserveParkingSpot(1, 4, { from: renter, value: 400 }),
      "This parking spot is not available."
    );
  });

  it("should not allow reserving a parking spot with insufficient available hours", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });

    await expectRevert(
      parkingRental.reserveParkingSpot(1, 6, { from: renter, value: 600 }),
      "Not enough hours available for this parking spot."
    );
  });

  it("should not allow reserving a parking spot with incorrect payment amount", async function () {
    await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });

    await expectRevert(
      parkingRental.reserveParking,
      Spot(1, 2, { from: renter, value: 100 }),
      "Incorrect payment amount."
      );
      });
      
    it("should allow the renter to release a parking spot", async function () {
      await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });
      await parkingRental.reserveParkingSpot(1, 2, { from: renter, value: 200 });
      await parkingRental.releaseParkingSpot(1, { from: renter });

        const parkingSpot = await parkingRental.parkingSpots(1);

    assert.equal(parkingSpot.isAvailable, true);
    assert.equal(parkingSpot.renter, "0x0000000000000000000000000000000000000000");
    assert.equal(parkingSpot.availableHours, 5);
    });

    it("should not allow anyone other than the renter to release a parking spot", async function () {
        await parkingRental.addParkingSpot(1, "location", 100, 5, { from: owner });
        await parkingRental.reserveParkingSpot(1, 2, { from: renter, value: 200 });
        await expectRevert(
        parkingRental.releaseParkingSpot(1, { from: owner }),
        "Only the renter can release the parking spot."
    );
});
});  