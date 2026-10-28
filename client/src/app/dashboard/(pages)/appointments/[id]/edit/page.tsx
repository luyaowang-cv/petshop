"use client";

import { useEffect } from "react";
import { Card, Descriptions, Select, Spin, Alert, message } from "antd";
import { PageContainer } from "@/components/layouts/PageContainer";
import { StatusTag } from "@/components/common";
import { APPOINTMENT } from "@/constants/i18n";
import { APPOINTMENT_KEY, fetchAppointment, updateAppointmentStatus } from "@/services/queries/Appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentStatus } from "@/@types/Appointment";
import dayjs from "dayjs";
import Link from "next/link";
import axios from "axios";

export default function EditAppointment({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();

  const appointmentQuery = useQuery({
    queryKey: [APPOINTMENT_KEY, params.id],
    queryFn: () => fetchAppointment(params.id),
    refetchOnWindowFocus: false,
  });

  const appointment = appointmentQuery.data?.appointment;

  const updateStatusMutation = useMutation({
    mutationFn: (status: AppointmentStatus) => updateAppointmentStatus(params.id, status),
    onSuccess: (data) => {
      message.success("状态更新成功！");
      queryClient.invalidateQueries([APPOINTMENT_KEY]);
      queryClient.setQueryData([APPOINTMENT_KEY, params.id], () => ({
        appointment: {
          ...appointment,
          status: data.appointment.status,
        },
      }));
    },
    onError: () => {
      message.error("状态更新失败，请重试");
    },
  });

  const handleStatusChange = (status: AppointmentStatus) => {
    updateStatusMutation.mutate(status);
  };

  // 错误处理
  if (appointmentQuery.isError) {
    const error = appointmentQuery.error;
    const errorMessage =
      axios.isAxiosError(error) && error.response?.status === 404
        ? "预约不存在"
        : "加载预约信息失败";

    return (
      <PageContainer
        title={APPOINTMENT.DETAIL}
        breadcrumb={[
          { title: APPOINTMENT.TITLE, href: "/dashboard/appointments" },
          { title: APPOINTMENT.DETAIL },
        ]}
      >
        <Alert message={errorMessage} type="error" showIcon />
      </PageContainer>
    );
  }

  // 加载中
  if (appointmentQuery.isLoading || !appointment) {
    return (
      <PageContainer
        title={APPOINTMENT.DETAIL}
        breadcrumb={[
          { title: APPOINTMENT.TITLE, href: "/dashboard/appointments" },
          { title: APPOINTMENT.DETAIL },
        ]}
      >
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={APPOINTMENT.DETAIL}
      breadcrumb={[
        { title: APPOINTMENT.TITLE, href: "/dashboard/appointments" },
        { title: APPOINTMENT.DETAIL },
      ]}
    >
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label={APPOINTMENT.TIME}>
            {dayjs(appointment.appointmentTime).format("YYYY-MM-DD HH:mm")}
          </Descriptions.Item>

          <Descriptions.Item label={APPOINTMENT.SERVICE}>
            {appointment.service ? (
              <Link href={`/dashboard/services/${appointment.service.id}/edit`}>
                {appointment.service.title}
              </Link>
            ) : (
              <span>-</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={APPOINTMENT.PET}>
            <Link href={`/dashboard/customers/${appointment.pet.ownerId}/edit`}>
              {appointment.pet.name}
            </Link>
          </Descriptions.Item>

          <Descriptions.Item label={APPOINTMENT.STATUS}>
            <Select
              value={appointment.status}
              onChange={handleStatusChange}
              loading={updateStatusMutation.isLoading}
              style={{ width: 150 }}
              options={[
                {
                  label: APPOINTMENT.STATUS_PENDING,
                  value: AppointmentStatus.PENDING,
                },
                {
                  label: APPOINTMENT.STATUS_DONE,
                  value: AppointmentStatus.DONE,
                },
                {
                  label: APPOINTMENT.STATUS_CANCELED,
                  value: AppointmentStatus.CANCELED,
                },
              ]}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
}
