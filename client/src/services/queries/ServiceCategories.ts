import {
  ServiceCategory,
  ServiceCategoryInput,
} from "@/@types/PetshopServices";
import api from "../api";

export const SERVICECATEGORY_KEY = "serviceCategory-fetch";

export async function fetchServiceCategories() {
  const { data } = await api.get<{ categories: ServiceCategory[] }>(
    `/service-categories`,
  );
  return data;
}

export async function createServiceCategory(payload: ServiceCategoryInput) {
  const { data } = await api.post<{ category: ServiceCategory }>(
    `/service-categories`,
    payload,
  );
  return data;
}

export async function updateServiceCategory(
  id: string,
  payload: ServiceCategoryInput,
) {
  const { data } = await api.put<{ category: ServiceCategory }>(
    `/service-categories/${id}`,
    payload,
  );
  return data;
}

export async function deleteServiceCategory(id: string) {
  await api.delete(`/service-categories/${id}`);
}
