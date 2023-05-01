// SPDX-License-Identifier: MIT
const ParkingRental = artifacts.require("ParkingRental");

contract("ParkingRental", ([owner, renter]) => {
  let parkingRental;

  before(async () => {
    parkingRental = await ParkingRental.new({ from: owner });
  });

  describe("addParkingSpot", () => {
    it("should add a new parking spot", async () => {
      await parkingRental.addParkingSpot(1, "location", 100, { from: owner });
      const parkingSpot = await parkingRental.parkingSpots(1);

      assert.equal(parkingSpot.id, 1);
      assert.equal(parkingSpot.location, "location");
      assert.equal(parkingSpot.pricePerHour, 100);
      assert.equal(parkingSpot.isAvailable, true);
      assert.equal(parkingSpot.renter, "0x0000000000000000000000000000000000000000");
    });

    it("should not allow non-owners to add parking spots", async () => {
      await expectRevert(
        parkingRental.addParkingSpot(2, "location", 200, { from: renter }),
        "Only owner can add parking spots."
      );
    });

    it("should not allow duplicate parking spot IDs", async () => {
      await expectRevert(
        parkingRental.addParkingSpot(1, "location", 300, { from: owner }),
        "Parking spot with this id already exists."
      );
    });
  });

  describe("reserveParkingSpot", () => {
    beforeEach(async () => {
      await parkingRental.addParkingSpot(2, "location", 400, { from: owner });
    });

    it("should reserve a parking spot", async () => {
      await parkingRental.reserveParkingSpot(2, { from: renter, value: 10000 });
      const parkingSpot = await parkingRental.parkingSpots(2);

      assert.equal(parkingSpot.isAvailable, false);
      assert.equal(parkingSpot.renter, renter);
    });

    it("should not allow reservations for unavailable parking spots", async () => {
      await parkingRental.reserveParkingSpot(2, { from: renter, value: 10000 });

      await expectRevert(
        parkingRental.reserveParkingSpot(2, { from: owner, value: 10000 }),
        "This parking spot is not available."
      );
    });

    it("should require correct payment amount", async () => {
      await expectRevert(
        parkingRental.reserveParkingSpot(2, { from: renter, value: 5000 }),
        "Incorrect payment amount."
      );
    });
  });

  describe("releaseParkingSpot", () => {
    beforeEach(async () => {
      await parkingRental.addParkingSpot(3, "location", 500, { from: owner });
      await parkingRental.reserveParkingSpot(3, { from: renter, value: 10000 });
    });

    it("should allow the renter to release a parking spot", async () => {
      await parkingRental.releaseParkingSpot(3, { from: renter });

      const parkingSpot = await parkingRental.parkingSpots(3);

      assert.equal(parkingSpot.isAvailable, true);
      assert.equal(parkingSpot.renter, "0x0000000000000000000000000000000000000000");
    });

    it("should not allow anyone other than the renter to release a parking spot", async () => {
      await expectRevert(
      parkingRental.releaseParkingSpot(3, { from: owner }),
      "Only the renter can release the parking spot."
      );
    });
  });
});