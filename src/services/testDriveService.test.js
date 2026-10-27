import {
  canTransitionTestDriveStatus,
  getTestDrivesForUser,
  hasConfirmedTestDriveConflict,
  isFutureDate,
  isTestDriveEligibleCar,
  loadTestDrives,
  normalizeTestDriveStatus,
  saveTestDrives,
  validateTestDriveDetails,
} from "./testDriveService";

describe("testDriveService", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("accepts only active cars that support test drives", () => {
    expect(isTestDriveEligibleCar({ active: 1, test_drive: 1 })).toBe(true);
    expect(isTestDriveEligibleCar({ active: 0, test_drive: 1 })).toBe(false);
    expect(isTestDriveEligibleCar({ active: 1, test_drive: 0 })).toBe(false);
  });

  test("requires a valid future date, time slot, customer name and phone", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    expect(
      validateTestDriveDetails({
        car: { active: 1, test_drive: 1 },
        date,
        timeSlot: "08:30 - 09:30",
        customerName: "Khách hàng",
        phone: "0900000000",
      }),
    ).toBe("");
    expect(isFutureDate("not-a-date")).toBe(false);
    expect(
      validateTestDriveDetails({
        car: { active: 1, test_drive: 1 },
        date,
        timeSlot: "08:30 - 09:30",
        customerName: "Khách hàng",
        phone: "123",
      }),
    ).toContain("10 chữ số");
  });

  test("detects confirmed conflicts across legacy field and status formats", () => {
    const appointments = [
      {
        id: "one",
        car_id: 7,
        slot: "2026-12-01 (10:00 - 11:00)",
        status: "Đã xác nhận",
      },
    ];

    expect(
      hasConfirmedTestDriveConflict(appointments, {
        carId: 7,
        date: "2026-12-01",
        timeSlot: "10:00 - 11:00",
      }),
    ).toBe(true);
    expect(
      hasConfirmedTestDriveConflict(appointments, {
        carId: 7,
        date: "2026-12-01",
        timeSlot: "10:00 - 11:00",
        id: "one",
      }),
    ).toBe(false);
  });

  test("filters customer records by identity and hides records without an identity", () => {
    const appointments = [
      { id: 1, userId: "customer-1" },
      { id: 2, user_id: "customer-2" },
    ];

    expect(getTestDrivesForUser(appointments, "customer-1")).toHaveLength(1);
    expect(getTestDrivesForUser(appointments, null)).toEqual([]);
  });

  test("reads and writes the canonical and legacy database keys", () => {
    window.localStorage.setItem(
      "carstore_lab_db",
      JSON.stringify({ testDrives: [{ id: "old" }] }),
    );
    expect(loadTestDrives()).toEqual([{ id: "old" }]);

    saveTestDrives([{ id: "new" }]);
    expect(JSON.parse(window.localStorage.getItem("testdrives"))).toEqual([
      { id: "new" },
    ]);
    expect(
      JSON.parse(window.localStorage.getItem("carstore_lab_db")),
    ).toEqual({
      testdrives: [{ id: "new" }],
      testDrives: [{ id: "new" }],
    });
  });

  test("normalizes legacy statuses and prevents invalid status transitions", () => {
    expect(normalizeTestDriveStatus("Đang chờ xác nhận")).toBe("pending");
    expect(canTransitionTestDriveStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionTestDriveStatus("completed", "confirmed")).toBe(false);
    expect(canTransitionTestDriveStatus("cancelled", "pending")).toBe(false);
  });
});
