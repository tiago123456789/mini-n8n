"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import useCustomNode from "@/hooks/useCustomNode";

export default function InstallCustomPackages() {
  const { 
    packageName,
    setPackageName,
    packages, loading, 
    fetchPackages, installPackage, 
    updatePackage, updatingPackageId,
    togglePackage
  } = useCustomNode()
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    installPackage(packageName);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <ToastContainer />
      <div className="mb-8">
        <Link href="/workflows">
          <Button variant="outline" className="mb-4">
            ← Back to Workflows
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Install Custom Packages</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Install New Package</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  type="text"
                  placeholder="e.g., my-custom-package"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Installing..." : "Install Package"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Installed Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading packages...</div>
            ) : packages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No packages installed yet
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{pkg.package_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {pkg.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={pkg.enabled ? "default" : "secondary"}>
                        {pkg.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePackage(pkg.id, pkg.enabled)}
                      >
                        {pkg.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePackage(pkg.package_name, pkg.id)}
                        disabled={updatingPackageId === pkg.id}
                      >
                        {updatingPackageId === pkg.id ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}