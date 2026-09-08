import { describe, expect, it } from "vitest";
import {
  CreateBatchRequestSchema,
  CreateClassLogRequestSchema,
  CreateStudentRequestSchema,
  LoginRequestSchema,
  SubmitHomeworkRequestSchema,
  SubscriptionSyncRequestSchema,
  CreateAnnouncementRequestSchema,
} from "@mksm/contracts";

describe("contract DTOs — happy path", () => {
  it("LoginRequest accepts an identifier + password and defaults keepSignedIn", () => {
    const parsed = LoginRequestSchema.parse({ identifier: "100428", password: "x" });
    expect(parsed.keepSignedIn).toBe(false);
  });

  it("CreateStudentRequest defaults country to India", () => {
    const parsed = CreateStudentRequestSchema.parse({
      firstName: "A",
      lastName: "B",
      phone: "+91 90000 00000",
      email: "a@b.com",
    });
    expect(parsed.country).toBe("India");
  });

  it("CreateBatchRequest requires uuid course/teacher and a known pitch", () => {
    const parsed = CreateBatchRequestSchema.parse({
      name: "Dhun Batch",
      courseId: "11111111-1111-1111-1111-111111111111",
      teacherId: "22222222-2222-2222-2222-222222222222",
      day: "Monday",
      pitch: "C#",
      studentType: "Adults",
      language: "Marathi",
      level: "Intermediate",
    });
    expect(parsed.genderMix).toBe("Mix");
    expect(parsed.region).toBe("india");
  });

  it("CreateClassLogRequest wants an ISO date", () => {
    const parsed = CreateClassLogRequestSchema.parse({
      classDate: "2026-09-08",
      batchId: "33333333-3333-3333-3333-333333333333",
      ragaId: "44444444-4444-4444-4444-444444444444",
      whatCovered: "Vistaar",
    });
    expect(parsed.classDate).toBe("2026-09-08");
  });

  it("SubscriptionSyncRequest coerces payment defaults", () => {
    const parsed = SubscriptionSyncRequestSchema.parse({
      items: [
        {
          studentMksmNo: "100428",
          provider: "razorpay",
          externalSubscriptionId: "sub_1",
          status: "active",
        },
      ],
    });
    expect(parsed.items[0]!.activeCycle).toBe(0);
    expect(parsed.items[0]!.payments).toEqual([]);
  });
});

describe("contract DTOs — rejection", () => {
  it("rejects a non-6-digit MKSM number in announcement student audience", () => {
    const result = CreateAnnouncementRequestSchema.safeParse({
      title: "t",
      body: "b",
      audience: "student",
      studentMksmNo: "12",
    });
    expect(result.success).toBe(false);
  });

  it("rejects announcement audience=batch without a batchId", () => {
    const result = CreateAnnouncementRequestSchema.safeParse({ title: "t", body: "b", audience: "batch" });
    expect(result.success).toBe(false);
  });

  it("rejects a homework submission without a class session id", () => {
    const result = SubmitHomeworkRequestSchema.safeParse({ title: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects a bad HH:MM time on a batch", () => {
    const result = CreateBatchRequestSchema.safeParse({
      name: "x",
      courseId: "11111111-1111-1111-1111-111111111111",
      teacherId: "22222222-2222-2222-2222-222222222222",
      day: "Monday",
      pitch: "C#",
      studentType: "Adults",
      language: "Marathi",
      level: "Intermediate",
      time: "6pm",
    });
    expect(result.success).toBe(false);
  });
});
