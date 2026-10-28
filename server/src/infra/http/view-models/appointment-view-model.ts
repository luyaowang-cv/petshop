import { Appointment, AppointmentStatus } from "@app/entities/appointment";
import { PetViewModel } from "./pet-view-model";
import { PetshopServiceViewModel } from "./petshop-service-view-model";

type AppointmentViewModelToHttp = {
  id: string
  appointmentTime: string
  petId: string
  serviceId: string
  status: AppointmentStatus
  rejectReason: string | null
  customerNote: string | null

  pet?: ReturnType<typeof PetViewModel.toHTTP>
  service?: ReturnType<typeof PetshopServiceViewModel.toHTTP>
}

export class AppointmentViewModel {
  static toHTTP(appointment: Appointment) {
    const appointmentViewModel: AppointmentViewModelToHttp = {
      id: appointment.id,
      appointmentTime: appointment.appointmentTime.toISOString(),
      petId: appointment.petId,
      serviceId: appointment.serviceId,
      status: appointment.status,
      rejectReason: appointment.rejectReason,
      customerNote: appointment.customerNote,
    }
    if (appointment.pet) {
      appointmentViewModel.pet = PetViewModel.toHTTP(appointment.pet)
    }
    if (appointment.service) {
      appointmentViewModel.service = PetshopServiceViewModel.toHTTP(appointment.service)
    }
    return appointmentViewModel
  }
}