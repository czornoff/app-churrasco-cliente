'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminLayoutContextType {
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    return (
        <AdminLayoutContext.Provider value={{ isSidebarOpen, setSidebarOpen, toggleSidebar }}>
            {children}
        </AdminLayoutContext.Provider>
    );
}

export function useAdminLayout() {
    const context = useContext(AdminLayoutContext);
    if (context === undefined) {
        throw new Error('useAdminLayout must be used within an AdminLayoutProvider');
    }
    return context;
}
