'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useEffect } from 'react';
import useWorkflow from "@/hooks/useWorkflow"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ToastContainer } from 'react-toastify';

const WorkflowsList = () => {
    const {
        triggerWorkflow,
        deleteWorkflow,
        workflows, getWorkflows
    } = useWorkflow()


    useEffect(() => {
        getWorkflows();
    }, []);

    return (
        <div className="container mx-auto">
            <ToastContainer />
            <h1 className="text-4xl font-bold">Workflows</h1>
            <br />
            <Link href={"/"}>
                <Button>Criar Workflow</Button>
            </Link>
            &nbsp;
            <Link href={"/install-custom-packages"}>
                <Button variant="outline">Install Custom Packages</Button>
            </Link>
            <br />
            <br />

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {workflows.map((workflow, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.triggerEvent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.created_at}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                <DropdownMenu dir='ltr'>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Actions</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuGroup>

                                            {workflow.webhookId !== null && (
                                                <DropdownMenuItem>
                                                    <a target="_blank" href={`${process.env.NEXT_PUBLIC_API_URL}/webhooks/${workflow.webhookId}`}>
                                                        Test Webhook
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => triggerWorkflow(workflow.id)}>
                                                Trigger
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => deleteWorkflow(workflow.id)}>
                                                Delete
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Link href={`/workflows/${workflow.id}/edit`}>
                                                    <span>Edit</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkflowsList;
