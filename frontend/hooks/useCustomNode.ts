import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CustomPackage from "../types/custom-node";

function useCustomNode() {
    const [packages, setPackages] = useState<CustomPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [packageName, setPackageName] = useState("");
    const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/custom-nodes-install`);
            setPackages(response.data);
        } catch (error) {
            toast.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };


    const installPackage = async (packageName: string) => {
        if (!packageName.trim()) {
            toast.error("Please enter a package name");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/custom-nodes-install`, {
                packageName: packageName.trim(),
            });
            toast.success("Package installed successfully");
            setPackageName("");
            fetchPackages();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to install package");
        } finally {
            setLoading(false);
        }
    };


    const updatePackage = async (packageName: string, id: string) => {
        setUpdatingPackageId(id);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/custom-nodes-update`, {
                packageName,
            });
            toast.success("Package updated successfully");
            fetchPackages();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update package");
        } finally {
            setUpdatingPackageId(null);
        }
    };



    const togglePackage = async (id: string, enabled: boolean) => {
        try {
            const endpoint = enabled ? "disable" : "enable";
            await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/custom-nodes-install/${id}/${endpoint}`);
            toast.success(`Package ${enabled ? "disabled" : "enabled"} successfully`);
            fetchPackages();
        } catch (error) {
            toast.error("Failed to toggle package");
        }
    };

    return {
        packageName,
        setPackageName,
        installPackage,
        packages,
        loading,
        fetchPackages,
        updatePackage,
        updatingPackageId,
        togglePackage
    }
}

export default useCustomNode
