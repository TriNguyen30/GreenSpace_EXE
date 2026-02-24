import { axiosInstance } from "@/lib/axios";
import type { AddressPayload, Address } from "@/types/api";

// GET all addresses
export const getMyAddresses = async (): Promise<Address[]> => {
    const res = await axiosInstance.get("/api/users/me/addresses");
    return res.data.data;
};

// GET default address
export const getDefaultAddress = async (): Promise<Address> => {
    const res = await axiosInstance.get(
        "/api/users/me/addresses/default"
    );
    return res.data.data;
};

// GET address by id
export const getAddressById = async (
    addressId: string
): Promise<Address> => {
    const res = await axiosInstance.get(
        `/api/users/me/addresses/${addressId}`
    );
    return res.data.data;
};

// CREATE address
export const createAddress = async (
    payload: AddressPayload
): Promise<Address> => {
    const res = await axiosInstance.post(
        "/api/users/me/addresses",
        payload
    );
    return res.data.data;
};

// UPDATE address
export const updateAddress = async (
    addressId: string,
    payload: AddressPayload
): Promise<Address> => {
    const res = await axiosInstance.put(
        `/api/users/me/addresses/${addressId}`,
        payload
    );
    return res.data.data;
};

// DELETE address
export const deleteAddress = async (
    addressId: string
): Promise<void> => {
    await axiosInstance.delete(
        `/api/users/me/addresses/${addressId}`
    );
};

// SET default address
export const setDefaultAddress = async (
    addressId: string
): Promise<void> => {
    await axiosInstance.put(
        `/api/users/me/addresses/${addressId}/default`
    );
};
