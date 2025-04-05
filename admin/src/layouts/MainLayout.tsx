import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial state

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="flex">
            <Sidebar isOpen={isSidebarOpen} />
            <div
                className={`flex flex-col w-full min-h-screen ${
                    isSidebarOpen ? "ml-64" : "ml-0"
                } transition-all duration-300 ease-in-out`}>
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex flex-col h-full w-full bg-[#ccc]">{children}</div>
            </div>
        </div>
    );
};

export default MainLayout;
