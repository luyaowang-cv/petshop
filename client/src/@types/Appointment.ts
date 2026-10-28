import { Pet } from "./Pet";
import { PetshopService } from "./PetshopServices";

export enum AppointmentStatus {
  PENDING = "PENDING", // 待审核
  CONFIRMED = "CONFIRMED", // 已确认（待服务）
  REJECTED = "REJECTED", // 已拒绝
  DONE = "DONE", // 服务完成（待支付）
  PENDING_PAYMENT = "PENDING_PAYMENT", // 待支付
  COMPLETED = "COMPLETED", // 已完成（已支付）
  CANCELED = "CANCELED", // 已取消
}

export type Appointment = {
  id: string;
  appointmentTime: Date;
  status: AppointmentStatus;
  petId: string;
  serviceId: string;
  rejectReason: string | null;
  customerNote: string | null;
  pet: Pet;
  service?: PetshopService;
};
