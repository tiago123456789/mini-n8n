'use client';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Workflow = {
    _id: string;
    triggerEvent: string;
    created_at: string;
    name: string;
};

const WorkflowsList = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);

    const getWorkflows = async () => {
        const response = await axios.get('http://localhost:5000/workflows');
        console.log(response.data.data);
        setWorkflows(response.data.data);
    };

    const triggerWorkflow = async (workflowId: string) => {
        await axios.get(`http://localhost:5000/workflows/${workflowId}/trigger`);
    }

    const deleteWorkflow = async (workflowId: string) => {
        await axios.delete(`http://localhost:5000/workflows/${workflowId}`);
        getWorkflows();
    };
    useEffect(() => {
        getWorkflows();
    }, []);

    return (
        <div>
            <h1>Workflows List</h1>
            <br/>
            <Link href={"/"}>
                <Button>Criar Workflow</Button>
            </Link>
            <br/>
            <br/>

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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow._id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.triggerEvent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.created_at}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <Button onClick={() => triggerWorkflow(workflow._id)}>Trigger</Button>
                                &nbsp;
                                <Button onClick={() => deleteWorkflow(workflow._id)}>Delete</Button>
                                &nbsp;
                                <Link href={`/workflows/${workflow._id}/edit`}>
                                    <Button >Edit</Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
    );
};

export default WorkflowsList;
